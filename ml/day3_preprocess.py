# day3_preprocess.py
import pandas as pd
import re
from sklearn.preprocessing import LabelEncoder

print("⚙️ Starting preprocessing...")

# Load data
df = pd.read_csv("hazards.csv")

# Drop rows with missing descriptions
df = df.dropna(subset=["description"])

# Clean text function
def clean_text(text):
    text = text.lower()  # lowercase
    text = re.sub(r"[^a-z0-9\s]", "", text)  # remove punctuation
    text = re.sub(r"\s+", " ", text).strip()  # remove extra spaces
    return text

# Apply cleaning
df["clean_description"] = df["description"].astype(str).apply(clean_text)

# Encode hazard type
label_encoder = LabelEncoder()
df["label"] = label_encoder.fit_transform(df["type"].astype(str))

# Save cleaned data
df.to_csv("hazards_clean.csv", index=False)

print("✅ Preprocessing complete")
print("📂 Saved as hazards_clean.csv")
print("🔖 Label mapping:", dict(zip(label_encoder.classes_, label_encoder.transform(label_encoder.classes_))))
