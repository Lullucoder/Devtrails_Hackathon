"""
Comprehensive test script for all 4 ML microservice endpoints
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health check endpoint"""
    print("\n" + "="*60)
    print("Testing Health Check Endpoint")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Service Status: {result['status']}")
            print(f"  Version: {result['version']}")
            print(f"  Models Loaded:")
            for model_name, model_info in result['models'].items():
                status = "✓" if model_info['loaded'] else "✗"
                print(f"    {status} {model_name}: {model_info.get('version', 'N/A')}")
        else:
            print(f"✗ Health check failed: HTTP {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")


def test_premium_engine():
    """Test premium calculation endpoint"""
    print("\n" + "="*60)
    print("Testing Premium Engine (XGBoost)")
    print("="*60)
    
    request_data = {
        "city_tier": 1,
        "zone_id": "zone_001",
        "week_of_year": 25,
        "season_flag": "monsoon",
        "forecasted_disruption_probability": 0.6,
        "shift_start_hour": 16,
        "shift_duration_hours": 8.0,
        "declared_weekly_income_slab": 2000,
        "claim_count_last_4_weeks": 1,
        "trust_score": 0.85,
        "days_since_registration": 365,
        "prior_zone_disruption_density": 0.4
    }
    
    try:
        response = requests.post(f"{BASE_URL}/premium/quote", json=request_data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Premium Calculated: ₹{result['premium_inr']}")
            print(f"  Risk Tier: {result['risk_tier']}")
            print(f"  Plan Recommendation: {result['plan_recommendation']}")
            print(f"  Model Used: {result['model_used']}")
            print(f"  Top Reasons: {', '.join(result['top_reasons'])}")
        else:
            print(f"✗ Premium calculation failed: HTTP {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")


def test_forecasting_engine():
    """Test disruption forecasting endpoint"""
    print("\n" + "="*60)
    print("Testing Forecasting Engine (Prophet)")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/forecast/zone_001", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Forecast Generated for {result['zone_id']}")
            print(f"  Model Used: {result['model_used']}")
            print(f"  Next Week Summary:")
            summary = result['next_week_summary']
            print(f"    - Avg Disruption Probability: {summary['average_disruption_probability']:.3f}")
            print(f"    - Peak Risk Day: {summary['peak_risk_day']}")
            print(f"    - Premium Adjustment: {summary['recommended_premium_adjustment']:.2f}x")
            print(f"  7-Day Forecast (first 3 days):")
            for day in result['forecast_7d'][:3]:
                print(f"    - {day['date']}: {day['disruption_probability']:.3f} ({day['risk_level']})")
        else:
            print(f"✗ Forecast failed: HTTP {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")


def test_fraud_detector():
    """Test fraud detection endpoint"""
    print("\n" + "="*60)
    print("Testing Fraud Detector (Isolation Forest)")
    print("="*60)
    
    request_data = {
        "motion_variance": 6.5,
        "network_type": 1,
        "gps_accuracy_radius": 30.0,
        "rtt_ms": 150.0,
        "distance_from_home_cluster_km": 8.0,
        "route_continuity_score": 0.85,
        "speed_between_pings_kmh": 35.0,
        "claim_frequency_7d": 2,
        "days_since_registration": 300,
        "upi_changed_recently": 0,
        "simultaneous_claim_density_ratio": 1.5,
        "shared_device_flag": 0,
        "claim_timestamp_cluster_flag": 0,
        "trigger_confirmed": 1,
        "zone_overlap": 0.9,
        "emulator_flag": 0
    }
    
    try:
        response = requests.post(f"{BASE_URL}/fraud/score", json=request_data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Fraud Score Calculated: {result['anomaly_score']:.3f}")
            print(f"  Is Suspicious: {result['is_suspicious']}")
            print(f"  Suspicion Level: {result['suspicion_level']}")
            print(f"  Recommended Track: {result['recommended_track']}")
            print(f"  Model Used: {result['model_used']}")
            print(f"  Flags: {', '.join(result['flags'][:3])}")
        else:
            print(f"✗ Fraud detection failed: HTTP {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")


def test_confidence_scorer():
    """Test confidence scoring endpoint"""
    print("\n" + "="*60)
    print("Testing Confidence Scorer (Logistic Regression)")
    print("="*60)
    
    request_data = {
        "motion_variance": 6.5,
        "network_type": 1,
        "gps_accuracy_radius": 30.0,
        "rtt_ms": 150.0,
        "distance_from_home_cluster_km": 8.0,
        "route_continuity_score": 0.85,
        "speed_between_pings_kmh": 35.0,
        "claim_frequency_7d": 2,
        "days_since_registration": 300,
        "upi_changed_recently": 0,
        "simultaneous_claim_density_ratio": 1.5,
        "shared_device_flag": 0,
        "claim_timestamp_cluster_flag": 0,
        "trigger_confirmed": 1,
        "zone_overlap": 0.9,
        "emulator_flag": 0,
        "anomaly_score": 0.3,
        "is_suspicious": False
    }
    
    try:
        response = requests.post(f"{BASE_URL}/confidence/score", json=request_data, timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Confidence Score: {result['confidence_score']:.3f}")
            print(f"  Decision: {result['decision']}")
            print(f"  Model Used: {result['model_used']}")
            print(f"  Explanation: {result['plain_language_explanation']}")
            print(f"  Top Contributing Factors:")
            for factor in result['top_contributing_factors']:
                print(f"    - {factor['factor']} ({factor['direction']})")
        else:
            print(f"✗ Confidence scoring failed: HTTP {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("RoziRakshak ML Microservice - Full Test Suite")
    print("="*60)
    
    # Run all tests
    test_health()
    test_premium_engine()
    test_forecasting_engine()
    test_fraud_detector()
    test_confidence_scorer()
    
    print("\n" + "="*60)
    print("All tests complete!")
    print("="*60 + "\n")
