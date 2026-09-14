EZYIFY — PRODUCT REPOST + SHARE + AUTOMATIC REFERRAL & COMMISSION SYSTEM

OBJECTIVE

Implement Product Repost and Product Share as fully integrated Social Commerce and Referral features within the existing Ezyify architecture.

The system must connect:

Product
→ Repost / Share
→ Automatic Referral Attribution
→ Product Discovery
→ Product View
→ Add to Cart
→ Purchase
→ Verified Order
→ Commission Calculation
→ Pending Commission
→ Confirmed Commission
→ User / Creator Earnings

The implementation must cover both the Product UI/UX and the underlying referral/commission architecture.

==================================================
1. PRODUCT PAGE UI/UX
==================================================

Add a dedicated “Repost” action to eligible Product Pages.

Current product actions:

Buy Now
Add to Cart
Wishlist
Share

Update the social/product action area to include:

Wishlist
Repost
Share

The Repost button must be a first-class product action and must be visually distinguishable from Share.

Do not redesign the Product Page.

Preserve the existing:
• Layout
• UI/UX
• Design system
• Typography
• Colors
• Spacing
• Icons
• Responsive behavior
• Navigation
• Product information structure
• Existing Buy Now functionality
• Existing Add to Cart functionality
• Existing Wishlist functionality
• Existing Share functionality

Only make the minimum UI changes required to introduce and properly integrate Repost.

==================================================
2. REPOST BEHAVIOR
==================================================

When a user selects Repost:

• Repost the existing product to the user's Ezyify Feed/Profile.
• Do not create a duplicate product listing.
• Preserve the original Product ID.
• Preserve the original Seller/Store.
• Preserve the original product information.
• Preserve the original product page URL.
• Preserve current product price, availability and stock through the centralized product source.
• Clearly identify the original seller/store.
• Clearly indicate that the content is a repost.

Example:

“[User] reposted this product”

The repost must remain permanently connected to the original product.

==================================================
3. REPOST INTERACTION STATES
==================================================

Complete the Repost UI/UX states:

• Default
• Pressed / Active
• Loading
• Successfully Reposted
• Already Reposted
• Repost Confirmation
• Repost Unavailable
• Error

After successful reposting, clearly communicate the updated state without disrupting the existing Product Page experience.

==================================================
4. PRODUCT SHARE
==================================================

Keep the existing Share functionality.

Enhance Share so that eligible product shares can automatically preserve referral attribution.

Supported Ezyify sharing surfaces may include:

• Direct Messages
• Friends
• Communities
• Groups
• Stories
• Other supported Ezyify sharing surfaces

Where external sharing is supported, generate a secure referral-enabled product URL where technically appropriate.

Users must not need to manually create referral links.

==================================================
5. AUTOMATIC REFERRAL SYSTEM
==================================================

Repost and Share must become referral-capable distribution actions.

When an eligible user or creator reposts or shares a product, automatically create or attach the appropriate referral attribution.

Example:

User A Reposts Product X
↓
User B sees Product X
↓
User B opens Product X
↓
User B purchases Product X
↓
System verifies referral attribution
↓
User A receives eligible commission

Share example:

User A shares Product X
↓
User B opens Product X
↓
User B purchases Product X
↓
System attributes the qualifying purchase to User A
↓
User A receives eligible commission

Do not require:

• Manual referral-link creation
• Separate affiliate registration
• Separate affiliate website
• Manual commission calculation

The existing Ezyify account should act as the user's identity within the referral system.

==================================================
6. REFERRAL DATA
==================================================

Referral attribution should securely support:

• Referral ID
• Referrer User ID
• Original Product ID
• Seller ID
• Repost ID where applicable
• Share ID where applicable
• Referral Source
• Campaign ID where applicable
• Click timestamp
• Attribution status
• Order ID
• Commission ID

All important referral attribution must be validated server-side.

Never trust referral ownership, commission amount, order value or financial data supplied by the client.

==================================================
7. COMMISSION ENGINE
==================================================

Implement a centralized commission calculation engine.

Commission must be calculated from one authoritative source.

Support:

• Percentage commission
• Fixed commission
• Product-specific commission
• Category-specific commission
• Seller-specific commission
• Campaign-specific commission
• Global default commission

Example:

Product Price: $100
Commission Rate: 5%
Eligible Commission: $5

Do not hardcode commission calculations inside individual frontend components or pages.

All commission calculations must use the centralized commission engine.

