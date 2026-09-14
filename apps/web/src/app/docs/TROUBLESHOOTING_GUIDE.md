# EZYIFY Escrow System - Troubleshooting Guide

**For:** Support Team, DevOps, Developers  
**Purpose:** Quick resolution guide for common issues  
**Last Updated:** January 19, 2026

---

## 🚨 Quick Issue Resolution

### Critical Issues (P0) - Resolve Immediately

#### Issue: User Cannot Withdraw Funds

**Symptom:** Withdrawal button disabled or error message shown

**Diagnosis Steps:**
1. Check KYC status
2. Verify account age
3. Check available balance
4. Verify payment method
5. Check daily/weekly limits

**Resolution Matrix:**

| Error Message | Cause | Solution | ETA |
|--------------|-------|----------|-----|
| "KYC verification required" | KYC not complete | Guide user to `/seller/kyc-verification` | 24-48h |
| "Account too new" | Account < 7 days old | Wait until account age requirement met | Varies |
| "Insufficient balance" | Available balance < $5 | Wait for escrow release or make more sales | Varies |
| "Daily limit exceeded" | Used $500+ today | Wait for daily reset (midnight UTC) | < 24h |
| "Weekly limit exceeded" | Used $2,000+ this week | Wait for weekly reset (Sunday) | < 7 days |
| "No payment method" | No verified payment method | Add method at `/seller/payout-settings` | 24h verification |

**Quick Fix Commands:**
```typescript
// Check user withdrawal eligibility
import { validateWithdrawal } from '../utils/escrowHelpers';

const result = validateWithdrawal(
  amount,
  availableBalance,
  dailyUsed,
  weeklyUsed,
  isKYCVerified,
  accountAgeDays
);

console.log('Eligibility:', result.isValid);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
```

---

#### Issue: Escrow Funds Not Released

**Symptom:** Delivery confirmed but funds still in escrow

**Common Causes:**
1. Delivery not actually confirmed (check order status)
2. 7-day hold period still active
3. Dispute filed on order
4. System calculation error

**Diagnosis:**
```typescript
import { getDaysRemainingInEscrow, calculateEscrowReleaseDate } from '../utils/escrowHelpers';

const daysRemaining = getDaysRemainingInEscrow(deliveryDate);
const releaseDate = calculateEscrowReleaseDate(deliveryDate);

console.log('Days remaining:', daysRemaining);
console.log('Expected release:', releaseDate);
```

**Resolution:**
- If < 7 days: Normal, wait for hold period
- If 7+ days: Check for disputes or system issues
- If disputed: Resolve dispute first
- If system error: Escalate to engineering

**Escalation:** If issue persists after expected release date

---

#### Issue: Payment Method Verification Failed

**Symptom:** "Payment method could not be verified" error

**Common Causes:**
1. Invalid account details
2. Bank rejection
3. Duplicate payment method
4. Regional restrictions

**Resolution Steps:**
1. Verify all details are correct (no typos)
2. Check bank account is active
3. Try alternative payment method
4. Contact payment provider support

**Testing:**
```typescript
// Validate payment method details
const isValidBankAccount = /^[0-9]{8,20}$/.test(accountNumber);
const isValidRoutingNumber = /^[0-9]{9}$/.test(routingNumber);

console.log('Valid account:', isValidBankAccount);
console.log('Valid routing:', isValidRoutingNumber);
```

---

### High Priority Issues (P1) - Resolve Within 4 Hours

#### Issue: Commission Calculation Incorrect

**Symptom:** Seller reports earnings don't match expected

**Expected Calculation:**
```
Gross Sale:          $100.00
Platform Fee (5%):    -$5.00
Processing Fee (2%):  -$2.00
─────────────────────────────
Net Earnings:         $93.00

Withdrawal Amount:    $93.00
Withdrawal Fee:       -$0.50
─────────────────────────────
Final Payout:         $92.50
```

**Verification:**
```typescript
import { calculateSellerEarnings, calculateWithdrawalAmount } from '../utils/escrowHelpers';

const earnings = calculateSellerEarnings(100);
console.log('Expected net:', earnings.netEarnings); // Should be 93

const withdrawal = calculateWithdrawalAmount(93);
console.log('Expected payout:', withdrawal.netAmount); // Should be 92.50
```

**Common Mistakes:**
- Forgetting withdrawal fee ($0.50)
- Confusing gross with net
- Not accounting for refunds

---

#### Issue: Security Score Not Updating

**Symptom:** User completed requirements but score unchanged

