# 🔌 EZYIFY BACKEND API SPECIFICATION
## Unified API & Data Contract Document — Single Source of Truth

---

## 📋 DOCUMENT OVERVIEW

| **Attribute** | **Details** |
|---------------|-------------|
| **Platform** | EZYIFY AI-First Social Commerce Super-App |
| **Document Type** | Backend API Specification & Data Contracts |
| **Purpose** | Complete API endpoint mapping for frontend-backend integration |
| **API Version** | v1.0 |
| **Status** | ✅ Production-Ready Specification |
| **Last Updated** | January 7, 2026 |
| **Base URL** | `https://api.ezyify.app/v1` (Production) |
| **Dev URL** | `https://dev-api.ezyify.app/v1` (Development) |

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### **Auth Token Rules**

| **Token Type** | **Format** | **Lifetime** | **Storage** |
|----------------|-----------|--------------|-------------|
| **Access Token** | JWT (Bearer) | 15 minutes | Memory only (no localStorage) |
| **Refresh Token** | JWT | 7 days | httpOnly cookie |
| **API Key** | UUID v4 | Permanent (until revoked) | Secure backend only |

**Header Format:**
```
Authorization: Bearer <access_token>
```

**Token Payload Structure:**
```json
{
  "userId": "uuid",
  "email": "string",
  "role": "user|creator|seller|admin",
  "permissions": ["array", "of", "permissions"],
  "iat": 1234567890,
  "exp": 1234568790
}
```

---

## 👤 USER ROLES & PERMISSIONS

### **Role Hierarchy**

| **Role** | **Level** | **Description** | **Access** |
|----------|-----------|----------------|-----------|
| **User** | 1 | Regular platform user | Browse, shop, post, interact |
| **Creator** | 2 | Content creator with monetization | User + analytics, earnings, affiliate |
| **Seller** | 3 | Product seller with store | User + product mgmt, orders, logistics |
| **Admin** | 4 | Platform administrator | Full access + moderation, analytics |
| **SuperAdmin** | 5 | Platform owner | Unrestricted access |

### **Permission Matrix**

| **Action** | **User** | **Creator** | **Seller** | **Admin** |
|------------|---------|-----------|-----------|----------|
| Browse content | ✅ | ✅ | ✅ | ✅ |
| Create posts | ✅ | ✅ | ✅ | ✅ |
| Create loops | ✅ | ✅ | ✅ | ✅ |
| Go live | ❌ | ✅ | ✅ | ✅ |
| Earn from affiliate | ❌ | ✅ | ✅ | ✅ |
| List products | ❌ | ❌ | ✅ | ✅ |
| Manage orders | ❌ | ❌ | ✅ | ✅ |
| Moderate content | ❌ | ❌ | ❌ | ✅ |
| View analytics | ❌ | ✅ (own) | ✅ (own) | ✅ (all) |
| Ban users | ❌ | ❌ | ❌ | ✅ |

---

## 📍 API ENDPOINTS — COMPLETE MAPPING

### **1. AUTHENTICATION ENDPOINTS**

#### **POST /auth/signup**
Create new user account

**Request:**
```json
{
  "name": "string (required, 2-50 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "acceptTerms": "boolean (required, must be true)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "userId": "uuid",
    "email": "string",
    "name": "string",
    "requiresOTP": true,
    "otpSentTo": "email"
  }
}
```

---

#### **POST /auth/verify-otp**
Verify email/phone with OTP

**Request:**
```json
{
  "userId": "string (uuid)",
  "otp": "string (6 digits)",
  "type": "email|phone"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account verified successfully",
  "data": {
    "accessToken": "jwt_string",
    "refreshToken": "jwt_string",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "username": "string",
      "avatar": "url",
      "role": "user",
      "verified": true
    }
  }
}
```

---

#### **POST /auth/login**
User login with email/password

