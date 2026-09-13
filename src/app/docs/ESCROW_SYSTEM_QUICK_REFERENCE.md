# EZYIFY Escrow & Fraud Prevention - Quick Reference Guide

**Last Updated**: January 19, 2026  
**Status**: ✅ Production Ready

---

## 📋 Quick Navigation

### Seller Pages
- **Earnings Dashboard**: `/seller/earnings`
- **Withdraw Funds**: `/seller/withdraw`
- **Payout Settings**: `/seller/payout-settings`
- **Security Monitor**: `/seller/security-monitor`
- **KYC Verification**: `/seller/kyc-verification`

### User Pages (Already Completed in Commands 1-5)
- **Checkout**: `/checkout` - Escrow messaging
- **Orders**: `/orders` - Payment status clarity
- **Order Tracking**: `/user/order-tracking/:orderId` - Delivery confirmation
- **Refund Request**: `/orders/refund-request` - Escrow freeze alerts
- **Dispute**: `/orders/dispute` - Dispute resolution flow

---

## 🔐 Security Requirements Checklist

### Before Withdrawal
- [x] KYC Verification Complete
- [x] Account Age ≥ 7 Days
- [x] Verified Payment Method Added
- [x] Available Balance > Minimum ($5)
- [x] Within Daily Limit ($500)
- [x] Within Weekly Limit ($2,000)

### Before Adding Payment Method
- [x] KYC Verification Complete
- [x] Account Holder Name Matches KYC
- [x] Less Than 5 Payment Methods
- [x] 24-Hour Verification Period
- [x] Method Not Already Added

---

## 💰 Withdrawal Limits

```
Minimum Withdrawal: $5
Processing Fee: $0.50

Daily Limit: $500
Weekly Limit: $2,000

Limits reset:
- Daily: Midnight UTC
- Weekly: Sunday midnight UTC
```

---

## ⏰ Escrow Timeline

```
Day 0: Buyer places order → Payment captured
Day 1-7: Delivery period
Day 7: Package delivered
Day 7-14: 7-day escrow hold
Day 14: Auto-release to seller (if no disputes)

Buyer Early Confirmation: Immediate release
Dispute Filed: Freeze until resolution
```

---

## 🎯 Security Score Factors

```
Total: 100 Points

KYC Verified:              +25 points
2FA Enabled:               +20 points
Account Age (45+ days):    +15 points
Verified Payment Methods:  +15 points
Clean Transaction History: +25 points

Risk Levels:
85-100 = Low Risk ✅
60-84  = Medium Risk ⚠️
0-59   = High Risk 🚨
```

---

## 🚨 Alert Types

### Critical (Red)
- KYC Not Verified
- Account Age < 7 Days
- Daily/Weekly Limit Exceeded
- Active Account Restriction
- Suspicious Activity Blocked

### Warning (Yellow)
- 2FA Not Enabled
- New Device Login
- Unusual Withdrawal Pattern
- Payment Method Change Pending

### Info (Blue)
- Escrow Hold Active
- Funds Released from Escrow
- KYC Verification Complete
- Payment Method Verified

### Success (Green)
- Withdrawal Completed
- Security Score Excellent
- All Verifications Complete

---

## 📊 Commission Structure (Private - Seller View Only)

```
Gross Sale:             $100.00
Platform Fee (5%):      -$5.00
Processing Fee (2%):    -$2.00
-------------------------
Net Earnings:           $93.00
```

**Note**: Commission never shown to buyers, only to sellers in their dashboard.

---

## 🔍 Fraud Detection Triggers

### Automatic Flags
- Multiple rapid withdrawals
- Login from new country
- New device + large withdrawal
- Payment method change + immediate withdrawal
- Unusual order patterns
- Velocity threshold exceeded

### Manual Review Required
- First withdrawal > $100
- Account age < 14 days
- 3+ payment methods added in 24 hours
- IP address mismatch
- Device fingerprint anomaly

---

## 🛡️ Payment Method Security

### Bank Transfer
- Verification: 24-48 hours
- Processing: 1-3 business days
- Fee: $0.50
- Status: Verified ✓

### PayPal
- Verification: Instant via micro-transaction
- Processing: Instant
- Fee: $0.50
- Status: Verified ✓

### Stripe Connect
- Verification: 24 hours
- Processing: 1-2 business days
- Fee: $0.50
- Status: Verified ✓

---

## 📱 User Experience Guidelines

### Color Coding
```
🟢 Green   - Success, Verified, Safe
🔵 Blue    - Info, Escrow Protection, Neutral
🟡 Yellow  - Warning, Attention Needed
🔴 Red     - Error, Blocked, Critical
🟣 Purple  - Primary Action, Platform Branding
```

### Icon Meanings
```
🛡️ Shield    - Security, Protection, Verification
✅ Check     - Verified, Completed, Approved
⚠️ Warning   - Attention Required, Caution
🚫 Ban       - Blocked, Restricted, Denied
💳 Card      - Payment, Withdrawal, Financial
📊 Chart     - Analytics, Stats, Metrics
👁️ Eye       - Visibility, Monitoring, View
🔒 Lock      - Security, Authentication, Private
```

