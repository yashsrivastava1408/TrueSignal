from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from typing import Dict

app = FastAPI(title="Project TrueSignal: KPT Adjustment Engine", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MOCK FEATURE STORE ---
feature_store: Dict[str, Dict[str, int]] = {}

class Location(BaseModel):
    lat: float
    lon: float

class FORRequest(BaseModel):
    order_id: str
    merchant_id: str
    merchant_loc: Location
    rider_loc: Location
    
class KPTRequest(BaseModel):
    order_id: str
    merchant_id: str
    base_kpt_minutes: float

class FeedbackRequest(BaseModel):
    merchant_id: str
    is_food_ready: bool

class AcceptOrderRequest(BaseModel):
    merchant_id: str
    latency_seconds: float

def init_merchant(merchant_id: str):
    if merchant_id not in feature_store:
        feature_store[merchant_id] = {
            "total_for_marks": 0, 
            "rider_influenced_marks": 0,
            "total_feedbacks": 0,
            "negative_feedbacks": 0,
            "total_accept_latency_s": 0.0,
            "total_orders": 0,
            "dinein_load": 0.0,  # 0.0 (empty) to 1.0 (full)
            "dineout_reservations": 0
        }

import math

def calculate_distance(loc1: Location, loc2: Location) -> float:
    """
    Haversine formula to calculate the distance between two points 
    on the earth (specified in decimal degrees).
    Returns distance in kilometers.
    """
    R = 6371.0 # Earth radius in km
    
    phi1, phi2 = math.radians(loc1.lat), math.radians(loc2.lat)
    dphi = math.radians(loc2.lat - loc1.lat)
    dlambda = math.radians(loc2.lon - loc1.lon)
    
    a = math.sin(dphi/2)**2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    c = 2 * math.asin(math.sqrt(a))
    dist = R * c
    return dist

@app.post("/mark_ready")
async def process_for_signal(req: FORRequest):
    init_merchant(req.merchant_id)
    merchant_data = feature_store[req.merchant_id]
    merchant_data["total_for_marks"] += 1
    
    dist_km = calculate_distance(req.merchant_loc, req.rider_loc)
    # Flag as rider-influenced if they are within 150m (0.15km)
    is_rider_influenced = dist_km < 0.150 
    
    if is_rider_influenced:
        merchant_data["rider_influenced_marks"] += 1
        
    current_ric = merchant_data["rider_influenced_marks"] / merchant_data["total_for_marks"]
        
    return {
        "status": "success",
        "is_rider_influenced_flag": is_rider_influenced,
        "current_ric": round(current_ric, 2)
    }

@app.post("/rider_feedback")
async def process_feedback(req: FeedbackRequest):
    init_merchant(req.merchant_id)
    fs = feature_store[req.merchant_id]
    fs["total_feedbacks"] += 1
    if not req.is_food_ready:
        fs["negative_feedbacks"] += 1
    return {"status": "success"}

@app.post("/accept_order")
async def process_accept(req: AcceptOrderRequest):
    init_merchant(req.merchant_id)
    fs = feature_store[req.merchant_id]
    fs["total_orders"] += 1
    fs["total_accept_latency_s"] += req.latency_seconds
    return {"status": "success"}

@app.post("/simulate_dinein")
async def simulate_dinein(merchant_id: str, load: float, reservations: int = 0):
    """Phase 2: Mocks Dineout reservation data and inferred walk-in load."""
    init_merchant(merchant_id)
    fs = feature_store[merchant_id]
    fs["dinein_load"] = max(0.0, min(1.0, load))
    fs["dineout_reservations"] = reservations
    return {"status": "success", "current_load": fs["dinein_load"], "reservations": fs["dineout_reservations"]}

@app.get("/merchant/{merchant_id}/stats")
async def get_stats(merchant_id: str):
    """Returns the Rider Influence Coefficient, SQS and other stats for a merchant."""
    if merchant_id not in feature_store:
        return {"merchant_id": merchant_id, "ric": 0.0, "sqs": 100.0, "tier": "Gold", "avg_latency": 10.0}
        
    data = feature_store[merchant_id]
    ric = data["rider_influenced_marks"] / data["total_for_marks"] if data["total_for_marks"] > 0 else 0.0
    feedback_score = 1.0 - (data["negative_feedbacks"] / data["total_feedbacks"]) if data["total_feedbacks"] > 0 else 1.0
    avg_latency = data["total_accept_latency_s"] / data["total_orders"] if data["total_orders"] > 0 else 10.0
    latency_score = max(0.0, 1.0 - (avg_latency / 60.0))

    ric_score = 1.0 - ric
    sqs_raw = (feedback_score * 0.50) + (ric_score * 0.35) + (latency_score * 0.15)
    sqs_percent = round(sqs_raw * 100, 2)
    
    if sqs_percent >= 85:
        tier = "Gold"
    elif sqs_percent >= 70:
        tier = "Silver"
    elif sqs_percent >= 55:
        tier = "Bronze"
    else:
        tier = "Below Threshold"

    return {
        "merchant_id": merchant_id, 
        "ric": round(ric, 2),
        "sqs": sqs_percent,
        "tier": tier,
        "avg_latency": round(avg_latency, 1),
        "feedback_score": round(feedback_score, 2),
        "hidden_load": round(data.get("dinein_load", 0.0), 2),
        "dineout_reservations": data.get("dineout_reservations", 0)
    }

@app.post("/predict_kpt")
async def adjust_kpt(req: KPTRequest):
    ric = 0.0
    sqs = 100.0
    
    if req.merchant_id in feature_store:
        data = feature_store[req.merchant_id]
        ric = data["rider_influenced_marks"] / data["total_for_marks"] if data["total_for_marks"] > 0 else 0.0
        
        feedback_score = 1.0 - (data["negative_feedbacks"] / data["total_feedbacks"]) if data["total_feedbacks"] > 0 else 1.0
        avg_latency = data["total_accept_latency_s"] / data["total_orders"] if data["total_orders"] > 0 else 10.0
        latency_score = max(0.0, 1.0 - (avg_latency / 60.0))
        ric_score = 1.0 - ric
        sqs = round(((feedback_score * 0.50) + (ric_score * 0.35) + (latency_score * 0.15)) * 100, 2)
        
        # Phase 2: Kitchen Load Factor
        dinein_load = data.get("dinein_load", 0.0)
        dineout_res = data.get("dineout_reservations", 0)
    else:
        dinein_load = 0.0
        dineout_res = 0.0
        
    multiplier = 1.0
    adjustment_reason = "Reliable signals — standard predict"
    
    # Phase 2: Add load-based buffer (Zomato-exclusive Dineout signals)
    load_multiplier = 1.0 + (dinein_load * 0.6) # Up to 60% increase for full kitchen
    if dinein_load > 0.7:
        adjustment_reason = f"High Hidden Load ({int(dinein_load*100)}%). Dineout signals indicate peak rush."
    elif dinein_load > 0.3:
        adjustment_reason = f"Moderate Hidden Load ({int(dinein_load*100)}%) detected via Dineout."
    else:
        adjustment_reason = "Low Kitchen Load"

    # Signal Correction Overlay (from Phase 1)
    # SDS (Signal-Aware Dispatch) Logic - Phase 3
    dispatch_delay = 0.0
    if sqs < 55:
        multiplier = 1.40
        dispatch_delay = req.base_kpt_minutes * 0.3 # Wait 30% of time before dispatch
        adjustment_reason += " + Poor Signal Accuracy (Gamed FOR)."
    elif sqs < 70:
        multiplier = 1.25
        dispatch_delay = req.base_kpt_minutes * 0.15
        adjustment_reason += " + Unreliable Signals."
    elif sqs < 85:
        multiplier = 1.10
        adjustment_reason += " + Moderate Signal Noise."
        
    final_multiplier = multiplier * load_multiplier
    adjusted_kpt = req.base_kpt_minutes * final_multiplier
    
    # Sustainability Metric: 1 min of idle removal = ~15ml of fuel saved (avg bike)
    eta_saved = adjusted_kpt - req.base_kpt_minutes
    fuel_saved = eta_saved * 15.0 
    
    return {
        "order_id": req.order_id,
        "merchant_id": req.merchant_id,
        "base_kpt": req.base_kpt_minutes,
        "ric": round(ric, 2),
        "sqs": sqs,
        "hidden_load": round(dinein_load, 2),
        "dineout_reservations": dineout_res,
        "adjusted_kpt": round(adjusted_kpt, 2),
        "adjustment_reason": adjustment_reason,
        "eta_saved_minutes": round(eta_saved, 2),
        "dispatch_delay_minutes": round(dispatch_delay, 1),
        "fuel_saved_ml": round(fuel_saved, 0)
    }

@app.get("/merchant/{merchant_id}/ric")
async def get_ric(merchant_id: str):
    """Returns just the RIC score for a merchant. Used by the frontend for live polling."""
    if merchant_id not in feature_store:
        return {"merchant_id": merchant_id, "ric": 0.0}
    data = feature_store[merchant_id]
    ric = data["rider_influenced_marks"] / data["total_for_marks"] if data["total_for_marks"] > 0 else 0.0
    return {"merchant_id": merchant_id, "ric": round(ric, 3)}

def seed_from_csv():
    csv_path = os.path.join(os.path.dirname(__file__), "synthetic_kpt_dataset.csv")
    if not os.path.exists(csv_path):
        return False
    
    with open(csv_path, mode='r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            m_id = row['merchant_id']
            if m_id in feature_store:
                # Calculate if it was a gaming event based on distance logic
                # For RIC calculation, we just need to know if it was an influenced event
                is_gaming = row['is_gaming_simulated'].lower() == 'true'
                feature_store[m_id]["ric_history"].append(1.0 if is_gaming else 0.0)
                # Keep history to a reasonable limit
                if len(feature_store[m_id]["ric_history"]) > 100:
                    feature_store[m_id]["ric_history"].pop(0)
    return True

@app.post("/seed_csv")
async def trigger_csv_seed():
    success = seed_from_csv()
    return {"status": "success" if success else "failed"}

@app.post("/reset")
async def reset_store():
    """Clears the feature store. Useful for resetting demo state."""
    global feature_store, prediction_logs
    feature_store = {
        "reliable_rest": {"ric_history": [], "feedback_count": 0, "accept_latencies": [], "dineout_load": 0.0},
        "spice_garden": {"ric_history": [], "feedback_count": 0, "accept_latencies": [], "dineout_load": 0.0}
    }
    prediction_logs = []
    return {"status": "reset complete"}

@app.get("/")
async def root():
    return {"status": "ok", "service": "Project TrueSignal — KPT Adjustment Engine v1.0"}