**Diagnosis:**
```typescript
import { calculateSecurityScore } from '../utils/escrowHelpers';

const score = calculateSecurityScore({
  kycVerified: true,        // +25
  twoFactorEnabled: true,   // +20
  accountAgeDays: 60,       // +15 (45+ days)
  verifiedPaymentMethods: 3,// +9 (3 × 3)
  cleanTransactionHistory: true // +25
});

console.log('Expected score:', score); // Should be 94
```

**Force Recalculation:**
1. Verify all factors in database
2. Clear cache
3. Trigger manual recalculation
4. Refresh user session

---

#### Issue: Delivery Confirmation Not Working

**Symptom:** "Confirm Delivery" button does nothing

**Common Causes:**
1. Order not in delivered status
2. Already confirmed
3. JavaScript error
4. API endpoint issue

**Client-Side Check:**
```typescript
// Check order status
const canConfirm = order.status === 'delivered' && !order.deliveryConfirmed;

if (!canConfirm) {
  console.log('Cannot confirm:', {
    status: order.status,
    alreadyConfirmed: order.deliveryConfirmed
  });
}
```

**API Call Verification:**
```typescript
// Test API endpoint
const response = await fetch(`/api/orders/${orderId}/confirm-delivery`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

console.log('API Response:', response.status, await response.json());
```

---

### Medium Priority Issues (P2) - Resolve Within 24 Hours

#### Issue: Balance Display Incorrect

**Symptom:** Available balance doesn't match expected

**Check These:**
1. Are there pending orders in escrow?
2. Are there disputed orders?
3. Recent withdrawals processed?
4. Refunds issued?

**Calculation:**
```typescript
// Manual balance calculation
const totalEarnings = completedOrders
  .map(order => calculateSellerEarnings(order.amount).netEarnings)
  .reduce((sum, amt) => sum + amt, 0);

const totalWithdrawals = withdrawals
  .filter(w => w.status === 'completed')
  .reduce((sum, w) => sum + w.amount + 0.50, 0); // Include fees

const totalRefunds = refunds
  .reduce((sum, r) => sum + r.amount, 0);

const expectedAvailable = totalEarnings - totalWithdrawals - totalRefunds;

console.log('Expected available balance:', expectedAvailable);
```

---

#### Issue: KYC Verification Stuck

**Symptom:** KYC submitted but no response after 48 hours

**Resolution:**
1. Check document quality (clear, readable)
2. Verify all required documents submitted
3. Check for rejection email (spam folder)
4. Contact KYC provider support
5. Escalate to compliance team

**Status Check:**
```typescript
// Check KYC status
const kycStatuses = {
  'not-started': 'User has not begun KYC',
  'in-progress': 'User is filling out forms',
  'pending-review': 'Submitted, awaiting review',
  'verified': 'Successfully verified',
  'rejected': 'Verification failed',
  'expired': 'Verification expired (annual renewal)'
};
```

---

#### Issue: Withdrawal Limits Confusion

**Symptom:** User doesn't understand why they can't withdraw

**Education Template:**
```
Your current limits:

Daily Limit:
  Used: $[X] of $500
  Remaining: $[Y]
  Resets: [Time] UTC

Weekly Limit:
  Used: $[X] of $2,000
  Remaining: $[Y]
  Resets: Sunday midnight UTC

Your requested withdrawal: $[Z]
Status: [Exceeds daily limit / Exceeds weekly limit / OK]

To withdraw $[Z], you need to:
[Wait until daily reset / Wait until weekly reset / Reduce amount]
```

---

### Low Priority Issues (P3) - Resolve Within 48 Hours

#### Issue: UI Display Issues

**Common Problems:**

**1. Progress Bar Not Showing:**
```typescript
// Check if data is valid
const percentage = (used / limit) * 100;
console.log('Progress bar percentage:', percentage);

// Should be 0-100
if (percentage < 0 || percentage > 100) {
  console.error('Invalid percentage:', percentage);
}
```

**2. Status Badge Wrong Color:**
```typescript
// Verify status mapping
const statusColors = {
  'pending': 'yellow',
  'in-escrow': 'blue',
  'holding': 'yellow',
  'released': 'green',
  'disputed': 'red'
};

console.log('Expected color:', statusColors[order.status]);
```

**3. Currency Not Formatting:**
```typescript
import { formatCurrency } from '../utils/escrowHelpers';

// Should return "$93.00"
console.log(formatCurrency(93));

// If returns "93", check locale settings
```

---

## 🔍 Diagnostic Tools

### Tool 1: User Eligibility Checker

