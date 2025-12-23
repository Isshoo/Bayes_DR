import os
import numpy as np
from tensorflow import keras
from PIL import Image
import io

# Path to the trained model
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "bcnn", "DenseNet(70:30)", "models", "best_bayesian_densenet.h5"
)

# Class labels (MUST match training order!)
CLASS_NAMES = ["No_DR", "Mild", "Moderate", "Severe", "Proliferate_DR"]

labels = {
    "No_DR": "No Diabetic Retinopathy",
    "Mild": "Mild Diabetic Retinopathy",
    "Moderate": "Moderate Diabetic Retinopathy",
    "Severe": "Severe Diabetic Retinopathy",
    "Proliferate_DR": "Proliferative Diabetic Retinopathy"
}

# Global model variable
_model = None

def load_model():
    """Load the trained BCNN model with proper compilation."""
    global _model
    if _model is None:
        try:
            print(f"Loading model from: {MODEL_PATH}")
            
            # Load model without compilation first
            _model = keras.models.load_model(MODEL_PATH, compile=False)
            
            # ✅ PENTING: Compile ulang dengan optimizer yang sama seperti training
            _model.compile(
                optimizer=keras.optimizers.Adam(learning_rate=1e-4),
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            
            print("✅ Model loaded and compiled successfully!")
            print(f"   Input shape: {_model.input_shape}")
            print(f"   Output shape: {_model.output_shape}")
            
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            raise
    
    return _model

def preprocess_image(image_bytes):
    """
    Preprocess the uploaded image for model prediction.
    Using DenseNet specific preprocessing.
    """
    try:
        from tensorflow.keras.applications.densenet import preprocess_input
        
        # Open image from bytes
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if img.mode != "RGB":
            img = img.convert("RGB")
        
        # Resize to 224x224
        img = img.resize((224, 224), Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(img, dtype=np.float32)
        
        # ✅ Use DenseNet preprocess_input (handles scaling and normalization)
        # Note: preprocess_input expects value range [0, 255]
        img_array = preprocess_input(img_array)
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

def predict_with_uncertainty(image_bytes, n_iterations=30):
    """
    Make prediction with Monte Carlo Dropout for uncertainty estimation.
    
    Args:
        image_bytes: Raw bytes of the uploaded image
        n_iterations: Number of forward passes for uncertainty estimation (default: 30)
        
    Returns:
        Dictionary containing prediction results with uncertainty metrics
    """
    try:
        # Load model
        model = load_model()
        
        # Preprocess image
        img_array = preprocess_image(image_bytes)
        
        # ✅ Perform Monte Carlo Dropout (30 forward passes)
        print(f"🔄 Running {n_iterations} MC Dropout iterations...")
        predictions = []
        
        for i in range(n_iterations):
            # ✅ KUNCI: training=True enables dropout during inference
            pred = model(img_array, training=True)
            predictions.append(pred.numpy())
        
        # Stack predictions and compute Bayesian statistics
        predictions = np.array(predictions)  # Shape: (n_iterations, 1, 5)
        
        # ✅ Mean prediction across all iterations (Bayesian posterior mean)
        mean_prediction = np.mean(predictions, axis=0)[0]
        
        # ✅ Standard deviation (aleatoric + epistemic uncertainty)
        std_prediction = np.std(predictions, axis=0)[0]
        
        # Get predicted class
        predicted_class = int(np.argmax(mean_prediction))
        predicted_class_name = CLASS_NAMES[predicted_class]
        
        # Get confidence (probability of predicted class)
        confidence = float(mean_prediction[predicted_class])
        
        # ✅ Compute uncertainty metrics
        # 1. Class-specific uncertainty
        class_uncertainty = float(std_prediction[predicted_class])
        
        # 2. Overall prediction uncertainty (mean std across all classes)
        overall_uncertainty = float(np.mean(std_prediction))
        
        # 3. Predictive entropy (measure of total uncertainty)
        predictive_entropy = float(-np.sum(mean_prediction * np.log(mean_prediction + 1e-10)))
        
        # ✅ Confidence interpretation
        confidence_level = "High" if confidence >= 0.8 else "Medium" if confidence >= 0.6 else "Low"
        uncertainty_level = "Low" if overall_uncertainty <= 0.05 else "Medium" if overall_uncertainty <= 0.10 else "High"
        
        print(f"\n📊 Prediction Results:")
        print(f"   Class: {predicted_class_name}")
        print(f"   Confidence: {confidence:.2%}")
        print(f"   Uncertainty: {overall_uncertainty:.4f}")
        print(f"   Entropy: {predictive_entropy:.4f}")
        
        return {
            # Primary results
            "predicted_class": predicted_class,
            "class_name": predicted_class_name,
            "class_label": labels[predicted_class_name],
            "confidence": confidence,
            "confidence_level": confidence_level,
            
            # Uncertainty metrics
            "uncertainty": overall_uncertainty,
            "class_uncertainty": class_uncertainty,
            "predictive_entropy": predictive_entropy,
            "uncertainty_level": uncertainty_level,
            
            # Detailed probabilities
            "probabilities": [float(p) for p in mean_prediction],
            "std_deviations": [float(s) for s in std_prediction],
            "class_names": CLASS_NAMES,
            
            # Metadata
            "n_iterations": n_iterations,
            "reliable_prediction": confidence >= 0.7 and overall_uncertainty <= 0.10
        }
    
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        raise

def get_prediction_explanation(result):
    """
    Generate human-readable explanation of the prediction.
    
    Args:
        result: Dictionary from predict_with_uncertainty()
        
    Returns:
        String explanation of the prediction
    """
    explanation = f"Diagnosis: {result['class_label']}\n"
    explanation += f"Confidence: {result['confidence']:.1%} ({result['confidence_level']})\n"
    explanation += f"Uncertainty: {result['uncertainty']:.4f} ({result['uncertainty_level']})\n\n"
    
    if result['reliable_prediction']:
        explanation += "✅ This is a reliable prediction (high confidence, low uncertainty).\n"
    else:
        explanation += "⚠️ This prediction has "
        if result['confidence'] < 0.7:
            explanation += "low confidence"
        if result['confidence'] < 0.7 and result['uncertainty'] > 0.10:
            explanation += " and "
        if result['uncertainty'] > 0.10:
            explanation += "high uncertainty"
        explanation += ". Consider additional medical evaluation.\n"
    
    # Show top 3 classes
    probs = result['probabilities']
    top_3_indices = np.argsort(probs)[-3:][::-1]
    
    explanation += "\nTop 3 Predictions:\n"
    for idx in top_3_indices:
        explanation += f"  {CLASS_NAMES[idx]}: {probs[idx]:.1%}\n"
    
    return explanation