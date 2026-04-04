"""
Quick test script for fraud detector endpoint
"""
import requests
import json

# Test case 1: Low-risk legitimate claim
legitimate_claim = {
    "motion_variance": 5.5,
    "network_type": 1,
    "gps_accuracy_radius": 25.0,
    "rtt_ms": 150.0,
    "distance_from_home_cluster_km": 10.0,
    "route_continuity_score": 0.85,
    "speed_between_pings_kmh": 25.0,
    "claim_frequency_7d": 1,
    "days_since_registration": 365,
    "upi_changed_recently": 0,
    "simultaneous_claim_density_ratio": 1.2,
    "shared_device_flag": 0,
    "claim_timestamp_cluster_flag": 0,
    "trigger_confirmed": 1,
    "zone_overlap": 0.9,
    "emulator_flag": 0
}

# Test case 2: High-risk fraudulent claim (emulator + impossible speed)
fraudulent_claim = {
    "motion_variance": 2.0,
    "network_type": 0,
    "gps_accuracy_radius": 150.0,
    "rtt_ms": 500.0,
    "distance_from_home_cluster_km": 40.0,
    "route_continuity_score": 0.3,
    "speed_between_pings_kmh": 120.0,  # Impossible speed
    "claim_frequency_7d": 5,  # High frequency
    "days_since_registration": 10,
    "upi_changed_recently": 1,
    "simultaneous_claim_density_ratio": 8.0,
    "shared_device_flag": 1,  # Shared device
    "claim_timestamp_cluster_flag": 1,
    "trigger_confirmed": 0,
    "zone_overlap": 0.2,
    "emulator_flag": 1  # Emulator detected
}

# Test case 3: Medium-risk suspicious claim
suspicious_claim = {
    "motion_variance": 7.0,
    "network_type": 1,
    "gps_accuracy_radius": 80.0,
    "rtt_ms": 300.0,
    "distance_from_home_cluster_km": 25.0,
    "route_continuity_score": 0.5,
    "speed_between_pings_kmh": 60.0,
    "claim_frequency_7d": 4,  # Slightly high
    "days_since_registration": 50,
    "upi_changed_recently": 1,
    "simultaneous_claim_density_ratio": 3.5,
    "shared_device_flag": 0,
    "claim_timestamp_cluster_flag": 1,
    "trigger_confirmed": 1,
    "zone_overlap": 0.6,
    "emulator_flag": 0
}

def test_fraud_endpoint(claim_data, test_name):
    """Test the fraud detection endpoint"""
    print(f"\n{'='*60}")
    print(f"Test: {test_name}")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            "http://localhost:8000/fraud/score",
            json=claim_data,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Status: SUCCESS")
            print(f"  Anomaly Score: {result['anomaly_score']:.3f}")
            print(f"  Is Suspicious: {result['is_suspicious']}")
            print(f"  Suspicion Level: {result['suspicion_level']}")
            print(f"  Recommended Track: {result['recommended_track']}")
            print(f"  Model Used: {result['model_used']}")
            print(f"  Flags: {', '.join(result['flags'][:3])}")
            print(f"  Graph Flags:")
            print(f"    - Shared Device: {result['graph_flags']['shared_device']}")
            print(f"    - Shared UPI: {result['graph_flags']['shared_upi']}")
            print(f"    - Coordinated Ring: {result['graph_flags']['coordinated_ring_suspected']}")
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
    print("Fraud Detection Endpoint Test Suite")
    print("="*60)
    
    # Run tests
    test_fraud_endpoint(legitimate_claim, "Legitimate Claim (Low Risk)")
    test_fraud_endpoint(fraudulent_claim, "Fraudulent Claim (High Risk)")
    test_fraud_endpoint(suspicious_claim, "Suspicious Claim (Medium Risk)")
    
    print("\n" + "="*60)
    print("Test suite complete!")
    print("="*60 + "\n")
