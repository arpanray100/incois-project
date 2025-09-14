import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer

print("⚙️ Starting feature engineering...")

# Load preprocessed CSV
df = pd.read_csv("hazards_clean.csv")

# Features and labels
X_texts = df["description"].astype(str)
y = df["label"]

# Convert text to numerical features
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(X_texts)

# Train-test split with stratification
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y
)

# Save splits
with open("X_train.pkl", "wb") as f:
    pickle.dump(X_train, f)
with open("X_test.pkl", "wb") as f:
    pickle.dump(X_test, f)
with open("y_train.pkl", "wb") as f:
    pickle.dump(y_train, f)
with open("y_test.pkl", "wb") as f:
    pickle.dump(y_test, f)

# Save vectorizer too (important for future predictions)
with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("✅ Features extracted and train/test split done")
print(f"📊 Training samples: {X_train.shape[0]}, Testing samples: {X_test.shape[0]}")
print(f"🔤 Vocabulary size: {len(vectorizer.vocabulary_)}")
print("💾 Data saved as X_train.pkl, X_test.pkl, y_train.pkl, y_test.pkl, vectorizer.pkl")
