import requests
import random
import time

API_URL = "http://127.0.0.1:8000"

# Mock two distinct restaurants
# 1. Reliable Restaurant: Marks food ready when it's ACTUALLY ready (rider mostly far away)
# 2. Spice Garden (Gaming the system): Marks food ready ONLY when rider arrives (rider very close)

merchants = {
    "reliable_rest": {"lat": 12.9716, "lon": 77.5946, "gaming_probability": 0.1},
    "spice_garden": {"lat": 12.9718, "lon": 77.5948, "gaming_probability": 0.85}
}

def simulate_for_event(merchant_id, order_id):
    merchant = merchants[merchant_id]
    
    # Simulate rider location when merchant taps the 'Ready' button
    if random.random() < merchant["gaming_probability"]:
        # GAMING: Rider is right next to the restaurant (< 0.002 degrees away)
        rider_lat = merchant["lat"] + random.uniform(-0.001, 0.001)
        rider_lon = merchant["lon"] + random.uniform(-0.001, 0.001)
    else:
        # HONEST: Rider is far away
        rider_lat = merchant["lat"] + random.uniform(0.01, 0.05)
        rider_lon = merchant["lon"] + random.uniform(0.01, 0.05)
        
    payload = {
        "order_id": f"ORD-{order_id}",
        "merchant_id": merchant_id,
        "merchant_loc": {"lat": merchant["lat"], "lon": merchant["lon"]},
        "rider_loc": {"lat": rider_lat, "lon": rider_lon}
    }
    
    try:
        res = requests.post(f"{API_URL}/mark_ready", json=payload)
        data = res.json()
        print(f"[{merchant_id}] FOR Marked -> Rider Influenced: {data['is_rider_influenced_flag']} | Current RIC: {data['current_ric']:.2f}")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to API. Is the FastAPI server running?")
        exit(1)

def demo():
    print("--- Starting TrueSignal Data Generator ---")
    print("Simulating 30 historic orders to build Rider Influence Coefficient (RIC)...\n")
    
    # 1. Backfill history (simulate past 30 days of data)
    for i in range(30):
        simulate_for_event("reliable_rest", 1000 + i)
        simulate_for_event("spice_garden", 2000 + i)
        time.sleep(0.05) # Add tiny delay for visual effect in terminal

    print("\n--- History Built in Feature Store. Now intercepting KPT for new orders ---\n")
    
    # 2. Predict new order
    base_kpt = 14.0 # 14 minutes
    
    print(f"Predicting KPT for Reliable Restaurant (Base model predicts {base_kpt} min)")
    res1 = requests.post(f"{API_URL}/predict_kpt", json={
        "order_id": "NEW-ORD-1",
        "merchant_id": "reliable_rest",
        "base_kpt_minutes": base_kpt
    }).json()
    print(f"Result -> RIC: {res1['ric']} | Adjusted KPT: {res1['adjusted_kpt']} | Reason: {res1['adjustment_reason']}\n")
    
    print(f"Predicting KPT for Spice Garden (Base model predicts {base_kpt} min)")
    res2 = requests.post(f"{API_URL}/predict_kpt", json={
        "order_id": "NEW-ORD-2",
        "merchant_id": "spice_garden",
        "base_kpt_minutes": base_kpt
    }).json()
    print(f"Result -> RIC: {res2['ric']} | Adjusted KPT: {res2['adjusted_kpt']} | Reason: {res2['adjustment_reason']}\n")
    
    print("--- Demo Complete ---")
    print(f"Notice how Spice Garden's predicted ETA was automatically corrected by +{res2['eta_saved_minutes']} minutes!")

if __name__ == "__main__":
    demo()
