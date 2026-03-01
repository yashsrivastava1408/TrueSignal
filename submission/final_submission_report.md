# TrueSignal: Improving Kitchen Prep Time Prediction via Signal Integrity

**Hackathon Submission for Problem Statement:** Improving Kitchen Prep Time (KPT) Prediction to Optimize Rider Assignment and Customer ETA at Zomato  
**Team Name:** [TEAM_NAME]  
**Team Members:** [TEAM_MEMBER_NAMES]  
**Date:** 2 March 2026

**Public Links (set to public before submission):**
- GitHub Repository: [GITHUB_LINK]
- Live Demo: [LIVE_DEMO_LINK]
- Dataset / Data Files: [DATASET_LINK]
- Notebook / Analysis: [NOTEBOOK_LINK]
- Demo Video (optional): [VIDEO_LINK]

## 1. Executive Summary
TrueSignal is a system-level solution that improves Kitchen Prep Time (KPT) prediction by improving input signal quality rather than replacing the existing model. The core problem is that merchant-marked Food Order Ready (FOR) events are noisy and often behavior-driven. TrueSignal adds a Signal Integrity Layer that detects biased FOR events, builds per-merchant reliability, incorporates hidden kitchen rush, and feeds corrected signals into the existing KPT pipeline.

This directly addresses the hackathon requirement to prioritize signal, workflow, and system improvements over purely model-centric changes.

## 2. Problem Understanding
### 2.1 Why current KPT signals are unreliable
- FOR events can be rider-influenced instead of true prep completion.
- The platform often sees only Zomato orders, not full kitchen demand.
- Manual marking behavior varies by merchant and time period.

### 2.2 Operational consequences
- Early rider arrival and pickup idle time.
- ETA instability for customers.
- Higher delay/cancellation risk.
- Lower rider utilization.

## 3. Proposed Approach
### 3.1 Solution architecture
TrueSignal inserts a middleware layer between raw operational events and the existing KPT model:
1. Event ingestion from merchant app, rider app, and load proxies.
2. Reliability computation and signal correction.
3. Enriched feature output to existing KPT model and dispatch logic.

### 3.2 Core components
1. **RIC (Rider Influence Coefficient):** Detects whether FOR was likely influenced by rider proximity.
2. **SQS (Signal Quality Score):** Merchant reliability score based on RIC trend, rider feedback consistency, and operational latency behavior.
3. **HKL (Hidden Kitchen Load):** Captures non-Zomato kitchen congestion via load proxies/reservation intensity.
4. **SDS (Signal-Aware Dispatch):** Adjusts dispatch timing/buffer by merchant trust tier.

## 4. Methodology
### 4.1 Signal correction logic
- Calculate rider-to-merchant distance at FOR event time.
- Flag potentially biased FOR events when rider is within threshold.
- Update rolling behavior metrics and compute SQS.
- Blend SQS + HKL into adjusted KPT multiplier and dispatch policy.

### 4.2 Trust tiers
- Gold (>=85): low correction.
- Silver (70-84): moderate correction.
- Bronze (55-69): stronger correction.
- Below threshold (<55): strict correction and dispatch delay.

## 5. Data Strategy (as required by brief)
No official dataset was provided; our team created and curated data for simulation and validation.

### 5.1 Data sources used
- Synthetic order event streams generated from operational assumptions.
- Merchant behavior patterns (reliable vs biased cohorts).
- Rider feedback and acceptance latency events.
- Simulated hidden load signals (dine-in/reservation intensity proxy).

### 5.2 Data preparation steps
- Event schema standardization.
- Time alignment across merchant, rider, and load events.
- Outlier handling for impossible sequences.
- Cohort tagging for controlled evaluation.

### 5.3 Data quality considerations
- Signals labeled with confidence level.
- Merchant-level rolling windows used to reduce one-off noise.
- Explicit distinction between simulation metrics and real-production claims.

## 6. Implementation Summary
### 6.1 Backend
FastAPI service implementing:
- `POST /mark_ready`
- `POST /rider_feedback`
- `POST /accept_order`
- `POST /simulate_dinein`
- `GET /merchant/{merchant_id}/stats`
- `POST /predict_kpt`

### 6.2 Frontend
Control-tower dashboard with:
- Live simulation controls.
- Signal drift charts.
- Merchant trust profile and forensic order-level view.

### 6.3 Deployment
- Frontend deployed at: [LIVE_DEMO_LINK]
- Backend deployed at: [BACKEND_LINK]

## 7. Results and Analysis
### 7.1 Evaluation setup
- Seeded historical run + live event simulation.
- Comparative view between unreliable and reliable merchant cohorts.
- Metric tracking at order and merchant level.

### 7.2 Observed outcomes (simulation)
- Average rider wait time: **6.8 min -> 3.4 min** (50% improvement)
- ETA P90 error: **12.0 min -> 4.8 min** (60% improvement)
- Estimated fuel savings: **~9,000 L/day** under simulation assumptions

### 7.3 Mapping to success metrics
- Rider wait time: improved.
- ETA error (P50/P90): improved.
- Delay/cancellation risk: reduced through better dispatch timing.
- Rider idle time: reduced.

## 8. Scalability and Feasibility
### 8.1 Rollout plan
1. Phase 1: Software-only signal correction across all merchants.
2. Phase 2: Add richer load integrations for integrated merchants.
3. Phase 3: Optional instrumentation for high-volume hubs.

### 8.2 Why this scales
- No mandatory hardware dependency in base rollout.
- Uses existing app event streams.
- Merchant-level scoring is lightweight and incremental.

## 9. Assumptions and Limitations
- Current results are based on synthetic simulation, not production A/B tests.
- Hidden-load signals are represented using proxies in this prototype.
- Final calibration requires real merchant and city-segment pilots.

## 10. Conclusion
TrueSignal addresses KPT in the way this problem statement demands: by improving signal quality and system behavior around the model, not only the model itself. It reduces bias from merchant FOR events, captures hidden kitchen load, and provides scalable dispatch improvements aligned with rider and customer outcomes.

## 11. Confidentiality and Compliance
- This submission is prepared only for hackathon evaluation.
- Problem details are not published in public social/forum channels.
- This report is the team’s single official submission artifact.