**Request:**
```json
{
  "email": "string (required)",
  "password": "string (required)",
  "rememberMe": "boolean (optional, default: false)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_string",
    "refreshToken": "jwt_string",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "username": "string",
      "avatar": "url",
      "role": "user|creator|seller|admin",
      "verified": true
    }
  }
}
```

---

#### **POST /auth/refresh**
Refresh access token

**Request:**
```json
{
  "refreshToken": "string (jwt)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_string",
    "refreshToken": "jwt_string"
  }
}
```

---

#### **POST /auth/forgot-password**
Request password reset

**Request:**
```json
{
  "email": "string (required, valid email)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent",
  "data": {
    "resetTokenSentTo": "email",
    "expiresIn": 3600
  }
}
```

---

#### **POST /auth/reset-password**
Reset password with token

**Request:**
```json
{
  "token": "string (reset token from email)",
  "newPassword": "string (min 8 chars)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

#### **POST /auth/logout**
Logout user and invalidate tokens

**Request:** Headers only (Authorization: Bearer token)

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### **2. USER PROFILE ENDPOINTS**

#### **GET /users/:username**
Get user profile by username

**Request:** No body (Auth optional for public profiles)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "name": "string",
    "avatar": "url",
    "bio": "string",
    "verified": "boolean",
    "role": "user|creator|seller",
    "stats": {
      "followers": 1234,
      "following": 567,
      "posts": 89,
      "products": 12
    },
    "isFollowing": "boolean (if authenticated)",
    "isPrivate": "boolean",
    "joinedDate": "ISO 8601 timestamp"
  }
}
```

---

#### **GET /users/me**
Get current authenticated user profile

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "avatar": "url",
    "coverImage": "url",
    "bio": "string",
    "website": "url",
    "location": "string",
    "verified": "boolean",
    "role": "user|creator|seller|admin",
    "stats": {
      "followers": 1234,
      "following": 567,
      "posts": 89,
      "products": 12,
      "totalOrders": 45,
      "totalSpent": 12345.67
    },
    "settings": {
      "privateAccount": "boolean",
      "allowMessages": "string (everyone|followers|none)",
      "showActivity": "boolean"
    },
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

#### **PUT /users/me**
Update current user profile

**Request:**
```json
{
  "name": "string (optional, 2-50 chars)",
  "username": "string (optional, 3-30 chars, alphanumeric + underscore)",
  "bio": "string (optional, max 160 chars)",
  "website": "string (optional, valid URL)",
  "location": "string (optional)",
  "avatar": "file (optional, max 5MB, jpg/png/webp)",
  "coverImage": "file (optional, max 10MB, jpg/png/webp)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "username": "string",
    "name": "string",
    "avatar": "url",
    "bio": "string"
  }
}
```

---

#### **POST /users/:userId/follow**
Follow a user

**Request:** Auth required, no body

**Response (200):**
```json
{
  "success": true,
  "message": "Now following @username",
  "data": {
    "isFollowing": true,
    "followerCount": 1235
  }
}
```

---

#### **DELETE /users/:userId/follow**
Unfollow a user

**Request:** Auth required, no body

**Response (200):**
```json
{
  "success": true,
  "message": "Unfollowed @username",
  "data": {
    "isFollowing": false,
    "followerCount": 1234
  }
}
```

---

### **3. CONTENT POSTING ENDPOINTS**

#### **POST /posts**
Create a new post (photo/video/carousel)

