"""
Fraud Detector - Module 3
Isolation Forest-based anomaly detection with hard-coded rule fallback and graph-based duplicate detection.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Global model state
fraud_model = None
fraud_metadata = None

router = APIRouter()


# Request/Response Models
class FraudFeatures(BaseModel):
    """Feature vector for fraud detection"""
    motion_variance: float = Field(..., ge=0.0, le=10.0, description="Accelerometer variance over 30s")
    network_type: int = Field(..., ge=0, le=1, description="0=wifi, 1=cellular")
    gps_accuracy_radius: float = Field(..., ge=5.0, le=200.0, description="GPS accuracy in meters")
    rtt_ms: float = Field(..., ge=20.0, le=2000.0, description="Network round-trip time")
    distance_from_home_cluster_km: float = Field(..., ge=0.0, le=50.0, description="Distance from home")
    route_continuity_score: float = Field(..., ge=0.0, le=1.0, description="Path plausibility")
    speed_between_pings_kmh: float = Field(..., ge=0.0, le=150.0, description="Movement speed")
    claim_frequency_7d: int = Field(..., ge=0, le=10, description="Claims in last 7 days")
    days_since_registration: int = Field(..., ge=1, le=730, description="Account age")
    upi_changed_recently: int = Field(..., ge=0, le=1, description="0=no, 1=yes")
    simultaneous_claim_density_ratio: float = Field(..., ge=0.1, le=15.0, description="Zone claim density")
    shared_device_flag: int = Field(..., ge=0, le=1, description="0=no, 1=yes")
    claim_timestamp_cluster_flag: int = Field(..., ge=0, le=1, description="0=no, 1=yes")
    trigger_confirmed: int = Field(..., ge=0, le=1, description="0=no, 1=yes")
    zone_overlap: float = Field(..., ge=0.0, le=1.0, description="Worker-trigger zone match")
    emulator_flag: int = Field(..., ge=0, le=1, description="0=no, 1=yes")


class GraphFlags(BaseModel):
    shared_device: bool
    shared_upi: bool
    coordinated_ring_suspected: bool


class FraudResponse(BaseModel):
    anomaly_score: float
    is_suspicious: bool
    suspicion_level: str
    flags: List[str]
    graph_flags: GraphFlags
    recommended_track: str
    model_used: str


def train_fraud_model(data_path: str = "./data/claim_signals.csv",
                     models_dir: str = "./models") -> Dict[str, Any]:
    """
    Train Isolation Forest model on claim signals data.
    
    Returns:
        Dict with model metadata
    """
    logger.info("Training Fraud Detector (Isolation Forest)...")
    
    # Load data
    df = pd.read_csv(data_path)
    logger.info(f"Loaded {len(df)} claim signals")
    
    # Prepare features (exclude target columns)
    feature_cols = [col for col in df.columns if col not in ['is_fraud', 'confidence_score']]
    X = df[feature_cols].copy()
    
    logger.info(f"Training on {len(feature_cols)} features: {feature_cols}")
    
    # Train Isolation Forest
    model = IsolationForest(
        contamination=0.05,  # Expect 5% fraud
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X)
    
    # Evaluate on training data
    predictions = model.predict(X)
    anomaly_scores = model.score_samples(X)
    
    # Count anomalies detected
    n_anomalies = (predictions == -1).sum()
    actual_fraud = df['is_fraud'].sum()
    
    logger.info(f"✓ Model trained successfully")
    logger.info(f"  Anomalies detected: {n_anomalies}/{len(df)} ({n_anomalies/len(df)*100:.1f}%)")
    logger.info(f"  Actual fraud in data: {actual_fraud}/{len(df)} ({actual_fraud/len(df)*100:.1f}%)")
    
    # Save model
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "fraud_v1.joblib")
    joblib.dump({
        'model': model,
        'feature_columns': feature_cols
    }, model_path)
    
    # Save metadata
    metadata = {
        'version': 'v1',
        'trained_at': datetime.utcnow().isoformat(),
        'n_samples': int(len(df)),
        'n_features': int(len(feature_cols)),
        'contamination': 0.05,
        'n_estimators': 100
    }
    
    metadata_path = os.path.join(models_dir, "fraud_v1_metadata.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    logger.info(f"✓ Model saved to {model_path}")
    logger.info(f"✓ Metadata saved to {metadata_path}")
    
    return metadata


def load_fraud_model() -> Dict[str, Any]:
    """
    Load the serialized Isolation Forest model and metadata at startup.
    Returns model metadata dict.
    """
    global fraud_model, fraud_metadata
    
    models_dir = os.getenv("MODELS_DIR", "./models")
    model_version = os.getenv("FRAUD_MODEL_VERSION", "v1")
    
    model_path = os.path.join(models_dir, f"fraud_{model_version}.joblib")
    metadata_path = os.path.join(models_dir, f"fraud_{model_version}_metadata.json")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Fraud model not found at {model_path}")
    
    # Load model
    model_data = joblib.load(model_path)
    fraud_model = model_data
    
    # Load metadata
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            fraud_metadata = json.load(f)
    else:
        fraud_metadata = {
            "version": model_version,
            "last_trained": None
        }
    
    logger.info(f"Fraud model loaded: {fraud_metadata.get('n_samples', 0)} training samples")
    
    return fraud_metadata


def detect_fraud_isolation_forest(features: FraudFeatures) -> Dict[str, Any]:
    """
    Detect fraud using Isolation Forest model.
    """
    if fraud_model is None:
        raise ValueError("Model not loaded")
    
    # Prepare input features
    feature_columns = fraud_model['feature_columns']
    input_data = {
        'motion_variance': features.motion_variance,
        'network_type': features.network_type,
        'gps_accuracy_radius': features.gps_accuracy_radius,
        'rtt_ms': features.rtt_ms,
        'distance_from_home_cluster_km': features.distance_from_home_cluster_km,
        'route_continuity_score': features.route_continuity_score,
        'speed_between_pings_kmh': features.speed_between_pings_kmh,
        'claim_frequency_7d': features.claim_frequency_7d,
        'days_since_registration': features.days_since_registration,
        'upi_changed_recently': features.upi_changed_recently,
        'simultaneous_claim_density_ratio': features.simultaneous_claim_density_ratio,
        'shared_device_flag': features.shared_device_flag,
        'claim_timestamp_cluster_flag': features.claim_timestamp_cluster_flag,
        'trigger_confirmed': features.trigger_confirmed,
        'zone_overlap': features.zone_overlap,
        'emulator_flag': features.emulator_flag
    }
    
    # Create DataFrame with correct column order
    input_df = pd.DataFrame([input_data])[feature_columns]
    
    # Predict
    model = fraud_model['model']
    prediction = model.predict(input_df)[0]  # 1 = normal, -1 = anomaly
    anomaly_score_raw = model.score_samples(input_df)[0]
    
    # Convert anomaly score to 0-1 range (more negative = more anomalous)
    # Typical range is -0.5 to 0.5, we'll normalize to 0-1
    anomaly_score = max(0, min(1, (-anomaly_score_raw + 0.5)))
    
    is_suspicious = prediction == -1
    
    return {
        'anomaly_score': float(anomaly_score),
        'is_suspicious': bool(is_suspicious),
        'model_used': 'isolation_forest'
    }


def detect_fraud_fallback(features: FraudFeatures) -> Dict[str, Any]:
    """
    Hard-coded rule engine fallback.
    Rules (ALWAYS applied):
    1. speed > 80 km/h → hold
    2. emulator_flag → hold
    3. claim_frequency_7d > 3 → hold
    """
    triggered_rules = []
    anomaly_score = 0.0
    
    # Rule 1: Impossible speed
    if features.speed_between_pings_kmh > 80:
        triggered_rules.append("Impossible speed detected")
        anomaly_score = max(anomaly_score, 0.9)
    
    # Rule 2: Emulator detection
    if features.emulator_flag:
        triggered_rules.append("Emulator detected")
        anomaly_score = max(anomaly_score, 1.0)
    
    # Rule 3: Excessive claim frequency
    if features.claim_frequency_7d > 3:
        triggered_rules.append("Excessive claim frequency")
        anomaly_score = max(anomaly_score, 0.8)
    
    # Additional soft signals
    if features.gps_accuracy_radius > 100:
        anomaly_score += 0.1
    
    if features.route_continuity_score < 0.3:
        anomaly_score += 0.1
    
    if features.upi_changed_recently:
        anomaly_score += 0.05
    
    # Clip to 0-1
    anomaly_score = min(1.0, anomaly_score)
    
    is_suspicious = len(triggered_rules) > 0 or anomaly_score > 0.6
    
    return {
        "anomaly_score": float(anomaly_score),
        "is_suspicious": bool(is_suspicious),
        "triggered_rules": triggered_rules if triggered_rules else None,
        "model_used": "fallback_rules"
    }


def check_graph_flags(features: FraudFeatures) -> GraphFlags:
    """
    Check for graph-based fraud patterns.
    In production, this would query a graph database.
    For now, we use the flags from the input.
    """
    return GraphFlags(
        shared_device=bool(features.shared_device_flag),
        shared_upi=bool(features.upi_changed_recently),  # Proxy for shared UPI
        coordinated_ring_suspected=bool(features.claim_timestamp_cluster_flag)
    )


def determine_track(anomaly_score: float, 
                   graph_flags: GraphFlags,
                   hard_rules_triggered: Optional[List[str]]) -> str:
    """
    Determine routing track based on fraud signals.
    
    Track A: Auto-approve (low risk)
    Track B: Soft review (medium risk)
    Track C: Hold for investigation (high risk)
    """
    # CRITICAL: Emulator or shared device → always Track C
    if graph_flags.shared_device:
        return "C"
    
    # Hard rules triggered → Track C
    if hard_rules_triggered and len(hard_rules_triggered) > 0:
        return "C"
    
    # High anomaly score → Track C
    if anomaly_score > 0.7:
        return "C"
    
    # Medium anomaly score or graph flags → Track B
    if anomaly_score > 0.4 or graph_flags.shared_upi or graph_flags.coordinated_ring_suspected:
        return "B"
    
    # Low risk → Track A
    return "A"


def determine_suspicion_level(anomaly_score: float) -> str:
    """Determine suspicion level from anomaly score"""
    if anomaly_score > 0.7:
        return "high"
    elif anomaly_score > 0.4:
        return "medium"
    else:
        return "low"


def generate_fraud_flags(features: FraudFeatures, 
                        anomaly_score: float,
                        hard_rules: Optional[List[str]]) -> List[str]:
    """Generate human-readable fraud flags"""
    flags = []
    
    # Hard rules
    if hard_rules:
        flags.extend(hard_rules)
    
    # Soft signals
    if features.emulator_flag:
        flags.append("Emulator detected")
    
    if features.shared_device_flag:
        flags.append("Shared device detected")
    
    if features.claim_timestamp_cluster_flag:
        flags.append("Coordinated timing pattern")
    
    if features.speed_between_pings_kmh > 80:
        flags.append("Impossible speed")
    
    if features.gps_accuracy_radius > 100:
        flags.append("Poor GPS accuracy")
    
    if features.route_continuity_score < 0.3:
        flags.append("Implausible route")
    
    if features.claim_frequency_7d > 3:
        flags.append("High claim frequency")
    
    if not features.trigger_confirmed:
        flags.append("Trigger not confirmed")
    
    if features.zone_overlap < 0.5:
        flags.append("Low zone overlap")
    
    # If no flags but high anomaly score
    if not flags and anomaly_score > 0.6:
        flags.append("Anomalous pattern detected")
    
    # If no issues
    if not flags:
        flags.append("No suspicious patterns detected")
    
    return flags[:5]  # Return top 5 flags


@router.post("/score", response_model=FraudResponse)
async def score_fraud(features: FraudFeatures):
    """
    Score a claim for fraud risk using Isolation Forest + hard-coded rules.
    
    CRITICAL: Hard-coded rules ALWAYS apply on top of model predictions.
    Never returns 500 - always returns a valid fraud score.
    
    Audit logging: Every request is logged for compliance.
    """
    request_id = f"fraud_{datetime.utcnow().timestamp()}"
    
    try:
        # Step 1: Try Isolation Forest prediction
        if fraud_model is not None:
            try:
                model_result = detect_fraud_isolation_forest(features)
                anomaly_score = model_result['anomaly_score']
                model_used = model_result['model_used']
            except Exception as e:
                logger.warning(f"Isolation Forest prediction failed: {e}. Using fallback.")
                fallback_result = detect_fraud_fallback(features)
                anomaly_score = fallback_result['anomaly_score']
                model_used = fallback_result['model_used']
                hard_rules_triggered = fallback_result.get('triggered_rules')
        else:
            # No model loaded - use fallback
            fallback_result = detect_fraud_fallback(features)
            anomaly_score = fallback_result['anomaly_score']
            model_used = fallback_result['model_used']
            hard_rules_triggered = fallback_result.get('triggered_rules')
        
        # Step 2: ALWAYS apply hard-coded rules on top
        hard_rules = []
        if features.speed_between_pings_kmh > 80:
            hard_rules.append("Impossible speed detected")
            anomaly_score = max(anomaly_score, 0.9)
        
        if features.emulator_flag:
            hard_rules.append("Emulator detected")
            anomaly_score = max(anomaly_score, 1.0)
        
        if features.claim_frequency_7d > 3:
            hard_rules.append("Excessive claim frequency")
            anomaly_score = max(anomaly_score, 0.8)
        
        # Step 3: Check graph flags
        graph_flags = check_graph_flags(features)
        
        # Step 4: Determine track routing
        recommended_track = determine_track(anomaly_score, graph_flags, hard_rules)
        
        # Step 5: Generate flags and suspicion level
        suspicion_level = determine_suspicion_level(anomaly_score)
        is_suspicious = anomaly_score > 0.4 or len(hard_rules) > 0
        flags = generate_fraud_flags(features, anomaly_score, hard_rules)
        
        # Step 6: Audit logging
        logger.info(f"Fraud detection: score={anomaly_score:.3f}, track={recommended_track}, "
                   f"model={model_used}, rules={len(hard_rules)}")
        
        return FraudResponse(
            anomaly_score=float(anomaly_score),
            is_suspicious=bool(is_suspicious),
            suspicion_level=suspicion_level,
            flags=flags,
            graph_flags=graph_flags,
            recommended_track=recommended_track,
            model_used=model_used
        )
    
    except Exception as e:
        # Ultimate fallback - return safe default
        logger.error(f"Fraud detection failed completely: {e}")
        
        # Emergency fallback based on critical flags only
        emergency_score = 0.5
        emergency_flags = ["System error - manual review required"]
        
        if features.emulator_flag or features.shared_device_flag:
            emergency_score = 1.0
            emergency_flags = ["Critical: Emulator or shared device detected"]
        
        return FraudResponse(
            anomaly_score=float(emergency_score),
            is_suspicious=True,
            suspicion_level="medium",
            flags=emergency_flags,
            graph_flags=GraphFlags(
                shared_device=bool(features.shared_device_flag),
                shared_upi=False,
                coordinated_ring_suspected=False
            ),
            recommended_track="B",  # Safe default: soft review
            model_used="emergency_fallback"
        )


# Training script entry point
if __name__ == "__main__":
    """Train the fraud detection model"""
    import sys
    
    data_path = sys.argv[1] if len(sys.argv) > 1 else "./data/claim_signals.csv"
    
    if not os.path.exists(data_path):
        logger.error(f"Data file not found: {data_path}")
        logger.info("Please run: python synthetic_data.py first")
        sys.exit(1)
    
    metadata = train_fraud_model(data_path)
    logger.info("\n✓ Training complete!")
    logger.info(f"Model ready for inference with {metadata['n_samples']} training samples")
