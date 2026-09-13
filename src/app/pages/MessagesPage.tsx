import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import {
  Send, Search, MoreVertical, Phone, Video, ImageIcon,
  Smile, Check, CheckCheck, ShoppingBag, Package, MessageCircle,
  ArrowLeft, X, BellOff, BellRing, Trash2, Flag, Copy, Reply,
  WifiOff, AlertCircle, RefreshCw, CheckCircle2, Edit3, Pin,
  ExternalLink, Clock, Users, PhoneCall, PhoneIncoming, PhoneMissed,
  PhoneOff, VideoOff, CornerDownRight, UserPlus, Forward,
  Star, ZoomIn,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { SEO, SEOConfigs } from '../components/SEO';
import { toast } from 'sonner';
import { CallScreen, type CallSessionData, type CallOutcome } from '../components/CallScreen';

// ─── Types ──────────────────────────────────────────────────────────────────────

type MsgType   = 'text' | 'image' | 'product' | 'order' | 'system';
type ConvType  = 'user' | 'seller' | 'creator';
type MsgStatus = 'sending' | 'sent' | 'delivered' | 'read';
type FilterTab = 'all' | 'unread' | 'sellers' | 'creators' | 'calls';

interface ProductCard {
  id: string; name: string; price: number;
  originalPrice?: number; image: string; store: string;
}

interface OrderCard {
  id: string; product: string; image: string;
  status: string; tracking?: string;
}

interface ReplyRef {
  id: number;
  text: string;
  senderName: string;
}

interface Msg {
  id: number;
  sender: 'you' | 'them';
  senderInfo?: { name: string; avatar: string }; // group chats
  type: MsgType;
  text?: string;
  imageUrl?: string;
  product?: ProductCard;
  order?: OrderCard;
  time: string;
  date: string;
  status: MsgStatus;
  replyTo?: ReplyRef;
}

interface GroupMember {
  name: string;
  avatar: string;
  username: string;
}

interface Conv {
  id: number;
  isGroup?: boolean;
  members?: GroupMember[];
  user: {
    name: string; username: string; avatar: string;
    online: boolean; lastSeen?: string;
    verified: boolean; type: ConvType;
  };
  lastMessage: {
    text: string; time: string; unread: number;
    sender: 'you' | 'them';
  };
  muted?: boolean;
  pinned?: boolean;
}

type CallDirection = 'incoming' | 'outgoing';
type CallHistoryOutcome = 'answered' | 'missed' | 'declined' | 'failed';

interface CallRecord {
  id: number;
  type: 'audio' | 'video';
  direction: CallDirection;
  outcome: CallHistoryOutcome;
  contact: { name: string; avatar: string; username: string };
  time: string;
  duration?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const EMOJIS = [
  '😊','😂','❤️','🔥','👍','😍','🙌','✨','💫','😭',
  '🥰','🤩','😎','🤔','😅','🥹','💪','🎉','🚀','👀',
  '💯','🤣','😘','🙏','💝','⭐','🎊','👏','💬','📦',
];

const SHARE_PRODUCTS: ProductCard[] = [
  { id: 'p1', name: 'Premium Wireless Headphones', price: 45, originalPrice: 79.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', store: 'TechStore' },
  { id: 'p2', name: 'Smart Watch Series 5', price: 89, originalPrice: 149, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop', store: 'TechStore' },
  { id: 'p3', name: 'Leather Crossbody Bag', price: 49.99, originalPrice: 89.99, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop', store: 'Fashion Hub' },
  { id: 'p4', name: 'Minimalist White Sneakers', price: 65, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop', store: 'Sneaker World' },
  { id: 'p5', name: 'Silk Blouse — White', price: 38, originalPrice: 60, image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=200&h=200&fit=crop', store: 'StyleHub' },
  { id: 'p6', name: 'Portable Bluetooth Speaker', price: 32, originalPrice: 55, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop', store: 'SoundLab' },
];

const AUTO_REPLIES: Record<number, string[]> = {
  1: ["Your order is on its way! 🚚", "Thank you for shopping with us! ✨", "Is there anything else I can help you with?"],
  2: ["Omg love that! 😍🔥", "You always have the best taste!", "Tag me when you wear it! 📸"],
  3: ["Yes, international warranty included! 🌍", "Happy to help with any other questions!", "We offer free returns within 30 days 😊"],
  4: ["Right?? It's so good 😂", "Check this one out too! 👀", "We should link up sometime!"],
  5: ["Use code STYLE20 for 20% extra off 🎉", "Limited stock — grab it before it's gone!", "The sale ends midnight Sunday ⏰"],
  6: ["Would love to collaborate! ✨", "Let me check my schedule and get back to you!", "Your content is amazing btw 🔥"],
  7: ["This offer expires tonight! ⏰", "Happy to extend if you need more time!", "Great choice — it's our best seller!"],
  8: ["Omg yes this is such a vibe! 🔥", "Love the direction, let's do it! ✨", "Can everyone confirm the collab date? 📅"],
  9: ["Anyone got a good EU shipping rate? 📦", "Ezyify analytics are insane this month 📈", "Let's sync on Q4 strategy this week!"],
};

const D_TODAY     = 'Today';
const D_YESTERDAY = 'Yesterday';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const INIT_CONVS: Conv[] = [
  {
    id: 1, pinned: true,
    user: { name: 'StyleHub Store', username: 'stylehub', avatar: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=150', online: true, verified: true, type: 'seller' },
    lastMessage: { text: "Your order has been shipped! 📦", time: '2m ago', unread: 2, sender: 'them' },
  },
  {
    id: 2,
    user: { name: 'Emma Wilson', username: 'fashionista_emma', avatar: 'https://images.unsplash.com/photo-1716827172706-9f4c36b039eb?w=150', online: true, verified: true, type: 'creator' },
    lastMessage: { text: 'Thanks! Love the outfit inspo 😍', time: '15m ago', unread: 0, sender: 'you' },
  },
  {
    id: 3,
    user: { name: 'TechWorld', username: 'techworld', avatar: 'https://images.unsplash.com/photo-1752859951149-7d3fc700a7ec?w=150', online: false, lastSeen: 'Last seen 1h ago', verified: true, type: 'seller' },
    lastMessage: { text: 'Is the warranty international?', time: '1h ago', unread: 0, sender: 'you' },
  },
  {
    id: 4,
    user: { name: 'Mike Chen', username: 'mike_chen', avatar: 'https://images.unsplash.com/photo-1615843636565-5cc1a4d187e7?w=150', online: false, lastSeen: 'Last seen 3h ago', verified: false, type: 'user' },
    lastMessage: { text: 'Check out this new product!', time: '3h ago', unread: 1, sender: 'them' },
  },
  {
    id: 5, muted: true,
    user: { name: 'FashionFirst', username: 'fashionfirst', avatar: 'https://images.unsplash.com/photo-1718296738046-e5cc0e95c143?w=150', online: true, verified: true, type: 'seller' },
    lastMessage: { text: 'The sale starts tomorrow!', time: '5h ago', unread: 0, sender: 'them' },
  },
  {
    id: 6,
    user: { name: 'Sarah Kim', username: 'sarah_creates', avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150', online: true, verified: true, type: 'creator' },
    lastMessage: { text: 'Would love to collab! 🌟', time: '1d ago', unread: 0, sender: 'them' },
  },
  {
    id: 7,
    user: { name: 'GadgetZone', username: 'gadgetzone', avatar: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=150', online: false, lastSeen: 'Last seen yesterday', verified: true, type: 'seller' },
    lastMessage: { text: 'Your exclusive discount expires tonight!', time: '2d ago', unread: 0, sender: 'them' },
  },
  // Group conversations
  {
    id: 8, isGroup: true,
    members: [
      { name: 'Emma Wilson',  avatar: 'https://images.unsplash.com/photo-1716827172706-9f4c36b039eb?w=150', username: 'fashionista_emma' },
      { name: 'Sarah Kim',    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150', username: 'sarah_creates' },
      { name: 'Mike Chen',    avatar: 'https://images.unsplash.com/photo-1615843636565-5cc1a4d187e7?w=150', username: 'mike_chen' },
    ],
    user: { name: 'Style Squad', username: 'group_style_squad', avatar: 'https://images.unsplash.com/photo-1716827172706-9f4c36b039eb?w=150', online: true, verified: false, type: 'creator' },
    lastMessage: { text: 'Emma: Omg this is going to be so good 🔥', time: '1h ago', unread: 3, sender: 'them' },
  },
  {
    id: 9, isGroup: true,
    members: [
      { name: 'StyleHub Store', avatar: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=150', username: 'stylehub' },
      { name: 'TechWorld',      avatar: 'https://images.unsplash.com/photo-1752859951149-7d3fc700a7ec?w=150', username: 'techworld' },
      { name: 'GadgetZone',     avatar: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=150', username: 'gadgetzone' },
    ],
    user: { name: 'Seller Network', username: 'group_seller_network', avatar: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=150', online: false, verified: false, type: 'seller' },
    lastMessage: { text: "StyleHub: Let’s sync on Q4 strategy 📈", time: '3h ago', unread: 0, sender: 'them' },
  },
];

const INIT_MSGS: Record<number, Msg[]> = {
  1: [
    { id: 101, sender: 'you', type: 'text', text: 'Hi! I ordered the Premium T-Shirt. Can I get an update?', time: '10:30 AM', date: D_YESTERDAY, status: 'read' },
    { id: 102, sender: 'them', type: 'text', text: 'Hello! Thank you for reaching out 😊 Let me pull up your order right away.', time: '10:32 AM', date: D_YESTERDAY, status: 'read' },
    { id: 103, sender: 'them', type: 'order', order: { id: '#EZY-2024-123456', product: 'Premium Cotton T-Shirt (White / L)', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200', status: 'Shipped', tracking: 'TRK-789012345' }, time: '10:33 AM', date: D_YESTERDAY, status: 'read' },
    { id: 104, sender: 'you', type: 'text', text: 'Awesome! When can I expect delivery?', time: '10:35 AM', date: D_YESTERDAY, status: 'read' },
    { id: 105, sender: 'them', type: 'text', text: "Your order arrives today between 2–6 PM 🚚 You'll get a notification when it's out for delivery!", time: '10:37 AM', date: D_YESTERDAY, status: 'read' },
    { id: 106, sender: 'you', type: 'text', text: 'Perfect! Do you have this in navy?', time: '10:40 AM', date: D_YESTERDAY, status: 'read' },
    { id: 107, sender: 'them', type: 'text', text: "Absolutely! It comes in 6 colors. Here's the navy version:", time: '10:42 AM', date: D_YESTERDAY, status: 'read' },
    { id: 108, sender: 'them', type: 'product', product: { id: 'p-shirt-navy', name: 'Premium Cotton T-Shirt (Navy)', price: 24.99, originalPrice: 39.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200', store: 'StyleHub Store' }, time: '10:43 AM', date: D_YESTERDAY, status: 'read' },
    { id: 109, sender: 'them', type: 'system', text: D_TODAY, time: '', date: D_TODAY, status: 'read' },
    { id: 110, sender: 'them', type: 'text', text: "Good morning! Your order is out for delivery today 📦✨", time: '9:15 AM', date: D_TODAY, status: 'read' },
    { id: 111, sender: 'them', type: 'text', text: "Your order has been shipped! 📦 You should receive it this afternoon.", time: '9:16 AM', date: D_TODAY, status: 'read' },
  ],
  2: [
    { id: 201, sender: 'them', type: 'text', text: "Hey! Loved your latest post 🔥 Where'd you get that jacket?", time: '11:00 AM', date: D_YESTERDAY, status: 'read' },
    { id: 202, sender: 'you', type: 'text', text: "Thank you so much!! It's from FashionFirst — link below 💕", time: '11:05 AM', date: D_YESTERDAY, status: 'read' },
    { id: 203, sender: 'you', type: 'product', product: { id: 'p-jacket', name: 'Oversized Denim Jacket', price: 68, originalPrice: 110, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200', store: 'FashionFirst' }, time: '11:06 AM', date: D_YESTERDAY, status: 'read' },
    { id: 204, sender: 'them', type: 'text', text: "OMG it's so cute!! Adding to cart rn 🛒✨", time: '11:10 AM', date: D_YESTERDAY, status: 'read' },
    { id: 205, sender: 'them', type: 'text', text: "Have you seen the new fall collections? My audience is obsessed 😍", time: '11:12 AM', date: D_YESTERDAY, status: 'read' },
    { id: 206, sender: 'you', type: 'text', text: "Yes!! The fall line is everything 🌟", time: '11:20 AM', date: D_YESTERDAY, status: 'read' },
    { id: 207, sender: 'them', type: 'system', text: D_TODAY, time: '', date: D_TODAY, status: 'read' },
    { id: 208, sender: 'you', type: 'text', text: "Thanks! Love the outfit inspo 😍", time: '2:45 PM', date: D_TODAY, status: 'read' },
  ],
  3: [
    { id: 301, sender: 'them', type: 'system', text: D_TODAY, time: '', date: D_TODAY, status: 'read' },
    { id: 302, sender: 'you', type: 'text', text: "Hi! I'm interested in the AirPods Pro. Is the warranty international?", time: '9:00 AM', date: D_TODAY, status: 'delivered' },
    { id: 303, sender: 'them', type: 'product', product: { id: 'p-airpods', name: 'AirPods Pro (2nd Gen)', price: 189, originalPrice: 249, image: 'https://images.unsplash.com/photo-1588423771073-b8903febb85b?w=200', store: 'TechWorld' }, time: '9:02 AM', date: D_TODAY, status: 'read' },
    { id: 304, sender: 'them', type: 'text', text: "Yes! All our products include a 2-year international warranty. Register on our site within 30 days 👍", time: '9:05 AM', date: D_TODAY, status: 'read' },
    { id: 305, sender: 'you', type: 'text', text: 'Is the warranty international?', time: '9:10 AM', date: D_TODAY, status: 'delivered' },
  ],
  4: [
    { id: 401, sender: 'them', type: 'system', text: D_TODAY, time: '', date: D_TODAY, status: 'read' },
    { id: 402, sender: 'them', type: 'text', text: "Yo! Found something wild 👀", time: '6:30 AM', date: D_TODAY, status: 'read' },
    { id: 403, sender: 'them', type: 'product', product: { id: 'p-watch-ultra', name: 'Smart Watch Ultra', price: 199, originalPrice: 349, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200', store: 'GadgetZone' }, time: '6:31 AM', date: D_TODAY, status: 'read' },
    { id: 404, sender: 'them', type: 'text', text: 'Check out this new product!', time: '6:35 AM', date: D_TODAY, status: 'read' },
  ],
  5: [
    { id: 501, sender: 'them', type: 'system', text: D_YESTERDAY, time: '', date: D_YESTERDAY, status: 'read' },
    { id: 502, sender: 'them', type: 'text', text: "Hi! 👋 Big news — our seasonal sale starts soon with up to 60% off!", time: '4:00 PM', date: D_YESTERDAY, status: 'read' },
    { id: 503, sender: 'them', type: 'system', text: D_TODAY, time: '', date: D_TODAY, status: 'read' },
    { id: 504, sender: 'them', type: 'text', text: 'The sale starts tomorrow!', time: '8:00 AM', date: D_TODAY, status: 'read' },
  ],
  6: [
    { id: 601, sender: 'them', type: 'system', text: '2 days ago', time: '', date: '2 days ago', status: 'read' },
    { id: 602, sender: 'them', type: 'text', text: "Hi! I've been following your content and would absolutely love to collab! 🌟", time: '3:00 PM', date: '2 days ago', status: 'read' },
    { id: 603, sender: 'them', type: 'text', text: 'Would love to collab! 🌟', time: '3:01 PM', date: '2 days ago', status: 'read' },
  ],
  7: [
    { id: 701, sender: 'them', type: 'system', text: '3 days ago', time: '', date: '3 days ago', status: 'read' },
    { id: 702, sender: 'them', type: 'text', text: "Hey! We've set aside an exclusive 40% discount just for you — it expires tonight at midnight.", time: '10:00 AM', date: '3 days ago', status: 'read' },
    { id: 703, sender: 'them', type: 'text', text: 'Your exclusive discount expires tonight!', time: '10:01 AM', date: '3 days ago', status: 'read' },
  ],
  // Group: Style Squad
  8: [
    { id: 801, sender: 'them', type: 'system', text: D_YESTERDAY, time: '', date: D_YESTERDAY, status: 'read' },
    { id: 802, sender: 'them', senderInfo: { name: 'Emma', avatar: 'https://images.unsplash.com/photo-1716827172706-9f4c36b039eb?w=150' }, type: 'text', text: "Hey squad! Thinking about doing a group collab for this fall season 🍂✨", time: '2:00 PM', date: D_YESTERDAY, status: 'read' },
    { id: 803, sender: 'them', senderInfo: { name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150' }, type: 'text', text: "Yesss!! I'm so in for this 🙌🔥", time: '2:04 PM', date: D_YESTERDAY, status: 'read' },
    { id: 804, sender: 'you', type: 'text', text: "Love the idea! What brands are you thinking?", time: '2:10 PM', date: D_YESTERDAY, status: 'read' },
    { id: 805, sender: 'them', senderInfo: { name: 'Emma', avatar: 'https://images.unsplash.com/photo-1716827172706-9f4c36b039eb?w=150' }, type: 'text', text: "Probably FashionFirst and maybe a couple new ones. Mike — you still in with TechWorld?", time: '2:15 PM', date: D_YESTERDAY, status: 'read' },
    { id: 806, sender: 'them', senderInfo: { name: 'Mike', avatar: 'https://images.unsplash.com/photo-1615843636565-5cc1a4d187e7?w=150' }, type: 'text', text: "100%! They just DM'd me about a new drop 👀 Perfect timing.", time: '2:20 PM', date: D_YESTERDAY, status: 'read' },
    { id: 807, sender: 'them', type: 'system', text: D_TODAY, time: '', date: D_TODAY, status: 'read' },
    { id: 808, sender: 'them', senderInfo: { name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150' }, type: 'text', text: "Good morning everyone! I made a mood board for the shoot — check the shared folder 📌", time: '9:30 AM', date: D_TODAY, status: 'read' },
    { id: 809, sender: 'them', senderInfo: { name: 'Emma', avatar: 'https://images.unsplash.com/photo-1716827172706-9f4c36b039eb?w=150' }, type: 'text', text: "Omg this is going to be so good 🔥", time: '9:45 AM', date: D_TODAY, status: 'read' },
  ],
  // Group: Seller Network
  9: [
    { id: 901, sender: 'them', type: 'system', text: D_YESTERDAY, time: '', date: D_YESTERDAY, status: 'read' },
    { id: 902, sender: 'them', senderInfo: { name: 'StyleHub', avatar: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=150' }, type: 'text', text: "Hey all! Saw the new seller dashboard — the analytics are insane 📈", time: '10:00 AM', date: D_YESTERDAY, status: 'read' },
    { id: 903, sender: 'them', senderInfo: { name: 'TechWorld', avatar: 'https://images.unsplash.com/photo-1752859951149-7d3fc700a7ec?w=150' }, type: 'text', text: "Right? Our conversion rate jumped 12% since the new checkout flow.", time: '10:05 AM', date: D_YESTERDAY, status: 'read' },
    { id: 904, sender: 'you', type: 'text', text: "Same here! The product recommendations are working really well 🙌", time: '10:12 AM', date: D_YESTERDAY, status: 'read' },
    { id: 905, sender: 'them', senderInfo: { name: 'GadgetZone', avatar: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=150' }, type: 'text', text: "Anyone tried the new bulk order feature? Working on a holiday bundle.", time: '10:20 AM', date: D_YESTERDAY, status: 'read' },
    { id: 906, sender: 'them', type: 'system', text: D_TODAY, time: '', date: D_TODAY, status: 'read' },
    { id: 907, sender: 'them', senderInfo: { name: 'StyleHub', avatar: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=150' }, type: 'text', text: "Let's sync on Q4 strategy this week 📈 I can do Thursday afternoon?", time: '11:00 AM', date: D_TODAY, status: 'read' },
  ],
};

const INIT_CALL_HISTORY: CallRecord[] = [
  { id: 1, type: 'video',  direction: 'incoming', outcome: 'answered', contact: { name: 'Emma Wilson',   avatar: 'https://images.unsplash.com/photo-1716827172706-9f4c36b039eb?w=150', username: 'fashionista_emma' }, time: '2h ago',   duration: '4:32' },
  { id: 2, type: 'audio',  direction: 'outgoing', outcome: 'missed',   contact: { name: 'StyleHub Store', avatar: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=150', username: 'stylehub' },          time: '5h ago' },
  { id: 3, type: 'audio',  direction: 'incoming', outcome: 'missed',   contact: { name: 'Mike Chen',      avatar: 'https://images.unsplash.com/photo-1615843636565-5cc1a4d187e7?w=150', username: 'mike_chen' },          time: 'Yesterday' },
  { id: 4, type: 'audio',  direction: 'outgoing', outcome: 'answered', contact: { name: 'TechWorld',      avatar: 'https://images.unsplash.com/photo-1752859951149-7d3fc700a7ec?w=150', username: 'techworld' },          time: 'Yesterday', duration: '1:15' },
  { id: 5, type: 'video',  direction: 'outgoing', outcome: 'declined', contact: { name: 'Sarah Kim',      avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150', username: 'sarah_creates' },      time: '2d ago' },
  { id: 6, type: 'audio',  direction: 'incoming', outcome: 'answered', contact: { name: 'GadgetZone',     avatar: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=150', username: 'gadgetzone' },         time: '3d ago',   duration: '0:42' },
];

// Extra contacts for New Conversation modal
const EXTRA_CONTACTS: Array<{ name: string; username: string; avatar: string; type: ConvType }> = [
  { name: 'Alex Rivera',  username: 'alex_style',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', type: 'creator' },
  { name: 'Luna Shop',    username: 'lunashop',     avatar: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150', type: 'seller'  },
  { name: 'Jordan Tran',  username: 'jordan_t',     avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', type: 'user'    },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

function MessagesSkeleton() {
  return (
    <div className="h-[calc(100vh-5.5rem)] md:h-[calc(100vh-4rem)] bg-background flex overflow-hidden">
      <div className="w-full md:w-80 lg:w-96 border-r border-border p-4 flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
        </div>
        <div className="space-y-2 mt-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-3 p-3 rounded-2xl">
              <Skeleton className="w-11 h-11 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:flex flex-1 flex-col">
        <div className="border-b border-border p-4"><Skeleton className="h-9 w-52" /></div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-60'}`} />
            </div>
          ))}
        </div>
        <div className="border-t border-border p-3"><Skeleton className="h-10 w-full rounded-2xl" /></div>
      </div>
    </div>
  );
}

function OfflineBanner() {
  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium shrink-0" role="alert">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You're offline — messages will send when you reconnect</span>
    </div>
  );
}

function TypingIndicator({ avatar, name }: { avatar: string; name?: string }) {
  return (
    <div className="flex gap-2 items-end">
      <img loading="lazy" src={avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mb-1" />
      <div className="flex flex-col items-start gap-0.5">
        {name && (
          <span className="text-[11px] font-semibold text-muted-foreground ml-1">{name} is typing…</span>
        )}
        <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div className="flex gap-1 items-center h-4">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.9s' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupAvatar({ members }: { members: GroupMember[] }) {
  const show = members.slice(0, 2);
  return (
    <div className="relative w-11 h-11 shrink-0">
      {show.map((m, i) => (
        <img
          key={i}
          loading="lazy"
          src={m.avatar}
          alt={m.name}
          className={`absolute w-[26px] h-[26px] rounded-lg object-cover border-[1.5px] border-card ${
            i === 0 ? 'top-0 left-0' : 'bottom-0 right-0'
          }`}
        />
      ))}
      {members.length > 2 && (
        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center px-0.5">
          +{members.length - 2}
        </span>
      )}
    </div>
  );
}

function ProductShareModal({ onClose, onShare }: {
  onClose: () => void;
  onShare: (p: ProductCard) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = SHARE_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.store.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <h3 className="font-semibold text-foreground">Share a Product</h3>
          <button onClick={onClose} className="w-11 h-11 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="px-3 py-2.5 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Search products..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No products found</div>
          ) : filtered.map(p => {
            const disc = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
            return (
              <button key={p.id} onClick={() => onShare(p)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors text-left group">
                <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.store}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm font-bold text-foreground">${p.price}</span>
                    {p.originalPrice && <span className="text-xs text-muted-foreground line-through">${p.originalPrice}</span>}
                    {disc && <Badge className="text-[9px] px-1.5 py-0 h-4">-{disc}%</Badge>}
                  </div>
                </div>
                <span className="text-xs font-medium text-white px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'var(--brand-gradient)' }}>Share</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NewConvModal({
  onClose,
  existingConvs,
  onSelectContact,
  onCreateGroup,
}: {
  onClose: () => void;
  existingConvs: Conv[];
  onSelectContact: (convId: number | null, contact: { name: string; username: string; avatar: string; type: ConvType }) => void;
  onCreateGroup: (name: string, members: GroupMember[]) => void;
}) {
  const [tab, setTab] = useState<'direct' | 'group'>('direct');
  const [search, setSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<GroupMember[]>([]);
  const [groupName, setGroupName] = useState('');

  const allContacts = [
    ...existingConvs.filter(c => !c.isGroup).map(c => ({ name: c.user.name, username: c.user.username, avatar: c.user.avatar, type: c.user.type, convId: c.id })),
    ...EXTRA_CONTACTS.map(c => ({ ...c, convId: null as number | null })),
  ];

  const filtered = allContacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMember = (contact: { name: string; username: string; avatar: string }) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.username === contact.username);
      if (exists) return prev.filter(m => m.username !== contact.username);
      return [...prev, { name: contact.name, username: contact.username, avatar: contact.avatar }];
    });
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length < 2) return;
    onCreateGroup(groupName.trim(), selectedMembers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <h3 className="font-semibold text-foreground">New Conversation</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-3 pb-0 gap-2 shrink-0">
          {(['direct', 'group'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                tab === t ? 'text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              style={tab === t ? { background: 'var(--brand-gradient)' } : {}}
            >
              {t === 'direct' ? 'Direct Message' : 'New Group'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={tab === 'direct' ? 'Search people…' : 'Add members…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>

        {/* Group name input */}
        {tab === 'group' && (
          <div className="px-3 pb-2 shrink-0">
            <input
              type="text"
              placeholder="Group name…"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
            />
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedMembers.map(m => (
                  <span key={m.username} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                    {m.name}
                    <button onClick={() => toggleMember(m)} className="ml-0.5 hover:text-destructive">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact list */}
        <div className="overflow-y-auto flex-1 px-2 pb-2">
          {filtered.map(c => {
            const isMemberSelected = selectedMembers.some(m => m.username === c.username);
            return (
              <button
                key={c.username}
                onClick={() => {
                  if (tab === 'direct') {
                    onSelectContact(c.convId, { name: c.name, username: c.username, avatar: c.avatar, type: c.type });
                  } else {
                    toggleMember(c);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                  isMemberSelected && tab === 'group' ? 'bg-primary/8 border border-primary/15' : 'hover:bg-muted'
                }`}
              >
                <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">@{c.username}</p>
                </div>
                {tab === 'direct' ? (
                  <span className="text-xs font-semibold text-white px-2.5 py-1 rounded-lg shrink-0"
                    style={{ background: 'var(--brand-gradient)' }}>
                    {c.convId ? 'Open' : 'Message'}
                  </span>
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isMemberSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  }`}>
                    {isMemberSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Create group button */}
        {tab === 'group' && (
          <div className="px-3 pb-3 pt-1 border-t border-border shrink-0">
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedMembers.length < 2}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--brand-gradient)' }}
            >
              Create Group ({selectedMembers.length} selected)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [convs,          setConvs]          = useState<Conv[]>(INIT_CONVS);
  const [msgs,           setMsgs]           = useState<Record<number, Msg[]>>(INIT_MSGS);
  const [selectedChat,   setSelectedChat]   = useState<number | null>(1);
  const [mobileView,     setMobileView]     = useState<'list' | 'chat'>('list');
  const [newMsg,         setNewMsg]         = useState('');
  const [search,         setSearch]         = useState('');
  const [filter,         setFilter]         = useState<FilterTab>('all');
  const [isTyping,       setIsTyping]       = useState(false);
  const [showEmoji,      setShowEmoji]      = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [contextMenu,    setContextMenu]    = useState<{ msgId: number; x: number; y: number } | null>(null);
  const [convMenu,       setConvMenu]       = useState<number | null>(null);
  const [showChatMenu,   setShowChatMenu]   = useState(false);
  const [isOnline,       setIsOnline]       = useState(true);
  const [isLoading,      setIsLoading]      = useState(true);
  const [hasError,       setHasError]       = useState(false);
  const [callSession,    setCallSession]    = useState<CallSessionData | null>(null);
  const [callHistory,    setCallHistory]    = useState<CallRecord[]>(INIT_CALL_HISTORY);
  const [replyingTo,     setReplyingTo]     = useState<{ id: number; text: string; sender: 'you' | 'them'; senderName?: string } | null>(null);
  const [showNewConv,    setShowNewConv]    = useState(false);

  const [lightboxImage,  setLightboxImage]  = useState<string | null>(null);
  const [callSearch,     setCallSearch]     = useState('');
  const [emojiPos,       setEmojiPos]       = useState({ bottom: 80, right: 16 });
  const [starredMsgs,    setStarredMsgs]    = useState<Set<number>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const emojiBtnRef    = useRef<HTMLButtonElement>(null);
  const longPressRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const incomingShown  = useRef(false);

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const goOnline  = () => { setIsOnline(true);  toast.success('Back online!'); };
    const goOffline = () =>   setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat, msgs, isTyping]);

  useEffect(() => {
    const close = () => {
      setContextMenu(null); setConvMenu(null); setShowChatMenu(false); setShowEmoji(false);
      setLightboxImage(null);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    setConvs(prev => prev.map(c =>
      c.id === selectedChat && c.lastMessage.unread > 0
        ? { ...c, lastMessage: { ...c.lastMessage, unread: 0 } }
        : c
    ));
  }, [selectedChat]);

  // Simulate incoming call after 22s (demo)
  useEffect(() => {
    const t = setTimeout(() => {
      if (incomingShown.current || callSession) return;
      incomingShown.current = true;
      setCallSession({
        type: 'audio',
        direction: 'incoming',
        contact: {
          name: 'Sarah Kim',
          avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150',
          username: 'sarah_creates',
        },
      });
    }, 22000);
    return () => clearTimeout(t);
   
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const currentConv  = convs.find(c => c.id === selectedChat);
  const currentMsgs  = selectedChat ? (msgs[selectedChat] ?? []) : [];
  const totalUnread  = convs.reduce((s, c) => s + c.lastMessage.unread, 0);
  const missedCalls  = callHistory.filter(c => c.outcome === 'missed').length;

  const filteredConvs = convs
    .filter(c => {
      if (search) {
        const q = search.toLowerCase();
        return c.user.name.toLowerCase().includes(q) || c.user.username.toLowerCase().includes(q);
      }
      if (filter === 'unread')   return c.lastMessage.unread > 0;
      if (filter === 'sellers')  return c.user.type === 'seller';
      if (filter === 'creators') return c.user.type === 'creator';
      return true;
    })
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const selectChat = (id: number) => {
    setSelectedChat(id);
    setMobileView('chat');
    setNewMsg('');
    setReplyingTo(null);
    setShowEmoji(false);
  };

  const initCall = (type: 'audio' | 'video') => {
    if (!currentConv) return;
    setCallSession({
      type,
      direction: 'outgoing',
      contact: {
        name:     currentConv.isGroup ? currentConv.user.name : currentConv.user.name,
        avatar:   currentConv.user.avatar,
        username: currentConv.user.username,
      },
    });
  };

  const handleCallEnd = useCallback((outcome: CallOutcome, durationSecs: number) => {
    if (!callSession) return;

    const duration =
      durationSecs > 0
        ? `${Math.floor(durationSecs / 60)}:${String(durationSecs % 60).padStart(2, '0')}`
        : undefined;

    const record: CallRecord = {
      id:        Date.now(),
      type:      callSession.type,
      direction: callSession.direction,
      outcome:   outcome as CallHistoryOutcome,
      contact:   callSession.contact,
      time:      'Just now',
      duration,
    };

    setCallHistory(prev => [record, ...prev]);
    setCallSession(null);

    const label =
      outcome === 'answered' ? `Call ended${duration ? ` · ${duration}` : ''}` :
      outcome === 'missed'   ? 'Missed call' :
      outcome === 'declined' ? 'Call declined' :
      'Call failed';
    toast.info(label, { duration: 3000 });
  }, [callSession]);

  const handleSend = useCallback(() => {
    if (!newMsg.trim() || !selectedChat) return;

    const msgId  = Date.now();
    const txt    = newMsg.trim();
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newMsgObj: Msg = {
      id: msgId, sender: 'you', type: 'text',
      text: txt, time: timeStr, date: D_TODAY, status: 'sending',
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text,
            senderName: replyingTo.senderName ?? (replyingTo.sender === 'you' ? 'You' : (currentConv?.user.name ?? 'Them')),
          }
        : undefined,
    };

    setMsgs(prev => ({ ...prev, [selectedChat]: [...(prev[selectedChat] ?? []), newMsgObj] }));
    setConvs(prev => prev.map(c => c.id === selectedChat
      ? { ...c, lastMessage: { ...c.lastMessage, text: txt, time: 'Just now', sender: 'you', unread: 0 } }
      : c
    ));
    setNewMsg('');
    setReplyingTo(null);
    if (inputRef.current) inputRef.current.style.height = 'auto';

    setTimeout(() => setMsgs(prev => ({
      ...prev,
      [selectedChat]: (prev[selectedChat] ?? []).map(m => m.id === msgId ? { ...m, status: 'sent' as MsgStatus } : m),
    })), 400);
    setTimeout(() => setMsgs(prev => ({
      ...prev,
      [selectedChat]: (prev[selectedChat] ?? []).map(m => m.id === msgId ? { ...m, status: 'delivered' as MsgStatus } : m),
    })), 1000);

    const replyDelay = 1400 + Math.random() * 1800;
    setTimeout(() => setIsTyping(true), 1200);
    setTimeout(() => {
      setIsTyping(false);
      const pool = AUTO_REPLIES[selectedChat] ?? ["Thanks! I'll get back to you soon 😊"];
      const replyText = pool[Math.floor(Math.random() * pool.length)];
      const replyTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const replyMsg: Msg = {
        id: Date.now() + 1, sender: 'them', type: 'text',
        text: replyText, time: replyTime, date: D_TODAY, status: 'read',
      };
      setMsgs(prev => ({ ...prev, [selectedChat]: [...(prev[selectedChat] ?? []), replyMsg] }));
      setConvs(prev => prev.map(c => c.id === selectedChat
        ? { ...c, lastMessage: { ...c.lastMessage, text: replyText, time: 'Just now', sender: 'them', unread: 0 } }
        : c
      ));
      setMsgs(prev => ({
        ...prev,
        [selectedChat]: (prev[selectedChat] ?? []).map(m =>
          m.sender === 'you' && (m.status === 'delivered' || m.status === 'sent')
            ? { ...m, status: 'read' as MsgStatus }
            : m
        ),
      }));
    }, 1200 + replyDelay);
  }, [newMsg, selectedChat, replyingTo, currentConv]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === 'Escape') setReplyingTo(null);
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMsg(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleShareProduct = (product: ProductCard) => {
    if (!selectedChat) return;
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newMsgObj: Msg = {
      id: Date.now(), sender: 'you', type: 'product',
      product, time: timeStr, date: D_TODAY, status: 'sent',
    };
    setMsgs(prev => ({ ...prev, [selectedChat]: [...(prev[selectedChat] ?? []), newMsgObj] }));
    setConvs(prev => prev.map(c => c.id === selectedChat
      ? { ...c, lastMessage: { ...c.lastMessage, text: `📦 ${product.name}`, time: 'Just now', sender: 'you', unread: 0 } }
      : c
    ));
    setShowProductModal(false);
    toast.success('Product shared!');
  };

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;
    const url = URL.createObjectURL(file);
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newMsgObj: Msg = {
      id: Date.now(), sender: 'you', type: 'image',
      imageUrl: url, time: timeStr, date: D_TODAY, status: 'sent',
    };
    setMsgs(prev => ({ ...prev, [selectedChat]: [...(prev[selectedChat] ?? []), newMsgObj] }));
    setConvs(prev => prev.map(c => c.id === selectedChat
      ? { ...c, lastMessage: { ...c.lastMessage, text: '📷 Photo', time: 'Just now', sender: 'you', unread: 0 } }
      : c
    ));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyMsg = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    toast.success('Copied to clipboard');
    setContextMenu(null);
  };

  const handleDeleteMsg = (msgId: number) => {
    if (!selectedChat) return;
    setMsgs(prev => {
      const updated = (prev[selectedChat] ?? []).filter(m => m.id !== msgId);
      const lastVisible = updated.filter(m => m.type !== 'system').slice(-1)[0];
      if (lastVisible) {
        const lastText =
          lastVisible.text ??
          (lastVisible.product ? `📦 ${lastVisible.product.name}` : null) ??
          (lastVisible.imageUrl ? '📷 Photo' : null) ??
          '';
        setConvs(cv => cv.map(c => c.id === selectedChat
          ? { ...c, lastMessage: { ...c.lastMessage, text: lastText, sender: lastVisible.sender } }
          : c
        ));
      }
      return { ...prev, [selectedChat]: updated };
    });
    setContextMenu(null);
    toast.success('Message deleted');
  };

  const handleReplyToMsg = (msgId: number) => {
    const msg = currentMsgs.find(m => m.id === msgId);
    if (!msg) { setContextMenu(null); return; }
    const preview =
      msg.text ??
      (msg.product ? `📦 ${msg.product.name}` : null) ??
      (msg.imageUrl ? '📷 Photo' : null) ??
      'Message';
    const senderName = msg.sender === 'you'
      ? 'You'
      : (msg.senderInfo?.name ?? currentConv?.user.name ?? 'Them');
    setReplyingTo({ id: msgId, text: preview, sender: msg.sender, senderName });
    setContextMenu(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleStarMsg = (msgId: number) => {
    setStarredMsgs(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) { next.delete(msgId); toast.success('Unstarred message'); }
      else { next.add(msgId); toast.success('Message starred'); }
      return next;
    });
    setContextMenu(null);
  };

  const handleForwardMsg = (msgId: number) => {
    const msg = currentMsgs.find(m => m.id === msgId);
    if (!msg) return;
    const text = msg.text ?? (msg.product ? msg.product.name : msg.imageUrl ? 'Photo' : '');
    navigator.clipboard.writeText(text).catch(() => {});
    toast.success('Forwarded to clipboard — paste in any conversation');
    setContextMenu(null);
  };

  const handleMsgTouchStart = (msgId: number, x: number, y: number) => {
    longPressRef.current = setTimeout(() => {
      longPressRef.current = null;
      setContextMenu({ msgId, x, y });
    }, 520);
  };

  const handleMsgTouchEnd = () => {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
  };

  const handleMuteConv = (convId: number) => {
    const conv = convs.find(c => c.id === convId);
    setConvs(prev => prev.map(c => c.id === convId ? { ...c, muted: !c.muted } : c));
    toast.success(conv?.muted ? 'Notifications unmuted' : 'Notifications muted');
    setConvMenu(null); setShowChatMenu(false);
  };

  const handlePinConv = (convId: number) => {
    const conv = convs.find(c => c.id === convId);
    setConvs(prev => prev.map(c => c.id === convId ? { ...c, pinned: !c.pinned } : c));
    toast.success(conv?.pinned ? 'Conversation unpinned' : 'Conversation pinned');
    setConvMenu(null);
  };

  const handleDeleteConv = (convId: number) => {
    setConvs(prev => prev.filter(c => c.id !== convId));
    if (selectedChat === convId) { setSelectedChat(null); setMobileView('list'); }
    setConvMenu(null); setShowChatMenu(false);
    toast.success('Conversation deleted');
  };

  const handleSelectContact = (
    convId: number | null,
    contact: { name: string; username: string; avatar: string; type: ConvType }
  ) => {
    setShowNewConv(false);
    if (convId) {
      selectChat(convId);
      return;
    }
    // Create new conversation
    const newId = Date.now();
    const newConv: Conv = {
      id: newId,
      user: { name: contact.name, username: contact.username, avatar: contact.avatar, online: false, verified: false, type: contact.type },
      lastMessage: { text: 'Say hello!', time: 'Now', unread: 0, sender: 'you' },
    };
    setConvs(prev => [newConv, ...prev]);
    setMsgs(prev => ({ ...prev, [newId]: [] }));
    selectChat(newId);
    toast.success(`Conversation with ${contact.name} started!`);
  };

  const handleCreateGroup = (name: string, members: GroupMember[]) => {
    setShowNewConv(false);
    const newId = Date.now();
    const firstMember = members[0];
    const newConv: Conv = {
      id: newId, isGroup: true, members,
      user: { name, username: `group_${newId}`, avatar: firstMember.avatar, online: true, verified: false, type: 'user' },
      lastMessage: { text: `Group created with ${members.length} members`, time: 'Now', unread: 0, sender: 'you' },
    };
    setConvs(prev => [newConv, ...prev]);
    setMsgs(prev => ({
      ...prev,
      [newId]: [
        { id: Date.now(), sender: 'them', type: 'system', text: D_TODAY, time: '', date: D_TODAY, status: 'read' },
      ],
    }));
    selectChat(newId);
    toast.success(`Group "${name}" created!`);
  };

  const handleCallback = (contact: CallRecord['contact'], type: 'audio' | 'video') => {
    setCallSession({ type, direction: 'outgoing', contact });
  };

  // ── Loading / Error ───────────────────────────────────────────────────────────

  if (isLoading) return <MessagesSkeleton />;

  if (hasError) {
    return (
      <div className="h-[calc(100vh-5.5rem)] md:h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-semibold text-foreground mb-2">Failed to load messages</h2>
          <p className="text-sm text-muted-foreground mb-5">Something went wrong. Please check your connection and try again.</p>
          <button
            onClick={() => { setHasError(false); setIsLoading(true); setTimeout(() => setIsLoading(false), 500); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--brand-gradient)' }}
          >
            <RefreshCw className="w-4 h-4" />Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="h-[calc(100vh-5.5rem)] md:h-[calc(100vh-4rem)] bg-background flex flex-col overflow-hidden">
      <SEO title={SEOConfigs.messages.title} description={SEOConfigs.messages.description} />

      {!isOnline && <OfflineBanner />}

      <div className="flex-1 flex overflow-hidden">

        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <div className={`
          w-full md:w-80 lg:w-96 bg-card border-r border-border flex flex-col shrink-0
          ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
        `}>

          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-foreground text-[17px]">Messages</h1>
                {totalUnread > 0 && (
                  <span className="min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1.5"
                    style={{ background: 'var(--brand-gradient)' }}>
                    {totalUnread}
                  </span>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); setShowNewConv(true); }}
                className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="New conversation"
              >
                <Edit3 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text" placeholder="Search conversations…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="px-4 py-2.5 flex gap-1.5 border-b border-border/50 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
            {(['all', 'unread', 'sellers', 'creators', 'calls'] as FilterTab[]).map(tab => (
              <button key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
                  filter === tab ? 'text-white shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                style={filter === tab ? { background: 'var(--brand-gradient)' } : {}}
              >
                {tab === 'all'      ? 'All' :
                 tab === 'unread'   ? `Unread${totalUnread > 0 ? ` (${totalUnread})` : ''}` :
                 tab === 'sellers'  ? 'Sellers' :
                 tab === 'creators' ? 'Creators' :
                 <>Calls{missedCalls > 0 && (
                   <span className={`min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-[9px] font-bold px-0.5 ${
                     filter === 'calls' ? 'bg-white/30 text-white' : 'bg-red-500 text-white'
                   }`}>{missedCalls}</span>
                 )}</>}
              </button>
            ))}
          </div>

          {/* ── Call History (when filter === 'calls') ── */}
          {filter === 'calls' ? (
            <div className="flex-1 overflow-y-auto py-2">
              {/* Call search */}
              {callHistory.length > 0 && (
                <div className="px-3 pb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search call history…"
                      value={callSearch}
                      onChange={e => setCallSearch(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 bg-input-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
                    />
                    {callSearch && (
                      <button onClick={() => setCallSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              {(() => {
                const filtered = callHistory.filter(r =>
                  !callSearch ||
                  r.contact.name.toLowerCase().includes(callSearch.toLowerCase()) ||
                  r.contact.username.toLowerCase().includes(callSearch.toLowerCase())
                );
                return filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <PhoneOff className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium text-foreground text-sm mb-1">
                    {callSearch ? `No results for "${callSearch}"` : 'No call history'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {callSearch ? 'Try a different name' : 'Start a call by tapping the phone icon in any chat'}
                  </p>
                  {callSearch && (
                    <button onClick={() => setCallSearch('')} className="mt-2 text-xs text-primary hover:underline">
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-0.5 px-2">
                  {filtered.map(record => {
                    const isMissed  = record.outcome === 'missed';
                    const isDeclined = record.outcome === 'declined';
                    const DirIcon   =
                      isMissed    ? PhoneMissed :
                      record.direction === 'incoming' ? PhoneIncoming : PhoneCall;
                    const dirColor  =
                      isMissed || isDeclined ? 'text-red-500' :
                      record.direction === 'incoming'  ? 'text-emerald-500' :
                      'text-blue-500';

                    return (
                      <div key={record.id}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-muted transition-colors group">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <img loading="lazy" src={record.contact.avatar} alt={record.contact.name}
                            className="w-11 h-11 rounded-full object-cover" />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-card flex items-center justify-center`}>
                            {record.type === 'video'
                              ? (isMissed || isDeclined)
                                ? <VideoOff className={`w-2.5 h-2.5 ${dirColor}`} />
                                : <Video className={`w-2.5 h-2.5 ${dirColor}`} />
                              : <DirIcon className={`w-2.5 h-2.5 ${dirColor}`} />
                            }
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-foreground truncate">{record.contact.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[11px] font-medium ${dirColor}`}>
                              {record.direction === 'incoming' ? 'Incoming' : 'Outgoing'} {record.type}
                            </span>
                            {(isMissed || isDeclined) && (
                              <span className={`text-[10px] font-medium ${dirColor}`}>
                                · {isMissed ? 'Missed' : 'Declined'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {record.time}{record.duration ? ` · ${record.duration}` : ''}
                          </p>
                        </div>

                        {/* Callback buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => handleCallback(record.contact, 'audio')}
                            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-primary/10 text-primary transition-colors"
                            aria-label="Call back (audio)"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCallback(record.contact, 'video')}
                            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-primary/10 text-primary transition-colors"
                            aria-label="Call back (video)"
                          >
                            <Video className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
              })()}
            </div>
          ) : (
            /* ── Conversation list ── */
            <div className="flex-1 overflow-y-auto py-1.5">
              {filteredConvs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <p className="font-medium text-foreground text-sm mb-1">
                    {search ? 'No results found' : 'No conversations yet'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {search ? `No matches for "${search}"` : 'Start a new conversation to begin chatting'}
                  </p>
                  {search ? (
                    <button onClick={() => setSearch('')} className="mt-3 text-xs text-primary hover:underline">
                      Clear search
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowNewConv(true)}
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <UserPlus className="w-3 h-3" /> New conversation
                    </button>
                  )}
                </div>
              ) : (
                filteredConvs.map(conv => (
                  <div key={conv.id} className="relative group/convitem">
                    <button
                      onClick={() => selectChat(conv.id)}
                      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setConvMenu(convMenu === conv.id ? null : conv.id); }}
                      className={`w-[calc(100%-1rem)] mx-2 my-0.5 px-3 py-2.5 flex items-start gap-3 rounded-2xl transition-all ${
                        selectedChat === conv.id
                          ? 'bg-primary/8 border border-primary/15'
                          : 'hover:bg-muted border border-transparent'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {conv.isGroup && conv.members ? (
                          <GroupAvatar members={conv.members} />
                        ) : (
                          <img loading="lazy" src={conv.user.avatar} alt={conv.user.name}
                            className="w-11 h-11 rounded-full object-cover" />
                        )}
                        {conv.user.online && !conv.isGroup && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
                        )}
                        {conv.isGroup && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-card flex items-center justify-center">
                            <Users className="w-2.5 h-2.5 text-muted-foreground" />
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            {conv.pinned && <Pin className="w-2.5 h-2.5 text-muted-foreground/40 shrink-0" />}
                            <span className={`text-[13px] truncate ${
                              conv.lastMessage.unread > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                            }`}>{conv.user.name}</span>
                            {!conv.isGroup && conv.user.verified && (
                              <span className="shrink-0">
                                <VerifiedBadge size="sm" variant={conv.user.type === 'seller' ? 'seller' : 'user'} />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-1.5">{conv.lastMessage.time}</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs truncate leading-relaxed ${
                            conv.lastMessage.unread > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                          }`}>
                            {conv.lastMessage.sender === 'you' && !conv.isGroup && (
                              <span className="text-muted-foreground/60">You: </span>
                            )}
                            {conv.lastMessage.text}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            {conv.muted && <BellOff className="w-3 h-3 text-muted-foreground/35" />}
                            {conv.lastMessage.unread > 0 && (
                              <span className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                                style={{ background: 'var(--brand-gradient)' }}>
                                {conv.lastMessage.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* 3-dot menu trigger — always visible on mobile, hover on desktop */}
                    <button
                      onClick={e => { e.stopPropagation(); setConvMenu(convMenu === conv.id ? null : conv.id); }}
                      aria-label="Conversation options"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-card hover:bg-muted text-muted-foreground transition-all z-10 opacity-100 md:opacity-0 md:group-hover/convitem:opacity-100 shadow-sm border border-border/50"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Conv context menu */}
                    {convMenu === conv.id && (
                      <div
                        className="absolute right-3 top-full mt-1 z-30 bg-card border border-border rounded-2xl shadow-xl py-1.5 min-w-[164px]"
                        onClick={e => e.stopPropagation()}
                      >
                        {conv.lastMessage.unread > 0 && (
                          <button onClick={() => {
                            setConvs(prev => prev.map(c => c.id === conv.id ? { ...c, lastMessage: { ...c.lastMessage, unread: 0 } } : c));
                            setConvMenu(null);
                            toast.success('Marked as read');
                          }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-foreground hover:bg-muted transition-colors">
                            <CheckCheck className="w-4 h-4 text-muted-foreground" />Mark as read
                          </button>
                        )}
                        <button onClick={() => handlePinConv(conv.id)}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-foreground hover:bg-muted transition-colors">
                          <Pin className="w-4 h-4 text-muted-foreground" />
                          {conv.pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button onClick={() => handleMuteConv(conv.id)}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-foreground hover:bg-muted transition-colors">
                          {conv.muted ? <BellRing className="w-4 h-4 text-muted-foreground" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
                          {conv.muted ? 'Unmute' : 'Mute'}
                        </button>
                        <div className="h-px bg-border/50 my-1" />
                        <button onClick={() => handleDeleteConv(conv.id)}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-destructive hover:bg-muted transition-colors">
                          <Trash2 className="w-4 h-4" />Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Chat Area ──────────────────────────────────────────────────────── */}
        <div className={`
          flex-1 flex flex-col min-w-0 bg-background
          ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
        `}>
          {currentConv ? (
            <>
              {/* Chat header */}
              <div className="bg-card border-b border-border px-3 py-2.5 flex items-center gap-2 shrink-0">
                {/* Back (mobile) */}
                <button onClick={() => setMobileView('list')}
                  className="md:hidden p-2 -ml-1 rounded-xl hover:bg-muted transition-colors shrink-0" aria-label="Back">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>

                {/* User / Group info */}
                {currentConv.isGroup ? (
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 rounded-xl p-1.5 -ml-1.5">
                    <GroupAvatar members={currentConv.members ?? []} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground text-[13px] truncate">{currentConv.user.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">Group</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {currentConv.members?.map(m => m.name.split(' ')[0]).join(', ')} + you
                      </p>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/profile/${currentConv.user.username}`}
                    className="flex items-center gap-2.5 flex-1 min-w-0 rounded-xl p-1.5 -ml-1.5 hover:bg-muted transition-colors"
                  >
                    <div className="relative shrink-0">
                      <img loading="lazy" src={currentConv.user.avatar} alt={currentConv.user.name}
                        className="w-9 h-9 rounded-full object-cover" />
                      {currentConv.user.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground text-[13px] truncate">{currentConv.user.name}</span>
                        {currentConv.user.verified && (
                          <VerifiedBadge size="sm" variant={currentConv.user.type === 'seller' ? 'seller' : 'user'} />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        {currentConv.user.online ? (
                          <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active now</>
                        ) : (
                          currentConv.user.lastSeen ?? 'Offline'
                        )}
                      </p>
                    </div>
                  </Link>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    aria-label="Voice call"
                    onClick={() => initCall('audio')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    aria-label="Video call"
                    onClick={() => initCall('video')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Video className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {/* More menu */}
                  <div className="relative">
                    <button aria-label="More options"
                      onClick={e => { e.stopPropagation(); setShowChatMenu(s => !s); }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {showChatMenu && (
                      <div className="absolute right-0 top-full mt-1 z-30 bg-card border border-border rounded-2xl shadow-xl py-1.5 min-w-[168px]"
                        onClick={e => e.stopPropagation()}>
                        {!currentConv.isGroup && (
                          <Link to={`/profile/${currentConv.user.username}`} onClick={() => setShowChatMenu(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />View Profile
                          </Link>
                        )}
                        {currentConv.isGroup && (
                          <button onClick={() => { toast.info(`${currentConv.user.name} · ${currentConv.members?.length} members`); setShowChatMenu(false); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors">
                            <Users className="w-4 h-4 text-muted-foreground" />View Members
                          </button>
                        )}
                        <button onClick={() => { handleMuteConv(selectedChat!); setShowChatMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors">
                          {currentConv.muted
                            ? <BellRing className="w-4 h-4 text-muted-foreground" />
                            : <BellOff className="w-4 h-4 text-muted-foreground" />}
                          {currentConv.muted ? 'Unmute' : 'Mute'}
                        </button>
                        <div className="h-px bg-border/50 my-1" />
                        <button onClick={() => { toast.info('Reported'); setShowChatMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-muted-foreground hover:bg-muted transition-colors">
                          <Flag className="w-4 h-4" />Report
                        </button>
                        <button onClick={() => handleDeleteConv(selectedChat!)}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-destructive hover:bg-muted transition-colors">
                          <Trash2 className="w-4 h-4" />Delete Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5"
                onClick={() => { setContextMenu(null); setConvMenu(null); setShowChatMenu(false); }}>
                {currentMsgs.map((msg, idx) => {
                  const prev    = currentMsgs[idx - 1];
                  const prevSenderKey = prev?.senderInfo?.name ?? prev?.sender;
                  const curSenderKey  = msg.senderInfo?.name  ?? msg.sender;
                  const grouped = !!(prev && prevSenderKey === curSenderKey && prev.type !== 'system' && msg.type !== 'system');

                  if (msg.type === 'system') {
                    return (
                      <div key={msg.id} className="flex items-center gap-3 py-3">
                        <div className="flex-1 h-px bg-border/40" />
                        <span className="text-[11px] text-muted-foreground/55 font-medium px-1 shrink-0">{msg.text}</span>
                        <div className="flex-1 h-px bg-border/40" />
                      </div>
                    );
                  }

                  const isMine      = msg.sender === 'you';
                  const senderAvatar = msg.senderInfo?.avatar ?? currentConv.user.avatar;

                  return (
                    <div key={msg.id} className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-0.5' : 'mt-3'}`}>
                      {/* Avatar (them) */}
                      {!isMine && (
                        <div className="shrink-0 self-end mb-1 w-7">
                          {!grouped ? (
                            <img loading="lazy" src={senderAvatar} alt=""
                              className="w-7 h-7 rounded-full object-cover" />
                          ) : null}
                        </div>
                      )}

                      <div className={`max-w-[72%] sm:max-w-[65%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        {/* Group sender name */}
                        {!isMine && currentConv.isGroup && !grouped && msg.senderInfo && (
                          <span className="text-[11px] font-semibold text-muted-foreground mb-1 ml-0.5">
                            {msg.senderInfo.name}
                          </span>
                        )}

                        {/* Reply quote */}
                        {msg.replyTo && (
                          <div className={`max-w-full border-l-2 border-primary/60 bg-muted/50 rounded-lg px-2.5 py-1.5 mb-1 ${
                            isMine ? 'self-end' : 'self-start'
                          }`}>
                            <p className="text-[10px] font-semibold text-primary/80 mb-0.5">{msg.replyTo.senderName}</p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{msg.replyTo.text}</p>
                          </div>
                        )}

                        {/* Product card */}
                        {msg.type === 'product' && msg.product && (
                          <div
                            className="block bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-1 w-60"
                            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ msgId: msg.id, x: e.clientX, y: e.clientY }); }}
                            onTouchStart={e => { const t = e.touches[0]; handleMsgTouchStart(msg.id, t.clientX, t.clientY); }}
                            onTouchEnd={handleMsgTouchEnd}
                            onTouchMove={handleMsgTouchEnd}
                          >
                            <Link to={`/product/${msg.product.id}`} onClick={e => e.stopPropagation()}>
                              <img loading="lazy" src={msg.product.image} alt={msg.product.name}
                                className="w-full h-32 object-cover" />
                            </Link>
                            <div className="p-3">
                              <p className="text-[13px] font-semibold text-foreground line-clamp-1 mb-0.5">{msg.product.name}</p>
                              <p className="text-xs text-muted-foreground mb-2">{msg.product.store}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[15px] text-foreground">${msg.product.price}</span>
                                  {msg.product.originalPrice && (
                                    <span className="text-xs text-muted-foreground line-through">${msg.product.originalPrice}</span>
                                  )}
                                </div>
                                <Link to={`/product/${msg.product.id}`} onClick={e => e.stopPropagation()}
                                  className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-lg hover:opacity-90 transition-opacity"
                                  style={{ background: 'var(--brand-gradient)' }}>View →</Link>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Order card */}
                        {msg.type === 'order' && msg.order && (
                          <div className="bg-card border border-border rounded-2xl p-3 shadow-sm mb-1 w-60"
                            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ msgId: msg.id, x: e.clientX, y: e.clientY }); }}
                            onTouchStart={e => { const t = e.touches[0]; handleMsgTouchStart(msg.id, t.clientX, t.clientY); }}
                            onTouchEnd={handleMsgTouchEnd}
                            onTouchMove={handleMsgTouchEnd}
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2 mb-2.5">
                              <Package className="w-4 h-4 text-primary shrink-0" />
                              <span className="text-[12px] font-semibold text-foreground">Order Update</span>
                              <Badge className="ml-auto text-[9px] px-1.5 py-0 h-4">{msg.order.status}</Badge>
                            </div>
                            <div className="flex gap-2.5 mb-2.5">
                              <img loading="lazy" src={msg.order.image} alt={msg.order.product}
                                className="w-14 h-14 rounded-xl object-cover shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[12px] font-medium text-foreground line-clamp-2 leading-tight mb-1">{msg.order.product}</p>
                                <p className="text-[10px] text-muted-foreground">{msg.order.id}</p>
                                {msg.order.tracking && (
                                  <p className="text-[10px] text-primary mt-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                                    {msg.order.tracking}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Link
                              to="/orders"
                              onClick={e => e.stopPropagation()}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-[11px] font-semibold text-foreground transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />Track Order
                            </Link>
                          </div>
                        )}

                        {/* Image */}
                        {msg.type === 'image' && msg.imageUrl && (
                          <div className="mb-1 rounded-2xl overflow-hidden max-w-[240px] shadow-sm cursor-pointer group/img relative"
                            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ msgId: msg.id, x: e.clientX, y: e.clientY }); }}
                            onTouchStart={e => { const t = e.touches[0]; handleMsgTouchStart(msg.id, t.clientX, t.clientY); }}
                            onTouchEnd={handleMsgTouchEnd}
                            onTouchMove={handleMsgTouchEnd}
                            onClick={e => { e.stopPropagation(); setLightboxImage(msg.imageUrl!); }}>
                            <img loading="lazy" src={msg.imageUrl} alt="Shared image"
                              className="w-full object-cover max-h-56 hover:brightness-95 transition-all" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/10">
                              <ZoomIn className="w-6 h-6 text-white drop-shadow" />
                            </div>
                          </div>
                        )}

                        {/* Text */}
                        {msg.type === 'text' && msg.text && (
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words select-text relative ${
                              isMine
                                ? 'text-white rounded-br-md'
                                : 'bg-card border border-border text-foreground rounded-bl-md shadow-sm'
                            } ${grouped && isMine ? 'rounded-tr-md' : ''} ${grouped && !isMine ? 'rounded-tl-md' : ''}`}
                            style={isMine ? { background: 'var(--brand-gradient)' } : {}}
                            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ msgId: msg.id, x: e.clientX, y: e.clientY }); }}
                            onTouchStart={e => { const t = e.touches[0]; handleMsgTouchStart(msg.id, t.clientX, t.clientY); }}
                            onTouchEnd={handleMsgTouchEnd}
                            onTouchMove={handleMsgTouchEnd}
                          >
                            {msg.text}
                            {starredMsgs.has(msg.id) && (
                              <Star className="inline-block w-2.5 h-2.5 ml-1.5 opacity-60 fill-current" />
                            )}
                          </div>
                        )}

                        {/* Time + status */}
                        {msg.time && (
                          <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] text-muted-foreground/50">{msg.time}</span>
                            {isMine && (
                              msg.status === 'sending'   ? <Clock     className="w-3 h-3 text-muted-foreground/35" /> :
                              msg.status === 'sent'      ? <Check     className="w-3 h-3 text-muted-foreground/50" /> :
                              msg.status === 'delivered' ? <CheckCheck className="w-3 h-3 text-muted-foreground/50" /> :
                                                           <CheckCheck className="w-3 h-3 text-primary" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="mt-3">
                    <TypingIndicator
                      avatar={currentConv.members?.[0]?.avatar ?? currentConv.user.avatar}
                      name={currentConv.isGroup ? (currentConv.members?.[0]?.name?.split(' ')[0]) : undefined}
                    />
                  </div>
                )}

                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Input area */}
              <div className="bg-card/95 backdrop-blur-xl border-t border-border shrink-0"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                {/* Reply preview strip */}
                {replyingTo && (
                  <div className="flex items-center gap-2 px-3 pt-2.5 pb-0">
                    <CornerDownRight className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <div className="flex-1 min-w-0 bg-primary/8 border border-primary/20 rounded-xl px-3 py-1.5">
                      <p className="text-[11px] font-semibold text-primary mb-0.5">
                        {replyingTo.senderName ?? (replyingTo.sender === 'you' ? 'You' : currentConv.user.name)}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{replyingTo.text}</p>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0 text-muted-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2 px-3 py-2.5">
                  {/* Attachment actions */}
                  <div className="flex shrink-0 pb-0.5 gap-0.5">
                    <label aria-label="Attach image"
                      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors cursor-pointer">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageAttach} className="hidden" />
                    </label>
                    <button aria-label="Share product"
                      onClick={e => { e.stopPropagation(); setShowProductModal(true); }}
                      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Input field */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={newMsg}
                      onChange={handleTextInput}
                      onKeyDown={handleKeyDown}
                      placeholder={replyingTo ? `Reply to ${replyingTo.sender === 'you' ? 'yourself' : currentConv.user.name}…` : 'Type a message…'}
                      rows={1}
                      disabled={!isOnline}
                      className="w-full px-4 py-2.5 pr-10 bg-input-background border border-border rounded-2xl text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground transition-all leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ minHeight: '42px', maxHeight: '120px' }}
                    />
                    <button
                      ref={emojiBtnRef}
                      type="button" aria-label="Emoji picker"
                      onClick={e => {
                        e.stopPropagation();
                        if (emojiBtnRef.current) {
                          const r = emojiBtnRef.current.getBoundingClientRect();
                          setEmojiPos({
                            bottom: window.innerHeight - r.top + 10,
                            right: Math.max(8, window.innerWidth - r.right + r.width / 2 - 120),
                          });
                        }
                        setShowEmoji(s => !s);
                      }}
                      className="absolute right-2.5 bottom-[9px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Send */}
                  <button
                    onClick={handleSend}
                    disabled={!newMsg.trim() || !isOnline}
                    aria-label="Send message"
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0"
                    style={{ background: 'var(--brand-gradient)' }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No chat selected */
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-xs">
                <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5">
                  <MessageCircle className="w-9 h-9 text-muted-foreground/50" />
                </div>
                <p className="font-semibold text-foreground mb-2">Select a conversation</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Choose a conversation from the list or start a new one to begin chatting
                </p>
                <button
                  onClick={() => setShowNewConv(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  <Edit3 className="w-4 h-4" />New Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Overlays ─────────────────────────────────────────────────────────── */}

      {showProductModal && (
        <ProductShareModal onClose={() => setShowProductModal(false)} onShare={handleShareProduct} />
      )}

      {showNewConv && (
        <NewConvModal
          onClose={() => setShowNewConv(false)}
          existingConvs={convs}
          onSelectContact={handleSelectContact}
          onCreateGroup={handleCreateGroup}
        />
      )}

      {showEmoji && (
        <div
          className="fixed z-40 bg-card border border-border rounded-2xl shadow-2xl p-2.5"
          style={{ bottom: `${emojiPos.bottom}px`, right: `${emojiPos.right}px` }}
          onClick={e => e.stopPropagation()}
        >
          <div className="grid grid-cols-6 gap-0.5">
            {EMOJIS.map(emoji => (
              <button key={emoji} type="button" aria-label={emoji}
                onClick={() => {
                  setNewMsg(prev => prev + emoji);
                  setShowEmoji(false);
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted text-lg transition-colors active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message context menu */}
      {contextMenu && (() => {
        const msg = currentMsgs.find(m => m.id === contextMenu.msgId);
        const winW = typeof window !== 'undefined' ? window.innerWidth  : 400;
        const winH = typeof window !== 'undefined' ? window.innerHeight : 600;
        const menuW = 172;
        const menuH = 260;
        return (
          <div
            className="fixed z-50 bg-card border border-border rounded-2xl shadow-2xl py-1.5 min-w-[172px]"
            style={{
              left: Math.min(Math.max(8, contextMenu.x), winW - menuW - 8),
              top:  Math.min(Math.max(8, contextMenu.y), winH - menuH - 8),
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Reply */}
            {(msg?.type === 'text' || msg?.type === 'image' || msg?.type === 'product') && (
              <button onClick={() => handleReplyToMsg(contextMenu.msgId)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors">
                <Reply className="w-4 h-4 text-muted-foreground" />Reply
              </button>
            )}
            {/* Copy text */}
            {msg?.type === 'text' && msg.text && (
              <button onClick={() => handleCopyMsg(msg.text!)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors">
                <Copy className="w-4 h-4 text-muted-foreground" />Copy text
              </button>
            )}
            {/* Forward */}
            {(msg?.type === 'text' || msg?.type === 'product') && (
              <button onClick={() => handleForwardMsg(contextMenu.msgId)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors">
                <Forward className="w-4 h-4 text-muted-foreground" />Forward
              </button>
            )}
            {/* Star */}
            <button onClick={() => handleStarMsg(contextMenu.msgId)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-foreground hover:bg-muted transition-colors">
              <Star className={`w-4 h-4 ${starredMsgs.has(contextMenu.msgId) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
              {starredMsgs.has(contextMenu.msgId) ? 'Unstar' : 'Star'}
            </button>
            {msg?.sender === 'you' && (
              <>
                <div className="h-px bg-border/50 my-1" />
                <button onClick={() => handleDeleteMsg(contextMenu.msgId)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-destructive hover:bg-muted transition-colors">
                  <Trash2 className="w-4 h-4" />Delete
                </button>
              </>
            )}
            {msg?.sender === 'them' && (
              <>
                <div className="h-px bg-border/50 my-1" />
                <button onClick={() => { toast.info('Message reported'); setContextMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-muted-foreground hover:bg-muted transition-colors">
                  <Flag className="w-4 h-4" />Report
                </button>
              </>
            )}
          </div>
        );
      })()}

      {/* Call screen overlay */}
      {callSession && (
        <CallScreen
          session={callSession}
          onEnd={handleCallEnd}
        />
      )}

      {/* Image lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="Close image"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