```typescript
// Copy-paste this into browser console on any page
function checkUserEligibility(userId) {
  const user = getUserData(userId); // Your API call
  
  console.log('=== USER ELIGIBILITY REPORT ===');
  console.log('User ID:', userId);
  console.log('KYC Verified:', user.kycVerified ? '✅' : '❌');
  console.log('Account Age:', user.accountAgeDays, 'days', 
    user.accountAgeDays >= 7 ? '✅' : '❌');
  console.log('Available Balance:', formatCurrency(user.availableBalance),
    user.availableBalance >= 5 ? '✅' : '❌');
  console.log('Payment Methods:', user.paymentMethods.length,
    user.paymentMethods.length > 0 ? '✅' : '❌');
  console.log('Daily Limit:', formatCurrency(user.dailyUsed), 'of $500',
    user.dailyUsed < 500 ? '✅' : '❌');
  console.log('Weekly Limit:', formatCurrency(user.weeklyUsed), 'of $2,000',
    user.weeklyUsed < 2000 ? '✅' : '❌');
  
  const canWithdraw = 
    user.kycVerified &&
    user.accountAgeDays >= 7 &&
    user.availableBalance >= 5 &&
    user.paymentMethods.length > 0 &&
    user.dailyUsed < 500 &&
    user.weeklyUsed < 2000;
  
  console.log('\n=== RESULT ===');
  console.log('Can Withdraw:', canWithdraw ? '✅ YES' : '❌ NO');
  
  if (!canWithdraw) {
    console.log('\nBlocking Factors:');
    if (!user.kycVerified) console.log('- KYC not verified');
    if (user.accountAgeDays < 7) console.log('- Account too new');
    if (user.availableBalance < 5) console.log('- Insufficient balance');
    if (user.paymentMethods.length === 0) console.log('- No payment method');
    if (user.dailyUsed >= 500) console.log('- Daily limit reached');
    if (user.weeklyUsed >= 2000) console.log('- Weekly limit reached');
  }
}
```

---

### Tool 2: Escrow Timeline Calculator

```typescript
function checkEscrowTimeline(orderId) {
  const order = getOrderData(orderId); // Your API call
  
  console.log('=== ESCROW TIMELINE ===');
  console.log('Order ID:', orderId);
  console.log('Status:', order.status);
  console.log('Order Date:', order.orderDate);
  console.log('Shipped Date:', order.shippedDate || 'Not shipped');
  console.log('Delivery Date:', order.deliveryDate || 'Not delivered');
  console.log('Delivery Confirmed:', order.deliveryConfirmed ? 'Yes' : 'No');
  
  if (order.deliveryConfirmed && order.deliveryDate) {
    const releaseDate = calculateEscrowReleaseDate(new Date(order.deliveryDate));
    const daysRemaining = getDaysRemainingInEscrow(new Date(order.deliveryDate));
    
    console.log('\nEscrow Hold:');
    console.log('Release Date:', releaseDate.toLocaleDateString());
    console.log('Days Remaining:', daysRemaining);
    console.log('Status:', daysRemaining === 0 ? '✅ Released' : `⏳ ${daysRemaining} days left`);
  } else {
    console.log('\nEscrow Status: Waiting for delivery confirmation');
  }
}
```

---

### Tool 3: Commission Calculator

```typescript
function calculateFullBreakdown(saleAmount) {
  const earnings = calculateSellerEarnings(saleAmount);
  const withdrawal = calculateWithdrawalAmount(earnings.netEarnings);
  
  console.log('=== COMMISSION BREAKDOWN ===');
  console.log('Gross Sale:', formatCurrency(earnings.grossAmount));
  console.log('Platform Fee (5%):', '-' + formatCurrency(earnings.platformFee));
  console.log('Processing Fee (2%):', '-' + formatCurrency(earnings.processingFee));
  console.log('─────────────────────');
  console.log('Net Earnings:', formatCurrency(earnings.netEarnings));
  console.log('');
  console.log('=== WITHDRAWAL BREAKDOWN ===');
  console.log('Amount to Withdraw:', formatCurrency(withdrawal.grossAmount));
  console.log('Withdrawal Fee:', '-' + formatCurrency(withdrawal.fee));
  console.log('─────────────────────');
  console.log('Final Payout:', formatCurrency(withdrawal.netAmount));
  
  return {
    earnings,
    withdrawal
  };
}
```

---

## 📞 Escalation Path

### Level 1: Support Team (First Response)
- Handle common issues using this guide
- Use diagnostic tools
- Check FAQ and documentation
- Response time: < 1 hour

