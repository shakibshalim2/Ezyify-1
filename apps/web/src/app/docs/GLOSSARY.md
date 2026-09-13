# EZYIFY Escrow System - Glossary of Terms

**For:** All Team Members, New Hires, External Partners  
**Purpose:** Unified vocabulary for escrow system  
**Last Updated:** January 19, 2026

---

## 💰 Financial Terms

### **Available Balance**
The amount of money a seller can immediately withdraw. This includes only funds that have been released from escrow after the 7-day hold period.

**Example:** If you have $500 in Available Balance, you can withdraw up to $500 (subject to daily/weekly limits).

**Related:** Pending Balance, Escrow Hold

---

### **Pending Balance**
Money that is currently in escrow hold and not yet available for withdrawal. This includes orders awaiting delivery confirmation or in the 7-day hold period.

**Example:** An order delivered 3 days ago has its payment in Pending Balance, waiting for the 7-day hold to complete.

**Related:** Available Balance, Escrow Hold

---

### **Escrow**
A secure holding mechanism where buyer payments are held by EZYIFY until delivery is confirmed and the 7-day protection period passes. Neither buyer nor seller can access these funds during the hold.

**Example:** Buyer pays $100 → Money held in escrow → Seller ships → Buyer confirms delivery → 7-day hold → Money released to seller.

**Related:** Escrow Hold, Payment Protection

---

### **Escrow Hold**
The 7-day period after delivery confirmation during which funds remain in escrow before being released to the seller's available balance.

**Duration:** Exactly 7 days from delivery confirmation date

**Purpose:** Provides buyers time to ensure item matches description and file disputes if necessary.

**Related:** Delivery Confirmation, Auto-Release

---

### **Auto-Release**
Automatic release of escrow funds to the seller after the 7-day hold period expires, assuming no disputes have been filed.

**Trigger:** 7 days after delivery confirmation (or auto-confirmation)

**Example:** Delivery confirmed Jan 10 → Auto-release on Jan 17

**Related:** Escrow Hold, Delivery Confirmation

---

### **Auto-Confirmation**
Automatic confirmation of delivery if the buyer doesn't manually confirm within 7 days of the delivery date. This prevents funds from being held indefinitely.

**Trigger:** 7 days after delivery date

**Example:** Item delivered Jan 10, buyer doesn't confirm → System auto-confirms on Jan 17

**Related:** Delivery Confirmation, Escrow Hold

---

### **Commission**
The percentage of each sale that EZYIFY retains as platform fees. Consists of two parts:

1. **Platform Fee:** 5% of sale price
2. **Processing Fee:** 2% of sale price
3. **Total Commission:** 7% of sale price

**Visibility:** Only visible to sellers, never shown to buyers

**Example:** $100 sale → $5 platform fee + $2 processing fee = $7 total commission → $93 seller earnings

**Related:** Net Earnings, Gross Sale

---

### **Net Earnings**
The amount a seller earns after commission is deducted from the gross sale price.

**Calculation:** Gross Sale - Platform Fee - Processing Fee

**Example:** $100 sale - $5 - $2 = $93 net earnings

**Related:** Gross Sale, Commission

---

### **Gross Sale**
The full price paid by the buyer before any fees or deductions.

**Example:** If buyer pays $100, gross sale = $100

**Related:** Net Earnings, Commission

---

### **Withdrawal Fee**
A flat fee charged per withdrawal transaction.

**Amount:** $0.50 per withdrawal

**Example:** Withdrawing $93.00 → Fee of $0.50 → Final payout $92.50

**Related:** Net Payout, Withdrawal

---

### **Net Payout**
The final amount deposited to the seller's bank account after the withdrawal fee is deducted.

**Calculation:** Withdrawal Amount - Withdrawal Fee

**Example:** $93.00 withdrawal - $0.50 fee = $92.50 net payout

**Related:** Withdrawal Fee, Available Balance

---

### **Daily Limit**
Maximum amount a seller can withdraw in a single day.

**Amount:** $500

**Reset:** Midnight UTC daily

