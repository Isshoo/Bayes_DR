from flask import Flask, request, jsonify
from flask_cors import CORS
from classify import predict_with_uncertainty, get_prediction_explanation
import traceback

app = Flask(__name__)

# ✅ CORS configuration - allow both localhost and 127.0.0.1
CORS(app, origins=[
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://localhost:3001"  # Backup port
])

@app.route("/", methods=["GET"])
def index():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "message": "BayesDR API is running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/ (GET)",
            "classify": "/api/classify (POST)"
        }
    })

@app.route("/api/health", methods=["GET"])
def health():
    """Detailed health check with model status."""
    try:
        from classify import load_model
        model = load_model()
        
        return jsonify({
            "status": "healthy",
            "model_loaded": model is not None,
            "model_input_shape": str(model.input_shape) if model else None,
            "model_output_shape": str(model.output_shape) if model else None
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route("/api/classify", methods=["POST"])
def classify():
    """
    Classify a fundus image for Diabetic Retinopathy.
    
    Expects: multipart/form-data with 'image' file
    Returns: JSON with prediction, confidence, uncertainty, and probabilities
    """
    try:
        # ✅ Validate request has files
        if "image" not in request.files:
            return jsonify({
                "success": False,
                "error": "No image uploaded",
                "message": "Please upload an image file in 'image' field"
            }), 400
        
        file = request.files["image"]
        
        # ✅ Check if file is empty
        if file.filename == "":
            return jsonify({
                "success": False,
                "error": "Empty filename",
                "message": "Please select a valid image file"
            }), 400
        
        # ✅ Check file extension
        allowed_extensions = {"png", "jpg", "jpeg", "bmp", "tiff"}
        file_ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
        
        if file_ext not in allowed_extensions:
            return jsonify({
                "success": False,
                "error": "Invalid file type",
                "message": f"Allowed types: {', '.join(allowed_extensions).upper()}",
                "received": file_ext
            }), 400
        
        # ✅ Check file size (optional - max 10MB)
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()  # Get size
        file.seek(0)  # Reset to start
        
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            return jsonify({
                "success": False,
                "error": "File too large",
                "message": f"Maximum file size is 10MB. Your file: {file_size / (1024*1024):.2f}MB"
            }), 400
        
        print(f"\n{'='*70}")
        print(f"📥 Received image: {file.filename}")
        print(f"   Size: {file_size / 1024:.2f} KB")
        print(f"   Type: {file_ext}")
        print(f"{'='*70}")
        
        # ✅ Read image bytes
        image_bytes = file.read()
        
        # ✅ Validate image bytes
        if len(image_bytes) == 0:
            return jsonify({
                "success": False,
                "error": "Empty file",
                "message": "The uploaded file appears to be empty"
            }), 400
        
        print(f"✅ Image loaded: {len(image_bytes)} bytes")
        
        # ✅ Get prediction with uncertainty (30 MC iterations)
        print("🔄 Starting prediction...")
        result = predict_with_uncertainty(image_bytes, n_iterations=30)
        
        # ✅ Add explanation
        explanation = get_prediction_explanation(result)
        result["explanation"] = explanation
        
        # ✅ Add metadata
        result["success"] = True
        result["filename"] = file.filename
        result["file_size_kb"] = round(file_size / 1024, 2)
        
        print(f"\n✅ Prediction completed!")
        print(f"   Result: {result['class_name']}")
        print(f"   Confidence: {result['confidence']:.2%}")
        print(f"   Uncertainty: {result['uncertainty']:.4f}")
        print(f"{'='*70}\n")
        
        return jsonify(result), 200
    
    except ValueError as e:
        # ❌ Preprocessing or validation errors
        error_msg = str(e)
        print(f"\n❌ ValueError: {error_msg}")
        
        return jsonify({
            "success": False,
            "error": "Invalid image",
            "message": error_msg,
            "details": "The image could not be processed. Please check the file format."
        }), 400
    
    except Exception as e:
        # ❌ Unexpected errors
        error_msg = str(e)
        error_trace = traceback.format_exc()
        
        print(f"\n❌ PREDICTION ERROR:")
        print(error_trace)
        
        return jsonify({
            "success": False,
            "error": "Prediction failed",
            "message": error_msg,
            "details": "An unexpected error occurred during prediction. Check server logs."
        }), 500

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors."""
    return jsonify({
        "success": False,
        "error": "Not found",
        "message": "The requested endpoint does not exist",
        "available_endpoints": {
            "health": "/ or /api/health (GET)",
            "classify": "/api/classify (POST)"
        }
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors."""
    return jsonify({
        "success": False,
        "error": "Internal server error",
        "message": str(e)
    }), 500

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🚀 Starting BayesDR API Server")
    print("="*70)
    print(f"   API URL: http://localhost:5500")
    print(f"   Frontend: http://localhost:3000")
    print(f"   Endpoints:")
    print(f"      GET  /              - Health check")
    print(f"      GET  /api/health    - Detailed health check")
    print(f"      POST /api/classify  - Image classification")
    print("="*70 + "\n")
    
    # ✅ Pre-load model before starting server
    try:
        from classify import load_model
        print("🔄 Pre-loading model...")
        model = load_model()
        print(f"✅ Model loaded successfully!")
        print(f"   Input: {model.input_shape}")
        print(f"   Output: {model.output_shape}")
        print("="*70 + "\n")
    except Exception as e:
        print(f"⚠️  WARNING: Could not pre-load model: {e}")
        print("   Model will be loaded on first request")
        print("="*70 + "\n")
    
    app.run(host="0.0.0.0", port=5500, debug=True)