==================================================
8. PRODUCT REFERRAL ELIGIBILITY
==================================================

Each eligible product should support referral configuration such as:

• Referral Enabled / Disabled
• Commission Type
• Commission Rate
• Fixed Commission
• Eligible Channels
• Campaign
• Attribution Rules
• Commission Confirmation Period
• Maximum Commission where applicable

If referral is disabled:

Repost and Share must still work as normal Social Commerce actions.

However, no referral commission should be generated.

==================================================
9. COMMISSION LIFECYCLE
==================================================

Do not immediately treat every generated commission as withdrawable.

Use clear financial states:

Pending
Confirmed
Cancelled
Refunded
Reversed
Paid

Example:

Purchase
→ Pending Commission
→ Order Delivered
→ Confirmation / Refund Window Passed
→ Confirmed Commission
→ Available Balance
→ Paid

If an order is cancelled, refunded or reversed, automatically adjust the related commission according to the centralized platform rules.

==================================================
10. FIRST-DAY EARNING
==================================================

The referral system must be available from the initial Ezyify launch.

Eligible users and creators should be able to generate referral-attributed sales from Day 1.

Both:

• Regular Users
• Creators

must be supported.

Creator status should not be mandatory unless a specific product, campaign or platform rule requires it.

==================================================
11. ATTRIBUTION MODEL
==================================================

Implement a centralized and configurable attribution model.

If multiple referral sources exist before a purchase, use one defined attribution rule.

Examples:

• Last Eligible Referral
• First Eligible Referral

The attribution model must be configurable from the Admin Panel.

Do not hardcode attribution logic into the frontend.

Only one valid referral attribution should receive commission for a qualifying transaction unless the platform explicitly supports a multi-party commission model in the future.

==================================================
12. ANTI-ABUSE & FRAUD PROTECTION
==================================================

Implement protection against:

• Self-referrals
• Duplicate attribution
• Repeated artificial clicks
• Fraudulent orders
• Cancelled-order manipulation
• Refund manipulation
• Automated abuse
• Commission farming
• Suspicious referral activity

Commission and referral ownership must always be validated server-side.

Users must never be able to manually modify:

• Referral ownership
• Commission amount
• Order value
• Commission status
• Earnings balance

==================================================
13. ORIGINAL SELLER ATTRIBUTION
==================================================

Every reposted or shared product must preserve:

• Original Seller
• Original Store
• Original Product
• Current Price
• Current Discount
• Current Stock
• Current Availability
• Original Product ID

The reposter must never appear as the product owner unless they are actually the seller.

==================================================
14. REAL-TIME PRODUCT DATA
==================================================

Reposted and shared products must remain connected to the centralized product data source.

If the original seller changes:

• Price
• Discount
• Stock
• Availability
• Product Status

the reposted/shared product experience must reflect the current authoritative product data according to the existing Ezyify architecture.

Never create independent product copies for reposts.

==================================================
15. PRODUCT REPOST ACROSS THE PLATFORM
==================================================

Where the same Product Action system exists, integrate Repost consistently across relevant surfaces, including:

• Product Detail Page
• Product Cards
• Feed/Product Posts
• Search Results
• Marketplace
• Creator Pages
• User Profiles
• Shop/Store Pages
• Reposted Product Content
• Product Sharing/Referral Flows

Do not blindly add duplicate UI elements.

Use the existing Ezyify component and design system wherever possible.

==================================================
16. FEED EXPERIENCE
==================================================

When a product is reposted, display clear attribution such as:

“[User] reposted this product”

The Feed must preserve:

• Original product
• Original seller/store
• Product price
• Product availability
• Product link
• Reposter identity

The repost should behave as Social Commerce content while remaining connected to the original product.

==================================================
17. USER / CREATOR EARNINGS
==================================================

Integrate referral earnings into the existing Ezyify account/dashboard architecture.

Support visibility for:

• Referral Earnings
• Pending Commission
• Confirmed Commission
• Available Balance
• Paid Earnings
• Referral Activity
• Referred Sales
• Commission History

Do not create a disconnected affiliate platform.

Use the existing Ezyify account and dashboard architecture wherever appropriate.

==================================================
18. ADMIN PANEL
==================================================

Integrate referral and commission management into the existing Admin Panel.

Admin should be able to configure:

• Global Commission Rules
• Product Commission
• Category Commission
• Seller Commission
• Campaign Commission
• Referral Eligibility
• Attribution Model
• Commission Confirmation Period
• Minimum Withdrawal Amount
• Commission Status
• Fraud Flags