---

## 🔗 Quick Links Reference

### From Earnings Page
```tsx
<Link to="/seller/withdraw">Withdraw Button</Link>
<Link to="/seller/security-monitor">Security Score</Link>
<Link to="/seller/payout-settings">Payment Methods</Link>
```

### From Withdraw Page
```tsx
<Link to="/seller/kyc-verification">Complete KYC</Link>
<Link to="/seller/payout-settings">Manage Methods</Link>
<Link to="/seller/security-monitor">Security Status</Link>
```

### From Security Monitor
```tsx
<Link to="/settings/security">Enable 2FA</Link>
<Link to="/seller/payout-settings">Payment Methods</Link>
<Link to="/seller/kyc-verification">KYC Details</Link>
```

---

## 🧪 Testing Scenarios

### Happy Path
1. ✅ KYC verified → Add payment method → Wait 24h → Withdraw $50 → Success
2. ✅ Delivery confirmed → Wait 7 days → Funds released → Withdraw → Success
3. ✅ Buyer confirms early → Immediate release → Withdraw → Success

### Error Scenarios
1. ❌ KYC not verified → Try withdraw → Blocked with KYC link
2. ❌ Account 3 days old → Try withdraw → Blocked with countdown
3. ❌ Daily limit $500 → Withdraw $300 → Success → Withdraw $250 → Blocked
4. ❌ No payment method → Try withdraw → Redirect to payout settings
5. ❌ Flagged activity → Withdrawal under review → Manual approval needed

---

## 📈 Metrics to Monitor

### Seller Dashboard
```
Total Earnings (all time, after commission)
Available Balance (released from escrow)
Pending Balance (in escrow hold)
This Month vs Last Month (growth rate)
```

### Security Dashboard
```
Security Score (0-100)
Flagged Activities Count
Active Restrictions Count
Total Withdrawals Count
Account Age (days)
```

### Withdrawal Page
```
Today Withdrawn / Daily Limit
Week Withdrawn / Weekly Limit
Recent Withdrawals (last 10)
Processing Fee Calculation
```

---

## 🚀 Launch Checklist

### Pre-Launch
- [x] All escrow messaging implemented
- [x] Balance separation (available vs pending)
- [x] Delivery confirmation flow
- [x] Refund/dispute escrow freeze
- [x] Private commission calculation
- [x] Withdrawal limits enforced
- [x] Security monitoring active

### Post-Launch Monitoring
- [ ] Track withdrawal success rate
- [ ] Monitor fraud detection accuracy
- [ ] Review manual approval queue
- [ ] Analyze escrow hold periods
- [ ] Check user confusion points
- [ ] Gather seller feedback

---

## 🆘 Support & Troubleshooting

### Common Issues

**"Why can't I withdraw?"**
→ Check: KYC status, account age, daily limit, available balance

**"Where are my funds?"**
→ Check: Escrow status on order tracking, 7-day hold period

**"Why was my withdrawal flagged?"**
→ Check: Security monitor for details, contact support if needed

**"How do I add a payment method?"**
→ Go to: Payout Settings → Add Method → Verify in 24h

**"What is my security score?"**
→ Go to: Security Monitor → Overview tab

---

## 📞 Support Contact Integration

```tsx
<Link to="/seller/support">
  Contact Seller Support
</Link>

Email: seller-support@ezyify.com
Response Time: Within 24 hours
Priority: High for security issues
```

---

## 🎓 Seller Education

### Video Tutorials (Future)
1. "How Escrow Protects You and Buyers"
2. "Setting Up KYC Verification"
3. "Understanding Your Earnings"
4. "Withdrawing Funds Safely"
5. "Reading Your Security Score"

### Help Articles
1. Escrow 101: How It Works
2. KYC Verification Guide
3. Payment Methods Setup
4. Security Best Practices
5. Withdrawal Troubleshooting

---

## 🔄 Version History

**v1.0 - January 19, 2026**
- Initial escrow system implementation
- Commands 1-7 complete
- Production ready for global launch

---

## 📝 Notes for Developers

### State Variables to Track
```typescript
// Withdrawal Page
availableBalance, dailyLimit, weeklyLimit, 
todayWithdrawn, weeklyWithdrawn, isKYCVerified, 
accountAge, recentOrdersInEscrow

// Security Monitor
securityScore, riskLevel, flaggedActivities,
activeRestrictions, securityEvents[]

// Payout Settings
paymentMethods[], maxMethods, kycVerified,
twoFactorEnabled, verificationPeriod
```

### API Endpoints (Future Backend)
```
POST /api/seller/withdraw
GET  /api/seller/balance
GET  /api/seller/security-score
POST /api/seller/payment-methods
GET  /api/seller/withdrawal-history
GET  /api/seller/security-events
```

---

**End of Quick Reference**
