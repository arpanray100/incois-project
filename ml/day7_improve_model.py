# day7_improve_model.py
import pickle
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, accuracy_score

print("⚙️ Starting Day 7 improvements...")

# Load previously saved data
with open("X_train.pkl", "rb") as f:
    X_vec = pickle.load(f)
with open("y_train.pkl", "rb") as f:
    y = pickle.load(f)

# Split into train/test (small dataset, so no stratify)
X_train, X_test, y_train, y_test = train_test_split(
    X_vec, y, test_size=0.3, random_state=42, shuffle=True
)

print(f"📊 Training samples: {X_train.shape[0]}, Testing samples: {X_test.shape[0]}")

# Train model with MultinomialNB
model = MultinomialNB()
model.fit(X_train, y_train)

# Evaluate
y_pred_train = model.predict(X_train)
y_pred_test = model.predict(X_test)

print("📑 Classification Report (Test Data):")
print(classification_report(y_test, y_pred_test))

print(f"📊 Train Accuracy: {accuracy_score(y_train, y_pred_train):.2f}")
print(f"📊 Test Accuracy: {accuracy_score(y_test, y_pred_test):.2f}")

# Save improved model
with open("hazard_model_improved.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ Improved model saved as hazard_model_improved.pkl")