**Request (multipart/form-data):**
```json
{
  "type": "photo|video|carousel",
  "caption": "string (optional, max 2200 chars)",
  "media": "file[] (1-10 files, max 50MB each)",
  "productTags": "array of product IDs (optional)",
  "location": "string (optional)",
  "allowComments": "boolean (default: true)",
  "visibility": "public|followers|private"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": "uuid",
    "type": "photo",
    "author": {
      "id": "uuid",
      "username": "string",
      "avatar": "url"
    },
    "caption": "string",
    "media": [
      {
        "url": "string",
        "type": "image|video",
        "width": 1080,
        "height": 1350,
        "thumbnailUrl": "string"
      }
    ],
    "productTags": [],
    "stats": {
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "saves": 0
    },
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

#### **GET /posts/:postId**
Get single post details

**Request:** Auth optional

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "photo|video|carousel",
    "author": {
      "id": "uuid",
      "username": "string",
      "name": "string",
      "avatar": "url",
      "verified": "boolean"
    },
    "caption": "string",
    "media": [],
    "productTags": [],
    "location": "string",
    "stats": {
      "likes": 1234,
      "comments": 567,
      "shares": 89,
      "saves": 234
    },
    "userInteraction": {
      "liked": "boolean",
      "saved": "boolean"
    },
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

#### **GET /feed**
Get personalized feed

**Request:** Auth required

**Query Parameters:**
```
?page=1
&limit=20 (max 50)
&type=all|following|explore
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalItems": 1000,
      "hasNext": true
    }
  }
}
```

---

#### **POST /posts/:postId/like**
Like a post

**Request:** Auth required, no body

**Response (200):**
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likeCount": 1235
  }
}
```

---

#### **DELETE /posts/:postId/like**
Unlike a post

**Request:** Auth required, no body

**Response (200):**
```json
{
  "success": true,
  "data": {
    "liked": false,
    "likeCount": 1234
  }
}
```

---

#### **POST /posts/:postId/save**
Save/bookmark a post

**Request:** Auth required, no body

**Response (200):**
```json
{
  "success": true,
  "data": {
    "saved": true,
    "saveCount": 235
  }
}
```

---

#### **DELETE /posts/:postId**
Delete own post

**Request:** Auth required, must be post author

**Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

### **4. LOOPS (SHORT VIDEO) ENDPOINTS**

#### **POST /loops**
Upload a short video (loop)

**Request (multipart/form-data):**
```json
{
  "video": "file (required, max 100MB, mp4/mov)",
  "caption": "string (optional, max 2200 chars)",
  "thumbnail": "file (optional, jpg/png)",
  "productTags": "array of product IDs (optional)",
  "music": "music track ID (optional)",
  "allowDuet": "boolean (default: true)",
  "allowComments": "boolean (default: true)",
  "visibility": "public|followers|private"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Loop uploaded successfully",
  "data": {
    "id": "uuid",
    "author": {},
    "videoUrl": "string",
    "thumbnailUrl": "string",
    "caption": "string",
    "duration": 30,
    "productTags": [],
    "stats": {
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0
    },
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

#### **GET /loops/feed**
Get loops feed (TikTok-style infinite scroll)

**Request:** Auth optional

**Query Parameters:**
```
?cursor=uuid (for infinite scroll)
&limit=10 (max 20)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "loops": [],
    "nextCursor": "uuid|null",
    "hasMore": "boolean"
  }
}
```

---

### **5. STORIES ENDPOINTS**

#### **POST /stories**
Create a story

**Request (multipart/form-data):**
```json
{
  "media": "file (required, image or video, max 50MB)",
  "type": "photo|video",
  "duration": "number (for video, max 15 seconds)",
  "productTag": "product ID (optional)",
  "link": "url (optional, swipe-up link)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Story created successfully",
  "data": {
    "id": "uuid",
    "mediaUrl": "string",
    "type": "photo|video",
    "expiresAt": "ISO 8601 timestamp (24 hours from now)",
    "viewers": 0
  }
}
```

---

#### **GET /stories/feed**
Get stories from followed users

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stories": [
      {
        "userId": "uuid",
        "username": "string",
        "avatar": "url",
        "hasUnseenStories": "boolean",
        "stories": [
          {
            "id": "uuid",
            "mediaUrl": "string",
            "type": "photo|video",
            "createdAt": "ISO 8601",
            "expiresAt": "ISO 8601",
            "viewed": "boolean"
          }
        ]
      }
    ]
  }
}
```

---

### **6. COMMENTS ENDPOINTS**

