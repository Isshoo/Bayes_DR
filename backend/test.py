"""
Script untuk debugging model yang selalu prediksi "Moderate"
Jalankan script ini untuk cek model Anda!
"""

import numpy as np
from tensorflow import keras
import os

# ============================================================================
# 1. CHECK MODEL FILE
# ============================================================================
print("="*70)
print("STEP 1: CHECKING MODEL FILE")
print("="*70)

MODEL_PATH = "../bcnn/DenseNet(70:30)/models/best_bayesian_densenet.h5"  # Adjust path

if os.path.exists(MODEL_PATH):
    file_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)  # MB
    print(f"✅ Model file found!")
    print(f"   Path: {MODEL_PATH}")
    print(f"   Size: {file_size:.2f} MB")
    
    if file_size < 50:
        print(f"   ⚠️  WARNING: Model size seems small for DenseNet121!")
        print(f"   Expected: ~100-150 MB")
else:
    print(f"❌ Model file NOT found at: {MODEL_PATH}")
    print(f"\n💡 Check these locations:")
    print(f"   1. models/best_bayesian_densenet.h5")
    print(f"   2. models/bayesian_densenet_final.h5")
    exit()

# ============================================================================
# 2. LOAD AND INSPECT MODEL
# ============================================================================
print("\n" + "="*70)
print("STEP 2: LOADING MODEL")
print("="*70)

try:
    model = keras.models.load_model(MODEL_PATH, compile=False)
    print("✅ Model loaded successfully!")
    
    # Check model architecture
    print(f"\n📐 Model Architecture:")
    print(f"   Total layers: {len(model.layers)}")
    print(f"   Input shape: {model.input_shape}")
    print(f"   Output shape: {model.output_shape}")
    
    # Check if it's DenseNet-based
    is_densenet = any('densenet' in layer.name.lower() for layer in model.layers)
    print(f"   DenseNet-based: {'✅ Yes' if is_densenet else '❌ No'}")
    
    # Check dropout layers
    dropout_layers = [layer for layer in model.layers if 'dropout' in layer.name.lower()]
    print(f"   Dropout layers: {len(dropout_layers)}")
    for layer in dropout_layers:
        print(f"      - {layer.name}: rate={layer.rate}")
    
    # Check final Dense layer
    output_layer = model.layers[-1]
    print(f"\n🎯 Output Layer:")
    print(f"   Name: {output_layer.name}")
    print(f"   Units: {output_layer.units}")
    print(f"   Activation: {output_layer.activation.__name__}")
    
    if output_layer.units != 5:
        print(f"   ❌ ERROR: Output should be 5 classes, found {output_layer.units}")
    
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit()

# ============================================================================
# 3. TEST WITH RANDOM INPUTS
# ============================================================================
print("\n" + "="*70)
print("STEP 3: TESTING WITH RANDOM INPUTS")
print("="*70)

# Create random images
np.random.seed(42)
test_images = [
    np.random.rand(1, 224, 224, 3).astype(np.float32) * 0.2,  # Dark
    np.random.rand(1, 224, 224, 3).astype(np.float32) * 0.5,  # Medium
    np.random.rand(1, 224, 224, 3).astype(np.float32),        # Bright
]

CLASS_NAMES = ["No_DR", "Mild", "Moderate", "Severe", "Proliferate_DR"]

print("\n🧪 Testing with 3 random inputs:")
for i, img in enumerate(test_images):
    pred = model.predict(img, verbose=0)
    pred_class = np.argmax(pred[0])
    print(f"\nTest {i+1}:")
    print(f"   Predictions: {pred[0]}")
    print(f"   Predicted class: {pred_class} ({CLASS_NAMES[pred_class]})")
    print(f"   Max prob: {np.max(pred[0]):.4f}")
    
    # Check if all predictions are the same
    if i > 0 and np.argmax(pred[0]) == 2:  # Always "Moderate" (index 2)
        print(f"   ⚠️  WARNING: Predicting Moderate again!")