Admin should be able to review:

• User
• Creator
• Product
• Seller
• Referral
• Referral Click
• Order
• Commission
• Status
• Amount
• Source
• Timestamp

==================================================
19. ANALYTICS
==================================================

Track:

• Product Views
• Referral Clicks
• Add to Cart
• Orders
• Conversion Rate
• Gross Sales
• Eligible Sales
• Pending Commission
• Confirmed Commission
• Cancelled Commission
• Referral Earnings

Support analytics for:

• Users
• Creators
• Sellers
• Admins

Use the centralized data architecture.

==================================================
20. CORE ARCHITECTURE
==================================================

Integrate the referral system into the existing Ezyify architecture.

The architecture should logically support:

Product
Seller
User
Creator
Repost
Share
Referral
Referral Click
Order
Commission
Earnings
Payout
Campaign

Use a single source of truth for:

• Product data
• Referral attribution
• Commission calculation
• Financial records

Do not duplicate financial logic across frontend pages.

==================================================
21. MOBILE + WEB
==================================================

The same core referral behavior must work consistently across:

• Mobile
• Web
• Responsive layouts

UI may adapt to screen size, but the underlying referral, attribution and commission logic must remain consistent.

==================================================
22. SECURITY & AUDITABILITY
==================================================

All referral and commission calculations must be server-side.

Financial records must be:

• Secure
• Auditable
• Traceable
• Consistent

Never allow the client to directly determine commission amounts or earnings balances.

==================================================
23. FUTURE EXTENSIBILITY
==================================================

Keep the architecture extensible for future features such as:

• Affiliate Campaigns
• Creator Campaigns
• Seller Campaigns
• Sponsored Products
• Referral Bonuses
• Creator Rewards
• Performance-Based Commissions
• Promotional Commissions
• Referral Tiers

Do not introduce unnecessary complexity now.

Build only the required foundation while keeping the architecture scalable.

==================================================
24. DESIGN PRESERVATION RULE
==================================================

Do NOT change unrelated Ezyify design or functionality.

Preserve the existing:

• UI/UX
• Layout
• Design System
• Colors
• Typography
• Icons
• Navigation
• Components
• Responsive Behavior
• Existing Product Flow
• Existing Architecture
• Existing APIs
• Existing Database Structure where compatible
• Existing Buy Now
• Existing Add to Cart
• Existing Wishlist
• Existing Share

Only make changes required to properly implement:

Repost
+
Share Referral Attribution
+
Commission Engine
+
Earnings Integration

If an existing component or service can be reused, reuse it instead of creating a duplicate system.

==================================================
25. FINAL VALIDATION
==================================================

Before marking the implementation complete, perform an A–Z review.

Verify that:

✓ Repost exists on eligible Product Pages.
✓ Repost is visually consistent with Ezyify.
✓ Repost works without duplicating products.
✓ Repost preserves original seller/store attribution.
✓ Share preserves referral attribution where eligible.
✓ Referral attribution is automatic.
✓ Users do not need to manually create referral links.
✓ Referral attribution survives the supported purchase flow.
✓ Commission is calculated centrally.
✓ Commission states are handled correctly.
✓ Cancelled/refunded orders adjust commissions correctly.
✓ Self-referral and duplicate attribution are protected.
✓ Admin can configure commission and attribution rules.
✓ User/Creator earnings are integrated with the existing account system.
✓ Product data remains connected to the original product.
✓ Web and mobile behavior are consistent.
✓ Financial calculations are server-side.
✓ No duplicate commission engines exist.
✓ No disconnected affiliate system has been created.
✓ Existing unrelated Ezyify functionality remains unchanged.

FINAL CORE EXPERIENCE:

Discover
→ Repost / Share
→ Automatic Referral Attribution
→ Product Discovery
→ Product View
→ Purchase
→ Verified Sale
→ Commission
→ Earnings

The final implementation must make Product Repost, Product Share, Referral Attribution, Commission and Earnings feel like one native part of the Ezyify Social Commerce ecosystem.

Do not create duplicate products.
Do not create a disconnected affiliate system.
Do not require manual referral-link generation.
Do not duplicate commission logic.
Do not modify unrelated Ezyify UI/UX or functionality.

Use the existing Ezyify architecture and design system wherever possible, while making the Product Repost + Share + Automatic Referral + Commission system secure, auditable, scalable and production-ready.