**Purpose:** Fraud prevention and risk management

**Related:** Weekly Limit, Velocity Limits

---

### **Weekly Limit**
Maximum amount a seller can withdraw in a single week.

**Amount:** $2,000

**Reset:** Sunday midnight UTC

**Purpose:** Fraud prevention and high-value transaction control

**Related:** Daily Limit, Velocity Limits

---

### **Minimum Withdrawal**
The smallest amount that can be withdrawn in a single transaction.

**Amount:** $5.00

**Purpose:** Prevents micro-transactions that incur proportionally high fees

**Related:** Withdrawal

---

## 🔒 Security Terms

### **KYC (Know Your Customer)**
Identity verification process required before sellers can withdraw funds. Involves submitting personal identification documents.

**Required Documents:**
- Government-issued ID
- Proof of address
- Business registration (if applicable)

**Verification Time:** 24-48 hours

**Purpose:** Regulatory compliance, fraud prevention

**Related:** Verification Status, Compliance

---

### **2FA (Two-Factor Authentication)**
Additional security layer requiring a second form of verification (typically a code sent to phone or email) in addition to password.

**Security Score Bonus:** +20 points

**Recommended for:** All users, especially sellers

**Related:** Security Score, Account Security

---

### **Security Score**
A numerical rating (0-100) that assesses the security level of a seller's account.

**Factors:**
- KYC Verified: +25 points
- 2FA Enabled: +20 points
- Account Age (45+ days): +15 points
- Verified Payment Methods (up to 5): +15 points
- Clean Transaction History: +25 points

**Risk Levels:**
- 85-100: Low Risk
- 60-84: Medium Risk
- 0-59: High Risk

**Related:** Risk Level, Account Security

---

### **Risk Level**
Classification of account security and fraud risk based on Security Score.

**Levels:**
- **Low Risk** (85-100): Full access, no restrictions
- **Medium Risk** (60-84): Some additional verification required
- **High Risk** (0-59): Heavy restrictions, manual review required

**Related:** Security Score, Account Restrictions

---

### **Velocity Limits**
Transaction frequency and volume restrictions designed to detect and prevent fraudulent activity.

**Types:**
- Daily withdrawal limit ($500)
- Weekly withdrawal limit ($2,000)
- Maximum withdrawals per day (10 attempts)

**Purpose:** Flag unusual patterns that may indicate fraud

**Related:** Daily Limit, Weekly Limit, Fraud Detection

---

### **Account Age Requirement**
Minimum time an account must be active before certain privileges (like withdrawals) are granted.

**Requirement:** 7 days

**Purpose:** Prevents fraudsters from creating accounts and quickly withdrawing funds

**Related:** Account Eligibility, Fraud Prevention

---

### **Fraud Detection**
Automated system that monitors transactions for suspicious patterns and flags potential fraud.

**Monitored Factors:**
- Unusual withdrawal patterns
- Location changes
- Device changes
- Velocity limit violations
- High-value transactions from new accounts

**Related:** Security Score, Flagged Transaction

---

### **Flagged Transaction**
A withdrawal or transaction that has been marked for manual review due to suspicious activity.

**Common Reasons:**
- First withdrawal > $400
- High-risk security score
- Unusual location
- Multiple payment methods added quickly

**Resolution Time:** 24-48 hours

**Related:** Manual Review, Security Events

---

### **Manual Review**
Human verification process for flagged transactions or high-risk activities.

**Triggers:**
- High-value withdrawals
- Flagged accounts
- Unusual patterns
- Security score < 60

**Timeline:** 24-48 hours

**Related:** Flagged Transaction, Fraud Detection

---

## 📦 Order & Transaction Terms

### **Delivery Confirmation**
The action of a buyer confirming they have received their order and it matches the description.

**Action:** Clicking "Confirm Delivery" button

**Effect:** Starts the 7-day escrow hold countdown

**Auto-Confirmation:** Happens automatically 7 days after delivery date if buyer doesn't confirm

**Related:** Escrow Hold, Auto-Confirmation

---

### **Order Status**
Current state of an order in the fulfillment process.

