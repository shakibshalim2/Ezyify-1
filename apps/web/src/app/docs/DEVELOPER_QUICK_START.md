# Developer Quick Start Guide - EZYIFY Escrow System

**For:** New developers joining the project  
**Time to Complete:** 30 minutes  
**Prerequisites:** Basic React/TypeScript knowledge

---

## 🎯 Goal

Get you up and running with the EZYIFY escrow system in 30 minutes, understanding the core concepts and being able to make your first contribution.

---

## 📚 Step 1: Understand the System (5 minutes)

### What is the Escrow System?

Think of it like eBay or PayPal buyer/seller protection:

```
Buyer pays → Money held safely → Seller ships → Buyer confirms → Money released
```

**Key Principle:** Money is NEVER released until buyer confirms delivery (or 7 days pass).

### Core Files to Know

```
/pages/seller/
  ├── EarningsPage.tsx      ← Shows seller balance
  ├── WithdrawPage.tsx      ← Withdrawal interface
  ├── SecurityMonitorPage.tsx ← Security dashboard
  └── PayoutSettingsPage.tsx  ← Payment methods

/components/
  ├── EscrowInfoTooltip.tsx       ← Reusable escrow info
  ├── SecurityStatusBadge.tsx     ← Security score badge
  └── EscrowStatusWidget.tsx      ← Order escrow status

/utils/
  ├── escrowHelpers.ts      ← All calculations & helpers
  └── analyticsEvents.ts    ← Event tracking

/constants/
  └── escrowConstants.ts    ← All configuration values
```

---

## 🔧 Step 2: Essential Imports (5 minutes)

### Import Constants (Never Hardcode!)

```typescript
// ✅ GOOD - Use constants
import { FINANCIAL, TIME_PERIODS } from '../constants/escrowConstants';

const dailyLimit = FINANCIAL.DAILY_WITHDRAWAL_LIMIT; // $500
const holdDays = TIME_PERIODS.ESCROW_HOLD_DAYS; // 7

// ❌ BAD - Hardcoding
const dailyLimit = 500; // Don't do this!
```

### Import Helpers

```typescript
// Import escrow calculation helpers
import {
  calculateSellerEarnings,
  calculateWithdrawalAmount,
  getDaysRemainingInEscrow,
  formatCurrency,
  validateWithdrawal
} from '../utils/escrowHelpers';

// Example usage:
const earnings = calculateSellerEarnings(100);
// Returns: { grossAmount: 100, platformFee: 5, processingFee: 2, netEarnings: 93 }

const formatted = formatCurrency(93);
// Returns: "$93.00"
```

### Import Analytics

```typescript
// Import analytics tracking
import { analytics } from '../utils/analyticsEvents';

// Track events
analytics.withdrawal.initiateWithdrawal(50);
analytics.security.viewSecurityMonitor();
```

---

## 💰 Step 3: Working with Money (5 minutes)

### Commission Calculation Example

```typescript
import { calculateSellerEarnings, formatCurrency } from '../utils/escrowHelpers';

function ProductEarnings({ salePrice }: { salePrice: number }) {
  const earnings = calculateSellerEarnings(salePrice);

  return (
    <div>
      <p>Sale Price: {formatCurrency(earnings.grossAmount)}</p>
      <p>Platform Fee (5%): -{formatCurrency(earnings.platformFee)}</p>
      <p>Processing Fee (2%): -{formatCurrency(earnings.processingFee)}</p>
      <hr />
      <p><strong>Your Earnings: {formatCurrency(earnings.netEarnings)}</strong></p>
    </div>
  );
}

// Example:
// Sale Price: $100.00
// Platform Fee (5%): -$5.00
// Processing Fee (2%): -$2.00
// ──────────────────────
// Your Earnings: $93.00
```

### Withdrawal Validation Example

