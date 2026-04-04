"""
Confidence Scorer - Module 4
Logistic Regression-based claim confidence scoring with weighted rule fallback.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
import joblib

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Global model state
confidence_model = None
confidence_metadata = None

router = APIRouter()


# Request/Response Models
class ConfidenceFeatures(BaseModel):
    """Feature vector for confidence scoring - same as fraud detector PLUS fraud outputs"""
    # Original signal features (same as fraud detector)
    motion_variance: float = Field(..., ge=0.0, le=10.0)
    network_type: int = Field(..., ge=0, le=1)
    gps_accuracy_radius: float = Field(..., ge=5.0, le=200.0)
    rtt_ms: float = Field(..., ge=20.0, le=2000.0)
    distance_from_home_cluster_km: float = Field(..., ge=0.0, le=50.0)
    route_continuity_score: float = Field(..., ge=0.0, le=1.0)
    speed_between_pings_kmh: float = Field(..., ge=0.0, le=150.0)
    claim_frequency_7d: int = Field(..., ge=0, le=10)
    days_since_registration: int = Field(..., ge=1, le=730)
    upi_changed_recently: int = Field(..., ge=0, le=1)
    simultaneous_claim_density_ratio: float = Field(..., ge=0.1, le=15.0)
    shared_device_flag: int = Field(..., ge=0, le=1)
    claim_timestamp_cluster_flag: int = Field(..., ge=0, le=1)
    trigger_confirmed: int = Field(..., ge=0, le=1)
    zone_overlap: float = Field(..., ge=0.0, le=1.0)
    emulator_flag: int = Field(..., ge=0, le=1)
    
    # Additional inputs from fraud detector
    anomaly_score: float = Field(..., ge=0.0, le=1.0, description="From fraud detector")
    is_suspicious: bool = Field(..., description="From fraud detector")


class ContributingFactor(BaseModel):
    factor: str
    direction: str  # "positive" or "negative"
    weight: float


class ConfidenceResponse(BaseModel):
    confidence_score: float
    decision: str  # "auto_approve", "soft_review", "hold"
    decision_threshold_applied: Dict[str, float]
    top_contributing_factors: List[ContributingFactor]
    plain_language_explanation: str
    model_used: str


def train_confidence_model(data_path: str = "./data/claim_signals.csv",
                          models_dir: str = "./models") -> Dict[str, Any]:
    """
    Train Logistic Regression model on claim signals data.
    Target: confidence_score binned to binary (1 if >= 0.75, 0 if < 0.75)
    
    Returns:
        Dict with model metadata including accuracy
    """
    logger.info("Training Confidence Scorer (Logistic Regression)...")
    
    # Load data
    df = pd.read_csv(data_path)
    logger.info(f"Loaded {len(df)} claim signals")
    
    # Prepare features (exclude target columns)
    feature_cols = [col for col in df.columns if col not in ['is_fraud', 'confidence_score']]
    X = df[feature_cols].copy()
    
    # Prepare target: bin confidence_score to binary
    y = (df['confidence_score'] >= 0.75).astype(int)
    
    logger.info(f"Training on {len(feature_cols)} features")
    logger.info(f"Target distribution: {y.value_counts().to_dict()}")
    
    # Split train/test (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    logger.info(f"Train set: {len(X_train)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    
    # Train Logistic Regression
    model = LogisticRegression(
        max_iter=1000,
        C=1.0,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_pred_proba)
    
    logger.info(f"✓ Model trained successfully")
    logger.info(f"  Accuracy on test set: {accuracy:.3f}")
    logger.info(f"  AUC-ROC: {auc:.3f}")
    
    # Extract feature importances (coefficients)
    feature_importance_dict = dict(zip(feature_cols, model.coef_[0]))
    top_features = sorted(feature_importance_dict.items(), key=lambda x: abs(x[1]), reverse=True)[:5]
    
    logger.info(f"\nTop 5 feature coefficients:")
    for feat, coef in top_features:
        logger.info(f"  {feat}: {coef:.4f}")
    
    # Save model
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "confidence_v1.joblib")
    joblib.dump({
        'model': model,
        'feature_columns': feature_cols,
        'top_features': dict(top_features)
    }, model_path)
    
    # Save metadata
    metadata = {
        'version': 'v1',
        'trained_at': datetime.utcnow().isoformat(),
        'n_samples': int(len(df)),
        'n_features': int(len(feature_cols)),
        'accuracy': float(accuracy),
        'auc_roc': float(auc),
        'max_iter': 1000,
        'C': 1.0
    }
    
    metadata_path = os.path.join(models_dir, "confidence_v1_metadata.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    logger.info(f"✓ Model saved to {model_path}")
    logger.info(f"✓ Metadata saved to {metadata_path}")
    
    return metadata


def load_confidence_model() -> Dict[str, Any]:
    """
    Load the serialized Logistic Regression model and metadata at startup.
    Returns model metadata dict.
    """
    global confidence_model, confidence_metadata
    
    models_dir = os.getenv("MODELS_DIR", "./models")
    model_version = os.getenv("CONFIDENCE_MODEL_VERSION", "v1")
    
    model_path = os.path.join(models_dir, f"confidence_{model_version}.joblib")
    metadata_path = os.path.join(models_dir, f"confidence_{model_version}_metadata.json")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Confidence model not found at {model_path}")
    
    # Load model
    model_data = joblib.load(model_path)
    confidence_model = model_data
    
    # Load metadata
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            confidence_metadata = json.load(f)
    else:
        confidence_metadata = {
            "version": model_version,
            "last_trained": None
        }
    
    logger.info(f"Confidence model loaded: accuracy {confidence_metadata.get('accuracy', 0):.3f}")
    
    return confidence_metadata


def score_confidence_logistic_regression(features: ConfidenceFeatures) -> Dict[str, Any]:
    """
    Score confidence using trained Logistic Regression model.
    """
    if confidence_model is None:
        raise ValueError("Model not loaded")
    
    # Prepare input features
    feature_columns = confidence_model['feature_columns']
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
    
    # Predict probability
    model = confidence_model['model']
    confidence_score = model.predict_proba(input_df)[0][1]  # Probability of high confidence class
    
    # Get top contributing features from coefficients
    coefficients = model.coef_[0]
    feature_contributions = []
    
    for i, (feat, coef) in enumerate(zip(feature_columns, coefficients)):
        contribution = coef * input_df.iloc[0, i]
        feature_contributions.append((feat, coef, contribution))
    
    # Sort by absolute contribution
    feature_contributions.sort(key=lambda x: abs(x[2]), reverse=True)
    
    return {
        'confidence_score': float(confidence_score),
        'top_features': feature_contributions[:3],
        'model_used': 'logistic_regression'
    }


def score_confidence_fallback(features: ConfidenceFeatures) -> Dict[str, Any]:
    """
    Weighted rule fallback.
    5 checks, each worth 0.2:
    1. trigger_confirmed
    2. zone_overlap > 0.5
    3. emulator_flag == 0
    4. speed_between_pings_kmh < 80
    5. shared_device_flag == 0
    """
    score = 0.0
    checks = []
    
    # Check 1: Trigger confirmed
    if features.trigger_confirmed:
        score += 0.2
        checks.append(("trigger_confirmed", 0.2, "positive"))
    
    # Check 2: Zone overlap
    if features.zone_overlap > 0.5:
        score += 0.2
        checks.append(("zone_overlap", 0.2, "positive"))
    
    # Check 3: No emulator
    if not features.emulator_flag:
        score += 0.2
        checks.append(("no_emulator", 0.2, "positive"))
    
    # Check 4: Speed plausible
    if features.speed_between_pings_kmh < 80:
        score += 0.2
        checks.append(("speed_plausible", 0.2, "positive"))
    
    # Check 5: No shared device
    if not features.shared_device_flag:
        score += 0.2
        checks.append(("no_shared_device", 0.2, "positive"))
    
    return {
        "confidence_score": float(score),
        "top_features": checks[:3],
        "model_used": "fallback_rules"
    }


def determine_decision(confidence_score: float) -> str:
    """Determine decision based on confidence score"""
    if confidence_score >= 0.75:
        return "auto_approve"
    elif confidence_score >= 0.40:
        return "soft_review"
    else:
        return "hold"


def generate_plain_language_explanation(confidence_score: float, 
                                        features: ConfidenceFeatures) -> str:
    """Generate plain language explanation for the worker"""
    if confidence_score >= 0.75:
        return "Your location and device signals match the disruption event in your zone."
    elif confidence_score >= 0.40:
        return "We're collecting a bit more data to verify your claim — sit tight."
    else:
        # Identify the main issue
        if features.emulator_flag:
            return "Your device appears to be an emulator, which we cannot verify."
        elif features.zone_overlap < 0.5:
            return "Your device appears to be on home WiFi far from the affected zone."
        elif features.speed_between_pings_kmh > 80:
            return "Your movement pattern doesn't match typical delivery routes."
        elif not features.trigger_confirmed:
            return "We couldn't confirm a disruption event in your area at that time."
        else:
            return "We need additional verification before approving this claim."


def map_feature_to_factor_name(feature_name: str) -> str:
    """Map technical feature names to plain English"""
    mapping = {
        'trigger_confirmed': 'Trigger event confirmed',
        'zone_overlap': 'Location matches trigger zone',
        'emulator_flag': 'Device authenticity',
        'shared_device_flag': 'Device uniqueness',
        'speed_between_pings_kmh': 'Movement pattern',
        'route_continuity_score': 'Route plausibility',
        'gps_accuracy_radius': 'GPS signal quality',
        'motion_variance': 'Device motion sensors',
        'claim_frequency_7d': 'Recent claim history',
        'days_since_registration': 'Account tenure',
        'no_emulator': 'Device authenticity',
        'speed_plausible': 'Movement pattern',
        'no_shared_device': 'Device uniqueness'
    }
    return mapping.get(feature_name, feature_name.replace('_', ' ').title())


@router.post("/score", response_model=ConfidenceResponse)
async def score_confidence(features: ConfidenceFeatures):
    """
    Calculate claim approval confidence score using Logistic Regression.
    
    Never returns 500 - always returns a valid confidence score.
    Falls back to weighted binary checks if model unavailable.
    """
    try:
        # Step 1: Try Logistic Regression prediction
        if confidence_model is not None:
            try:
                result = score_confidence_logistic_regression(features)
                confidence_score = result['confidence_score']
                top_features = result['top_features']
                model_used = result['model_used']
            except Exception as e:
                logger.warning(f"Logistic Regression prediction failed: {e}. Using fallback.")
                fallback_result = score_confidence_fallback(features)
                confidence_score = fallback_result['confidence_score']
                top_features = fallback_result['top_features']
                model_used = fallback_result['model_used']
        else:
            # No model loaded - use fallback
            fallback_result = score_confidence_fallback(features)
            confidence_score = fallback_result['confidence_score']
            top_features = fallback_result['top_features']
            model_used = fallback_result['model_used']
        
        # Step 2: Determine decision
        decision = determine_decision(confidence_score)
        
        # Step 3: Generate plain language explanation
        explanation = generate_plain_language_explanation(confidence_score, features)
        
        # Step 4: Build top contributing factors
        contributing_factors = []
        for feat_name, weight, direction in top_features[:3]:
            if isinstance(direction, str):
                # Fallback format
                factor_direction = direction
            else:
                # Model format - determine direction from weight
                factor_direction = "positive" if weight > 0 else "negative"
            
            contributing_factors.append(ContributingFactor(
                factor=map_feature_to_factor_name(feat_name),
                direction=factor_direction,
                weight=float(abs(weight))
            ))
        
        # Step 5: Log for audit
        logger.info(f"Confidence scoring: score={confidence_score:.3f}, decision={decision}, "
                   f"model={model_used}")
        
        return ConfidenceResponse(
            confidence_score=float(confidence_score),
            decision=decision,
            decision_threshold_applied={
                "auto_approve": 0.75,
                "soft_review_lower": 0.40
            },
            top_contributing_factors=contributing_factors,
            plain_language_explanation=explanation,
            model_used=model_used
        )
    
    except Exception as e:
        # Ultimate fallback - return safe default
        logger.error(f"Confidence scoring failed completely: {e}")
        
        # Emergency fallback: medium confidence, soft review
        return ConfidenceResponse(
            confidence_score=0.5,
            decision="soft_review",
            decision_threshold_applied={
                "auto_approve": 0.75,
                "soft_review_lower": 0.40
            },
            top_contributing_factors=[
                ContributingFactor(
                    factor="System error",
                    direction="negative",
                    weight=0.5
                )
            ],
            plain_language_explanation="We're reviewing your claim manually due to a system issue.",
            model_used="emergency_fallback"
        )


# Training script entry point
if __name__ == "__main__":
    """Train the confidence scoring model"""
    import sys
    
    data_path = sys.argv[1] if len(sys.argv) > 1 else "./data/claim_signals.csv"
    
    if not os.path.exists(data_path):
        logger.error(f"Data file not found: {data_path}")
        logger.info("Please run: python synthetic_data.py first")
        sys.exit(1)
    
    metadata = train_confidence_model(data_path)
    logger.info("\n✓ Training complete!")
    logger.info(f"Model ready for inference with accuracy: {metadata['accuracy']:.3f}")
