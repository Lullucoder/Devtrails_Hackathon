"""
Quick test script for confidence scorer endpoint
"""
import requests
import json

# Test case 1: High confidence claim (should auto-approve)
high_confidence_claim = {
    "motion_variance": 6.5,
    "network_type": 1,
    "gps_accuracy_radius": 20.0,
    "rtt_ms": 100.0,
    "distance_from_home_cluster_km": 5.0,
    "route_continuity_score": 0.9,
    "speed_between_pings_kmh": 25.0,
    "claim_frequency_7d": 1,
    "days_since_registration": 400,
    "upi_changed_recently": 0,
    "simultaneous_claim_density_ratio": 1.0,
    "shared_device_flag": 0,
    "claim_timestamp_cluster_flag": 0,
    "trigger_confirmed": 1,
    "zone_overlap": 0.95,
    "emulator_flag": 0,
    "anomaly_score": 0.1,
    "is_suspicious": False
}

# Test case 2: Low confidence claim (should hold)
low_confidence_claim = {
    "motion_variance": 2.0,
    "network_type": 0,
    "gps_accuracy_radius": 150.0,
    "rtt_ms": 500.0,
    "distance_from_home_cluster_km": 45.0,
    "route_continuity_score": 0.2,
    "speed_between_pings_kmh": 120.0,
    "claim_frequency_7d": 6,
    "days_since_registration": 5,
    "upi_changed_recently": 1,
    "simultaneous_claim_density_ratio": 10.0,
    "shared_device_flag": 1,
    "claim_timestamp_cluster_flag": 1,
    "trigger_confirmed": 0,
    "zone_overlap": 0.1,
    "emulator_flag": 1,
    "anomaly_score": 0.95,
    "is_suspicious": True
}

# Test case 3: Medium confidence claim (should soft review)
medium_confidence_claim = {
    "motion_variance": 5.0,
    "network_type": 1,
    "gps_accuracy_radius": 60.0,
    "rtt_ms": 250.0,
    "distance_from_home_cluster_km": 15.0,
    "route_continuity_score": 0.6,
    "speed_between_pings_kmh": 45.0,
    "claim_frequency_7d": 3,
    "days_since_registration": 100,
    "upi_changed_recently": 0,
    "simultaneous_claim_density_ratio": 2.5,
    "shared_device_flag": 0,
    "claim_timestamp_cluster_flag": 0,
    "trigger_confirmed": 1,
    "zone_overlap": 0.65,
    "emulator_flag": 0,
    "anomaly_score": 0.5,
    "is_suspicious": False
}

def test_confidence_endpoint(claim_data, test_name):
    """Test the confidence scoring endpoint"""
    print(f"\n{'='*60}")
    print(f"Test: {test_name}")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            "http://localhost:8000/confidence/score",
            json=claim_data,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Status: SUCCESS")
            print(f"  Confidence Score: {result['confidence_score']:.3f}")
            print(f"  Decision: {result['decision']}")
            print(f"  Model Used: {result['model_used']}")
            print(f"  Explanation: {result['plain_language_explanation']}")
            print(f"  Top Contributing Factors:")
            for factor in result['top_contributing_factors']:
                print(f"    - {factor['factor']} ({factor['direction']}): {factor['weight']:.3f}")
        else:
            print(f"✗ Status: FAILED")
            print(f"  HTTP {response.status_code}: {response.text}")
    
    except requests.exceptions.ConnectionError:
        print(f"✗ Connection Error: Server not running at http://localhost:8000")
        print(f"  Start the server with: python main.py")
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("Confidence Scorer Endpoint Test Suite")
    print("="*60)
    
    # Run tests
    test_confidence_endpoint(high_confidence_claim, "High Confidence Claim (Auto-Approve)")
    test_confidence_endpoint(low_confidence_claim, "Low Confidence Claim (Hold)")
    test_confidence_endpoint(medium_confidence_claim, "Medium Confidence Claim (Soft Review)")
    
    print("\n" + "="*60)
    print("Test suite complete!")
    print("="*60 + "\n")
