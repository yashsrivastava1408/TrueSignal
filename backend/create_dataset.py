import random
import csv
import os

# Configuration for two distinct restaurant behaviors
# Reliable: Honest signals
# Spice Garden: Gaming signals (wait for rider proximity)
merchants = {
    "reliable_rest": {"lat": 12.9716, "lon": 77.5946, "gaming_probability": 0.08},
    "spice_garden": {"lat": 12.9718, "lon": 77.5948, "gaming_probability": 0.88}
}

filename = "/Users/yashsrivastava32/Desktop/zomato-kpt-hackathon/backend/synthetic_kpt_dataset.csv"

def generate_csv_dataset(n_rows=200):
    headers = [
        "order_id", "merchant_id", "timestamp", "merchant_lat", "merchant_lon", 
        "rider_lat", "rider_lon", "distance_km", "is_gaming_simulated", "base_kpt_min", "hidden_load_index"
    ]
    
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        
        for i in range(n_rows):
            m_id = random.choice(list(merchants.keys()))
            m = merchants[m_id]
            is_gaming = random.random() < m["gaming_probability"]
            
            if is_gaming:
                # Proximity Bias (within 100-200m)
                r_lat = m["lat"] + random.uniform(-0.001, 0.001)
                r_lon = m["lon"] + random.uniform(-0.001, 0.001)
            else:
                # Normal Distribution (rider far away)
                r_lat = m["lat"] + random.uniform(0.01, 0.04)
                r_lon = m["lon"] + random.uniform(0.01, 0.04)
                
            # Random base KPT and hidden load for variety
            base_kpt = random.randint(12, 25)
            hidden_load = random.uniform(0.1, 0.9)
            
            writer.writerow([
                f"ORD-{10000+i}", m_id, f"2026-03-01 19:{random.randint(10,59)}",
                m["lat"], m["lon"], round(r_lat, 5), round(r_lon, 5), 
                "N/A", # Distance would be calculated by engine
                is_gaming, base_kpt, round(hidden_load, 2)
            ])
            
    return filename

if __name__ == "__main__":
    path = generate_csv_dataset(300)
    print(f"Successfully generated {path}")