**Possible Statuses:**
- Pending: Order placed, awaiting payment
- Processing: Payment captured, awaiting shipment
- Shipped: Order en route to buyer
- Delivered: Order arrived at destination
- Confirmed: Buyer confirmed receipt
- Completed: Escrow released, transaction complete

**Related:** Payment Status, Escrow Timeline

---

### **Payment Status**
Current state of payment in the escrow system.

**Possible Statuses:**
- Pending: Payment initiated
- Captured: Payment successfully charged
- In-Escrow: Payment held in escrow
- Holding: 7-day hold period active
- Released: Funds released to seller
- Refunded: Funds returned to buyer
- Disputed: Funds frozen due to dispute

**Related:** Order Status, Escrow

---

### **Withdrawal Status**
Current state of a withdrawal request.

**Possible Statuses:**
- Pending: Request submitted, awaiting processing
- Processing: Being prepared for payout
- Under Review: Flagged, manual review in progress
- Approved: Cleared for payout
- Completed: Funds sent to bank
- Failed: Processing error occurred
- Blocked: Security hold prevents withdrawal
- Cancelled: User or system cancelled request

**Related:** Withdrawal, Payout Processing

---

### **Dispute**
A formal disagreement between buyer and seller regarding an order, typically filed when the item doesn't match the description or wasn't received.

**Effect:** Freezes escrow funds until resolution

**Resolution Time:** Typically 5-10 business days

**Outcomes:**
- Resolved in favor of buyer (full refund)
- Resolved in favor of seller (payment released)
- Partial refund (compromise)

**Related:** Refund, Escrow Freeze

---

### **Refund**
Return of payment to the buyer, typically issued when an order is cancelled, item not received, or dispute resolved in buyer's favor.

**Sources:**
- From escrow (if order not yet released)
- From seller's available balance (if already released)
- From EZYIFY (in case of seller fraud)

**Timeline:** 5-10 business days

**Related:** Dispute, Chargeback

---

### **Chargeback**
Reversal of payment initiated by buyer through their bank or credit card company. Escrow system is designed to minimize chargebacks.

**Prevention:** Escrow protection and delivery confirmation

**Related:** Dispute, Refund

---

### **Escrow Freeze**
Temporary lock on escrowed funds when a dispute is filed, preventing release until the dispute is resolved.

**Duration:** Until dispute resolution

**Purpose:** Protects funds while investigation occurs

**Related:** Dispute, Escrow Hold

---

## 💳 Payment Method Terms

### **Payment Method**
The destination account where seller withdrawals are sent.

**Types:**
- Bank Transfer (ACH)
- PayPal
- Stripe Connect
- Venmo
- Cash App

**Maximum:** 5 payment methods per seller

**Verification:** 24-hour verification period for new methods

**Related:** Payout, Withdrawal

---

### **Verified Payment Method**
A payment method that has completed the verification process and can be used for withdrawals.

**Verification Time:** 24 hours

**Security Score Bonus:** +3 points per verified method (up to 5 methods)

**Related:** Payment Method, Withdrawal

---

### **Payment Method Verification**
Process of confirming that a payment method belongs to the user and is valid for receiving funds.

**Process:**
1. User enters payment details
2. System validates format
3. Micro-transaction test (for bank accounts)
4. Verification within 24 hours
5. Status changes to "Verified"

**Related:** Verified Payment Method, Micro-Transaction

---

### **Payout Processing**
The process of transferring funds from EZYIFY to the seller's payment method.

**Timeline by Method:**
- PayPal: Instant
- Venmo: Instant
- Cash App: Instant
- Bank Transfer: 1-3 business days
- Stripe Connect: 1-2 business days

**Related:** Withdrawal, Payment Method

---

## 📊 System & Technical Terms

### **Escrow Timeline**
The complete journey of a payment from capture to release.

**Phases:**
1. **Day 0:** Payment captured at checkout
2. **Days 1-7:** Delivery period
3. **Day 7:** Delivery confirmed (manual or auto)
4. **Days 8-14:** 7-day escrow hold
5. **Day 15+:** Auto-release to available balance

