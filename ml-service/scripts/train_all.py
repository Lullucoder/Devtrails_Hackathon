"""
Master Training Script - RoziRakshak ML Microservice
Trains all 4 AI models in sequence with comprehensive logging.
"""

import os
import sys
import time
import logging
from pathlib import Path

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    """Train all 4 models in sequence"""
    start_time = time.time()
    
    print("\n" + "="*70)
    print("RoziRakshak ML Microservice - Master Training Script")
    print("="*70 + "\n")
    
    # Change to ml-service directory
    script_dir = Path(__file__).parent
    ml_service_dir = script_dir.parent
    os.chdir(ml_service_dir)
    
    logger.info(f"Working directory: {os.getcwd()}")
    
    # Create necessary directories
    os.makedirs("data", exist_ok=True)
    os.makedirs("models", exist_ok=True)
    
    training_results = {}
    
    # ========================================================================
    # STEP 1: Generate Synthetic Data
    # ========================================================================
    print("\n" + "-"*70)
    print("STEP 1/5: Generating Synthetic Training Data")
    print("-"*70)
    
    try:
        import synthetic_data
        logger.info("✓ Synthetic data generation complete")
        training_results['data_generation'] = 'success'
    except Exception as e:
        logger.error(f"✗ Synthetic data generation failed: {e}")
        training_results['data_generation'] = f'failed: {e}'
        return 1
    
    # ========================================================================
    # STEP 2: Train Premium Engine (XGBoost)
    # ========================================================================
    print("\n" + "-"*70)
    print("STEP 2/5: Training Premium Engine (XGBoost)")
    print("-"*70)
    
    try:
        from premium_engine import train_premium_model
        metadata = train_premium_model(
            data_path="./data/rider_profiles.csv",
            models_dir="./models"
        )
        training_results['premium_engine'] = {
            'status': 'success',
            'rmse': metadata['rmse'],
            'n_samples': metadata['n_train_samples'] + metadata['n_test_samples']
        }
        logger.info(f"✓ Premium Engine trained: RMSE ₹{metadata['rmse']:.2f}")
    except Exception as e:
        logger.error(f"✗ Premium Engine training failed: {e}")
        training_results['premium_engine'] = {'status': f'failed: {e}'}
        return 1
    
    # ========================================================================
    # STEP 3: Train Forecasting Engine (Prophet)
    # ========================================================================
    print("\n" + "-"*70)
    print("STEP 3/5: Training Forecasting Engine (Prophet)")
    print("-"*70)
    
    try:
        from forecasting import train_forecasting_models
        metadata = train_forecasting_models(
            data_path="./data/disruption_history.csv",
            models_dir="./models"
        )
        training_results['forecasting_engine'] = {
            'status': 'success',
            'n_zones': metadata['n_zones'],
            'zones': list(metadata['zones'].keys())
        }
        logger.info(f"✓ Forecasting Engine trained: {metadata['n_zones']} zones")
    except Exception as e:
        logger.error(f"✗ Forecasting Engine training failed: {e}")
        training_results['forecasting_engine'] = {'status': f'failed: {e}'}
        return 1
    
    # ========================================================================
    # STEP 4: Train Fraud Detector (Isolation Forest)
    # ========================================================================
    print("\n" + "-"*70)
    print("STEP 4/5: Training Fraud Detector (Isolation Forest)")
    print("-"*70)
    
    try:
        from fraud_detector import train_fraud_model
        metadata = train_fraud_model(
            data_path="./data/claim_signals.csv",
            models_dir="./models"
        )
        training_results['fraud_detector'] = {
            'status': 'success',
            'contamination': metadata['contamination'],
            'n_samples': metadata['n_samples']
        }
        logger.info(f"✓ Fraud Detector trained: {metadata['n_samples']} samples")
    except Exception as e:
        logger.error(f"✗ Fraud Detector training failed: {e}")
        training_results['fraud_detector'] = {'status': f'failed: {e}'}
        return 1
    
    # ========================================================================
    # STEP 5: Train Confidence Scorer (Logistic Regression)
    # ========================================================================
    print("\n" + "-"*70)
    print("STEP 5/5: Training Confidence Scorer (Logistic Regression)")
    print("-"*70)
    
    try:
        from confidence_scorer import train_confidence_model
        metadata = train_confidence_model(
            data_path="./data/claim_signals.csv",
            models_dir="./models"
        )
        training_results['confidence_scorer'] = {
            'status': 'success',
            'accuracy': metadata['accuracy'],
            'auc_roc': metadata['auc_roc'],
            'n_samples': metadata['n_samples']
        }
        logger.info(f"✓ Confidence Scorer trained: accuracy {metadata['accuracy']:.3f}")
    except Exception as e:
        logger.error(f"✗ Confidence Scorer training failed: {e}")
        training_results['confidence_scorer'] = {'status': f'failed: {e}'}
        return 1
    
    # ========================================================================
    # Training Summary
    # ========================================================================
    end_time = time.time()
    total_time = end_time - start_time
    
    print("\n" + "="*70)
    print("TRAINING SUMMARY")
    print("="*70)
    
    print(f"\n✓ All 4 models trained successfully in {total_time:.1f} seconds\n")
    
    print("Model Performance:")
    print(f"  1. Premium Engine (XGBoost)")
    print(f"     - RMSE: ₹{training_results['premium_engine']['rmse']:.2f}")
    print(f"     - Samples: {training_results['premium_engine']['n_samples']}")
    
    print(f"\n  2. Forecasting Engine (Prophet)")
    print(f"     - Zones: {training_results['forecasting_engine']['n_zones']}")
    print(f"     - Zone IDs: {', '.join(training_results['forecasting_engine']['zones'])}")
    
    print(f"\n  3. Fraud Detector (Isolation Forest)")
    print(f"     - Contamination: {training_results['fraud_detector']['contamination']}")
    print(f"     - Samples: {training_results['fraud_detector']['n_samples']}")
    
    print(f"\n  4. Confidence Scorer (Logistic Regression)")
    print(f"     - Accuracy: {training_results['confidence_scorer']['accuracy']:.3f}")
    print(f"     - AUC-ROC: {training_results['confidence_scorer']['auc_roc']:.3f}")
    print(f"     - Samples: {training_results['confidence_scorer']['n_samples']}")
    
    print(f"\nTotal Training Time: {total_time:.1f} seconds")
    
    print("\n" + "="*70)
    print("✓ Training complete! All models saved to ./models/")
    print("="*70 + "\n")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
