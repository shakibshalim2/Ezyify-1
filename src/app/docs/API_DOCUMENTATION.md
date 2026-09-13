# EZYIFY Escrow System - API Documentation

**Version:** 1.0.0  
**Base URL:** `https://api.ezyify.com`  
**Authentication:** Bearer Token (JWT)  
**Last Updated:** January 19, 2026

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Seller Endpoints](#seller-endpoints)
3. [Order Endpoints](#order-endpoints)
4. [Payment Method Endpoints](#payment-method-endpoints)
5. [KYC Endpoints](#kyc-endpoints)
6. [Security Endpoints](#security-endpoints)
7. [Webhook Endpoints](#webhook-endpoints)
8. [Error Codes](#error-codes)
9. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

All API requests require a valid JWT token in the Authorization header.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Example

```bash
curl -H "Authorization: Bearer eyJhbGc..." \
     -H "Content-Type: application/json" \
     https://api.ezyify.com/api/seller/balance
```

---

## 💰 Seller Endpoints

### Get Seller Balance

Get the seller's current available and pending balances.

**Endpoint:** `GET /api/seller/balance`

**Response:**
```json
{
  "success": true,
  "data": {
    "availableBalance": 363.00,
    "pendingBalance": 124.50,
    "totalEarnings": 487.50,
    "currency": "USD"
  }
}
```

**Error Codes:**
- `401` - Unauthorized
- `403` - Not a seller account
- `500` - Server error

---

### Get Earnings Breakdown

Get detailed breakdown of seller earnings.

**Endpoint:** `GET /api/seller/earnings`

**Query Parameters:**
- `period` (optional): `today` | `week` | `month` | `all` (default: `all`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEarnings": 487.50,
      "availableBalance": 363.00,
      "pendingBalance": 124.50,
      "totalSales": 523.66,
      "totalCommission": 36.16,
      "totalWithdrawn": 0.00
    },
    "breakdown": [
      {
        "orderId": "ORD-12345",
        "grossAmount": 100.00,
        "platformFee": 5.00,
        "processingFee": 2.00,
        "netEarnings": 93.00,
        "status": "released",
        "date": "2026-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

### Initiate Withdrawal

Request a withdrawal from available balance.

**Endpoint:** `POST /api/seller/withdraw`

**Request Body:**
```json
{
  "amount": 93.00,
  "paymentMethodId": "pm_abc123",
  "note": "Weekly payout"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "withdrawalId": "WD-67890",
    "amount": 93.00,
    "fee": 0.50,
    "netAmount": 92.50,
    "status": "pending",
    "paymentMethod": {
      "id": "pm_abc123",
      "type": "bank-transfer",
      "last4": "1234"
    },
    "estimatedArrival": "2026-01-22T00:00:00Z",
    "createdAt": "2026-01-19T14:30:00Z"
  }
}
```

**Validation Errors:**
```json
{
  "success": false,
  "error": {
    "code": "WD_001",
    "message": "Insufficient balance",
    "details": {
      "requested": 100.00,
      "available": 93.00
    }
  }
}
```

**Error Codes:**
- `WD_001` - Insufficient balance
- `WD_002` - Daily limit exceeded
- `WD_003` - Weekly limit exceeded
- `WD_004` - Account too new
- `WD_005` - No payment method
- `WD_006` - Transaction flagged
- `WD_007` - Below minimum amount
- `KYC_001` - KYC not verified

---

### Get Withdrawal History

Get list of past withdrawals.

**Endpoint:** `GET /api/seller/withdrawal-history`

**Query Parameters:**
- `status` (optional): `pending` | `completed` | `failed` | `all` (default: `all`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "withdrawals": [
      {
        "id": "WD-67890",
        "amount": 93.00,
        "fee": 0.50,
        "netAmount": 92.50,
        "status": "completed",
        "paymentMethod": {
          "type": "bank-transfer",
          "last4": "1234"
        },
        "createdAt": "2026-01-19T14:30:00Z",
        "completedAt": "2026-01-22T09:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "pages": 1
    },
    "limits": {
      "daily": {
        "used": 93.00,
        "limit": 500.00,
        "remaining": 407.00,
        "resetAt": "2026-01-20T00:00:00Z"
      },
      "weekly": {
        "used": 93.00,
        "limit": 2000.00,
        "remaining": 1907.00,
        "resetAt": "2026-01-26T00:00:00Z"
      }
    }
  }
}
```

---

### Get Security Score

Get seller's security score and risk level.

**Endpoint:** `GET /api/seller/security-score`

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 94,
    "riskLevel": "low",
    "factors": {
      "kycVerified": {
        "status": true,
        "points": 25
      },
      "twoFactorEnabled": {
        "status": true,
        "points": 20
      },
      "accountAge": {
        "days": 60,
        "points": 15
      },
      "paymentMethods": {
        "count": 3,
        "points": 9
      },
      "transactionHistory": {
        "clean": true,
        "points": 25
      }
    },
    "recommendations": [
      "Maintain clean transaction history",
      "Keep 2FA enabled"
    ]
  }
}
```

---

### Get Security Events

Get recent security events for the account.

**Endpoint:** `GET /api/seller/security-events`

**Query Parameters:**
- `severity` (optional): `low` | `medium` | `high` | `all` (default: `all`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "SE-12345",
        "type": "login_success",
        "severity": "low",
        "description": "Successful login from new location",
        "details": {
          "ip": "192.168.1.1",
          "location": "New York, US",
          "device": "Chrome on MacOS"
        },
        "timestamp": "2026-01-19T14:30:00Z",
        "reviewed": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

---

## 📦 Order Endpoints

### Get Order Details

Get detailed information about a specific order.

**Endpoint:** `GET /api/orders/:orderId`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ORD-12345",
    "orderNumber": "#12345",
    "status": "delivered",
    "paymentStatus": "holding",
    "buyer": {
      "id": "USR-456",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "seller": {
      "id": "USR-789",
      "name": "Jane Smith",
      "shopName": "Jane's Store"
    },
    "items": [
      {
        "id": "ITEM-001",
        "name": "Product Name",
        "quantity": 1,
        "price": 100.00,
        "image": "https://..."
      }
    ],
    "pricing": {
      "subtotal": 100.00,
      "shipping": 0.00,
      "tax": 0.00,
      "total": 100.00
    },
    "shipping": {
      "address": "123 Main St, New York, NY 10001",
      "carrier": "USPS",
      "trackingNumber": "9400123456789",
      "estimatedDelivery": "2026-01-20T00:00:00Z"
    },
    "timeline": {
      "ordered": "2026-01-10T10:00:00Z",
      "shipped": "2026-01-12T14:30:00Z",
      "delivered": "2026-01-15T09:15:00Z",
      "confirmed": "2026-01-15T18:30:00Z"
    },
    "escrow": {
      "status": "holding",
      "amount": 100.00,
      "sellerEarnings": 93.00,
      "releaseDate": "2026-01-22T00:00:00Z",
      "daysRemaining": 3
    }
  }
}
```

---

### Confirm Delivery

Confirm that an order has been delivered (buyer action).

**Endpoint:** `POST /api/orders/:orderId/confirm-delivery`

**Request Body:**
```json
{
  "rating": 5,
  "review": "Great product, fast shipping!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-12345",
    "deliveryConfirmed": true,
    "confirmedAt": "2026-01-19T14:30:00Z",
    "escrowReleaseDate": "2026-01-26T00:00:00Z",
    "message": "Delivery confirmed. Funds will be released to seller in 7 days."
  }
}
```

**Error Codes:**
- `400` - Order not in delivered status
- `409` - Delivery already confirmed
- `403` - Not the buyer of this order

---

### Get Escrow Status

Get current escrow status for an order.

**Endpoint:** `GET /api/orders/:orderId/escrow-status`

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-12345",
    "status": "holding",
    "amount": 100.00,
    "sellerEarnings": 93.00,
    "timeline": {
      "capturedAt": "2026-01-10T10:00:00Z",
      "deliveredAt": "2026-01-15T09:15:00Z",
      "confirmedAt": "2026-01-15T18:30:00Z",
      "releaseDate": "2026-01-22T00:00:00Z"
    },
    "daysRemaining": 3,
    "canDispute": true,
    "disputeDeadline": "2026-02-14T00:00:00Z"
  }
}
```

---

### File Dispute

File a dispute for an order (buyer action).

**Endpoint:** `POST /api/orders/:orderId/dispute`

**Request Body:**
```json
{
  "reason": "item-not-received | item-not-as-described | damaged | other",
  "description": "The item I received is different from the description...",
  "evidence": [
    {
      "type": "image",
      "url": "https://..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "disputeId": "DSP-12345",
    "orderId": "ORD-12345",
    "status": "open",
    "reason": "item-not-as-described",
    "createdAt": "2026-01-19T14:30:00Z",
    "escrowStatus": "frozen",
    "estimatedResolution": "2026-01-29T00:00:00Z",
    "message": "Dispute filed successfully. Escrow funds are frozen pending resolution."
  }
}
```

---

### Request Refund

Request a refund for an order (buyer action).

**Endpoint:** `POST /api/orders/:orderId/refund`

**Request Body:**
```json
{
  "reason": "changed-mind | item-not-needed | other",
  "description": "I ordered the wrong size..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refundId": "REF-12345",
    "orderId": "ORD-12345",
    "amount": 100.00,
    "status": "pending",
    "createdAt": "2026-01-19T14:30:00Z",
    "estimatedCompletion": "2026-01-29T00:00:00Z",
    "message": "Refund request submitted. Seller has 48 hours to respond."
  }
}
```

---

## 💳 Payment Method Endpoints

### Get Payment Methods

Get all payment methods for the seller.

**Endpoint:** `GET /api/seller/payment-methods`

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentMethods": [
      {
        "id": "pm_abc123",
        "type": "bank-transfer",
        "status": "verified",
        "isPrimary": true,
        "details": {
          "bankName": "Chase Bank",
          "accountType": "checking",
          "last4": "1234"
        },
        "processingTime": "1-3 business days",
        "addedAt": "2026-01-10T10:00:00Z",
        "verifiedAt": "2026-01-11T14:30:00Z"
      },
      {
        "id": "pm_def456",
        "type": "paypal",
        "status": "verified",
        "isPrimary": false,
        "details": {
          "email": "seller@example.com"
        },
        "processingTime": "instant",
        "addedAt": "2026-01-12T10:00:00Z",
        "verifiedAt": "2026-01-13T09:15:00Z"
      }
    ],
    "limits": {
      "current": 2,
      "maximum": 5
    }
  }
}
```

---

### Add Payment Method

Add a new payment method.

**Endpoint:** `POST /api/seller/payment-methods/add`

**Request Body (Bank Transfer):**
```json
{
  "type": "bank-transfer",
  "details": {
    "accountHolderName": "Jane Smith",
    "routingNumber": "123456789",
    "accountNumber": "987654321",
    "accountType": "checking"
  }
}
```

**Request Body (PayPal):**
```json
{
  "type": "paypal",
  "details": {
    "email": "seller@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentMethodId": "pm_abc123",
    "status": "pending-verification",
    "verificationMethod": "micro-transaction",
    "estimatedVerification": "2026-01-20T14:30:00Z",
    "message": "Payment method added. Verification in progress."
  }
}
```

**Error Codes:**
- `PM_001` - Maximum payment methods reached (5)
- `PM_002` - Invalid account details
- `PM_004` - Payment method already exists

---

### Verify Payment Method

Verify a payment method (for bank accounts with micro-transactions).

**Endpoint:** `POST /api/seller/payment-methods/verify`

**Request Body:**
```json
{
  "paymentMethodId": "pm_abc123",
  "amount1": 0.12,
  "amount2": 0.34
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentMethodId": "pm_abc123",
    "status": "verified",
    "verifiedAt": "2026-01-20T14:30:00Z",
    "message": "Payment method verified successfully"
  }
}
```

---

### Delete Payment Method

Remove a payment method.

**Endpoint:** `DELETE /api/seller/payment-methods/:paymentMethodId`

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentMethodId": "pm_abc123",
    "deleted": true,
    "message": "Payment method removed successfully"
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "PM_005",
    "message": "Cannot delete primary payment method with pending withdrawals"
  }
}
```

---

## 🔐 KYC Endpoints

### Get KYC Status

Get current KYC verification status.

**Endpoint:** `GET /api/seller/kyc/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "verified | pending-review | rejected | not-started",
    "submittedAt": "2026-01-10T10:00:00Z",
    "verifiedAt": "2026-01-12T14:30:00Z",
    "documents": [
      {
        "type": "government-id",
        "status": "approved"
      },
      {
        "type": "proof-of-address",
        "status": "approved"
      }
    ],
    "expiresAt": "2027-01-12T00:00:00Z"
  }
}
```

---

### Start KYC Verification

Initiate KYC verification process.

**Endpoint:** `POST /api/seller/kyc/start`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "kyc_session_abc123",
    "verificationUrl": "https://verify.ezyify.com/kyc/abc123",
    "expiresAt": "2026-01-19T15:30:00Z",
    "requiredDocuments": [
      "government-id",
      "proof-of-address",
      "selfie"
    ]
  }
}
```

---

### Submit KYC Documents

Submit KYC documents for review.

**Endpoint:** `POST /api/seller/kyc/submit`

**Request Body:**
```json
{
  "sessionId": "kyc_session_abc123",
  "documents": [
    {
      "type": "government-id",
      "frontImage": "base64_encoded_image",
      "backImage": "base64_encoded_image"
    },
    {
      "type": "proof-of-address",
      "image": "base64_encoded_image"
    },
    {
      "type": "selfie",
      "image": "base64_encoded_image"
    }
  ],
  "personalInfo": {
    "firstName": "Jane",
    "lastName": "Smith",
    "dateOfBirth": "1990-05-15",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "pending-review",
    "submittedAt": "2026-01-19T14:30:00Z",
    "estimatedCompletion": "2026-01-21T14:30:00Z",
    "message": "KYC documents submitted successfully. Review typically takes 24-48 hours."
  }
}
```

---

## 🔔 Webhook Endpoints

### Webhook Events

EZYIFY sends webhook notifications for important events.

**Webhook URL Configuration:** Set in Dashboard → Settings → Webhooks

**Webhook Signature:** All webhooks include `X-EZYIFY-Signature` header for verification

### Event Types

#### `withdrawal.completed`
```json
{
  "event": "withdrawal.completed",
  "timestamp": "2026-01-22T09:15:00Z",
  "data": {
    "withdrawalId": "WD-67890",
    "sellerId": "USR-789",
    "amount": 93.00,
    "netAmount": 92.50,
    "paymentMethodId": "pm_abc123"
  }
}
```

#### `withdrawal.failed`
```json
{
  "event": "withdrawal.failed",
  "timestamp": "2026-01-22T09:15:00Z",
  "data": {
    "withdrawalId": "WD-67890",
    "sellerId": "USR-789",
    "amount": 93.00,
    "reason": "bank-account-closed",
    "errorCode": "PM_006"
  }
}
```

#### `escrow.released`
```json
{
  "event": "escrow.released",
  "timestamp": "2026-01-22T00:00:00Z",
  "data": {
    "orderId": "ORD-12345",
    "sellerId": "USR-789",
    "amount": 93.00,
    "releaseReason": "auto-release-7-days"
  }
}
```

#### `kyc.verified`
```json
{
  "event": "kyc.verified",
  "timestamp": "2026-01-12T14:30:00Z",
  "data": {
    "sellerId": "USR-789",
    "verifiedAt": "2026-01-12T14:30:00Z",
    "expiresAt": "2027-01-12T00:00:00Z"
  }
}
```

### Verifying Webhook Signatures

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Usage
const isValid = verifyWebhookSignature(
  req.body,
  req.headers['x-ezyify-signature'],
  process.env.WEBHOOK_SECRET
);
```

---

## ⚠️ Error Codes

### Authentication Errors (AUTH_xxx)
- `AUTH_001` - Invalid credentials
- `AUTH_002` - Session expired
- `AUTH_003` - Account locked

### KYC Errors (KYC_xxx)
- `KYC_001` - KYC not verified
- `KYC_002` - Documents missing
- `KYC_003` - Verification failed

### Withdrawal Errors (WD_xxx)
- `WD_001` - Insufficient balance
- `WD_002` - Daily limit exceeded
- `WD_003` - Weekly limit exceeded
- `WD_004` - Account too new
- `WD_005` - No payment method
- `WD_006` - Transaction flagged
- `WD_007` - Below minimum amount

### Payment Method Errors (PM_xxx)
- `PM_001` - Maximum payment methods reached
- `PM_002` - Verification pending
- `PM_003` - Invalid details
- `PM_004` - Payment method already exists
- `PM_005` - Cannot delete primary method
- `PM_006` - Payment method closed/invalid

### General Errors
- `ERR_500` - Internal server error
- `ERR_NETWORK` - Network error
- `ERR_VALIDATION` - Validation error

---

## 🚦 Rate Limiting

### Rate Limit Headers

All API responses include rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642607200
```

### Limits by Endpoint

| Endpoint Category | Requests per Hour | Burst Limit |
|------------------|------------------|-------------|
| GET requests | 1000 | 100 |
| POST requests | 100 | 20 |
| Withdrawal | 10 | 3 |
| Payment methods | 20 | 5 |

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 15 minutes.",
    "retryAfter": 900
  }
}
```

---

## 📞 Support

**API Issues:**
- Email: api-support@ezyify.com
- Documentation: https://docs.ezyify.com
- Status Page: https://status.ezyify.com

**Response Times:**
- Critical API issues: < 1 hour
- General API questions: < 24 hours

---

**API Version:** 1.0.0  
**Last Updated:** January 19, 2026  
**Next Review:** March 1, 2026