**Total Duration:** Approximately 14-21 days from purchase to withdrawal eligibility

**Related:** Escrow Hold, Auto-Release

---

### **Security Event**
Recorded instance of suspicious or notable security-related activity on an account.

**Examples:**
- Failed login attempts
- Unusual withdrawal request
- Location change
- Device change
- Velocity limit violation

**Purpose:** Audit trail, pattern detection

**Related:** Fraud Detection, Manual Review

---

### **Analytics Event**
Tracked user action used for business intelligence and product optimization.

**Categories:**
- Escrow events
- Withdrawal events
- Payment method events
- Security events
- KYC events

**Purpose:** Data-driven decisions, performance monitoring

**Related:** Tracking, Metrics

---

### **Rate Limiting**
Restriction on the frequency of certain actions to prevent abuse.

**Examples:**
- Maximum 10 withdrawal attempts per hour
- Maximum 5 payment method changes per day
- Maximum 3 password reset requests per day

**Purpose:** Fraud prevention, system protection

**Related:** Velocity Limits, Security

---

### **Session Timeout**
Automatic logout after a period of inactivity for security purposes.

**Duration:** 30 minutes of inactivity

**Purpose:** Prevents unauthorized access if user forgets to log out

**Related:** Account Security, Authentication

---

## 🎯 User Roles & States

### **Seller**
A user who lists and sells products on EZYIFY. Subject to escrow system, withdrawal requirements, and commission structure.

**Requirements:**
- Account creation
- KYC verification (for withdrawals)
- Payment method (for withdrawals)
- Account age ≥ 7 days (for withdrawals)

**Related:** Buyer, User

---

### **Buyer**
A user who purchases products on EZYIFY. Protected by escrow system and delivery confirmation process.

**Rights:**
- Escrow protection
- Delivery confirmation
- 7-day protection period
- Dispute filing
- Refund requests

**Related:** Seller, User

---

### **Verified Seller**
A seller who has completed KYC verification and meets all requirements for withdrawing funds.

**Status Indicators:**
- ✅ KYC Verified badge
- Higher trust rating
- Full withdrawal access

**Related:** KYC, Verification Status

---

### **High-Risk Account**
Account flagged due to low security score (< 60) or suspicious activity patterns.

**Restrictions:**
- Manual review required for withdrawals
- Additional verification may be requested
- Withdrawal limits may be reduced
- Increased monitoring

**Related:** Risk Level, Security Score

---

## 📈 Metrics & Reporting Terms

### **Conversion Rate**
Percentage of sessions that result in a purchase.

**Calculation:** (Orders / Sessions) × 100

**Related:** GMV, Transaction Volume

---

### **GMV (Gross Merchandise Value)**
Total value of all sales on the platform before any fees or deductions.

**Related:** Transaction Volume, Revenue

---

### **Transaction Volume**
Total number of completed transactions in a given period.

**Related:** GMV, Conversion Rate

---

### **Withdrawal Success Rate**
Percentage of withdrawal requests that complete successfully.

**Calculation:** (Successful Withdrawals / Total Withdrawal Attempts) × 100

**Target:** > 95%

**Related:** Withdrawal Status, Failed Withdrawal

---

### **Dispute Rate**
Percentage of orders that result in disputes.

**Calculation:** (Disputed Orders / Total Orders) × 100

**Target:** < 5%

**Related:** Dispute, Order Status

---

### **Chargeback Rate**
Percentage of payments reversed through bank/credit card chargebacks.

**Calculation:** (Chargebacks / Total Payments) × 100

**Target:** < 1%

**Goal:** Minimize through escrow protection

**Related:** Chargeback, Dispute

---

## 🛠️ Platform Features

### **Escrow Protection**
EZYIFY's core feature that holds payments securely until delivery is confirmed and the protection period passes.

**Benefits:**
- Buyer protection
- Seller guaranteed payment
- Reduced disputes
- Fraud prevention

**Related:** Escrow, Payment Protection

---

