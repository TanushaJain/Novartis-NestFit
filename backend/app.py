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

        return jsonify({"prediction": int(prediction[0])})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    try:
        data = request.get_json(force=True)  # Ensure JSON parsing
        df = pd.DataFrame(data)

        # 🛠 Ensure only required columns are used (ignores extra columns)
        input_columns = df.columns.tolist()
        input_df = df[input_columns]  # Keep only provided columns
        
        # 🛠 Add missing features efficiently
        missing_features = list(set(feature_names) - set(input_df.columns))
        if missing_features:
            missing_df = pd.DataFrame(0, index=input_df.index, columns=missing_features)
            input_df = pd.concat([input_df, missing_df], axis=1)

        # 🛠 Ensure correct feature order before prediction
        input_df = input_df[feature_names]

        # 🔹 Identify Year & Month Columns (Modify these based on your dataset)
        year_month_columns = [
            "Start Date_Year", "Start Date_Month",
            "Completion Date_Year", "Completion Date_Month"
        ]

        # 🛠 Convert Year & Month Columns to int
        for col in year_month_columns:
            if col in input_df.columns:
                input_df[col] = input_df[col].fillna(0).astype('int32')  # Avoid NaN issues

        # 🛠 Convert other numeric columns to float
        input_df = input_df.astype({col: 'float32' for col in input_df.columns if col not in year_month_columns})

        # 🛠 Make Predictions
        predictions = model.predict(input_df)

        # 🛠 Add predictions column to output
        df["prediction"] = predictions.tolist()

        # 🛠 Return only original input columns + prediction
        response_df = df[input_columns + ["prediction"]]

        return jsonify({"predictions": response_df.to_dict(orient="records")})

    except Exception as e:
        logging.error(f"Batch prediction error: {e}")
        return jsonify({"error": str(e)}), 400




if __name__ == '__main__':
    app.run(debug=True)