#### **POST /posts/:postId/comments**
Add comment to post

**Request:**
```json
{
  "text": "string (required, 1-2200 chars)",
  "parentCommentId": "uuid (optional, for replies)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Comment added",
  "data": {
    "id": "uuid",
    "author": {
      "id": "uuid",
      "username": "string",
      "avatar": "url"
    },
    "text": "string",
    "likes": 0,
    "replies": 0,
    "createdAt": "ISO 8601"
  }
}
```

---

#### **GET /posts/:postId/comments**
Get post comments

**Request:** Auth optional

**Query Parameters:**
```
?page=1
&limit=20
&sort=top|recent
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comments": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100
    }
  }
}
```

---

### **7. LIVE STREAMING ENDPOINTS**

#### **POST /live/start**
Start a live stream

**Request:**
```json
{
  "title": "string (required, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "category": "string (optional)",
  "productShowcase": "array of product IDs (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Live stream started",
  "data": {
    "streamId": "uuid",
    "streamKey": "string (RTMP key)",
    "rtmpUrl": "rtmp://live.ezyify.app/live",
    "playbackUrl": "hls://live.ezyify.app/stream/{streamId}.m3u8",
    "startedAt": "ISO 8601"
  }
}
```

---

#### **POST /live/:streamId/end**
End live stream

**Request:** Auth required, must be stream owner

**Response (200):**
```json
{
  "success": true,
  "message": "Live stream ended",
  "data": {
    "streamId": "uuid",
    "duration": 3600,
    "peakViewers": 1234,
    "totalViews": 5678,
    "totalGifts": 89,
    "earnings": 1234.56,
    "endedAt": "ISO 8601"
  }
}
```

---

#### **GET /live/active**
Get currently active live streams

**Request:** Auth optional

**Query Parameters:**
```
?category=all|fashion|electronics|etc
&page=1
&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "streams": [
      {
        "id": "uuid",
        "host": {
          "id": "uuid",
          "username": "string",
          "avatar": "url",
          "verified": "boolean"
        },
        "title": "string",
        "thumbnailUrl": "string",
        "viewerCount": 1234,
        "startedAt": "ISO 8601"
      }
    ],
    "pagination": {}
  }
}
```

---

#### **POST /live/:streamId/gifts/send**
Send gift during live stream

**Request:**
```json
{
  "giftId": "string (gift item ID)",
  "quantity": "number (min 1, max 100)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Gift sent successfully",
  "data": {
    "giftId": "string",
    "giftName": "string",
    "quantity": 1,
    "totalCost": 99.99,
    "walletBalance": 900.01
  }
}
```

---

### **8. PRODUCT ENDPOINTS**

#### **POST /products**
Create/list a product (Seller only)

**Request (multipart/form-data):**
```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (required, max 5000 chars)",
  "category": "string (required)",
  "price": "number (required, min 0.01)",
  "compareAtPrice": "number (optional)",
  "images": "file[] (1-10 images, max 5MB each)",
  "variants": "JSON array of variants",
  "inventory": "number (required, min 0)",
  "sku": "string (optional)",
  "brand": "string (optional)",
  "tags": "array of strings (optional)",
  "shipping": {
    "weight": "number (in kg)",
    "dimensions": {
      "length": "number",
      "width": "number",
      "height": "number"
    }
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "price": 999.99,
    "images": ["url1", "url2"],
    "status": "draft|active",
    "createdAt": "ISO 8601"
  }
}
```

---

#### **GET /products/:productId**
Get product details