### **Delivery Tracking**
System for monitoring order fulfillment status and triggering escrow releases.

**Stages:**
- Order placed
- Payment captured
- Shipped
- In transit
- Delivered
- Confirmed

**Related:** Order Status, Delivery Confirmation

---

### **Fraud Prevention System**
Multi-layer security system designed to detect and prevent fraudulent activity.

**Layers:**
1. Pre-transaction validation (KYC, account age, limits)
2. Real-time monitoring (patterns, velocity, location)
3. Transaction processing (logging, risk scoring)
4. Post-transaction review (anomaly detection, manual review)

**Related:** Security Score, Fraud Detection

---

### **Withdrawal Dashboard**
Seller interface for managing withdrawals and viewing available balance.

**Features:**
- Available balance display
- Pending balance display
- Withdrawal request form
- Limit indicators
- Transaction history

**Related:** Seller Dashboard, Withdrawal

---

## 🔄 Process Terms

### **Reconciliation**
Process of verifying that financial records (escrow balances, available balances, payouts) match accounting records.

**Frequency:** Daily

**Purpose:** Detect discrepancies, ensure accuracy

**Related:** Financial Accuracy, Audit

---

### **Escalation**
Process of forwarding an issue to higher-level support or engineering when first-line resolution fails.

**Levels:**
- L1: Support Team
- L2: Engineering Team
- L3: Senior Engineering + Security

**Related:** Support, Incident Response

---

### **Rollback**
Reverting to a previous version of the system in case of critical issues after deployment.

**Trigger:** Critical bugs, system failures

**Procedure:** Documented in deployment checklist

**Related:** Deployment, Incident Response

---

## 📞 Support Terms

### **Ticket**
Formal support request submitted by a user or internal team member.

**Priority Levels:**
- P0: Critical (< 30 min response)
- P1: High (< 2 hour response)
- P2: Medium (< 4 hour response)
- P3: Low (< 24 hour response)

**Related:** Support, Escalation

---

### **SLA (Service Level Agreement)**
Commitment to specific response and resolution times for support tickets.

**Examples:**
- P0 incidents: 30 minute response, 2 hour resolution
- P1 incidents: 2 hour response, 4 hour resolution

**Related:** Support, Ticket

---

### **Runbook**
Documented operational procedures for running the production system.

**Contents:**
- Daily operations
- Monitoring procedures
- Incident response
- Maintenance tasks

**Related:** Operations, Documentation

---

## 🎓 Acronyms & Abbreviations

**2FA** - Two-Factor Authentication  
**ACH** - Automated Clearing House (bank transfers)  
**API** - Application Programming Interface  
**AML** - Anti-Money Laundering  
**CLS** - Cumulative Layout Shift  
**CRUD** - Create, Read, Update, Delete  
**ETA** - Estimated Time of Arrival  
**FCP** - First Contentful Paint  
**FID** - First Input Delay  
**GMV** - Gross Merchandise Value  
**KYC** - Know Your Customer  
**LCP** - Largest Contentful Paint  
**P0/P1/P2/P3** - Priority Levels  
**PII** - Personally Identifiable Information  
**SLA** - Service Level Agreement  
**TTI** - Time to Interactive  
**UTC** - Coordinated Universal Time  
**WCAG** - Web Content Accessibility Guidelines  

---

## 📚 Related Documentation

- **Technical Guide:** `/docs/ESCROW_PAYOUT_FRAUD_PREVENTION_COMPLETE.md`
- **Quick Reference:** `/docs/ESCROW_SYSTEM_QUICK_REFERENCE.md`
- **Architecture:** `/docs/ESCROW_SYSTEM_ARCHITECTURE_DIAGRAM.md`
- **Troubleshooting:** `/docs/TROUBLESHOOTING_GUIDE.md`
- **Operations:** `/docs/OPERATIONS_RUNBOOK.md`

---

**Last Updated:** January 19, 2026  
**Version:** 1.0  
**Maintained By:** Documentation Team

---

*If you encounter a term not defined here, please request an addition via [documentation@ezyify.com]*
