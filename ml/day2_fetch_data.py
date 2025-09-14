# day2_fetch_data.py
import requests
import pandas as pd

# 🔹 Update with your backend API
API_URL = "http://localhost:5000/api/hazards"

def fetch_hazard_data():
    try:
        print("📡 Fetching hazard data from backend...")
        response = requests.get(API_URL)
        response.raise_for_status()  # raise error if not 200
        data = response.json()
        
        print(f"✅ Retrieved {len(data)} hazards")
        return data
    except Exception as e:
        print("❌ Error fetching data:", e)
        return []

def save_to_csv(data, filename="hazards.csv"):
    if not data:
        print("⚠️ No data to save")
        return

    # Extract useful fields
    rows = []
    for hazard in data:
        rows.append({
            "id": hazard.get("_id"),
            "type": hazard.get("type"),
            "description": hazard.get("description"),
            "latitude": hazard.get("location", {}).get("latitude"),
            "longitude": hazard.get("location", {}).get("longitude"),
            "media": ",".join([m.get("fileUrl", "") for m in hazard.get("media", [])]),
            "createdAt": hazard.get("createdAt"),
        })
    
    # Save as CSV
    df = pd.DataFrame(rows)
    df.to_csv(filename, index=False, encoding="utf-8")
    print(f"💾 Data saved to {filename}")
    print(df.head())

if __name__ == "__main__":
    data = fetch_hazard_data()
    save_to_csv(data)