# ============================================================================
# 4. CHECK MODEL WEIGHTS
# ============================================================================
print("\n" + "="*70)
print("STEP 4: CHECKING MODEL WEIGHTS")
print("="*70)

# Check if weights are properly loaded
total_weights = 0
zero_weights = 0

for layer in model.layers:
    weights = layer.get_weights()
    if len(weights) > 0:
        total_weights += len(weights)
        for w in weights:
            if np.all(w == 0):
                zero_weights += 1

print(f"Total weight arrays: {total_weights}")
print(f"Zero weight arrays: {zero_weights}")

if zero_weights > total_weights * 0.5:
    print(f"❌ ERROR: Too many zero weights! Model might not be trained.")
else:
    print(f"✅ Weights look normal")

# ============================================================================
# 5. CHECK LAYER TRAINABILITY
# ============================================================================
print("\n" + "="*70)
print("STEP 5: CHECKING TRAINABLE LAYERS")
print("="*70)

trainable_layers = sum([layer.trainable for layer in model.layers])
non_trainable_layers = len(model.layers) - trainable_layers

print(f"Trainable layers: {trainable_layers}")
print(f"Non-trainable layers: {non_trainable_layers}")

# Check last few layers (should be trainable)
print(f"\nLast 5 layers:")
for layer in model.layers[-5:]:
    print(f"   {layer.name:30s} - Trainable: {layer.trainable}")

# ============================================================================
# 6. MC DROPOUT TEST
# ============================================================================
print("\n" + "="*70)
print("STEP 6: TESTING MC DROPOUT")
print("="*70)

test_img = np.random.rand(1, 224, 224, 3).astype(np.float32)

print("\n🔄 Running 10 MC Dropout iterations:")
mc_predictions = []
for i in range(10):
    pred = model(test_img, training=True)
    mc_predictions.append(pred.numpy()[0])
    print(f"Iter {i+1}: Class {np.argmax(pred.numpy()[0])} - {pred.numpy()[0]}")

mc_predictions = np.array(mc_predictions)
variance = np.var(mc_predictions, axis=0)

print(f"\nVariance across iterations: {variance}")
print(f"Mean variance: {np.mean(variance):.6f}")

if np.mean(variance) < 1e-6:
    print("❌ ERROR: No variance in MC Dropout! Dropout might not be working.")
    print("   This could explain why predictions are always the same.")
else:
    print("✅ MC Dropout is working (predictions vary)")

# ============================================================================
# 7. DIAGNOSIS
# ============================================================================
print("\n" + "="*70)
print("DIAGNOSIS & RECOMMENDATIONS")
print("="*70)

issues = []

if zero_weights > total_weights * 0.3:
    issues.append("⚠️  Many zero weights - model might not be trained properly")

if np.mean(variance) < 1e-6:
    issues.append("⚠️  MC Dropout not working - check dropout layers")

if all(np.argmax(mc_predictions[i]) == 2 for i in range(len(mc_predictions))):
    issues.append("⚠️  Model always predicts 'Moderate' - likely overfitted to majority class")

if issues:
    print("\n🚨 ISSUES FOUND:")
    for issue in issues:
        print(f"   {issue}")
    
    print("\n💡 SOLUTIONS:")
    print("   1. Re-train model dengan class weights:")
    print("      from sklearn.utils.class_weight import compute_class_weight")
    print("      class_weights = compute_class_weight('balanced', ...)")
    print("      model.fit(..., class_weight=class_weights)")
    print()
    print("   2. Check if you loaded the CORRECT model file")
    print("      Should be: models/best_bayesian_densenet.h5 (ModelCheckpoint best)")
    print()
    print("   3. Verify training actually completed and saved")
    print("      Check training history: history.history['val_accuracy']")
else:
    print("✅ No obvious issues found!")
    print("   The problem might be in preprocessing or inference code.")

print("\n" + "="*70)