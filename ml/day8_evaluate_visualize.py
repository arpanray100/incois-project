# day8_evaluate_visualize.py
import pickle
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report

# ------------------------------
# 1️⃣ Load model and test data
# ------------------------------
with open("hazard_model_improved.pkl", "rb") as f:
    model = pickle.load(f)

with open("X_test.pkl", "rb") as f:
    X_test = pickle.load(f)

with open("y_test.pkl", "rb") as f:
    y_test = pickle.load(f)

# ------------------------------
# 2️⃣ Predict test labels
# ------------------------------
y_pred = model.predict(X_test)

# ------------------------------
# 3️⃣ Classification report
# ------------------------------
report = classification_report(y_test, y_pred, zero_division=0)
print("📑 Classification Report (Test Data):\n")
print(report)

# ------------------------------
# 4️⃣ Confusion matrix
# ------------------------------
cm = confusion_matrix(y_test, y_pred)

plt.figure(figsize=(8,6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=range(cm.shape[0]), yticklabels=range(cm.shape[0]))
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.tight_layout()

# ------------------------------
# 5️⃣ Save the plot
# ------------------------------
plt.savefig("confusion_matrix.png")
print("💾 Confusion matrix saved as confusion_matrix.png")
plt.show()
