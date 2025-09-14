from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import numpy as np

# ---------------------------
# Load trained model & vectorizer
# ---------------------------
with open("hazard_model_improved.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# Mapping from label index to hazard type
label_mapping = {0: "cyclone", 1: "earthquake", 2: "fire", 3: "flood", 4: "high waves", 5: "storm surge"}

# ---------------------------
# FastAPI app setup
# ---------------------------
app = FastAPI(title="Hazard Prediction API")

# ---------------------------
# Request schema
# ---------------------------
class HazardInput(BaseModel):
    description: str

# ---------------------------
# Prediction endpoint
# ---------------------------
@app.post("/predict")
def predict_hazard(data: HazardInput):
    if not data.description.strip():
        raise HTTPException(status_code=400, detail="Description cannot be empty")

    # Transform input text
    X_input = vectorizer.transform([data.description])

    # Predict hazard class
    pred_idx = model.predict(X_input)[0]
    pred_label = label_mapping.get(pred_idx, "unknown")

    return {"predicted_hazard": pred_label}
