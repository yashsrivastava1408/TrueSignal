from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import os
import csv
import math
from typing import Dict, List, Optional

app = FastAPI(title="Project TrueSignal: KPT Adjustment Engine", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
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

# --- FEATURE STORE (In-memory for simulation) ---
feature_store: Dict[str, Dict] = {}

def init_merchant(merchant_id: str):
    if merchant_id not in feature_store:
        feature_store[merchant_id] = {
            "total_for_marks": 0, 
            "rider_influenced_marks": 0,
            "total_feedbacks": 0,
            "negative_feedbacks": 0,
            "total_accept_latency_s": 0.0,
            "total_orders": 0,
            "dinein_load": 0.0,
            "dineout_reservations": 0
        }

def calculate_distance(loc1: Location, loc2: Location) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(loc1.lat), math.radians(loc2.lat)
    dphi = math.radians(loc2.lat - loc1.lat)
    dlambda = math.radians(loc2.lon - loc1.lon)
    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

# --- ENDPOINTS ---

@app.post("/mark_ready")
async def process_for_signal(req: FORRequest):
    init_merchant(req.merchant_id)
    merchant_data = feature_store[req.merchant_id]
    merchant_data["total_for_marks"] += 1
    
    dist_km = calculate_distance(req.merchant_loc, req.rider_loc)
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
    init_merchant(merchant_id)
    fs = feature_store[merchant_id]
    fs["dinein_load"] = max(0.0, min(1.0, load))
    fs["dineout_reservations"] = reservations
    return {"status": "success", "current_load": fs["dinein_load"], "reservations": fs["dineout_reservations"]}

@app.get("/merchant/{merchant_id}/stats")
async def get_stats(merchant_id: str):
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
    
    if sqs_percent >= 85: tier = "Gold"
    elif sqs_percent >= 70: tier = "Silver"
    elif sqs_percent >= 55: tier = "Bronze"
    else: tier = "Below Threshold"

    return {
        "merchant_id": merchant_id, "ric": round(ric, 2), "sqs": sqs_percent, "tier": tier,
        "avg_latency": round(avg_latency, 1), "feedback_score": round(feedback_score, 2),
        "hidden_load": round(data.get("dinein_load", 0.0), 2),
        "dineout_reservations": data.get("dineout_reservations", 0)
    }

@app.get("/merchant/{merchant_id}/ric")
async def get_ric(merchant_id: str):
    if merchant_id not in feature_store:
        return {"merchant_id": merchant_id, "ric": 0.0}
    data = feature_store[merchant_id]
    ric = data["rider_influenced_marks"] / data["total_for_marks"] if data["total_for_marks"] > 0 else 0.0
    return {"merchant_id": merchant_id, "ric": round(ric, 3)}

@app.post("/predict_kpt")
async def adjust_kpt(req: KPTRequest):
    ric, sqs, dinein_load, dineout_res = 0.0, 100.0, 0.0, 0
    if req.merchant_id in feature_store:
        data = feature_store[req.merchant_id]
        ric = data["rider_influenced_marks"] / data["total_for_marks"] if data["total_for_marks"] > 0 else 0.0
        fb_score = 1.0 - (data["negative_feedbacks"] / data["total_feedbacks"]) if data["total_feedbacks"] > 0 else 1.0
        avg_lat = data["total_accept_latency_s"] / data["total_orders"] if data["total_orders"] > 0 else 10.0
        lat_score = max(0.0, 1.0 - (avg_lat / 60.0))
        sqs = round(((fb_score * 0.5) + ((1.0-ric)*0.35) + (lat_score*0.15)) * 100, 2)
        dinein_load = data.get("dinein_load", 0.0)
        dineout_res = data.get("dineout_reservations", 0)
        
    load_multiplier = 1.0 + (dinein_load * 0.6)
    reason = "Low Kitchen Load" if dinein_load < 0.3 else f"Peak Hidden Load ({int(dinein_load*100)}%) detected via Dineout."
    
    multiplier, delay, penalty_reason = 1.0, 0.0, ""
    if sqs < 55:
        multiplier, delay, penalty_reason = 1.40, req.base_kpt_minutes * 0.3, " + Poor Signal Accuracy (Gamed FOR)."
    elif sqs < 70:
        multiplier, delay, penalty_reason = 1.25, req.base_kpt_minutes * 0.15, " + Unreliable Signals."
    elif sqs < 85:
        multiplier, penalty_reason = 1.10, " + Moderate Signal Noise."
    
    adj_kpt = req.base_kpt_minutes * multiplier * load_multiplier
    eta_saved = adj_kpt - req.base_kpt_minutes
    return {
        "order_id": req.order_id, "merchant_id": req.merchant_id, "base_kpt": req.base_kpt_minutes,
        "ric": round(ric, 2), "sqs": sqs, "hidden_load": round(dinein_load, 2),
        "dineout_reservations": dineout_res, "adjusted_kpt": round(adj_kpt, 2),
        "adjustment_reason": reason + penalty_reason, "eta_saved_minutes": round(eta_saved, 2),
        "dispatch_delay_minutes": round(delay, 1), "fuel_saved_ml": round(eta_saved * 15.0, 0)
    }

def seed_from_csv():
    csv_path = os.path.join(os.path.dirname(__file__), "synthetic_kpt_dataset.csv")
    if not os.path.exists(csv_path): return False
    with open(csv_path, mode='r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            m_id = row['merchant_id']
            init_merchant(m_id)
            is_gaming = row['is_gaming_simulated'].lower() == 'true'
            feature_store[m_id]["total_for_marks"] += 1
            if is_gaming: feature_store[m_id]["rider_influenced_marks"] += 1
    return True

@app.post("/seed_csv")
async def trigger_csv_seed():
    return {"status": "success" if seed_from_csv() else "failed"}

@app.post("/reset")
async def reset_store():
    feature_store.clear()
    return {"status": "reset complete"}

@app.get("/")
async def root():
    return {"status": "ok", "service": "Project TrueSignal Engine v1.0"}