**Request:** Auth optional

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "price": 999.99,
    "compareAtPrice": 1299.99,
    "discount": 23,
    "images": [],
    "variants": [],
    "category": "string",
    "brand": "string",
    "seller": {
      "id": "uuid",
      "name": "string",
      "avatar": "url",
      "rating": 4.8,
      "verified": true
    },
    "rating": 4.7,
    "reviewCount": 1234,
    "soldCount": 5678,
    "inventory": 100,
    "inStock": true,
    "shipping": {
      "free": true,
      "estimatedDays": "3-5"
    },
    "createdAt": "ISO 8601"
  }
}
```

---

#### **GET /products**
Browse products (Shop page)

**Request:** Auth optional

**Query Parameters:**
```
?category=all|fashion|electronics|etc
&minPrice=0
&maxPrice=10000
&sort=featured|price_low|price_high|newest|popular
&page=1
&limit=24
&search=query
&inStock=true|false
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [],
    "filters": {
      "categories": [],
      "priceRange": {
        "min": 0,
        "max": 50000
      }
    },
    "pagination": {}
  }
}
```

---

#### **PUT /products/:productId**
Update product (Seller only, own product)

**Request:** Same as POST /products

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "status": "active"
  }
}
```

---

#### **DELETE /products/:productId**
Delete product (Seller only, own product)

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### **9. SHOPPING CART ENDPOINTS**

#### **GET /cart**
Get user's cart

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "title": "string",
          "price": 999.99,
          "image": "url"
        },
        "quantity": 2,
        "variant": {
          "id": "uuid",
          "size": "L",
          "color": "Black"
        },
        "subtotal": 1999.98
      }
    ],
    "summary": {
      "subtotal": 5999.94,
      "shipping": 0,
      "tax": 599.99,
      "discount": -500,
      "total": 6099.93
    },
    "itemCount": 3
  }
}
```

---

#### **POST /cart/items**
Add item to cart

**Request:**
```json
{
  "productId": "uuid (required)",
  "quantity": "number (required, min 1)",
  "variantId": "uuid (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cartItemId": "uuid",
    "itemCount": 4,
    "total": 7099.92
  }
}
```

---

#### **PUT /cart/items/:itemId**
Update cart item quantity

**Request:**
```json
{
  "quantity": "number (min 0, 0 to remove)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart updated",
  "data": {
    "itemCount": 3,
    "total": 6099.93
  }
}
```

---

#### **DELETE /cart/items/:itemId**
Remove item from cart

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

#### **DELETE /cart**
Clear entire cart

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

### **10. CHECKOUT & ORDERS ENDPOINTS**

#### **POST /checkout**
Create order from cart

**Request:**
```json
{
  "shippingAddress": {
    "name": "string",
    "phone": "string",
    "addressLine1": "string",
    "addressLine2": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string",
    "country": "string"
  },
  "paymentMethod": "card|wallet|cod|bkash|nagad",
  "paymentDetails": {
    "cardToken": "string (for card payments)",
    "saveCard": "boolean"
  },
  "couponCode": "string (optional)",
  "giftMessage": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "uuid",
    "orderNumber": "EZY1234567890",
    "status": "pending_payment",
    "total": 6099.93,
    "paymentUrl": "https://payment.ezyify.app/pay/xyz (if redirect needed)",
    "estimatedDelivery": "ISO 8601 date"
  }
}
```

---

#### **GET /orders/:orderId**
Get order details

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "EZY1234567890",
    "status": "confirmed|processing|shipped|delivered|cancelled|refunded",
    "items": [],
    "shippingAddress": {},
    "billing": {
      "subtotal": 5999.94,
      "shipping": 0,
      "tax": 599.99,
      "discount": -500,
      "total": 6099.93
    },
    "tracking": {
      "carrier": "DHL",
      "trackingNumber": "1234567890",
      "url": "https://track.dhl.com/..."
    },
    "timeline": [
      {
        "status": "confirmed",
        "timestamp": "ISO 8601",
        "description": "Order confirmed"
      }
    ],
    "createdAt": "ISO 8601",
    "estimatedDelivery": "ISO 8601"
  }
}
```

---

#### **GET /orders**
Get user's order history

**Request:** Auth required

**Query Parameters:**
```
?status=all|pending|processing|delivered|cancelled
&page=1
&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [],
    "pagination": {}
  }
}
```

---