**Escalate to Level 2 if:**
- Issue not in troubleshooting guide
- Requires system access
- Security concern
- User is high-value customer

---

### Level 2: Engineering Team
- System-level issues
- Bug investigation
- Database queries
- API debugging
- Response time: < 4 hours

**Escalate to Level 3 if:**
- Critical system outage
- Security breach
- Data integrity issue
- Affects multiple users

---

### Level 3: Senior Engineering + Security
- Critical incidents
- Security incidents
- Architecture decisions
- Data recovery
- Response time: < 30 minutes

---

## 🚑 Emergency Procedures

### Emergency 1: System-Wide Withdrawal Failure

**Immediate Actions:**
1. Post status page update
2. Disable withdrawal button platform-wide
3. Investigate root cause
4. Fix and test
5. Enable withdrawals gradually
6. Monitor closely

**Communication Template:**
```
Subject: Temporary Withdrawal Service Interruption

We're experiencing a temporary issue with withdrawal processing. 
Your funds are safe and will be available shortly.

Status: Investigating / Fixing / Testing / Resolved
ETA: [Time]

We'll update you within [X] hours.
```

---

### Emergency 2: Fraudulent Activity Detected

**Immediate Actions:**
1. Freeze affected account(s)
2. Alert security team
3. Document evidence
4. Review transaction logs
5. File internal report
6. Contact law enforcement if needed

**DO NOT:**
- Inform suspected user prematurely
- Refund without investigation
- Release funds to suspicious accounts

---

### Emergency 3: Escrow System Not Releasing Funds

**Immediate Actions:**
1. Check cron jobs / scheduled tasks
2. Review error logs
3. Manual release for affected orders
4. Fix automation issue
5. Notify affected sellers
6. Prevent future occurrences

---

## 📊 Health Check Dashboard

### Key Metrics to Monitor

**Financial Health:**
```
✅ Total Escrow Balance = Sum of all pending orders
✅ Available Withdrawals = Released funds not yet withdrawn
✅ Daily Withdrawal Volume < Expected range
✅ Failed Withdrawal Rate < 5%
```

**System Health:**
```
✅ API Response Time < 500ms
✅ Error Rate < 1%
✅ Database Query Time < 100ms
✅ Uptime > 99.9%
```

**User Health:**
```
✅ KYC Completion Rate > 60%
✅ Withdrawal Success Rate > 95%
✅ Average Escrow Release Time = 7-8 days
✅ Dispute Rate < 5%
```

---

## 🔐 Security Incident Response

### Suspicious Activity Indicators:

**Account Takeover:**
- Login from new location
- Password change followed by immediate withdrawal attempt
- Multiple failed login attempts

**Fraudulent Withdrawal:**
- First-time withdrawal > $400
- Multiple payment methods added quickly
- Withdrawal to recently added method

**Action:**
1. Flag account for review
2. Require additional verification
3. Delay withdrawal 24-48 hours
4. Contact user via verified email/phone

---

## 📝 Logging Best Practices

### What to Log:

```typescript
// Good logging example
console.log('Withdrawal attempt:', {
  userId: user.id,
  amount: amount,
  availableBalance: user.availableBalance,
  kycVerified: user.kycVerified,
  accountAge: user.accountAgeDays,
  dailyUsed: user.dailyUsed,
  weeklyUsed: user.weeklyUsed,
  timestamp: new Date().toISOString()
});
```

### What NOT to Log:

❌ Passwords or API keys  
❌ Full credit card numbers  
❌ Social security numbers  
❌ Personal identification documents  

---

## 📚 Additional Resources

- **Full Documentation:** `/docs/ESCROW_PAYOUT_FRAUD_PREVENTION_COMPLETE.md`
- **Quick Reference:** `/docs/ESCROW_SYSTEM_QUICK_REFERENCE.md`
- **Architecture:** `/docs/ESCROW_SYSTEM_ARCHITECTURE_DIAGRAM.md`
- **Testing Guide:** `/docs/QA_TESTING_GUIDE.md`

---

## 📞 Support Contacts

**Technical Issues:**
- Email: engineering@ezyify.app
- Slack: #escrow-system-support
- On-Call: [Phone Number]

**Security Issues:**
- Email: security@ezyify.app
- Emergency: [Phone Number]
- Response: < 30 minutes

**Compliance Issues:**
- Email: compliance@ezyify.app
- Response: < 4 hours

---

**Last Updated:** January 19, 2026  
**Version:** 1.0  
**Next Review:** Post-Launch Week 1

---

*Keep this guide updated as new issues are discovered and resolved.*
