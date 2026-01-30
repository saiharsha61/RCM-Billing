# RCM Billing System

> A HIPAA-compliant Revenue Cycle Management (RCM) application built with React

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

## 🚀 Features

### Core RCM Modules
- **📊 Dashboard** - Revenue overview with KPIs and priority queue
- **👥 Patient Demographics** - Patient registration and management
- **📅 Appointments** - Appointment scheduling and tracking
- **✅ Eligibility Verification** - Insurance coverage verification
- **💊 Medical Coding** - CPT/ICD-10 code selection and charge entry
- **📋 Claims Management** - Claims submission and status tracking
- **💰 Payment Posting** - ERA posting and payment reconciliation
- **⚠️ Denial Management** - Denial tracking and appeal workflow
- **📈 Reports** - Business intelligence and analytics dashboard

### 🔒 HIPAA Security Features
- **Authentication** - Secure login/logout system
- **Session Management** - Auto-logout after 15 minutes of inactivity
- **Data Masking** - Role-based masking of PHI (SSN, DOB, phone, email)
- **Audit Logging** - Comprehensive tracking of all PHI access
- **Password Security** - Strong password requirements and strength meter
- **Role-Based Access Control** - Different permission levels (Admin, Billing, Front Desk, Viewer)

## 🛠️ Tech Stack

- **Frontend:** React 18 with Hooks
- **Build Tool:** Vite
- **Styling:** Inline styles (light theme)
- **Authentication:** Mock (Supabase-ready)
- **State Management:** React useState/useEffect
- ** Security:** Custom HIPAA compliance utilities

## 📦 Installation

### Prerequisites
```bash
Node.js >= 14.0.0
npm >= 6.0.0
```

### Setup
```bash
# Clone the repository
git clone https://github.com/saiharsha61/RCM-Billing.git
cd RCM-Billing

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔑 Demo Credentials

```
Email: demo@rcmbilling.com
Password: demo123
```

## 📁 Project Structure

```
RCM-Billing/
├── src/
│   ├── lib/
│   │   ├── auth.js              # Authentication service
│   │   ├── auditLog.js          # HIPAA audit logging
│   │   ├── encryption.js        # Data masking utilities
│   │   ├── passwordValidation.js # Password validation
│   │   └── sessionManager.js    # Session timeout manager
│   ├── App.jsx                  # Main application
│   ├── index.css                # Global styles
│   └── main.jsx                 # Entry point
├── public/
├── package.json
└── README.md
```

## 🔐 Security Features

### Data Masking
Sensitive patient data is masked based on user role:
- **SSN:** `***-**-6789` (last 4 digits visible)
- **DOB:** `**/**/**** (Age: 38)`
- **Phone:** `(***) ***-4567`
- **Email:** `j***@email.com`

### Role Permissions
| Role | SSN | DOB | Insurance | Phone | Email | Audit Logs |
|------|-----|-----|-----------|-------|-------|------------|
| Admin | Full | Full | Full | Full | Full | Yes |
| Billing | Masked | Full | Full | Full | Full | No |
| Front Desk | Masked | Masked | Full | Masked | Full | No |
| Viewer | Masked | Masked | Masked | Masked | Masked | No |

### Audit Logging
All PHI access is logged with:
- Timestamp
- User ID and email
- Action (VIEW, CREATE, UPDATE, DELETE, EXPORT)
- Resource type
- IP address and session ID

View audit logs in the **Audit Logs** page (Admin only).

## 🚀 Usage

### Login
1. Navigate to `http://localhost:5173`
2. Enter credentials (see Demo Credentials above)
3. Click "Sign In"

### Navigation
- Use the sidebar to navigate between modules
- Current page is highlighted in blue
- Logout button is at the bottom of the sidebar

### Session Management
- Sessions automatically expire after 15 minutes of inactivity
- A warning popup appears 2 minutes before timeout
- Click "Extend Session" to continue or "Logout Now" to end session

## 🔧 Configuration

### Supabase Integration (Optional)
To use real Supabase authentication:

1. Install Supabase client:
```bash
npm install @supabase/supabase-js
```

2. Create a Supabase project at [supabase.com](https://supabase.com)

3. Update `src/lib/auth.js` with your credentials:
```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

4. Sign a Business Associate Agreement (BAA) for HIPAA compliance

## 📊 Module Details

### Dashboard
- **KPIs:** Expected Revenue, At Risk, Clean Rate, Needs Action
- **Priority Queue:** Urgent denials, reviews, and payments

### Patients
- Patient list with search
- Registration form
- Data masking based on role
- Audit logging on view

### Claims
- Claims table with filters
- Status tracking (Draft, Submitted, Paid, Rejected)
- Amount totals

### Payments
- Payment entry form
- ERA support
- Recent payments table

### Denials
- Denials tracking
- Reason codes (CO-50, CO-197, etc.)
- Appeal workflow

### Reports
- Revenue by Provider
- Claims Aging
- Denial Rate Analysis
- Collection Metrics
- AR Aging
- Payer Performance

## 🔒 HIPAA Compliance

### Implemented
✅ Data masking (role-based)  
✅ Audit logging (all PHI access)  
✅ Session management (auto-timeout)  
✅ Strong passwords  
✅ Role-based access control  
✅ User authentication  

### Required for Production
⏳ Supabase BAA (Business Associate Agreement)  
⏳ Production encryption keys (AWS KMS/Azure Key Vault)  
⏳ Multi-factor authentication (MFA)  
⏳ Staff HIPAA training  
⏳ Breach notification procedures  

See `hipaa_compliance_checklist.md` for detailed compliance requirements.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is a demo application and should NOT be used with real patient data without:
- Signing BAA with Supabase (or your backend provider)
- Implementing production-grade encryption
- Conducting security audits
- Establishing HIPAA compliance procedures

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Powered by [Vite](https://vitejs.dev/)
- Security best practices from [HIPAA Journal](https://www.hipaajournal.com/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**⭐ Star this repository if you find it helpful!**
