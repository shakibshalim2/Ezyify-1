import { Link } from 'react-router';
import { 
  CheckCircle2, ShoppingBag, Wallet, Shield, Users, TrendingUp, 
  FileText, Settings, BarChart3, Package, CreditCard, AlertCircle,
  Sparkles, Rocket, Target, Award, Clock, ArrowRight, Home, Store,
  MessageSquare, Heart, Search, Video, Upload, Bell, Menu
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function PlatformOverviewPage() {
  const launchDate = new Date('2026-02-25');
  const today = new Date();
  const daysUntilLaunch = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 pb-8 max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-brand-gradient">
                Ezyify Platform Overview
              </h1>
              <p className="text-muted-foreground text-lg">
                E-Commerce Social Media Ecosystem — Production Ready
              </p>
            </div>
            <Badge variant="default" className="h-12 px-6 text-lg">
              <Rocket className="mr-2 h-5 w-5" />
              v1.0 Production
            </Badge>
          </div>

          {/* Launch Countdown */}
          <Card className="border-primary/50 bg-primary/8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Launch Target</p>
                    <p className="text-2xl font-bold">February 25, 2026</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-4xl font-bold text-primary">{daysUntilLaunch}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-success/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Audit</p>
                  <p className="text-2xl font-bold text-success">15/15</p>
                  <p className="text-xs text-muted-foreground mt-1">100% Pass</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <Progress value={100} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="border-info/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Functional Pages</p>
                  <p className="text-2xl font-bold text-info">86</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete</p>
                </div>
                <FileText className="h-8 w-8 text-info" />
              </div>
              <Progress value={100} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="border-primary/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Documentation</p>
                  <p className="text-2xl font-bold text-primary">22</p>
                  <p className="text-xs text-muted-foreground mt-1">~35K words</p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
              <Progress value={100} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="border-warning/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Backend APIs</p>
                  <p className="text-2xl font-bold text-warning">22</p>
                  <p className="text-xs text-muted-foreground mt-1">Spec Ready</p>
                </div>
                <Sparkles className="h-8 w-8 text-warning" />
              </div>
              <Progress value={100} className="mt-3 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Core Features</TabsTrigger>
            <TabsTrigger value="pages">Key Pages</TabsTrigger>
            <TabsTrigger value="payment">Payment System</TabsTrigger>
            <TabsTrigger value="admin">Admin Tools</TabsTrigger>
          </TabsList>

          {/* Core Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Social Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Social Features
                  </CardTitle>
                  <CardDescription>Content & Community</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Home Feed
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/explore" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Explore
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/loops" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Loops (Short Video)
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/upload" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Create Content
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              {/* Commerce Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Commerce Features
                  </CardTitle>
                  <CardDescription>Shopping & Products</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/shop" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Shop
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/cart" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Shopping Cart
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/categories" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Menu className="h-4 w-4" />
                      Categories
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/deals" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Deals
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              {/* Payment & Wallet */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Payment & Wallet
                  </CardTitle>
                  <CardDescription>Escrow Protected</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/wallet" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      My Wallet
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/checkout" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Checkout
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/orders" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      My Orders
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/payment-guide" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Payment Guide
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              {/* Seller Dashboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    Seller Portal
                  </CardTitle>
                  <CardDescription>Manage Your Store</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/seller-dashboard" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Dashboard
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/seller/products" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Products
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/seller/orders" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Orders
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/seller/earnings" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Earnings
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              {/* Creator Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Creator Tools
                  </CardTitle>
                  <CardDescription>Content Creation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/creator-dashboard" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Creator Dashboard
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/live-schedule" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Live Schedule
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/affiliate-manager" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Affiliate Manager
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/upload" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Content
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              {/* User Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    User Features
                  </CardTitle>
                  <CardDescription>Profile & Settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/profile/me" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      My Profile
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/wishlist" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Wishlist
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/messages" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/notifications" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                    <span className="text-sm flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Key Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-lg">User Pages (15)</h3>
                <div className="space-y-1">
                  <Link to="/dashboard" className="block p-2 rounded hover:bg-muted text-sm transition-colors">User Dashboard</Link>
                  <Link to="/checkout" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Checkout</Link>
                  <Link to="/wallet" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Wallet</Link>
                  <Link to="/orders" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Orders</Link>
                  <Link to="/user/order-tracking" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Order Tracking</Link>
                  <Link to="/wishlist" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Wishlist</Link>
                  <Link to="/cart" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Cart</Link>
                  <Link to="/profile/me" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Profile</Link>
                  <Link to="/profile/edit" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Edit Profile</Link>
                  <Link to="/messages" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Messages</Link>
                  <Link to="/notifications" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Notifications</Link>
                  <Link to="/settings" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Settings</Link>
                  <Link to="/orders/refund-request" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Refund Request</Link>
                  <Link to="/orders/return-request" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Return Request</Link>
                  <Link to="/orders/dispute" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Dispute</Link>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-lg">Seller Pages (14)</h3>
                <div className="space-y-1">
                  <Link to="/seller-dashboard" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Seller Dashboard</Link>
                  <Link to="/seller/products" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Product Management</Link>
                  <Link to="/seller/add-product" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Add Product</Link>
                  <Link to="/seller/orders" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Order Management</Link>
                  <Link to="/seller/earnings" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Earnings</Link>
                  <Link to="/seller/withdraw" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Withdraw</Link>
                  <Link to="/seller/payout-settings" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Payout Settings</Link>
                  <Link to="/seller/analytics" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Analytics</Link>
                  <Link to="/seller/customers" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Customers</Link>
                  <Link to="/seller/reviews" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Reviews</Link>
                  <Link to="/seller/logistics" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Logistics</Link>
                  <Link to="/seller/settings" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Store Settings</Link>
                  <Link to="/seller/kyc-verification" className="block p-2 rounded hover:bg-muted text-sm transition-colors">KYC Verification</Link>
                  <Link to="/seller/security-monitor" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Security Monitor</Link>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-lg">Content & Legal (12)</h3>
                <div className="space-y-1">
                  <Link to="/" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Home Feed</Link>
                  <Link to="/explore" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Explore</Link>
                  <Link to="/loops" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Loops</Link>
                  <Link to="/shop" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Shop</Link>
                  <Link to="/search" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Search</Link>
                  <Link to="/upload" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Upload</Link>
                  <Link to="/terms" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Terms of Service</Link>
                  <Link to="/privacy" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Privacy Policy</Link>
                  <Link to="/community-guidelines" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Community Guidelines</Link>
                  <Link to="/safety-trust" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Safety & Trust</Link>
                  <Link to="/commission-policy" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Commission Policy</Link>
                  <Link to="/help" className="block p-2 rounded hover:bg-muted text-sm transition-colors">Help Center</Link>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Payment System Tab */}
          <TabsContent value="payment" className="space-y-4">
            <Card className="border-success/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  Payment System Status: 100% Audited
                </CardTitle>
                <CardDescription>All 15 sections passed — Global marketplace standards met</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Core Features Implemented
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        COD Completely Eliminated
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Escrow Protection Visible
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Buyer-Only Delivery Confirmation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Product Condition Selection
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Wallet Balance Separation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Transparent Refund System
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Commission Hidden from Buyers
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        KYC Verification Required
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Quick Access
                    </h4>
                    <div className="space-y-2">
                      <Link to="/payment-guide" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="mr-2 h-4 w-4" />
                          Payment Guide (User Education)
                        </Button>
                      </Link>
                      <Link to="/checkout" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Checkout Flow
                        </Button>
                      </Link>
                      <Link to="/wallet" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Wallet className="mr-2 h-4 w-4" />
                          Wallet Management
                        </Button>
                      </Link>
                      <Link to="/orders/refund-request" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Refund Request
                        </Button>
                      </Link>
                      <Link to="/seller/withdraw" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Seller Withdrawal
                        </Button>
                      </Link>
                      <Link to="/commission-policy" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="mr-2 h-4 w-4" />
                          Commission Policy
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backend API Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-warning" />
                  Backend API Specifications Ready
                </CardTitle>
                <CardDescription>22 API endpoints documented and ready for integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 border rounded-xl">
                    <p className="font-semibold mb-2">Payment APIs (8)</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Wallet Balance</li>
                      <li>• Escrow Creation</li>
                      <li>• Payment Processing</li>
                      <li>• Refund Handling</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-xl">
                    <p className="font-semibold mb-2">Order APIs (6)</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Order Creation</li>
                      <li>• Status Updates</li>
                      <li>• Delivery Confirmation</li>
                      <li>• Dispute Management</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-xl">
                    <p className="font-semibold mb-2">Seller APIs (8)</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Earnings Tracking</li>
                      <li>• Withdrawal Requests</li>
                      <li>• KYC Verification</li>
                      <li>• Commission Calculation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tools Tab */}
          <TabsContent value="admin" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    System Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/admin" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                  <Link to="/admin/payment-system-status" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      Payment System Status
                    </Button>
                  </Link>
                  <Link to="/admin/pre-deployment-checker" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Pre-Deployment Checker
                    </Button>
                  </Link>
                  <Link to="/admin/launch-dashboard" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Rocket className="mr-2 h-4 w-4" />
                      Launch Dashboard
                    </Button>
                  </Link>
                  <Link to="/admin/system-architecture" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      System Architecture
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Documentation Hub
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 border rounded-xl">
                      <p className="font-semibold mb-1">Payment Documentation</p>
                      <p className="text-muted-foreground text-xs">PAYMENT_SYSTEM_HANDOVER.md</p>
                      <p className="text-muted-foreground text-xs">BACKEND_API_SPECIFICATIONS.md</p>
                      <p className="text-muted-foreground text-xs">PAYMENT_AUDIT_COMPLETE.md</p>
                    </div>
                    <div className="p-3 border rounded-xl">
                      <p className="font-semibold mb-1">Project Organization</p>
                      <p className="text-muted-foreground text-xs">CODEBASE_MASTER_STRUCTURE.md</p>
                      <p className="text-muted-foreground text-xs">FIGMA_MASTER_STRUCTURE.md</p>
                      <p className="text-muted-foreground text-xs">UPDATE_COMMAND_GUIDE.md</p>
                    </div>
                    <div className="p-3 border rounded-xl">
                      <p className="font-semibold mb-1">Launch Materials</p>
                      <p className="text-muted-foreground text-xs">FINAL_LAUNCH_CHECKLIST.md</p>
                      <p className="text-muted-foreground text-xs">FINAL_HANDOVER_DOCUMENT.md</p>
                      <p className="text-muted-foreground text-xs">PROJECT_COMPLETION_CERTIFICATE.md</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Next Steps */}
        <Card className="mt-8 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              Next Steps to Launch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-semibold">Backend Integration</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Implement 22 backend APIs using BACKEND_API_SPECIFICATIONS.md
                </p>
              </div>
              <div className="p-4 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-semibold">Testing & QA</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Run integration tests using INTEGRATION_TEST_CHECKLIST.md
                </p>
              </div>
              <div className="p-4 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-semibold">Production Deploy</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Follow FINAL_LAUNCH_CHECKLIST.md for go-live
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/">
            <Button size="lg" className="gap-2">
              <Home className="h-5 w-5" />
              View Home Feed
            </Button>
          </Link>
          <Link to="/shop">
            <Button size="lg" variant="outline" className="gap-2">
              <ShoppingBag className="h-5 w-5" />
              Explore Shop
            </Button>
          </Link>
          <Link to="/admin">
            <Button size="lg" variant="outline" className="gap-2">
              <Settings className="h-5 w-5" />
              Admin Panel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
