import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

print("🤖 Starting model training...")

# Load preprocessed data
with open("X_train.pkl", "rb") as f:
    X_train = pickle.load(f)
with open("X_test.pkl", "rb") as f:
    X_test = pickle.load(f)
with open("y_train.pkl", "rb") as f:
    y_train = pickle.load(f)
with open("y_test.pkl", "rb") as f:
    y_test = pickle.load(f)

# Train Logistic Regression model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Evaluate
train_acc = accuracy_score(y_train, model.predict(X_train))
test_acc = accuracy_score(y_test, model.predict(X_test))

print(f"✅ Training complete")
print(f"📊 Train Accuracy: {train_acc:.2f}")
print(f"📊 Test Accuracy: {test_acc:.2f}")

# Save model
with open("hazard_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("💾 Model saved as hazard_model.pkl")
