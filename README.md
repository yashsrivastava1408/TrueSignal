# TrueSignal KPT Engine — Zomato Hackathon Submission
## Signal Integrity Layer for Kitchen Prep Time Prediction
**Team SUDARSHAN** | Yash Srivastava, Vanshika

**Production-inspired architecture | Scalable to 300K+ Merchants | Zero Model Retraining Required**

**TrueSignal** is a signal-integrity layer designed to improve Kitchen Prep Time (KPT) prediction without modifying existing models. Instead of building a new predictor, we enhance input reliability by triangulating multiple real-world signals.

**Quick Links**
- Live Demo: https://true-signal-five.vercel.app
- Synthetic Dataset: https://github.com/yashsrivastava1408/TrueSignal/blob/main/backend/synthetic_kpt_dataset.csv
- Signal Analysis: https://github.com/yashsrivastava1408/TrueSignal/blob/main/backend/mock_data_generator.py

---

### 0. Executive Summary: The Signal Integrity Advantage

**The Core Insight:** KPT prediction today is a signal problem, not a model problem. We improve KPT accuracy by fixing signal quality at the source by using automated geofencing, reliability scoring (SQS), and ecological data integration.

---

### Judge Quick Start

To evaluate quickly, follow this sequence:
1. Open the **Overview** tab to see signal drift and corrected KPT behavior.
2. Open **Live Simulation**, click **Seed 30-Day History**, then **Start Live Sim**.
3. Compare **Spice Garden** (high rider-influenced FOR behavior) vs **Reliable Rest** (stable behavior).
4. Open **Architecture** tab for the end-to-end signal pipeline and trust-tier logic.
5. Review `backend/mock_data_generator.py` for dataset generation and analysis assumptions.

Expected demo output:
- Spice Garden shows higher RIC and lower SQS than Reliable Rest over time.
- Adjusted KPT increases for lower-trust or high-hidden-load scenarios.
- Dispatch delay is applied for low-SQS merchants to reduce rider idle wait.

| Strategy | Technical Implementation | Business Impact |
| :--- | :--- | :--- |
| **RIC Engine** | GPS proximity verification for merchant "Ready" taps | Detects and corrects intentional signal bias |
| **Dineout Integration** | Real-time kitchen load inference from reservations | Captures "unseen" traffic in the merchant ecosystem |
| **SDS Optimization** | Signal-Aware Dispatch logic for rider assignment | Reduces idle costs & improves fleet efficiency |
| **Sustainability Loop** | Fuel-waste reduction via optimized wait-times | ESG win: measurable CO2 reduction |

---

### 1. Technical Architecture

TrueSignal acts as a real-time enrichment layer that intercepts logistics events and injects reliability metrics into the decision pipeline.

```mermaid
graph TD
    subgraph "Zomato Ecosystem"
        MA[Merchant App]
        RA[Rider App]
        DS[Dineout System]
    end

    subgraph "TrueSignal Logic Engine"
        direction TB
        GFC[Geofencing Controller]
        RIC[RIC Calculator]
        HLE[Hidden Load Estimator]
        SQS[SQS Aggregator]
    end

    subgraph "Decision Layer"
        FS[Redis Feature Store]
        SDS[Signal-Aware Dispatch]
        KPT[Existing KPT Model]
    end

    MA -- "Food Ready Event" --> GFC
    RA -- "GPS Stream" --> GFC
    GFC --> RIC
    DS -- "Reservations/Traffic" --> HLE
    RIC & HLE --> SQS
    SQS --> FS
    FS --> KPT
    KPT -- "Adjusted ETA" --> SDS
    SDS -- "Optimal Rider Dispatch" --> RA
```

---

### 2. Core Modules: Deep Dive

#### 2.1 Rider Influence Coefficient (RIC)
The RIC detects the "Rider-Triggered Bias" where merchants mark food as ready only when they see the rider. This creates significant latency for common fleet metrics.

**Validation Logic:**
```mermaid
flowchart LR
    A[FOR Signal Fired] --> B{Rider < 150m?}
    B -- Yes --> C[Mark as 'Biased']
    B -- No --> D[Mark as 'Trustworthy']
    C --> E[RIC Score Increases]
    D --> F[RIC Score Decreases]
    E & F --> G[Rolling 30-Day Avg]
```

#### 2.2 Hidden Kitchen Load (HKL) via Dineout
A restaurant handling 5 Zomato orders might be processing 20+ Dine-in tables. Using Dineout's reservation data, we calculate a **Kitchen Congestion Multiplier** to proactively pad ETAs before the backlog impacts the customer.

#### 2.3 Signal-Aware Dispatch (SDS)
Traditional dispatch sends a rider immediately. SDS uses the merchant's **SQS (Signal Quality Score)** to calculate a **Dispatch Offset**.
*   **High Trust:** Dispatch immediately.
*   **Low Trust:** Delay dispatch by $N$ minutes (where $N = RIC \times BaseKPT$).
*   **Result:** Riders arrive exactly when food is ready, maximizing "Earnings per Hour" (EPH).

---

### 3. Sustainability & Impact

#### 3.1 The Green Fleet Metric
By reducing rider idle time, we directly impact Zomato's carbon footprint.
- **Formula:** $1 \min \text{ Idle} \approx 15\text{ml Fuel Waste}$.
- **Scale:** Across 300k merchants, a 2-minute idle reduction per order saves **~9,000 Liters of fuel per day**.

#### 3.2 Merchant Incentive Program (Behavioral Economics)
We move from enforcement to behavioral economics:
- **Gold Tier (SQS > 85%):** 1% Commission Rebates + "Signal Verified" Trust Badge.
- **Bronze Tier (SQS < 50%):** Automatic ETA padding (Customer sees slower times) + No Ranking Boost.

---

### 4. Implementation Roadmap

1.  **Phase 1 (Signal Foundation):** Deploy RIC engine and GPS triangulation layer.
2.  **Phase 2 (Ecosystem Synergy):** Integrate Dineout reservation streams for hidden load detection.
3.  **Phase 3 (Operational Optimization):** Enable SDS Dispatch Offsets and the Tiered Merchant Reward program.

---

### 5. Quick Start & Deployment

#### 5.1 Running Locally
1.  **Backend:**
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```
2.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

#### 5.2 Deployment (Production)
*   **Backend:** Deploy the `backend` folder to **Render.com** (Python 3, Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`).
*   **Frontend:** Deploy the `frontend` folder to **Vercel**. 
*   **Environment Variables:** Set `VITE_API_BASE` in Vercel to point to your Render backend URL (e.g., `https://truesignal-api.onrender.com`).

---

### Disclaimer
This project is a **student submission** for the Zomato KPT Hackathon organized by Sunrise Mentors and Zomato. 
- **Non-Official:** This is not an official Zomato product or service.
- **Data:** All data shown in the demo is **synthetically generated** for simulation purposes only.
- **Branding:** Zomato and Dineout logos used are for **demonstrative purposes** within the hackathon scope.
- **Confidentiality Note:** Problem statement details and solution specifics are intended only for hackathon evaluation and should not be shared publicly outside permitted submission links.

*Fix the signals. The predictions fix themselves.*