#### **POST /orders/:orderId/cancel**
Cancel order

**Request:**
```json
{
  "reason": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "orderId": "uuid",
    "status": "cancelled",
    "refundAmount": 6099.93,
    "refundETA": "3-5 business days"
  }
}
```

---

### **11. MESSAGING ENDPOINTS**

#### **GET /messages/conversations**
Get user's conversations list

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "participant": {
          "id": "uuid",
          "username": "string",
          "avatar": "url",
          "online": "boolean"
        },
        "lastMessage": {
          "id": "uuid",
          "text": "string",
          "sentBy": "uuid",
          "timestamp": "ISO 8601",
          "read": "boolean"
        },
        "unreadCount": 3
      }
    ]
  }
}
```

---

#### **GET /messages/conversations/:conversationId**
Get conversation messages

**Request:** Auth required

**Query Parameters:**
```
?before=messageId (for pagination)
&limit=50
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "messages": [
      {
        "id": "uuid",
        "senderId": "uuid",
        "text": "string",
        "type": "text|image|video|product|voice",
        "mediaUrl": "string (if applicable)",
        "productId": "uuid (if applicable)",
        "timestamp": "ISO 8601",
        "read": "boolean",
        "delivered": "boolean"
      }
    ],
    "hasMore": "boolean"
  }
}
```

---

#### **POST /messages/conversations/:conversationId/messages**
Send message

**Request:**
```json
{
  "text": "string (required if no media)",
  "media": "file (optional, image/video)",
  "type": "text|image|video|product|voice",
  "productId": "uuid (optional, for product sharing)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "id": "uuid",
    "conversationId": "uuid",
    "timestamp": "ISO 8601"
  }
}
```

---

### **12. NOTIFICATIONS ENDPOINTS**

#### **GET /notifications**
Get user notifications

**Request:** Auth required

**Query Parameters:**
```
?type=all|likes|comments|follows|orders|system
&unreadOnly=true|false
&page=1
&limit=50
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "like|comment|follow|order|system",
        "actor": {
          "id": "uuid",
          "username": "string",
          "avatar": "url"
        },
        "content": "string (notification text)",
        "actionUrl": "string (deep link)",
        "read": "boolean",
        "createdAt": "ISO 8601"
      }
    ],
    "unreadCount": 12,
    "pagination": {}
  }
}
```

---

#### **PUT /notifications/:notificationId/read**
Mark notification as read

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 11
  }
}
```

---

#### **PUT /notifications/read-all**
Mark all notifications as read

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### **13. WALLET & EARNINGS ENDPOINTS**

#### **GET /wallet**
Get user wallet balance

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": 12345.67,
    "currency": "BDT",
    "earnings": {
      "total": 50000,
      "thisMonth": 5000,
      "pending": 1000
    },
    "transactions": []
  }
}
```

---

#### **POST /wallet/add-money**
Add money to wallet

**Request:**
```json
{
  "amount": "number (min 100)",
  "paymentMethod": "card|bkash|nagad|bank",
  "paymentDetails": {}
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment initiated",
  "data": {
    "transactionId": "uuid",
    "paymentUrl": "string (if redirect needed)",
    "amount": 1000
  }
}
```

---

#### **POST /wallet/withdraw**
Withdraw earnings (Creator/Seller only)

**Request:**
```json
{
  "amount": "number (min 1000)",
  "method": "bank|bkash|nagad",
  "accountDetails": {
    "accountNumber": "string",
    "accountName": "string"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Withdrawal request submitted",
  "data": {
    "transactionId": "uuid",
    "amount": 10000,
    "processingTime": "3-5 business days"
  }
}
```

---

### **14. ANALYTICS ENDPOINTS (Creator/Seller)**

#### **GET /analytics/overview**
Get analytics dashboard overview

**Request:** Auth required (Creator/Seller/Admin)

**Query Parameters:**
```
?period=7d|30d|90d|1y|all
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "views": {
      "total": 123456,
      "change": "+23.5%"
    },
    "engagement": {
      "likes": 12345,
      "comments": 2345,
      "shares": 567,
      "engagementRate": 4.5
    },
    "followers": {
      "total": 50000,
      "gained": 1234,
      "change": "+2.5%"
    },
    "earnings": {
      "total": 12345.67,
      "pending": 1000,
      "withdrawn": 10000
    },
    "topPosts": [],
    "topProducts": []
  }
}
```

---

### **15. SEARCH ENDPOINTS**

#### **GET /search**
Universal search

**Request:** Auth optional

**Query Parameters:**
```
?q=search query
&type=all|posts|products|users|hashtags
&page=1
&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "results": {
      "posts": [],
      "products": [],
      "users": [],
      "hashtags": []
    },
    "pagination": {}
  }
}
```

---

### **16. WISHLIST ENDPOINTS**

#### **GET /wishlist**
Get user's wishlist

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "title": "string",
          "price": 999.99,
          "image": "url",
          "inStock": true
        },
        "addedAt": "ISO 8601"
      }
    ]
  }
}
```

