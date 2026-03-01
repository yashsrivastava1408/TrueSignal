# TrueSignal KPT Engine — Final PPT Content (Submission-Ready)

Replace placeholders before export:
- [TEAM_NAME]
- [TEAM_MEMBER_NAMES]
- [GITHUB_LINK]
- [LIVE_DEMO_LINK]
- [DATASET_LINK]
- [NOTEBOOK_LINK]
- [VIDEO_LINK]

## Slide 1 — Title
**Title:** TrueSignal: Improving Kitchen Prep Time (KPT) Prediction via Signal Integrity

**Subtitle:** Input-Signal Reliability Layer for Better Rider Assignment and ETA Accuracy

**Footer:**
- Team: [TEAM_NAME]
- Members: [TEAM_MEMBER_NAMES]
- Zomato KPT Hackathon Submission

---

## Slide 2 — Problem & Business Impact
**Problem:** KPT predictions are noisy because merchant-marked Food Ready (FOR) is often biased.

**Observed issues:**
- Rider-influenced FOR taps (food marked ready when rider arrives)
- No visibility into full kitchen load (dine-in + non-Zomato demand)
- Manual behavior variability by merchant/time

**Business impact:**
- Early rider arrival -> idle wait
- ETA instability for customers
- Higher delays/cancellations and cost

---

## Slide 3 — Objective and Constraints
**Objective:** Improve KPT accuracy by improving input signals, not by replacing the existing model.

**Hackathon alignment:**
- Focus on signal quality and system design
- Reduce FOR bias
- Capture hidden kitchen rush beyond Zomato orders
- Ensure scale feasibility for 300K+ merchants

---

## Slide 4 — Solution Overview: TrueSignal
**Core idea:** Add a Signal Integrity Layer between raw events and existing KPT prediction.

**Modules:**
1. Rider Influence Coefficient (RIC)
2. Signal Quality Score (SQS)
3. Hidden Kitchen Load (HKL)
4. Signal-Aware Dispatch (SDS)

**Positioning:**
- Keep current model
- Improve what goes into it

---

## Slide 5 — Module 1: RIC (Bias Detection)
**What RIC detects:** FOR taps likely triggered by rider proximity.

**Logic:**
- Compute rider-to-merchant distance at FOR timestamp
- If distance <150m, mark event as potentially rider-influenced
- Update merchant behavior profile over rolling window

**Outcome:**
- Down-weight low-trust FOR events
- Clean label quality for KPT input

---

## Slide 6 — Module 2: SQS + HKL
**SQS (Signal Quality Score):** merchant reliability score from:
- RIC behavior
- Rider feedback quality
- Accept-order latency consistency

**HKL (Hidden Kitchen Load):**
- Integrate dine-in intensity proxy (e.g., reservations/load index)
- Apply congestion-aware multiplier when kitchen is busy, even with low Zomato order volume

**Outcome:** better real-world prep state estimation.

---

## Slide 7 — Module 3: Signal-Aware Dispatch (SDS)
**Current issue:** fixed dispatch logic sends riders too early in noisy environments.

**SDS policy by SQS tier:**
- Gold (>=85): immediate/standard dispatch
- Silver (70-84): moderate correction
- Bronze (55-69): higher buffer
- Below threshold (<55): strongest correction + dispatch delay

**Result:** lower rider idle time and smoother ETAs.

---

## Slide 8 — Architecture & Data Flow
Use your architecture image/screenshot from app.

**Narration points:**
- Merchant app + rider app + load proxy feeds
- TrueSignal layer computes RIC/SQS/HKL
- Existing KPT model consumes corrected signals
- Dispatch system uses adjusted KPT + confidence

---

## Slide 9 — Implementation (What We Built)
**Backend:** FastAPI rules engine
- `/mark_ready` (RIC update)
- `/predict_kpt` (KPT adjustment + dispatch delay)
- `/merchant/{id}/stats` (SQS/tier/hidden load)
- `/simulate_dinein` (hidden load simulation)

**Frontend:** React control tower
- Live simulation and event log
- Signal drift charts
- Merchant profile/tier visibility

---

## Slide 10 — Evaluation Results (Simulation)
Label clearly: **Synthetic simulation (30-day seeded + live run)**

Use these project numbers (already in your report):
- Avg Rider Wait Time: 6.8 min -> 3.4 min (**50% improvement**)
- ETA P90 Error: 12.0 min -> 4.8 min (**60% improvement**)
- Estimated Daily Fuel Saved: **~9,000 L** (simulation assumption)

Also add:
- Total orders simulated
- RIC divergence between “gamer” vs “reliable” merchants

---

## Slide 11 — Scalability, Rollout, Risks
**Scalable rollout:**
1. Tier A (all merchants): software-only RIC/SQS
2. Tier B (integrated merchants): richer load signals
3. Tier C (select hubs): optional instrumentation

**Risks and mitigations:**
- Signal gaming -> adaptive trust decay
- Sparse data -> fallback priors by segment
- Integration variance -> tiered rollout by merchant maturity

---

## Slide 12 — Submission Links + Closing
**What we submit:**
- Single PDF report
- Public links
- Demo + code + data generation details

**Links:**
- Repo: [GITHUB_LINK]
- Live Demo: [LIVE_DEMO_LINK]
- Dataset/Simulation Data: [DATASET_LINK]
- Notebook/Analysis: [NOTEBOOK_LINK]
- Demo Video (optional): [VIDEO_LINK]

**Closing line:**
TrueSignal improves KPT by fixing signal integrity first, enabling better ETA reliability, rider efficiency, and scalable operational impact.

---

## 60-Second Pitch Script
KPT errors are mostly a signal-quality problem, not only a model problem. In the current system, merchant-marked food-ready events are often biased by rider arrival and do not reflect true kitchen completion. We built TrueSignal, a lightweight integrity layer that sits before the existing KPT model. It computes Rider Influence Coefficient from geofenced rider proximity, creates merchant Signal Quality Score from behavior and feedback consistency, and injects hidden kitchen load using dine-in congestion proxies. Then Signal-Aware Dispatch applies reliability-tiered corrections so riders arrive closer to true readiness. In our simulation stack, this reduced rider wait from 6.8 to 3.4 minutes and improved ETA P90 error from 12.0 to 4.8 minutes. The approach is software-first, deployable across large merchant networks, and aligns directly with hackathon constraints focused on better input signals and system-level improvements.