```typescript
import { validateWithdrawal, FINANCIAL } from '../utils/escrowHelpers';

function WithdrawalForm() {
  const [amount, setAmount] = useState(0);
  
  const validation = validateWithdrawal(
    amount,                    // Amount to withdraw
    500,                       // Available balance
    100,                       // Daily used so far
    500,                       // Weekly used so far
    true,                      // KYC verified
    14                         // Account age in days
  );

  return (
    <div>
      <input 
        type="number" 
        value={amount} 
        onChange={(e) => setAmount(parseFloat(e.target.value))}
      />
      
      {!validation.isValid && (
        <div>
          {validation.errors.map((error, i) => (
            <p key={i} className="text-red-600">{error}</p>
          ))}
        </div>
      )}
      
      {validation.warnings.map((warning, i) => (
        <p key={i} className="text-yellow-600">{warning}</p>
      ))}
    </div>
  );
}
```

---

## ⏰ Step 4: Working with Escrow Timelines (5 minutes)

### Calculate Escrow Release Date

```typescript
import { 
  calculateEscrowReleaseDate, 
  getDaysRemainingInEscrow,
  formatDate 
} from '../utils/escrowHelpers';

function EscrowTimeline({ deliveryDate }: { deliveryDate: Date }) {
  const releaseDate = calculateEscrowReleaseDate(deliveryDate);
  const daysRemaining = getDaysRemainingInEscrow(deliveryDate);

  return (
    <div>
      <p>Delivery Confirmed: {formatDate(deliveryDate, 'short')}</p>
      <p>Release Date: {formatDate(releaseDate, 'short')}</p>
      <p>Days Remaining: {daysRemaining}</p>
      
      {daysRemaining === 0 && <p>✅ Funds released!</p>}
      {daysRemaining > 0 && (
        <div className="w-full h-2 bg-gray-200 rounded">
          <div 
            className="h-full bg-blue-500"
            style={{ width: `${((7 - daysRemaining) / 7) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Example output:
// Delivery Confirmed: Jan 10, 2026
// Release Date: Jan 17, 2026
// Days Remaining: 3
// [=========>    ] 57%
```

---

## 🔒 Step 5: Security Score Calculation (5 minutes)

### Calculate and Display Security Score

```typescript
import { calculateSecurityScore, getRiskLevel } from '../utils/escrowHelpers';
import { SecurityStatusBadge } from '../components/SecurityStatusBadge';

function SellerSecurityScore() {
  const score = calculateSecurityScore({
    kycVerified: true,              // +25 points
    twoFactorEnabled: true,         // +20 points
    accountAgeDays: 60,             // +15 points (45+ days)
    verifiedPaymentMethods: 3,      // +9 points (3 methods × 3)
    cleanTransactionHistory: true   // +25 points
  });
  // Total: 94 points

  const riskLevel = getRiskLevel(score); // "low"

  return (
    <div>
      <SecurityStatusBadge score={score} />
      {/* Displays: "Low Risk (94/100)" with green badge */}
      
      <p>Your account is in excellent standing!</p>
    </div>
  );
}
```

---

## 🎨 Step 6: Using Reusable Components (5 minutes)

### EscrowInfoTooltip

```typescript
import { EscrowInfoTooltip } from '../components/EscrowInfoTooltip';

function CheckoutSummary() {
  return (
    <div className="flex items-center gap-2">
      <p>Your payment is protected</p>
      <EscrowInfoTooltip />
      {/* Shows tooltip on hover with escrow explanation */}
    </div>
  );
}
```

### EscrowStatusWidget

```typescript
import { EscrowStatusWidget } from '../components/EscrowStatusWidget';

function OrderCard({ order }) {
  return (
    <EscrowStatusWidget
      status="holding"
      amount={100}
      deliveryDate={new Date('2026-01-10')}
      releaseDate={new Date('2026-01-17')}
      orderId="ORD-12345"
      compact={false}
    />
  );
}
```

### WithdrawalLimitIndicator

```typescript
import { WithdrawalLimitIndicator } from '../components/WithdrawalLimitIndicator';

function WithdrawalLimits() {
  return (
    <div className="space-y-4">
      <WithdrawalLimitIndicator
        used={300}
        limit={500}
        label="Daily Withdrawal"
        period="Daily"
      />
      
      <WithdrawalLimitIndicator
        used={1200}
        limit={2000}
        label="Weekly Withdrawal"
        period="Weekly"
      />
    </div>
  );
}
```

---

## 📊 Step 7: Analytics Tracking (5 minutes)

### Track User Events

```typescript
import { analytics } from '../utils/analyticsEvents';

function WithdrawButton({ amount }: { amount: number }) {
  const handleWithdraw = async () => {
    // Track initiation
    analytics.withdrawal.initiateWithdrawal(amount);
    
    try {
      const response = await fetch('/api/seller/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount })
      });
      
      if (response.ok) {
        // Track success
        analytics.withdrawal.completeWithdrawal(amount, 'bank-transfer');
      } else {
        // Track failure
        analytics.withdrawal.failWithdrawal('API Error', amount);
      }
    } catch (error) {
      analytics.trackError('Withdrawal API Error', error.message);
    }
  };

  return (
    <button onClick={handleWithdraw}>
      Withdraw ${amount}
    </button>
  );
}
```

### Track Page Views

```typescript
import { useEffect } from 'react';
import { analytics } from '../utils/analyticsEvents';

