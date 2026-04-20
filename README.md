# CrediNova — Adaptive Credit Intelligence Engine

> **Hackathon Project: Hack-o-hire**  
> AI-powered credit scoring for unbanked and underbanked populations. Uses alternative financial data and production-grade ML to assess creditworthiness with full explainability, fairness monitoring, and compliance audit trails.

---

## Demo Video

> Some README renderers do not play local MP4 files inline.
>
> **Use this direct link:** [Watch / Download CrediNova Demo (MP4)](./public/CrediNova.mp4?raw=1)
>
> **Google Drive:** [Watch on Google Drive](https://drive.google.com/file/d/1IUojbH16Wp52otLhDkQN_DL_JNVKUwue/view?usp=drive_link)
>
> Fallback link: [Open video file](./public/CrediNova.mp4)

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [System Architecture](#system-architecture)
4. [Core AI Pipeline](#core-ai-pipeline)
5. [Application Pages](#application-pages)
6. [Services Layer](#services-layer)
7. [Data Model & Types](#data-model--types)
8. [AI Integrations](#ai-integrations)
9. [Tech Stack](#tech-stack)
10. [Project Structure](#project-structure)
11. [Environment Variables](#environment-variables)
12. [Key Design Decisions](#key-design-decisions)
13. [Known Limitations & Simulations](#known-limitations--simulations)
14. [Future Roadmap](#future-roadmap)

---

## Problem Statement

Millions of individuals and MSMEs across emerging markets are **financially invisible** — they lack traditional credit histories (no home loans, no credit cards, no formal employment records). Conventional FICO-style scoring models are blind to this population.

This results in:
- Blanket rejections for creditworthy individuals
- Banks missing a massive untapped lending market
- Perpetuation of systemic financial exclusion

**The gap:** Alternative signals — UPI transaction volume, e-commerce spend patterns, utility bill payment consistency, income stability — are rich predictors of creditworthiness, but no production-grade system ties them together with explainability, fairness auditing, and drift monitoring under one roof.

---

## Solution Overview

**CrediNova** is an end-to-end Adaptive Credit Intelligence Engine that:

1. **Ingests** 12 alternative + traditional financial features per applicant
2. **Scores** using a hybrid XGBoost/LightGBM model producing a probability of default (PD) and a 300–900 risk score
3. **Explains** every decision via SHAP-derived feature attributions in human-readable language (via Gemini AI)
4. **Governs** decisions with fairness metrics, drift detection, and a full immutable audit trail
5. **Enables** policy simulation — lenders can tune approval thresholds and see real-time impact on approval rate, default rate, and revenue

The frontend is a full production-grade React + TypeScript dashboard demonstrating what this system would look like when embedded into a bank's internal tooling.

---

## System Architecture

```
Applicant Data (12 features)
        |
        v
+---------------------+
|  Data Ingestion      |  Missing value handling, outlier treatment,
|  & Preprocessing     |  encoding, validation, PII masking at ingestion
+----------+----------+
           |
           v
+---------------------+
|  Feature Engineering |  DTI, credit utilization buckets,
|  Layer               |  delinquency frequency score,
|                      |  age x behavior interaction features,
|                      |  UPI/e-commerce as alternative signals
+----------+----------+
           |
           v
+---------------------+
|  Hybrid ML Risk      |  XGBoost (primary) + LightGBM
|  Engine              |  Probability calibration (Platt/isotonic)
|                      |  Output: PD ∈ [0,1], Risk Score 300–900,
|                      |  Risk Tier: Low / Medium / High / Critical
+----------+----------+
           |
           v
+---------------------+
|  SHAP Explainability |  Per-applicant feature contributions
|  Layer               |  Top risk drivers + Top protective factors
|                      |  Global feature importance
+----------+----------+
           |
           v
+--------------------------------------------------+
|                  Agentic AI Layer                |
|  +-----------+  +-------------+  +------------+ |
|  | Decision  |  |Explainability|  |  Fairness  | |
|  |  Agent    |  |    Agent    |  |   Agent    | |
|  +-----------+  +-------------+  +------------+ |
|              +------------------------+          |
|              |      Drift Agent       |          |
|              +------------------------+          |
+--------------------------------------------------+
                       |
                       v
         Final Decision + Audit Log Entry
    (Approved / Rejected / Manual Review / Conditional)
```

### Agentic Layer Details

| Agent | Inputs | Logic |
|-------|--------|-------|
| **Decision Agent** | PD, Risk Tier, SHAP context | Low PD → Approve; Medium → Conditional/Reduce loan; High → Manual review; Critical → Reject. Context-aware overrides using SHAP when borderline |
| **Explainability Agent** | SHAP values + decision | Generates human-readable narrative, improvement suggestions for applicant, what-if scenario analysis via Gemini 1.5 Flash |
| **Fairness Agent** | Approval rates by income segment | Monitors disparate impact ratio (protected/reference group). Flags if ratio < 0.8 (80% rule / Barclays Fair Lending standard) |
| **Drift Agent** | PSI, KS statistic, AUC over time, feature distributions vs training baseline | Detects covariate shift. Triggers retraining alerts and SageMaker hooks when PSI > threshold |

---

## Core AI Pipeline

### Input Features (12 total)

| Feature | Type | Description |
|---------|------|-------------|
| `monthly_income` | Numeric | Monthly gross income |
| `income_stability` | 0–100 score | Consistency of income (employment history proxy) |
| `total_emi` | Numeric | Existing monthly EMI obligations |
| `credit_limit` | Numeric | Sanctioned credit limit |
| `outstanding_balance` | Numeric | Current outstanding balance |
| `past_delinquencies` | Count | Number of past defaults/missed payments |
| `months_since_last_dq` | Count | Months elapsed since last delinquency |
| `loan_amount_requested` | Numeric | Requested loan amount |
| `loan_tenure` | Months | Requested loan tenure |
| `upi_volume` | Numeric | Monthly UPI transaction volume (alternative signal) |
| `ecommerce_spend` | Numeric | Monthly e-commerce spend (behavioral signal) |
| `utility_score` | 0–100 score | Utility bill payment consistency score |

### Derived Risk Features (computed internally)

- **EMI-to-Income Ratio (DTI):** `total_emi / monthly_income`
- **Credit Utilization:** `outstanding_balance / credit_limit`
- **Delinquency Recency:** normalized `months_since_last_dq`
- **Loan Size Pressure:** `loan_amount_requested / income`

### Output

| Output | Description |
|--------|-------------|
| `probability_of_default` | Float ∈ [0, 1] |
| `risk_score` | Int 300–900 (higher = safer) |
| `risk_tier` | `Low` / `Medium` / `High` / `Critical` |
| `decision` | `Approved` / `Rejected` / `Manual Review` / `Conditional Approval` |
| `confidence_score` | Float ∈ [0, 1] |
| `recommended_interest_rate` | Float % |
| `top_features` | Top 5 SHAP risk drivers with impact values |
| `top_protective_factors` | Top 5 SHAP protective factors |
| `explanation_summary` | Human-readable narrative (Gemini-generated) |
| `improvement_suggestions` | Actionable advice for applicant |
| `business_impact` | Expected revenue, approval precision, risk reduction % |

### Model Performance Metrics (Production Baseline)

| Metric | Value |
|--------|-------|
| AUC (ROC) | 0.78 |
| Gini Coefficient | 0.56 |
| KS Statistic | 0.42 |
| Lift @ 10% | 2.15x |
| Lift @ 30% | 1.65x |
| Precision | 0.82 |
| Recall | 0.75 |
| F1 Score | 0.78 |

---

## Application Pages

### Public / Auth

| Page | File | Description |
|------|------|-------------|
| Landing | `Landing.tsx` | Hero, value proposition, feature highlights, how it works, social proof. Full marketing page. |
| Login | `Login.tsx` | JWT-based auth login |
| Signup | `Signup.tsx` | User registration with form validation (react-hook-form + Zod) |
| Privacy Policy | `PrivacyPolicy.tsx` | GDPR/data privacy policy |
| Terms of Service | `TermsOfService.tsx` | ToS page |

### Authenticated App

| Page | File | Description |
|------|------|-------------|
| **Dashboard** | `Dashboard.tsx` | Main analytics hub: KPIs, approval rate trends, risk tier distribution charts, recent applications table, portfolio-level stats, AI Chat sidebar |
| **Credit Application** | `CreditApplication.tsx` | Full applicant data entry form. Single applicant mode + bulk upload (CSV/JSON/XLSX/HTML). Policy threshold slider. Calls ML engine and routes to result. |
| **Risk Assessment** | `RiskAssessment.tsx` | Post-decision result: Decision badge, risk score gauge, PD gauge, risk tier, top features bar chart, top protective factors, recommended interest rate, confidence. Policy simulation panel. |
| **Explainability** | `Explainability.tsx` | Deep SHAP deep-dive: radar chart (Income/Stability/Debt Control/History/Alternative/Usage), feature attribution waterfall, human-readable AI narrative (Gemini), what-if scenario analysis, improvement suggestions |
| **Model Intelligence** | `ModelIntelligence.tsx` | AUC, Gini, KS, Lift curves, Precision/Recall visualizations (Recharts). Feature importance global bar chart. Live model performance monitoring. |
| **Compliance** | `Compliance.tsx` | Fairness metrics: disparate impact ratio by income segment (Low/Mid/High), 80% rule compliance indicator, segment-level approval/rejection breakdown |
| **Audit Log** | `AuditLog.tsx` | Full immutable audit trail (localStorage). Every decision logged with: timestamp, model version, input features (non-PII), decision, risk score, top features. Export capability. |
| **Architecture** | `Architecture.tsx` | System architecture visualization — interactive diagram of the ML pipeline and agentic layers |
| **Documentation** | `Documentation.tsx` | In-app technical docs: API reference, data schema, integration guide |
| **Profile** | `Profile.tsx` | User profile, settings, preferences |
| **Settings** | `Settings.tsx` | App configuration, theme, notification preferences |

---

## Services Layer

### `creditModelService.ts` — ML Model Simulation

Simulates a deployed AWS SageMaker inference endpoint. In production, `callSageMakerEndpoint()` would be a real HTTP call to a SageMaker REST endpoint.

- `callSageMakerEndpoint(request, approvalThreshold)` — Main inference. Returns PD, risk band, interest rate, confidence, top features, SHAP values, business impact, model version, latency
- `batchPredictions(applications[], threshold)` — Batch inference mode (parallelized via `Promise.all`)
- `modelPredictionToCreditResponse(prediction)` — Maps raw model output to frontend `CreditResponse` type
- `calculatePSI(actual[], expected[], bins)` — Population Stability Index for drift detection
- `simulatePolicy(threshold)` — Policy simulation: given a threshold, returns expected approval rate, default rate, revenue
- `productionMetrics` — Hardcoded production model performance baseline (AUC, Gini, KS, Lift, F1)
- `trainingFeatureStats` — Training set feature statistics (mean, std, min, max, p25, p75) for outlier detection and drift comparison

---

### `geminiService.ts` — AI Report Generation

Integrates Google Gemini 1.5 Flash to generate comprehensive AI reports on credit decisions.

- `generateAIReport(creditResponse)` — Sends model output to Gemini with a structured prompt. Returns:
  - `risk_explanation` — Deep narrative of risk profile
  - `visual_insights` — Plain-English interpretation of metrics
  - `improvement_suggestions[]` — Actionable advice for the applicant
  - `what_if_scenarios[]` — Impact of changing specific factors
  - `chart_data[]` — Radar chart data (Income, Stability, Debt Control, History, Alternative, Usage) with values 0–100
- Falls back to hardcoded mock response if API key is missing or Gemini call fails

---

### `chatService.ts` — Credit Risk AI Chat

Dual-provider AI chat assistant (Gemini default, OpenAI optional) embedded in the dashboard.

- Configured via `VITE_AI_PROVIDER` env var (`"gemini"` or `"openai"`)
- Domain-specific system prompt: credit scoring, portfolio analysis, fair lending, model governance, applicant improvement suggestions
- **PII redaction guardrail** built-in — emails, phone numbers, Aadhaar/PAN/SSN, ID keywords automatically masked before sending to AI
- Gemini implementation uses **exponential backoff** (5 retries: 1s → 2s → 4s → 8s → 16s) for 429/5xx errors
- `getFallbackResponse()` — Pattern-matched offline fallback for disconnected environments

---

### `fairnessService.ts` — Fairness & Bias Metrics

Barclays Fair Lending-compliant fairness computation.

- `computeFairnessReport(results[])` — Segments applicants by income band (Low < $5k, Mid $5k–$15k, High > $15k). Computes:
  - Approval/rejection/manual review counts per segment
  - Per-segment approval rates
  - **Disparate Impact Ratio** = Low-income approval rate ÷ High-income approval rate
  - Compliance flag: ratio ≥ 0.8 = compliant (80% rule / ECOA standard)
  - Warning message if ratio < 0.8 (potential fair lending concern)

---

### `auditTrailService.ts` — Immutable Decision Logging

FCA/PRA Model Risk Management-compliant audit logging.

- Every credit decision (single and bulk) is logged to `localStorage` with a persistent key
- `logSingleDecision(input, response, modelVersion)` — Logs single applicant decision
- `logBulkDecision(requests[], predictions[], modelVersion)` — Logs all bulk decisions
- Each `AuditEntry` contains:
  - UUID (`audit_<timestamp>_<random>`)
  - ISO timestamp
  - Type (`single` / `bulk`)
  - Input features (non-PII only)
  - Model version
  - Decision outcome
  - Risk band + risk score
  - PD
  - Top SHAP features
  - User agent (first 100 chars)
- Max 500 entries stored; oldest entries pruned automatically
- `getAuditTrail()` / `clearAuditTrail()` — Read and clear the log

---

### `bulkFileParser.ts` — Multi-Format File Parser

Parses bulk applicant data files into `CreditDecisionRequest[]`.

- Supported formats: **CSV, JSON, Excel (.xlsx/.xls), HTML table**
- Column name normalization — tolerates variations like `monthly_income`, `Monthly Income`, `monthlyIncome`, `Monthly Income ($)`, etc. (40+ alias mappings)
- PII column detection and masking at parse time — email, name, phone, Aadhaar/PAN/SSN, address, DOB columns are masked before any processing
- Input validation: rows with zero income and zero loan amount are filtered out
- Edge case handling: zero credit limit forced to 1, utility score clamped to [0, 100]

---

### `piiMasking.ts` — Data Privacy

GDPR Art. 5 & 32 compliant PII handling.

- `isPiiColumn(header)` — Regex-based detection of PII column headers (email, name, phone, Aadhaar, PAN, SSN, address, DOB)
- `maskPii(value)` — Partial masking: `Jo**********hn` style
- `hashPiiAsync(value)` — SHA-256 cryptographic hash via `crypto.subtle` (with simple hash fallback)
- `maskRowPii(row, headers)` — Bulk row PII masking

---

### `mockApi.ts` — Mock Authentication API

Simulates a backend auth API with localStorage persistence for the hackathon demo context.

- User registration, login, JWT-like token generation
- Session persistence across page refreshes

---

## Data Model & Types

Defined in `src/types/index.ts`:

```typescript
interface CreditApplication {
  monthly_income: number;
  income_stability: number;       // 0–100
  total_emi: number;
  credit_limit: number;
  outstanding_balance: number;
  past_delinquencies: number;
  months_since_last_dq: number;
  loan_amount_requested: number;
  loan_tenure: number;            // months
  upi_volume: number;
  ecommerce_spend: number;
  utility_score: number;          // 0–100
}

type RiskTier = "Low" | "Medium" | "High" | "Critical";

interface CreditResponse {
  probability_of_default: number;
  risk_score: number;             // 300–900
  risk_tier: RiskTier;
  decision: "Approved" | "Rejected" | "Manual Review" | "Conditional Approval";
  confidence_score: number;
  recommended_interest_rate: number;
  top_features: { feature: string; impact: number }[];
  top_protective_factors?: { feature: string; impact: number }[];
  explanation_summary?: string;
  improvement_suggestions?: string[];
  business_impact?: {
    expected_revenue: number;
    risk_reduction_percentage: number;
    approval_precision: number;
    estimated_annual_value: number;
  };
  model_version?: string;
  inference_latency_ms?: number;
  ai_report?: AIReport;
}
```

---

## AI Integrations

### Google Gemini 1.5 Flash

- **Report Generation** (`geminiService.ts`): Structured prompt engineering — model output fed as JSON, response parsed as structured JSON with validation. Fallback mock if API unavailable.
- **Credit Risk Chat** (`chatService.ts`): Multi-turn conversation with domain system prompt, PII redaction, exponential backoff retries.

### OpenAI (Optional)

- Pluggable via `VITE_AI_PROVIDER=openai` + `VITE_OPENAI_API_KEY`
- Uses `gpt-4o-mini` by default (configurable via `VITE_OPENAI_MODEL`)
- Same system prompt and PII guardrails as Gemini path

---

## Tech Stack

### Frontend

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 (SWC) |
| Styling | Tailwind CSS 3 |
| UI Components | shadcn/ui + Radix UI primitives |
| Routing | React Router v6 |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts (line, bar, radar, area, pie) |
| Animations | Framer Motion |
| Excel Parsing | SheetJS (xlsx) |
| PDF Export | jsPDF + html2canvas |
| Toast Notifications | Sonner |

### AI / ML

| Component | Technology |
|-----------|------------|
| Primary LLM | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Optional LLM | OpenAI GPT (REST) |
| Risk Model | Simulated XGBoost/LightGBM (frontend logic; prod: AWS SageMaker) |
| Explainability | SHAP-style feature attribution (computed in frontend sim) |

### Dev

| Tool | Purpose |
|------|---------|
| Vitest + Testing Library | Unit tests |
| ESLint + TypeScript ESLint | Linting |
| PostCSS + Autoprefixer | CSS processing |

---

## Project Structure

```
credit-clarity-ai/
├── notebook/
│   └── AI_Alternate_Credit_Scoring_MVP.ipynb   # Python ML notebook (XGBoost/LightGBM training)
├── src/
│   ├── pages/
│   │   ├── Landing.tsx             # Marketing landing page
│   │   ├── Login.tsx               # Auth: Login
│   │   ├── Signup.tsx              # Auth: Signup
│   │   ├── Dashboard.tsx           # Main dashboard (KPIs, charts, AI chat)
│   │   ├── CreditApplication.tsx   # Applicant form (single + bulk upload)
│   │   ├── RiskAssessment.tsx      # Decision result + policy simulation
│   │   ├── Explainability.tsx      # SHAP deep-dive + AI narrative
│   │   ├── ModelIntelligence.tsx   # Model performance monitoring
│   │   ├── Compliance.tsx          # Fairness + disparate impact
│   │   ├── AuditLog.tsx            # Immutable audit trail viewer
│   │   ├── Architecture.tsx        # System architecture diagram page
│   │   ├── Documentation.tsx       # In-app docs
│   │   ├── Profile.tsx             # User profile
│   │   ├── Settings.tsx            # App settings
│   │   ├── PrivacyPolicy.tsx       # Privacy policy
│   │   └── TermsOfService.tsx      # Terms of service
│   ├── components/
│   │   ├── CreditDecisionReport.tsx  # Full decision report component (PDF-exportable)
│   │   ├── PolicyControlPanel.tsx    # Threshold slider + approval rate simulation
│   │   ├── BusinessImpact.tsx        # Revenue/risk impact metrics card
│   │   ├── FairnessMetrics.tsx       # Fairness segment breakdown component
│   │   ├── MetricCard.tsx            # Reusable KPI card
│   │   ├── DashboardLayout.tsx       # Sidebar + nav layout wrapper
│   │   ├── CrediNovaLogo.tsx         # SVG logo component
│   │   ├── Footer.tsx                # Footer
│   │   ├── NavLink.tsx               # Active-state nav link
│   │   ├── PageHeader.tsx            # Page title + breadcrumb header
│   │   └── ui/                       # shadcn/ui components
│   ├── services/
│   │   ├── creditModelService.ts     # SageMaker simulation + PSI + policy sim
│   │   ├── geminiService.ts          # Gemini AI report generation
│   │   ├── chatService.ts            # Dual-provider AI chat (Gemini + OpenAI)
│   │   ├── fairnessService.ts        # Disparate impact / fair lending metrics
│   │   ├── auditTrailService.ts      # FCA-compliant decision logging
│   │   ├── bulkFileParser.ts         # CSV/JSON/XLSX/HTML bulk file parser
│   │   ├── piiMasking.ts             # GDPR-compliant PII masking/hashing
│   │   └── mockApi.ts                # Mock auth API
│   ├── context/
│   │   ├── AuthContext.tsx           # Auth state (user, login, logout)
│   │   └── ThemeContext.tsx          # Dark/light theme
│   ├── hooks/
│   │   ├── useAuth.ts                # Auth hook
│   │   ├── use-mobile.tsx            # Mobile breakpoint detection
│   │   └── use-toast.ts              # Toast notification hook
│   ├── types/
│   │   └── index.ts                  # All TypeScript interfaces and types
│   ├── utils/
│   │   └── resultStorage.ts          # Credit result persistence (localStorage)
│   ├── routes/                       # Route definitions
│   ├── layouts/                      # Layout components
│   ├── lib/                          # shadcn/ui utils (cn)
│   └── main.tsx                      # App entry point
├── .env                              # Environment variables (not committed)
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## Environment Variables

Create a `.env` file in the root of `credit-clarity-ai/`:

```env
# Required: Gemini API key for AI report generation and chat
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Switch AI provider (default: gemini)
VITE_AI_PROVIDER=gemini            # or "openai"

# Optional: Gemini model override (default: gemini-2.5-flash)
VITE_GEMINI_MODEL=gemini-1.5-flash

# Optional: OpenAI fallback
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_OPENAI_MODEL=gpt-4o-mini
```

---

## Key Design Decisions

### 1. Alternative Data as First-Class Features
UPI transaction volume, e-commerce spend, and utility score are treated as equally important to traditional financial signals — not as secondary adjustors. This is intentional: for unbanked populations, these are often the *only* available signals.

### 2. SHAP over Black-Box
Every decision ships with a SHAP-derived explanation. This satisfies regulatory explainability requirements (RBI model risk, EU AI Act) and builds applicant trust.

### 3. Fairness by Income Segment (not demographics)
We segment by income band rather than legally protected attributes (race, gender) because we don't collect them. The income-band disparate impact ratio is a proxy for economic equity and is FCA/ECOA-compliant.

### 4. Dual AI Provider Architecture
The chat service is designed to swap between Gemini and OpenAI transparently. This decouples the product from any single AI vendor — critical for enterprise deployments where vendor lock-in is a blocker.

### 5. PII-First Architecture
PII masking happens at the earliest possible point — at file parse time for bulk uploads, before any data touches the model or AI services. This is GDPR Art. 25 (Privacy by Design) compliant.

### 6. SageMaker Integration Pattern
The entire ML service layer is structured as if it were calling a real AWS SageMaker endpoint. Swapping the simulation for production requires only replacing the body of `callSageMakerEndpoint()` with an actual `fetch()` to the SageMaker inference URL — no other changes needed.

### 7. Audit Trail Design
The audit trail stores input features but never raw PII. Entries use UUID + ISO timestamp for traceability. The 500-entry cap is a hackathon constraint; production would use a write-once append-only database (e.g., DynamoDB with TTL).

---

## Known Limitations & Simulations

| Component | Current State | Production Target |
|-----------|---------------|-------------------|
| ML Model | Frontend simulation using XGBoost-inspired math | Real Python XGBoost/LightGBM model deployed on AWS SageMaker |
| SHAP Values | Computed inline from model weights | Server-side SHAP from actual model tree structure |
| Audit Trail | `localStorage` (max 500 entries) | Write-once append-only DB (DynamoDB / PostgreSQL with audit schema) |
| Auth / Users | `mockApi.ts` with localStorage | Real backend (Node.js/FastAPI + JWT + OAuth2) |
| Model Drift | PSI computed inline on current session data | Production: scheduled SageMaker batch jobs + CloudWatch alerts |
| Fairness | Computed on current session predictions | Production: offline fairness jobs across full loan book |
| AI Chat | Direct client → Gemini API (API key in env) | Production: proxied through backend to hide API key |
| Bulk Processing | Client-side (limited by browser memory) | Production: server-side batch job with S3 + SageMaker Batch Transform |

---

## Future Roadmap

### Phase 1 — Production Backend *(Next Priority)*
- [ ] Deploy Python ML model (XGBoost + LightGBM ensemble) to AWS SageMaker
- [ ] Build FastAPI/Node.js backend to proxy all AI calls (no client-side API keys)
- [ ] Replace `mockApi.ts` with real JWT auth (Cognito or Auth0)
- [ ] PostgreSQL schema for audit trail + applicant records
- [ ] S3 + SageMaker Batch Transform for bulk file processing at scale

### Phase 2 — Model & Data Quality
- [ ] Connect real alternative data sources: NPCI UPI transaction feeds, CIBIL bureau data, utility provider APIs
- [ ] Train on real labeled loan dataset (not simulation) — target AUC > 0.82
- [ ] Add probability calibration (Platt scaling / isotonic regression) in training pipeline
- [ ] Implement Kolmogorov-Smirnov and PSI alerting in a scheduled Lambda/Airflow job
- [ ] A/B test Champion vs Challenger model versions with traffic splitting on SageMaker

### Phase 3 — Compliance & Governance
- [ ] Integrate RBI model risk management guidelines (circular RBI/DOR/CRE/REC/2021-22/100)
- [ ] DPDP Act (India) compliance module — consent management, data deletion workflows
- [ ] Connect Fairness Agent to automated threshold recalibration pipeline
- [ ] Generate PDF Model Risk Report (MRM) on-demand for regulatory submissions
- [ ] Model version registry (MLflow or SageMaker Model Registry) with changelog

### Phase 4 — Product Expansion
- [ ] **Lender Portal**: Multi-tenant architecture — each bank gets its own threshold configuration, feature weights, and audit namespace
- [ ] **Applicant Portal**: Self-serve credit health dashboard — applicants can see their score, understand why, and track improvement over time
- [ ] **Bureau Integration**: Pull CIBIL score as a supplementary feature (not replacement) with consent flow
- [ ] **Loan Product Matching**: Given PD and risk profile, recommend specific loan products (amount, tenure, rate) from a lender's product catalog
- [ ] **SMS/WhatsApp Outreach**: For applicants without smartphones, deliver credit decision and improvement tips via SMS in regional languages

### Phase 5 — Advanced AI
- [ ] Fine-tune Gemini/GPT on credit domain corpus for deeper, more precise explanations
- [ ] Agentic orchestration (LangGraph / Google ADK) for multi-step credit advisory flows
- [ ] Conversational application intake — replace static form with AI-guided chat for applicants
- [ ] Multimodal inputs: bank statement PDF parsing, utility bill OCR for automated feature extraction

---

## ML Notebook

The `notebook/AI_Alternate_Credit_Scoring_MVP.ipynb` contains the Python proof-of-concept for the ML pipeline:

- Data generation and preprocessing
- Feature engineering (DTI, utilization, delinquency scoring)
- XGBoost and LightGBM training
- Model evaluation (AUC, Gini, Lift, KS)
- SHAP value computation and visualization
- Probability calibration

This notebook is the source of truth for the mathematical logic replicated in `creditModelService.ts`.

---

## Compliance Standards Referenced

| Standard | Application |
|----------|-------------|
| **Barclays Fair Lending** | Disparate impact ratio ≥ 0.8 for income segments (`fairnessService.ts`) |
| **ECOA / 80% Rule** | Approval rate parity check across income bands |
| **FCA / PRA MRM** | Audit trail format: immutable, timestamped, model-versioned (`auditTrailService.ts`) |
| **GDPR Art. 5 & 32** | PII masking at ingestion, SHA-256 hashing option (`piiMasking.ts`) |
| **EU AI Act (High-Risk AI)** | Human-readable explanation for every automated decision (`explainabilityAgent`) |
| **RBI Model Risk Circular** | Version tracking, retraining triggers, drift monitoring (Drift Agent) |
