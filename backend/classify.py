import os
import numpy as np
from tensorflow import keras
import tensorflow as tf
from PIL import Image
import io

# Path to the trained model
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "bcnn", "DenseNet(70:30)", "models", "bayesian_densenet_v2.h5"
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
            
            # ✅ Compile with same optimizer as training
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
    Using normalization that matches training (rescale=1./255).
    """
    try:
        # Open image from bytes
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if img.mode != "RGB":
            img = img.convert("RGB")
        
        # Resize to 224x224 (DenseNet input size)
        img = img.resize((224, 224), Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(img, dtype=np.float32)
        
        # ✅ Normalize to [0, 1] (Match training: rescale=1./255)
        img_array = img_array / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Debug: Print image stats
        print(f"   Image stats: min={img_array.min():.4f}, max={img_array.max():.4f}, mean={img_array.mean():.4f}")
        
        return img_array
    
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

def mc_dropout_predict(model, img_array, n_iterations=50):
    """
    Perform MC Dropout inference with proper BatchNorm handling.
    
    CRITICAL FIX:
    - BatchNorm layers MUST stay in inference mode (use learned stats)
    - Only Dropout layers should be in training mode
    
    This uses a custom training step to control layer behavior precisely.
    """
    
    # ✅ METHOD 1: Using tf.function with custom training flag
    @tf.function
    def predict_with_dropout(x):
        """
        Custom prediction function that enables dropout but keeps BatchNorm in inference mode.
        """
        # Manually iterate through layers
        for layer in model.layers:
            if isinstance(layer, keras.layers.Dropout):
                # Enable dropout
                x = layer(x, training=True)
            elif isinstance(layer, keras.layers.BatchNormalization):
                # Force BatchNorm to inference mode
                x = layer(x, training=False)
            elif hasattr(layer, 'layers'):
                # For nested models (like DenseNet), recursively apply
                for sublayer in layer.layers:
                    if isinstance(sublayer, keras.layers.Dropout):
                        x = sublayer(x, training=True)
                    elif isinstance(sublayer, keras.layers.BatchNormalization):
                        x = sublayer(x, training=False)
                    else:
                        x = sublayer(x, training=False)
            else:
                # Regular layers in inference mode
                x = layer(x, training=False)
        return x
    
    # This approach is too complex. Let's use the WORKING approach from your original code!
    
    # ✅ METHOD 2: Split Inference (YOUR ORIGINAL APPROACH - KEEP IT!)
    # Extract features using backbone (training=False for BatchNorm)
    feature_extractor = keras.Model(
        inputs=model.input, 
        outputs=model.get_layer('bn_1').output
    )
    
    # Get features with BatchNorm in inference mode
    features = feature_extractor(img_array, training=False)
    
    # Get head layers (Dense + Dropout + Output)
    head_layers = [
        model.get_layer('dense_1'),
        model.get_layer('bayesian_dropout_1'),
        model.get_layer('dense_2'),
        model.get_layer('bayesian_dropout_2'),
        model.get_layer('dense_3'),
        model.get_layer('bayesian_dropout_3'),
        model.get_layer('output')
    ]
    
    # Perform MC Dropout iterations
    mc_predictions = []
    
    for i in range(n_iterations):
        # Start with features
        x = features
        
        # Pass through head layers with dropout enabled
        for layer in head_layers:
            if 'dropout' in layer.name:
                x = layer(x, training=True)  # Enable dropout
            else:
                x = layer(x, training=False)  # Regular layers
        
        mc_predictions.append(x.numpy()[0])
    
    return np.array(mc_predictions)

def predict_with_uncertainty(image_bytes, n_iterations=50):
    """
    Make prediction with Monte Carlo Dropout for uncertainty estimation.
    
    FIXED VERSION:
    - Uses split inference to keep BatchNorm in inference mode
    - Only enables dropout in head layers
    - This is YOUR ORIGINAL APPROACH - it was CORRECT!
    
    Args:
        image_bytes: Raw bytes of the uploaded image
        n_iterations: Number of forward passes for uncertainty estimation (default: 50)
        
    Returns:
        Dictionary containing prediction results with uncertainty metrics
    """
    try:
        # Load model
        model = load_model()
        
        # Preprocess image
        img_array = preprocess_image(image_bytes)
        
        # ✅ 1. STANDARD PREDICTION (training=False)
        print(f"🔄 Running standard prediction (training=False)...")
        standard_pred = model.predict(img_array, verbose=0)[0]
        
        print(f"   Standard prediction: {CLASS_NAMES[np.argmax(standard_pred)]} ({np.max(standard_pred):.2%})")
        
        # ✅ 2. MC DROPOUT - SPLIT INFERENCE (YOUR ORIGINAL APPROACH)
        print(f"🔄 Running MC Dropout via Split Inference (n={n_iterations})...")
        
        mc_predictions = mc_dropout_predict(model, img_array, n_iterations)
        
        # ✅ 3. COMPUTE BAYESIAN STATISTICS
        mean_prediction = np.mean(mc_predictions, axis=0)  # Shape: (5,)
        std_prediction = np.std(mc_predictions, axis=0)    # Shape: (5,)
        
        # Get predicted class from Mean Prediction
        predicted_class = int(np.argmax(mean_prediction))
        predicted_class_name = CLASS_NAMES[predicted_class]
        
        # Get confidence (probability of predicted class)
        confidence = float(mean_prediction[predicted_class])
        
        # ✅ 4. COMPUTE UNCERTAINTY METRICS
        # 1. Class-specific uncertainty (std of predicted class)
        class_uncertainty = float(std_prediction[predicted_class])
        
        # 2. Overall prediction uncertainty (mean std across all classes)
        overall_uncertainty = float(np.mean(std_prediction))
        
        # 3. Predictive entropy (measure of total uncertainty)
        predictive_entropy = float(-np.sum(mean_prediction * np.log(mean_prediction + 1e-10)))
        
        # ✅ 5. CONFIDENCE & UNCERTAINTY INTERPRETATION
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