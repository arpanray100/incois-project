# day10_analytics.py
"""
Day 10 analytics:
- auto-detects collections (handles naming variants)
- finds a text field to use (description, details, etc.)
- loads model + vectorizer, predicts hazard types
- saves: analytics_outputs/*.html, analytics_outputs/all_requests_with_predictions.csv
- updates/inserts a summary document(s) in `hazard_summaries` collection
"""

import os
import pickle
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.io as pio
from pymongo import MongoClient

# -------- config --------
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://raj:Raj%40100@cluster0.njlef.mongodb.net/incois?retryWrites=true&w=majority&appName=Cluster0"
)
DB_NAME = os.getenv("MONGO_DB", "incois")   # change if your DB name is different
MODEL_PATH = "hazard_model_improved.pkl"
VECTORIZER_PATH = "vectorizer.pkl"
OUTPUT_DIR = "analytics_outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------- connect to MongoDB --------
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print("Connected to DB:", DB_NAME)
print("Collections in DB:", db.list_collection_names())

# -------- load model + vectorizer --------
if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
    raise SystemExit(f"Missing model or vectorizer. Ensure {MODEL_PATH} and {VECTORIZER_PATH} exist.")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)
with open(VECTORIZER_PATH, "rb") as f:
    vectorizer = pickle.load(f)

# ✅ Dynamically detect hazard classes
LABEL_MAP = None
if hasattr(model, "classes_"):
    LABEL_MAP = {i: c for i, c in enumerate(model.classes_)}
    print("Detected hazard classes from model:", LABEL_MAP)

# -------- helper: robust predict function --------
def predict_hazard_list(texts):
    """
    texts: list[str]
    returns: list[str] (hazard names)
    """
    if not texts:
        return []
    X = vectorizer.transform(texts)
    preds = model.predict(X)

    # if model returns numbers, map with LABEL_MAP
    if LABEL_MAP and np.issubdtype(np.array(preds).dtype, np.number):
        return [LABEL_MAP.get(int(p), "unknown") for p in preds]
    else:
        # assume preds are already string labels
        return [str(p) for p in preds]

# -------- choose candidate collections (auto-detect) --------
target_keywords = {
    "help": ["help_requests", "helprequests", "help"],
    "resource": ["resource_requests", "resourcerequests", "resourcerequest", "resource_request", "resourceRequests"],
    "service": ["service_requests", "servicerequests", "service_requests", "servicerequest", "serviceRequests"],
    "donation": ["donations", "donation"],
    "emergency": ["emergency_reports", "emergencyreports", "emergency"],
    "reports": ["reports", "hazardreports", "hazard_reports"]
}

all_collections = [c.lower() for c in db.list_collection_names()]

selected_collections = []
for keyword, variants in target_keywords.items():
    found = None
    for v in variants:
        if v.lower() in all_collections:
            for orig in db.list_collection_names():
                if orig.lower() == v.lower():
                    found = orig
                    break
            if found:
                break
    if not found:
        for orig in db.list_collection_names():
            if keyword in orig.lower():
                found = orig
                break
    if found:
        selected_collections.append(found)

if not selected_collections:
    for orig in db.list_collection_names():
        if any(k in orig.lower() for k in ("request", "report", "help", "emergency", "donat")):
            selected_collections.append(orig)
    selected_collections = list(dict.fromkeys(selected_collections))

print("Selected collections for analysis:", selected_collections)

# -------- extract text field from each collection --------
FIELD_PRIORITIES = ["description", "details", "request_details", "message", "text", "report", "desc", "body", "note"]

rows = []
for col_name in selected_collections:
    col = db[col_name]
    sample_docs = list(col.find({}, limit=200))
    if not sample_docs:
        continue

    chosen_field = None
    keys = set().union(*(d.keys() for d in sample_docs))
    for p in FIELD_PRIORITIES:
        if p in keys:
            chosen_field = p
            break

    if not chosen_field:
        candidate_counts = {}
        for d in sample_docs:
            for k, v in d.items():
                if isinstance(v, str) and len(v.strip()) > 0:
                    candidate_counts[k] = candidate_counts.get(k, 0) + 1
        if candidate_counts:
            chosen_field = max(candidate_counts.items(), key=lambda x: x[1])[0]

    if not chosen_field:
        print(f"⚠️ Could not find a text field for collection '{col_name}', skipping.")
        continue

    print(f"Using field '{chosen_field}' from collection '{col_name}'")

    for doc in col.find():
        if chosen_field in doc and isinstance(doc[chosen_field], str) and doc[chosen_field].strip():
            rows.append({
                "collection": col_name,
                "description": doc[chosen_field].strip(),
                "_id": doc.get("_id")
            })

# -------- if no rows, exit --------
if not rows:
    print("❌ No text entries found in the selected collections.")
    print("Collections present:", db.list_collection_names())
    raise SystemExit()

# -------- build DataFrame --------
df = pd.DataFrame(rows)
print(f"Found {len(df)} records with text.")

# -------- predict in batch --------
texts = df["description"].tolist()
preds = predict_hazard_list(texts)
df["predicted_hazard"] = preds

# -------- summary counts --------
summary = df["predicted_hazard"].value_counts().reset_index()
summary.columns = ["hazard", "count"]
print("\nHazard counts:\n", summary)

# -------- save combined CSV --------
csv_path = os.path.join(OUTPUT_DIR, "all_requests_with_predictions.csv")
df.to_csv(csv_path, index=False)
print("Saved combined CSV:", csv_path)

# -------- create visualizations --------
bar_path = os.path.join(OUTPUT_DIR, "hazard_bar.html")
pie_path = os.path.join(OUTPUT_DIR, "hazard_pie.html")

fig_bar = px.bar(summary, x="hazard", y="count", text="count", color="count",
                 title="Hazard Request Counts")
fig_bar.update_layout(xaxis_title="Hazard Type", yaxis_title="Number of Requests")
pio.write_html(fig_bar, bar_path, auto_open=False)

fig_pie = px.pie(summary, values="count", names="hazard", title="Hazard Distribution", hole=0.3)
pio.write_html(fig_pie, pie_path, auto_open=False)

print("Saved visualizations:", bar_path, pie_path)

# -------- write summary back to MongoDB --------
summary_docs = summary.to_dict("records")
if summary_docs:
    db.hazard_summaries.delete_many({})
    for d in summary_docs:
        d["generated_at"] = pd.Timestamp.utcnow().to_pydatetime()
    db.hazard_summaries.insert_many(summary_docs)
    print("Updated collection 'hazard_summaries' with aggregated counts.")

print("✅ Day 10 analytics complete.")