---

#### **POST /wishlist**
Add product to wishlist

**Request:**
```json
{
  "productId": "uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Added to wishlist"
}
```

---

#### **DELETE /wishlist/:productId**
Remove from wishlist

**Request:** Auth required

**Response (200):**
```json
{
  "success": true,
  "message": "Removed from wishlist"
}
```

---

## 🔄 WEBHOOK EVENTS

### **Supported Webhooks**

| **Event** | **Trigger** | **Payload** |
|-----------|------------|-------------|
| `order.created` | New order placed | Order object |
| `order.confirmed` | Order confirmed by seller | Order object |
| `order.shipped` | Order shipped | Order + tracking |
| `order.delivered` | Order delivered | Order object |
| `payment.success` | Payment completed | Payment object |
| `payment.failed` | Payment failed | Payment + error |
| `user.signup` | New user registered | User object |
| `product.out_of_stock` | Product inventory = 0 | Product object |

---

## 📊 RATE LIMITING

| **Endpoint Type** | **Rate Limit** | **Window** |
|-------------------|---------------|-----------|
| **Auth endpoints** | 10 requests | 15 minutes |
| **Write operations** (POST/PUT/DELETE) | 100 requests | 1 hour |
| **Read operations** (GET) | 1000 requests | 1 hour |
| **Search** | 100 requests | 5 minutes |
| **File uploads** | 20 uploads | 1 hour |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## ❌ ERROR RESPONSES

### **Standard Error Format**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Specific field error (for validation)"
    }
  }
}
```

### **Common Error Codes**

| **Code** | **HTTP Status** | **Description** |
|----------|----------------|-----------------|
| `UNAUTHORIZED` | 401 | Invalid or missing auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 🧪 TESTING

### **Test Credentials**

```
Email: test@ezyify.app
Password: TestUser123!

Creator Email: creator@ezyify.app
Seller Email: seller@ezyify.app
Admin Email: admin@ezyify.app
```

### **API Testing Tools**
- Postman Collection: Available at `/api/postman-collection.json`
- Swagger UI: `https://api.ezyify.app/docs`

---

## 🔒 COMPLIANCE & SECURITY

- ✅ All API requests over HTTPS only
- ✅ CORS configured for web domains
- ✅ JWT tokens with short expiration
- ✅ Rate limiting on all endpoints
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection for state-changing operations

---

## 📝 VERSIONING

**API Version:** v1.0  
**Deprecation Policy:** 6 months notice before endpoint removal  
**Version Header:** `Accept: application/vnd.ezyify.v1+json`

---

## 📞 API SUPPORT

**Documentation:** https://docs.ezyify.app/api  
**Status Page:** https://status.ezyify.app  
**Support Email:** api-support@ezyify.app

---

**🎯 END OF BACKEND API SPECIFICATION**

*This document is the single source of truth for all EZYIFY backend API contracts.*