function WithdrawPage() {
  useEffect(() => {
    analytics.withdrawal.viewWithdrawPage();
  }, []);

  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

---

## 🚨 Common Patterns & Best Practices

### Pattern 1: Always Validate Before Processing

```typescript
// ✅ GOOD
const validation = validateWithdrawal(amount, balance, dailyUsed, weeklyUsed, kycVerified, accountAge);

if (!validation.isValid) {
  // Show errors
  validation.errors.forEach(error => showError(error));
  return;
}

// Process withdrawal
processWithdrawal(amount);

// ❌ BAD
// Just process without validation
processWithdrawal(amount);
```

### Pattern 2: Use Constants, Never Hardcode

```typescript
// ✅ GOOD
import { FINANCIAL } from '../constants/escrowConstants';

if (amount > FINANCIAL.DAILY_WITHDRAWAL_LIMIT) {
  showError('Daily limit exceeded');
}

// ❌ BAD
if (amount > 500) { // What is 500? Why 500?
  showError('Daily limit exceeded');
}
```

### Pattern 3: Always Format Currency

```typescript
import { formatCurrency } from '../utils/escrowHelpers';

// ✅ GOOD
<p>Balance: {formatCurrency(93.50)}</p>
// Output: "Balance: $93.50"

// ❌ BAD
<p>Balance: ${balance.toFixed(2)}</p>
// Issues: Missing $ in edge cases, not localized
```

### Pattern 4: Track Important Events

```typescript
// ✅ GOOD
const handleKYC = async () => {
  analytics.kyc.startKYC();
  
  const result = await submitKYC();
  
  if (result.success) {
    analytics.kyc.completeKYC();
  } else {
    analytics.kyc.failKYC(result.reason);
  }
};

// ❌ BAD
const handleKYC = async () => {
  await submitKYC(); // No tracking
};
```

---

## 🧪 Testing Your Changes

### Quick Test Checklist

```typescript
// 1. Does it compile?
npm run build

// 2. Are types correct?
// TypeScript should show no errors in your editor

// 3. Does the math work?
const earnings = calculateSellerEarnings(100);
console.assert(earnings.netEarnings === 93, 'Commission calculation wrong!');

// 4. Does it handle edge cases?
const validation = validateWithdrawal(3, 100, 0, 0, true, 14);
console.assert(!validation.isValid, 'Should reject withdrawal < $5');

// 5. Is it accessible?
// Check with keyboard navigation (Tab, Enter)
// Check color contrast ratios

// 6. Is it responsive?
// Test on mobile (375px), tablet (768px), desktop (1024px+)
```

---

## 📝 Your First Contribution

### Example: Add a New Security Check

Let's add a check for maximum withdrawal amount per transaction.

**1. Update constants:**

```typescript
// constants/escrowConstants.ts
export const FINANCIAL = {
  // ... existing constants
  MAX_WITHDRAWAL_PER_TRANSACTION: 1000, // Add this
} as const;
```

**2. Update validation:**

```typescript
// utils/escrowHelpers.ts
export function validateWithdrawal(/* ... params */) {
  // ... existing validation
  
  // Add new check
  if (amount > FINANCIAL.MAX_WITHDRAWAL_PER_TRANSACTION) {
    errors.push(
      `Maximum ${formatCurrency(FINANCIAL.MAX_WITHDRAWAL_PER_TRANSACTION)} per withdrawal`
    );
  }
  
  // ... rest of function
}
```

**3. Add test case:**

```typescript
// Test the new validation
const validation = validateWithdrawal(
  1500, // Amount over limit
  2000, // Available balance
  0, 0, // Daily/weekly used
  true, // KYC verified
  30 // Account age
);

console.assert(
  !validation.isValid && 
  validation.errors.includes('Maximum $1,000.00 per withdrawal'),
  'Should reject withdrawals over $1,000'
);
```

**4. Update documentation:**

Add to `/docs/ESCROW_SYSTEM_QUICK_REFERENCE.md`:

```markdown
### Withdrawal Limits
- Daily: $500
- Weekly: $2,000
- Per Transaction: $1,000 (NEW)
- Minimum: $5
```

**5. Track analytics:**

```typescript
// utils/analyticsEvents.ts
export const withdrawalEvents = {
  // ... existing events
  
  maxAmountExceeded: (amount: number) => {
    trackEvent({
      category: EventCategory.WITHDRAWAL,
      action: EventAction.FAIL,
      label: 'Max Per Transaction Exceeded',
      value: amount
    });
  }
};
```

Done! You've made your first contribution. 🎉

---

## 🆘 Common Issues & Solutions

### Issue 1: "Cannot find module escrowConstants"

**Solution:**
```typescript
// ❌ Wrong
import { FINANCIAL } from '../escrowConstants';

// ✅ Correct
import { FINANCIAL } from '../constants/escrowConstants';
```

### Issue 2: "Type error: number is not assignable to string"

**Solution:**
```typescript
// ❌ Wrong
<p>Balance: {balance}</p> // balance is a number

// ✅ Correct
<p>Balance: {formatCurrency(balance)}</p> // formatCurrency returns string
```

### Issue 3: Withdrawal validation always fails

**Solution:**
Check all 6 parameters are correct:
```typescript
validateWithdrawal(
  amount,           // number: amount to withdraw
  availableBalance, // number: current available balance
  dailyUsed,        // number: amount withdrawn today
  weeklyUsed,       // number: amount withdrawn this week
  isKYCVerified,    // boolean: KYC status
  accountAgeDays    // number: account age in days
);
```

---

## 🎓 Next Steps

Now that you've completed the quick start:

1. ✅ Read full technical docs: `/docs/ESCROW_PAYOUT_FRAUD_PREVENTION_COMPLETE.md`
2. ✅ Review architecture diagrams: `/docs/ESCROW_SYSTEM_ARCHITECTURE_DIAGRAM.md`
3. ✅ Run through test cases: `/docs/QA_TESTING_GUIDE.md`
4. ✅ Pick your first issue from the backlog
5. ✅ Join daily standup to introduce yourself

---

## 💬 Questions?

- **Slack:** #escrow-system-dev
- **Email:** engineering@ezyify.com
- **Code Reviews:** Submit PR and tag @tech-lead

---

## 📖 Cheat Sheet

```typescript
// Constants
import { FINANCIAL, TIME_PERIODS, SECURITY } from '../constants/escrowConstants';

// Helpers
import { 
  calculateSellerEarnings,
  calculateWithdrawalAmount,
  validateWithdrawal,
  formatCurrency,
  getDaysRemainingInEscrow
} from '../utils/escrowHelpers';

// Analytics
import { analytics } from '../utils/analyticsEvents';

// Components
import { EscrowInfoTooltip } from '../components/EscrowInfoTooltip';
import { SecurityStatusBadge } from '../components/SecurityStatusBadge';
import { EscrowStatusWidget } from '../components/EscrowStatusWidget';

// Usage Examples
const earnings = calculateSellerEarnings(100); // Commission calc
const formatted = formatCurrency(93.50);       // "$93.50"
const daysLeft = getDaysRemainingInEscrow(deliveryDate); // 3
const validation = validateWithdrawal(...);    // Validate withdrawal

analytics.withdrawal.initiateWithdrawal(50);   // Track event
```

---

**Welcome to the team! Happy coding! 🚀**

---

*Last Updated: January 19, 2026*  
*Version: 1.0*  
*Maintained by: Engineering Team*
