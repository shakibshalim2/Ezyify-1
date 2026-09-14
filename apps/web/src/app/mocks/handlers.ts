// Mock Service Worker (MSW) Handlers for EZYIFY Backend APIs
// This provides realistic mock responses for all 22 backend endpoints during development

import { http, HttpResponse } from 'msw';

const API_BASE_URL = '/api/v1';

// Mock data store
const mockStore = {
  users: new Map(),
  orders: new Map(),
  escrow: new Map(),
  wallets: new Map(),
  disputes: new Map(),
  withdrawals: new Map(),
};

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ==========================================
// 1️⃣ PAYMENT & ESCROW APIs (5 endpoints)
// ==========================================

export const paymentHandlers = [
  // 1.1 Process Payment
  http.post(`${API_BASE_URL}/payments/process`, async ({ request }) => {
    const body = await request.json() as any;
    
    const transactionId = generateId('txn');
    const escrowId = generateId('esc');
    
    // Store in mock escrow
    mockStore.escrow.set(escrowId, {
      escrowId,
      orderId: body.orderId,
      amount: body.amount,
      status: 'locked',
      createdAt: new Date().toISOString(),
      autoReleaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    
    return HttpResponse.json({
      success: true,
      transactionId,
      escrowId,
      status: 'held_in_escrow',
      message: 'Payment held securely in escrow until delivery is confirmed',
      releaseTrigger: 'buyer_confirmation',
      timestamp: new Date().toISOString(),
    });
  }),

  // 1.2 Release Escrow (Buyer Confirmation)
  http.post(`${API_BASE_URL}/escrow/release`, async ({ request }) => {
    const body = await request.json() as any;
    
    const amount = 125.50;
    const commissionRate = 0.10; // 10%
    const gatewayFee = 0.029 * amount + 0.30; // Stripe fees
    const commission = amount * commissionRate;
    const sellerPayout = amount - commission - gatewayFee;
    
    return HttpResponse.json({
      success: true,
      escrowReleased: true,
      sellerPayout: parseFloat(sellerPayout.toFixed(2)),
      platformCommission: parseFloat(commission.toFixed(2)),
      gatewayFee: parseFloat(gatewayFee.toFixed(2)),
      buyerRefund: 0,
      orderStatus: 'completed',
      releasedAt: new Date().toISOString(),
    });
  }),

  // 1.3 Check Escrow Status
  http.get(`${API_BASE_URL}/escrow/status/:orderId`, ({ params }) => {
    const { orderId } = params;
    
    return HttpResponse.json({
      orderId,
      escrowStatus: 'locked',
      amount: 125.50,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      releaseCondition: 'buyer_confirmation',
      autoReleaseDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      daysUntilAutoRelease: 5,
    });
  }),

  // 1.4 Auto-Release Escrow (Internal Cron)
  http.post(`${API_BASE_URL}/escrow/auto-release`, async () => {
    return HttpResponse.json({
      success: true,
      releasedCount: 12,
      totalAmount: 3456.78,
      orders: ['ord_001', 'ord_002', 'ord_003'],
      processedAt: new Date().toISOString(),
    });
  }),

  // 1.5 Calculate Commission
  http.post(`${API_BASE_URL}/payments/calculate-commission`, async ({ request }) => {
    const body = await request.json() as any;
    const amount = body.amount || 100;
    const category = body.category || 'electronics';
    
    const commissionRates: Record<string, number> = {
      electronics: 0.10,
      fashion: 0.15,
      beauty: 0.12,
      home: 0.08,
      sports: 0.10,
    };
    
    const rate = commissionRates[category] || 0.10;
    const commission = amount * rate;
    const gatewayFee = amount * 0.029 + 0.30;
    const sellerReceives = amount - commission - gatewayFee;
    
    return HttpResponse.json({
      amount,
      commissionRate: rate,
      commission: parseFloat(commission.toFixed(2)),
      gatewayFee: parseFloat(gatewayFee.toFixed(2)),
      sellerReceives: parseFloat(sellerReceives.toFixed(2)),
      breakdown: {
        subtotal: amount,
        platformFee: parseFloat(commission.toFixed(2)),
        paymentProcessing: parseFloat(gatewayFee.toFixed(2)),
        total: parseFloat(sellerReceives.toFixed(2)),
      },
    });
  }),
];

// ==========================================
// 2️⃣ ORDER MANAGEMENT APIs (6 endpoints)
// ==========================================

export const orderHandlers = [
  // 2.1 Create Order
  http.post(`${API_BASE_URL}/orders/create`, async ({ request }) => {
    const body = await request.json() as any;
    const orderId = generateId('ord');
    
    const order = {
      orderId,
      ...body,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
      escrowStatus: 'pending',
    };
    
    mockStore.orders.set(orderId, order);
    
    return HttpResponse.json({
      success: true,
      order,
    });
  }),

  // 2.2 Get Order Details
  http.get(`${API_BASE_URL}/orders/:orderId`, ({ params }) => {
    const { orderId } = params;
    
    return HttpResponse.json({
      orderId,
      buyerId: 'usr_buyer_001',
      sellerId: 'usr_seller_002',
      products: [
        {
          productId: 'prd_123',
          name: 'Wireless Headphones',
          quantity: 1,
          price: 125.50,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        },
      ],
      totalAmount: 125.50,
      status: 'in_transit',
      escrowStatus: 'locked',
      paymentMethod: 'ezyify-wallet',
      shippingAddress: {
        street: '123 Main St',
        city: 'Dhaka',
        state: 'Dhaka',
        zip: '1200',
        country: 'Bangladesh',
      },
      tracking: {
        carrier: 'Pathao',
        trackingNumber: 'PATH123456',
        lastUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        status: 'Out for delivery',
      },
      timeline: [
        { status: 'Order Placed', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { status: 'Payment Held in Escrow', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { status: 'Seller Confirmed', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { status: 'Shipped', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  // 2.3 Update Order Status (Seller)
  http.patch(`${API_BASE_URL}/orders/:orderId/status`, async ({ request, params }) => {
    const body = await request.json() as any;
    const { orderId } = params;
    
    return HttpResponse.json({
      success: true,
      orderId,
      newStatus: body.status,
      updatedAt: new Date().toISOString(),
    });
  }),

  // 2.4 Confirm Delivery (Buyer)
  http.post(`${API_BASE_URL}/orders/:orderId/confirm-delivery`, async ({ request, params }) => {
    const body = await request.json() as any;
    const { orderId } = params;
    
    return HttpResponse.json({
      success: true,
      orderId,
      deliveryConfirmed: true,
      escrowReleased: body.productCondition === 'good',
      orderStatus: body.productCondition === 'good' ? 'completed' : 'disputed',
      confirmedAt: new Date().toISOString(),
    });
  }),

  // 2.5 List Orders (Buyer/Seller)
  http.get(`${API_BASE_URL}/orders`, ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get('role') || 'buyer';
    
    const orders = [
      {
        orderId: 'ord_001',
        productName: 'Wireless Headphones',
        totalAmount: 125.50,
        status: 'in_transit',
        escrowStatus: 'locked',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      },
      {
        orderId: 'ord_002',
        productName: 'Smart Watch',
        totalAmount: 299.99,
        status: 'completed',
        escrowStatus: 'released',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      },
      {
        orderId: 'ord_003',
        productName: 'Running Shoes',
        totalAmount: 89.99,
        status: 'delivered',
        escrowStatus: 'locked',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      },
    ];
    
    return HttpResponse.json({
      orders,
      total: orders.length,
      page: 1,
      limit: 20,
    });
  }),

  // 2.6 Cancel Order
  http.post(`${API_BASE_URL}/orders/:orderId/cancel`, async ({ request, params }) => {
    const body = await request.json() as any;
    const { orderId } = params;
    
    return HttpResponse.json({
      success: true,
      orderId,
      cancelled: true,
      refundInitiated: true,
      refundAmount: 125.50,
      reason: body.reason,
      cancelledAt: new Date().toISOString(),
    });
  }),
];

// ==========================================
// 3️⃣ WALLET APIs (4 endpoints)
// ==========================================

export const walletHandlers = [
  // 3.1 Get Wallet Balance
  http.get(`${API_BASE_URL}/wallet/balance`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    return HttpResponse.json({
      userId: 'usr_001',
      balance: 1234.56,
      currency: 'USD',
      pendingBalance: 456.78,
      availableBalance: 777.78,
      lastUpdated: new Date().toISOString(),
    });
  }),

  // 3.2 Get Transaction History
  http.get(`${API_BASE_URL}/wallet/transactions`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    const transactions = [
      {
        transactionId: 'txn_001',
        type: 'credit',
        amount: 125.50,
        description: 'Payment received from order #ord_002',
        status: 'completed',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        transactionId: 'txn_002',
        type: 'debit',
        amount: 50.00,
        description: 'Withdrawal to bank account',
        status: 'completed',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        transactionId: 'txn_003',
        type: 'credit',
        amount: 299.99,
        description: 'Refund for cancelled order #ord_005',
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    return HttpResponse.json({
      transactions,
      total: transactions.length,
      page,
      limit,
      hasMore: false,
    });
  }),

  // 3.3 Add Funds to Wallet
  http.post(`${API_BASE_URL}/wallet/add-funds`, async ({ request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      success: true,
      transactionId: generateId('txn'),
      amount: body.amount,
      newBalance: 1234.56 + body.amount,
      message: 'Funds added successfully',
      addedAt: new Date().toISOString(),
    });
  }),

  // 3.4 Transfer Funds (Seller Payout)
  http.post(`${API_BASE_URL}/wallet/transfer`, async ({ request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      success: true,
      transferId: generateId('trf'),
      fromWallet: body.fromWallet,
      toWallet: body.toWallet,
      amount: body.amount,
      status: 'completed',
      transferredAt: new Date().toISOString(),
    });
  }),
];

// ==========================================
// 4️⃣ REFUND & DISPUTE APIs (4 endpoints)
// ==========================================

export const refundDisputeHandlers = [
  // 4.1 Request Refund
  http.post(`${API_BASE_URL}/refunds/request`, async ({ request }) => {
    const body = await request.json() as any;
    const refundId = generateId('ref');
    
    return HttpResponse.json({
      success: true,
      refundId,
      orderId: body.orderId,
      amount: body.amount,
      reason: body.reason,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      estimatedProcessingTime: '3-5 business days',
    });
  }),

  // 4.2 Get Refund Status
  http.get(`${API_BASE_URL}/refunds/:refundId`, ({ params }) => {
    const { refundId } = params;
    
    return HttpResponse.json({
      refundId,
      orderId: 'ord_123',
      amount: 125.50,
      reason: 'Product damaged on arrival',
      status: 'approved',
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      refundedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      adminNotes: 'Refund approved after photo evidence review',
    });
  }),

  // 4.3 Create Dispute
  http.post(`${API_BASE_URL}/disputes/create`, async ({ request }) => {
    const body = await request.json() as any;
    const disputeId = generateId('dsp');
    
    return HttpResponse.json({
      success: true,
      disputeId,
      orderId: body.orderId,
      reason: body.reason,
      status: 'open',
      escrowFrozen: true,
      createdAt: new Date().toISOString(),
      expectedResolutionTime: '7-14 business days',
    });
  }),

  // 4.4 Get Dispute Details
  http.get(`${API_BASE_URL}/disputes/:disputeId`, ({ params }) => {
    const { disputeId } = params;
    
    return HttpResponse.json({
      disputeId,
      orderId: 'ord_123',
      buyerId: 'usr_buyer_001',
      sellerId: 'usr_seller_002',
      reason: 'Product not as described',
      status: 'in_review',
      escrowStatus: 'frozen',
      evidence: {
        buyerPhotos: ['url1.jpg', 'url2.jpg'],
        sellerResponse: 'Product shipped as described with proper packaging',
        adminComments: 'Under investigation',
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }),
];

// ==========================================
// 5️⃣ WITHDRAWAL APIs (3 endpoints)
// ==========================================

export const withdrawalHandlers = [
  // 5.1 Request Withdrawal
  http.post(`${API_BASE_URL}/withdrawals/request`, async ({ request }) => {
    const body = await request.json() as any;
    const withdrawalId = generateId('wth');
    
    return HttpResponse.json({
      success: true,
      withdrawalId,
      amount: body.amount,
      method: body.method,
      status: 'pending',
      estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      requestedAt: new Date().toISOString(),
    });
  }),

  // 5.2 Get Withdrawal Status
  http.get(`${API_BASE_URL}/withdrawals/:withdrawalId`, ({ params }) => {
    const { withdrawalId } = params;
    
    return HttpResponse.json({
      withdrawalId,
      userId: 'usr_seller_002',
      amount: 500.00,
      method: 'bank_transfer',
      status: 'completed',
      bankDetails: {
        accountNumber: '****5678',
        bankName: 'Example Bank',
      },
      requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }),

  // 5.3 List Withdrawal History
  http.get(`${API_BASE_URL}/withdrawals`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    
    const withdrawals = [
      {
        withdrawalId: 'wth_001',
        amount: 500.00,
        method: 'bank_transfer',
        status: 'completed',
        requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        withdrawalId: 'wth_002',
        amount: 250.00,
        method: 'paypal',
        status: 'completed',
        requestedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        withdrawalId: 'wth_003',
        amount: 750.00,
        method: 'bank_transfer',
        status: 'pending',
        requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    return HttpResponse.json({
      withdrawals,
      total: withdrawals.length,
      page,
      limit: 20,
    });
  }),
];

// ==========================================
// 6️⃣ LOOPS / SOCIAL INTERACTION APIs
// ==========================================

export const loopsHandlers = [
  // 6.1 Get Loops feed
  http.get(`${API_BASE_URL}/loops`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    return HttpResponse.json({
      loops: [],
      page,
      limit,
      hasMore: false,
      message: 'Use static data via getLoops() in development',
    });
  }),

  // 6.2 Like / Unlike a Loop
  http.post(`${API_BASE_URL}/loops/:loopId/like`, async ({ request, params }) => {
    const { loopId } = params;
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      loopId,
      liked: body.liked ?? true,
      likeCount: Math.floor(Math.random() * 50000) + 1000,
    });
  }),

  // 6.3 Save / Unsave a Loop
  http.post(`${API_BASE_URL}/loops/:loopId/save`, async ({ request, params }) => {
    const { loopId } = params;
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      loopId,
      saved: body.saved ?? true,
    });
  }),

  // 6.4 Track share event
  http.post(`${API_BASE_URL}/loops/:loopId/share`, async ({ request, params }) => {
    const { loopId } = params;
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      loopId,
      shareId: generateId('shr'),
      referralId: body.referralId,
      shareCount: Math.floor(Math.random() * 5000) + 100,
      trackedAt: new Date().toISOString(),
    });
  }),

  // 6.5 Repost a Loop
  http.post(`${API_BASE_URL}/loops/:loopId/repost`, async ({ request, params }) => {
    const { loopId } = params;
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      loopId,
      repostId: generateId('rp'),
      quoteText: body.quoteText ?? null,
      repostedAt: new Date().toISOString(),
    });
  }),

  // 6.6 Follow / Unfollow a user
  http.post(`${API_BASE_URL}/social/follow`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      targetUserId: body.targetUserId,
      following: body.follow ?? true,
      followerCount: Math.floor(Math.random() * 100000) + 500,
    });
  }),

  // 6.7 Report a Loop
  http.post(`${API_BASE_URL}/loops/:loopId/report`, async ({ request, params }) => {
    const { loopId } = params;
    const body = await request.json() as any;
    const reportId = generateId('rpt');
    return HttpResponse.json({
      success: true,
      reportId,
      loopId,
      reason: body.reason,
      status: 'submitted',
      message: 'Thank you for helping keep Ezyify safe.',
      submittedAt: new Date().toISOString(),
    });
  }),

  // 6.8 Not Interested (hide loop for user)
  http.post(`${API_BASE_URL}/loops/:loopId/not-interested`, async ({ params }) => {
    const { loopId } = params;
    return HttpResponse.json({
      success: true,
      loopId,
      hidden: true,
      message: 'Loop hidden. We\'ll show you less content like this.',
    });
  }),
];

// ─── Messages & Calls API Handlers ─────────────────────────────────────────────

export const messagesHandlers = [
  // GET /api/v1/conversations — list conversations
  http.get(`${API_BASE_URL}/conversations`, () => {
    return HttpResponse.json({
      success: true,
      conversations: [],
      total: 0,
    });
  }),

  // GET /api/v1/conversations/:id/messages
  http.get(`${API_BASE_URL}/conversations/:id/messages`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      conversationId: params.id,
      messages: [],
      hasMore: false,
    });
  }),

  // POST /api/v1/conversations/:id/messages — send a message
  http.post(`${API_BASE_URL}/conversations/:id/messages`, async ({ request, params }) => {
    const body = await request.json() as any;
    const msgId = generateId('msg');
    return HttpResponse.json({
      success: true,
      message: {
        id: msgId,
        conversationId: params.id,
        content: body.content,
        type: body.type ?? 'text',
        sender: 'you',
        status: 'sent',
        createdAt: new Date().toISOString(),
      },
    });
  }),

  // PUT /api/v1/conversations/:id/read — mark conversation as read
  http.put(`${API_BASE_URL}/conversations/:id/read`, ({ params }) => {
    return HttpResponse.json({ success: true, conversationId: params.id, readAt: new Date().toISOString() });
  }),

  // POST /api/v1/conversations — create new conversation
  http.post(`${API_BASE_URL}/conversations`, async ({ request }) => {
    const body = await request.json() as any;
    const convId = generateId('conv');
    return HttpResponse.json({
      success: true,
      conversation: {
        id: convId,
        participants: body.participants,
        isGroup: body.isGroup ?? false,
        groupName: body.groupName,
        createdAt: new Date().toISOString(),
      },
    });
  }),

  // POST /api/v1/calls/initiate — initiate a call
  http.post(`${API_BASE_URL}/calls/initiate`, async ({ request }) => {
    const body = await request.json() as any;
    const callId = generateId('call');
    return HttpResponse.json({
      success: true,
      callId,
      type: body.type,
      targetUserId: body.targetUserId,
      status: 'calling',
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
      createdAt: new Date().toISOString(),
    });
  }),

  // POST /api/v1/calls/:callId/answer — answer incoming call
  http.post(`${API_BASE_URL}/calls/:callId/answer`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      callId: params.callId,
      status: 'connected',
      connectedAt: new Date().toISOString(),
    });
  }),

  // POST /api/v1/calls/:callId/decline — decline incoming call
  http.post(`${API_BASE_URL}/calls/:callId/decline`, ({ params }) => {
    return HttpResponse.json({ success: true, callId: params.callId, status: 'declined' });
  }),

  // POST /api/v1/calls/:callId/end — end active call
  http.post(`${API_BASE_URL}/calls/:callId/end`, async ({ request, params }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      callId: params.callId,
      status: 'ended',
      duration: body.duration ?? 0,
      endedAt: new Date().toISOString(),
    });
  }),

  // GET /api/v1/calls/history — call history
  http.get(`${API_BASE_URL}/calls/history`, () => {
    return HttpResponse.json({
      success: true,
      calls: [],
      total: 0,
    });
  }),

  // POST /api/v1/messages/:id/react — react to a message
  http.post(`${API_BASE_URL}/messages/:id/react`, async ({ request, params }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      messageId: params.id,
      emoji: body.emoji,
      reactedAt: new Date().toISOString(),
    });
  }),

  // DELETE /api/v1/messages/:id — delete a message
  http.delete(`${API_BASE_URL}/messages/:id`, ({ params }) => {
    return HttpResponse.json({ success: true, messageId: params.id, deletedAt: new Date().toISOString() });
  }),

  // PUT /api/v1/conversations/:id/typing — typing status
  http.put(`${API_BASE_URL}/conversations/:id/typing`, async ({ request, params }) => {
    const body = await request.json() as any;
    return HttpResponse.json({ success: true, conversationId: params.id, isTyping: body.isTyping });
  }),
];

// Export all handlers
export const handlers = [
  ...paymentHandlers,
  ...orderHandlers,
  ...walletHandlers,
  ...refundDisputeHandlers,
  ...withdrawalHandlers,
  ...loopsHandlers,
  ...messagesHandlers,
];
