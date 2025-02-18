import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS  # ✅ Import Flask-CORS

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes

# Ensure model and feature names are loaded correctly
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "lightgbm_model.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "feature_names.pkl")

# Load the trained LightGBM model
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

# Load feature names
if os.path.exists(FEATURES_PATH):
    feature_names = joblib.load(FEATURES_PATH)
else:
    raise FileNotFoundError(f"Feature names file not found: {FEATURES_PATH}")

# Dummy data template to handle missing values
dummy_data = {feature: 0 for feature in feature_names}

# Define mappings for categorical variables
sex_mapping = {"all": 0, "male": 1, "female": 2}
study_type_mapping = {"interventional": 1, "observational": 0}
funder_type_mapping = {"industry": 0, "government": 1, "other": 2}
healthy_volunteers_mapping = {"yes": 1, "no": 0}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        user_data = request.json
        print("Received user data:", user_data)

        # Merge user input with dummy data
        complete_data = {**dummy_data, **user_data}

        # Apply categorical mappings
        complete_data["sex"] = sex_mapping.get(user_data.get("sex", "").lower(), 0)
        complete_data["studyType"] = study_type_mapping.get(user_data.get("studyType", "").lower(), 0)
        complete_data["funderType"] = funder_type_mapping.get(user_data.get("funderType", "").lower(), 2)
        complete_data["healthyVolunteers"] = healthy_volunteers_mapping.get(user_data.get("healthyVolunteers", "").lower(), 0)

        # Convert to DataFrame and ensure correct feature order
        input_df = pd.DataFrame([complete_data])
        input_df = input_df[feature_names]

        # Make prediction
        prediction = model.predict(input_df)
        print(prediction)

        return jsonify({"prediction": int(prediction[0])})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
