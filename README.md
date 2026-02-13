# AI-Native RCM Platform (eCW V12 Style)

A comprehensive Revenue Cycle Management (RCM) platform built with React, mimicking the workflows of eClinicalWorks V12 but enhanced with AI-driven features, FHIR interoperability, and predictive analytics.

## 🚀 Features

### Core RCM Modules
- **Patient Registration**: Demographics, SOGI data, insurance & guarantor management.
- **Eligibility Verification**: Real-time 270/271 EDI transaction simulation.
- **Prior Authorization**: Automated auth tracking, visit chart decrements, and expiration alerts.
- **Clinical Documentation**: "Treatment Window" with smart forms, CPT/ICD-10/NDC coding.
- **Claims Management**: Claim scrubbers, denial routing, and payment posting.
- **Patient Kiosk**: Self-service check-in and copay payments.

### 🧠 AI & Predictive Analytics
- **No-Show Risk Scoring**: Predicts appointment no-shows based on 7 factors (history, distance, weather, etc.).
- **Denial Risk Prediction**: Analyzes claims before submission for potential denials (authorization missing, mismatch, etc.).
- **Propensity-to-Pay**: Scores patients on likelihood to pay balances to optimize collection strategies.
- **Smart Worklists**: AI-prioritized task lists for staff efficiency.

### 🔥 FHIR R4 API Layer
- **RESTful API**: Full support for `Patient`, `Observation`, `Condition`, `MedicationRequest`, and `DocumentReference` resources.
- **SMART on FHIR**: OAuth 2.0 authentication with scope-based access control.
- **Interactive Documentation**: Built-in Swagger-like UI to test API endpoints directly.

### 📊 Analytics Dashboard
- **RCM KPIs**: Real-time tracking of Days in A/R, Net Collection Rate, Denial Rate.
- **Provider Productivity**: RVU tracking and encounter volume (featuring Mission, TX wound care data).
- **Financial Visualization**: Interactive charts for revenue by payer and A/R aging buckets.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, CSS Modules (eCW-styled)
- **State Management**: React Hooks & Context
- **Security**: AES-256-GCM encryption for clinical notes, PBKDF2 for keys, Break-glass access logs.
- **Database**: Mock SQL schema with relational integrity (Providers, Patients, Claims, etc.).

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/saiharsha61/AI-RCM-Platform.git
   cd AI-RCM-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open browser to `http://localhost:5173` (or port shown in terminal)
   - **Login**: `admin` / `password123`

## 🧪 How to Test

### 1. Test AI Features
- Go to **Patient Demographics**, search for "Pedro Suarez" (MRN 9609).
- Observe the **Propensity Score** badge.
- Go to **Scheduler**, create an appointment. See the **No-Show Risk** score calculated instantly.

### 2. Test FHIR API
- Click **API Docs** (🔌 icon) in the sidebar.
- Go to **Authentication** tab -> Click **"Authorize"** -> **"Exchange Token"**.
- Copy the access token.
- Go to **API Tester** tab, paste token, and click **"GET /Patient"**.

### 3. Test Analytics
- Click **Analytics** (📊 icon) in the sidebar.
- Explore the **Claims AI** tab to see denial risk distribution.
- Check **Providers** tab to see wound care specialist performance.

## 📁 Project Structure

```
src/
├── components/        # React components (Clinical, RCM, Admin, UI)
├── lib/              # core logic & utilities
│   ├── aiScoringEngine.js  # ML models for risk/propensity
│   ├── fhirServer.js       # Mock FHIR R4 server
│   ├── fhirAuth.js         # OAuth 2.0 implementation
│   ├── mockData.js         # Seed data (including Mission, TX clinic)
│   └── cryptoService.js    # Encryption service
├── database/         # SQL schema definitions
└── assets/           # Static assets
```

## 🔒 Security & Compliance
- **HIPAA**: Audit logs for all data access (`auditLog.js`).
- **Encryption**: Sensitive clinical notes encrypted at rest.
- **Access Control**: Role-based access (Provider, Front Desk, Biller).

## 📄 License
Proprietary - Staffingly Inc.
