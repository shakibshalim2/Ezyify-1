import React, { lazy, Suspense, useEffect, useState, memo } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { EzyifyContext } from '@ezyify/core';
import { createWebRuntime } from './runtime';
import { Toaster } from './components/ui/sonner';
import { PageTransition } from './components/primitives/PageTransition';
import { SplashScreen, shouldShowSplash } from './features/splash/SplashScreen';
import { hasSeenOnboarding } from './features/onboarding/OnboardingPage';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import { Analytics } from './components/Analytics';
import InstallPrompt from './components/InstallPrompt';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RouteAwareLoader } from './components/RouteAwareLoader';
import { CookieConsent } from './components/CookieConsent';
import { registerPwa } from './pwa';
import { initializeOptimizations } from './utils/advancedPerformance';
import { initializeManualTriggers } from './utils/systemTriggers';
import { logPlatformStatus } from './console-status';
import { displayLaunchStatusBanner, showLaunchReminder } from './utils/launchStatusBanner';
import { markInitializationComplete } from './utils/initializationGuard';
import { initProductionCleanupValidator } from './utils/productionCleanupValidator';
import { initProductionAuditHelper } from './utils/productionAuditHelper';

import { isPreviewMode } from './utils/previewModeIsolation';
import { devRoutes } from './routes/devRoutes';

// Initialize browser compatibility check immediately - SKIP IN PREVIEW
// Minimal safe module-level init — no DOM manipulation, no timers that overwrite content
if (typeof window !== 'undefined') {
  try {
    // Deferred non-critical validators — low priority, won't block render
    if (import.meta.env.DEV && typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        try { initProductionCleanupValidator(); } catch (e) {}
        try { initProductionAuditHelper(); } catch (e) {}
      }, { timeout: 10000 });
    }
  } catch (error) {
    // Silent — never block startup
  }
}

// Eager load critical pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OnboardingPage from './features/onboarding/OnboardingPage';

// Lazy load all other pages with error handling
const createLazyComponent = (importFn: () => Promise<any>) => {
  return lazy(() => importFn().catch(err => {
    console.error('Failed to load component:', err);
    // Return a fallback component instead of failing
    return {
      default: () => (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Page Loading Error</h1>
            <p className="text-muted-foreground">Unable to load this page. Please refresh to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    };
  }));
};

// High-priority pages (likely to be accessed first)
const ExplorePage = createLazyComponent(() => import('./pages/ExplorePage'));
const ShopPage = createLazyComponent(() => import('./pages/ShopPage'));
const LivePage = createLazyComponent(() => import('./pages/LivePage'));
const SearchPage = createLazyComponent(() => import('./pages/SearchPage'));
const ProfilePage = createLazyComponent(() => import('./pages/ProfilePage'));
const CartPage = createLazyComponent(() => import('./pages/CartPage'));
const MessagesPage = createLazyComponent(() => import('./pages/MessagesPage'));
const ProductDetailPage = createLazyComponent(() => import('./pages/ProductDetailPage'));

// Medium-priority pages (defer definition)
// Batch 1
const LoopsPage = createLazyComponent(() => import('./pages/LoopsPage'));
const PostDetailPage = createLazyComponent(() => import('./pages/PostDetailPage'));
const StoriesPage = createLazyComponent(() => import('./pages/StoriesPage'));
const CategoriesPage = createLazyComponent(() => import('./pages/CategoriesPage'));
const SellerStorePage = createLazyComponent(() => import('./pages/SellerStorePage'));
const NotificationsPage = createLazyComponent(() => import('./pages/NotificationsPage'));
const WishlistPage = createLazyComponent(() => import('./pages/WishlistPage'));
const DealsPage = createLazyComponent(() => import('./pages/DealsPage'));

// Batch 2
const UploadPage = createLazyComponent(() => import('./pages/UploadPage'));
const ForgotPasswordPage = createLazyComponent(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = createLazyComponent(() => import('./pages/auth/ResetPasswordPage'));
const OTPVerificationPage = createLazyComponent(() => import('./pages/auth/OTPVerificationPage'));
const TwoFactorPage = createLazyComponent(() => import('./pages/auth/TwoFactorPage'));
const UserDashboardPage = createLazyComponent(() => import('./pages/user/UserDashboard'));
const CheckoutPage = createLazyComponent(() => import('./pages/user/index').then(m => ({ default: m.CheckoutPage })));
const WalletPage = createLazyComponent(() => import('./pages/user/index').then(m => ({ default: m.WalletPage })));
const OrdersPage = createLazyComponent(() => import('./pages/user/index').then(m => ({ default: m.OrdersPage })));
const OrderSuccessPage = createLazyComponent(() => import('./pages/OrderSuccessPage'));
const OrderTrackingPage = createLazyComponent(() => import('./pages/user/OrderTrackingPage'));

// Batch 3
const CreatorDashboardPage = createLazyComponent(() => import('./pages/creator/index').then(m => ({ default: m.DashboardPage })));
const LiveSchedulePage = createLazyComponent(() => import('./pages/creator/index').then(m => ({ default: m.LiveSchedulePage })));
const AffiliateManagerPage = createLazyComponent(() => import('./pages/creator/index').then(m => ({ default: m.AffiliateManagerPage })));
const SellerDashboardPage = createLazyComponent(() => import('./pages/seller/index').then(m => ({ default: m.DashboardPage })));
const ProductManagementPage = createLazyComponent(() => import('./pages/seller/index').then(m => ({ default: m.ProductManagementPage })));
const SellerOrdersPage = createLazyComponent(() => import('./pages/seller/OrderManagement'));
const LogisticsPage = createLazyComponent(() => import('./pages/seller/index').then(m => ({ default: m.LogisticsPage })));
const StoreSettingsPage = createLazyComponent(() => import('./pages/seller/index').then(m => ({ default: m.StoreSettingsPage })));
const SellerAnalyticsPage = createLazyComponent(() => import('./pages/seller/index').then(m => ({ default: m.AnalyticsPage })));
const SellerCustomersPage = createLazyComponent(() => import('./pages/seller/index').then(m => ({ default: m.CustomersPage })));
const SellerReviewsPage = createLazyComponent(() => import('./pages/seller/index').then(m => ({ default: m.ReviewsPage })));
const SellerSupportPage = createLazyComponent(() => import('./pages/seller/index').then(m => ({ default: m.SupportPage })));

// Batch 4
const EarningsPage = createLazyComponent(() => import('./pages/seller/EarningsPage'));
const WithdrawPage = createLazyComponent(() => import('./pages/seller/WithdrawPage'));
const PayoutSettingsPage = createLazyComponent(() => import('./pages/seller/PayoutSettingsPage'));
const KYCVerificationPage = createLazyComponent(() => import('./pages/seller/KYCVerificationPage'));
const SecurityMonitorPage = createLazyComponent(() => import('./pages/seller/SecurityMonitorPage'));
const AddProductPage = createLazyComponent(() => import('./pages/seller/AddProductPage'));
const EditProductPage = createLazyComponent(() => import('./pages/seller/EditProductPage'));
const OrderDetailPage = createLazyComponent(() => import('./pages/seller/OrderDetailPage'));
const AdminDashboardPage = createLazyComponent(() => import('./pages/admin/DashboardPage'));

// Batch 5

// Batch 6
const LandingPage = createLazyComponent(() => import('./pages/LandingPage'));
const SettingsPage = createLazyComponent(() => import('./pages/SettingsPage'));
const PrivacySettingsPage = createLazyComponent(() => import('./pages/settings/PrivacySettingsPage'));
const SecuritySettingsPage = createLazyComponent(() => import('./pages/settings/SecuritySettingsPage'));
const NotificationSettingsPage = createLazyComponent(() => import('./pages/settings/NotificationSettingsPage'));
const AccountManagementPage = createLazyComponent(() => import('./pages/settings/AccountManagementPage'));
const HelpPage = createLazyComponent(() => import('./pages/HelpPage'));
const PaymentGuide = createLazyComponent(() => import('./pages/help/PaymentGuide'));
const TermsPage = createLazyComponent(() => import('./pages/legal/TermsPage'));
const PrivacyPage = createLazyComponent(() => import('./pages/legal/PrivacyPage'));
const PrivacyPreferencesPage = createLazyComponent(() => import('./pages/PrivacyPreferencesPage'));
const CommunityGuidelinesPage = createLazyComponent(() => import('./pages/legal/CommunityGuidelinesPage'));
const CopyrightPage = createLazyComponent(() => import('./pages/legal/CopyrightPage'));
const SafetyPage = createLazyComponent(() => import('./pages/legal/SafetyPage'));

// Batch 7
const SafetyTrustPage = createLazyComponent(() => import('./pages/legal/SafetyTrustPage'));
const ChildSafetyPage = createLazyComponent(() => import('./pages/legal/ChildSafetyPage'));
const AccessibilityPage = createLazyComponent(() => import('./pages/legal/AccessibilityPage'));
const TransparencyPage = createLazyComponent(() => import('./pages/legal/TransparencyPage'));
const CommissionPolicyPage = createLazyComponent(() => import('./pages/legal/CommissionPolicyPage'));
const InterestsPage = createLazyComponent(() => import('./pages/onboarding/InterestsPage'));
const FollowSuggestionsPage = createLazyComponent(() => import('./pages/onboarding/FollowSuggestionsPage'));
const PermissionsPage = createLazyComponent(() => import('./pages/onboarding/PermissionsPage'));
const AboutPage = createLazyComponent(() => import('./pages/company/AboutPage'));
const ContactPage = createLazyComponent(() => import('./pages/company/ContactPage'));
const CareersPage = createLazyComponent(() => import('./pages/company/CareersPage'));
const SellOnEzyifyPage = createLazyComponent(() => import('./pages/company/SellOnEzyifyPage'));
const CreatorProgramPage = createLazyComponent(() => import('./pages/company/CreatorProgramPage'));
const PressPage = createLazyComponent(() => import('./pages/company/PressPage'));
const BlogPage = createLazyComponent(() => import('./pages/company/BlogPage'));

// Batch 8
const SuccessStoriesPage = createLazyComponent(() => import('./pages/company/SuccessStoriesPage'));
const InvestorsPage = createLazyComponent(() => import('./pages/company/InvestorsPage'));
const ForCreatorsPage = createLazyComponent(() => import('./pages/company/ForCreatorsPage'));
const FAQPage = createLazyComponent(() => import('./pages/support/FAQPage'));
const ReportProblemPage = createLazyComponent(() => import('./pages/support/ReportProblemPage'));
const NotFoundPage = createLazyComponent(() => import('./pages/ErrorPage').then(m => ({ default: m.NotFoundPage })));
const OfflinePage = createLazyComponent(() => import('./pages/ErrorPage').then(m => ({ default: m.OfflinePage })));
const MaintenancePage = createLazyComponent(() => import('./pages/ErrorPage').then(m => ({ default: m.MaintenancePage })));
const EditProfilePage = createLazyComponent(() => import('./pages/profile/EditProfilePage'));
const FollowersPage = createLazyComponent(() => import('./pages/profile/FollowersPage'));

// Batch 9
const RefundRequestPage = createLazyComponent(() => import('./pages/orders/RefundRequestPage'));
const RefundStatusPage = createLazyComponent(() => import('./pages/orders/RefundStatusPage'));
const DisputeResolutionDashboard = createLazyComponent(() => import('./pages/admin/DisputeResolutionDashboard'));
const AffiliateRulesPage = createLazyComponent(() => import('./pages/AffiliateRulesPage'));
const ReferralTrackingPage = createLazyComponent(() => import('./pages/ReferralTrackingPage'));
const VerificationStatusPage = createLazyComponent(() => import('./pages/VerificationStatusPage'));
const MultiSellerOrderTrackingPage = createLazyComponent(() => import('./pages/user/MultiSellerOrderTrackingPage'));
const UserManagementDashboard = createLazyComponent(() => import('./pages/admin/users/UserManagementDashboard'));
const ContentModerationQueue = createLazyComponent(() => import('./pages/admin/moderation/ContentModerationQueue'));
const FraudDetectionDashboard = createLazyComponent(() => import('./pages/admin/fraud/FraudDetectionDashboard'));
const SellerApprovalQueue = createLazyComponent(() => import('./pages/admin/operations/SellerApprovalQueue'));
const LiveShoppingPage = createLazyComponent(() => import('./pages/LiveShoppingPage'));


function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

const WithNavigation = memo(function WithNavigation() {
  const location = useLocation();
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        {/* Top offset = fixed top nav height (+ mobile search row); bottom offset = BottomNav on < lg */}
        <div className={`pt-[calc(5.75rem+var(--safe-top))] md:pt-[calc(3rem+var(--safe-top))] lg:pt-16 lg:pb-0 ${location.pathname.startsWith('/messages') ? 'pb-[calc(var(--nav-height)+var(--safe-bottom))]' : 'pb-nav'}`}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </div>
      </div>
    </>
  );
});

/** Redirects first-time visitors on the root route to the onboarding carousel. */
function FirstRunGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (location.pathname === '/' && !hasSeenOnboarding()) {
    return <Navigate to="/welcome" replace />;
  }
  return <>{children}</>;
}

const runtime = createWebRuntime();

export default function App() {
  const [splash, setSplash] = useState(() => shouldShowSplash());

  useEffect(() => {
    // Ensure viewport-fit=cover so env(safe-area-inset-top) works on iOS/Android
    try {
      const vp = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
      if (vp && !vp.content.includes('viewport-fit')) {
        vp.content = vp.content + ', viewport-fit=cover';
      } else if (!vp) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
        document.head.appendChild(meta);
      }
    } catch (e) {}

    // Signal init complete — safe call, no DOM side-effects
    try { markInitializationComplete(); } catch (e) {}

    // All heavy services deferred — never block the render pipeline
    const init = () => {
      try { initializeManualTriggers(); } catch (e) {}
      try { registerPwa(); } catch (e) {}
      try { initializeOptimizations(); } catch (e) {}
      if (import.meta.env.DEV) {
        try { logPlatformStatus(); } catch (e) {}
        try { displayLaunchStatusBanner(); showLaunchReminder(); } catch (e) {}
      }
    };

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(init, { timeout: 3000 });
      // Prefetch high-traffic routes after init
      requestIdleCallback(() => {
        import('./pages/ExplorePage').catch(() => {});
        import('./pages/ShopPage').catch(() => {});
        import('./pages/LoopsPage').catch(() => {});
      }, { timeout: 4000 });
    } else {
      setTimeout(init, 200);
    }
  }, []);

  return (
    <ErrorBoundary>
      <EzyifyContext.Provider value={runtime}>
      <QueryClientProvider client={runtime.queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          {splash && <SplashScreen onDone={() => setSplash(false)} />}
          <Toaster />
          {/* Wrapped in error boundaries - never blocks UI */}
          <ErrorBoundary fallback={null}>
            <InstallPrompt />
          </ErrorBoundary>
          <ErrorBoundary fallback={null}>
            <OfflineIndicator />
          </ErrorBoundary>
          <AuthProvider>
          <ErrorBoundary fallback={null}>
            <Analytics />
          </ErrorBoundary>
          <ErrorBoundary fallback={null}>
            <CookieConsent />
          </ErrorBoundary>
          <Suspense fallback={<RouteAwareLoader />}>
            <Routes>
              <Route path="/welcome" element={<OnboardingPage />} />
              <Route path="/onboarding" element={<InterestsPage />} />
              <Route path="/onboarding/interests" element={<InterestsPage />} />
              <Route path="/onboarding/follow-suggestions" element={<FollowSuggestionsPage />} />
              <Route path="/onboarding/permissions" element={<PermissionsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/otp-verification" element={<OTPVerificationPage />} />
              <Route path="/two-factor" element={<TwoFactorPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/stories/:username" element={<StoriesPage />} />
              <Route path="/loops" element={<LoopsPage />} />
              <Route path="/live/:id" element={<LivePage />} />
              <Route element={<WithNavigation />}>
                <Route path="/" element={<FirstRunGate><HomePage /></FirstRunGate>} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/post/:id" element={<PostDetailPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/profile/me" element={<ProfilePage />} />
                <Route path="/seller/:storeName" element={<SellerStorePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/order/:orderId" element={<OrderSuccessPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/user/order-tracking/:orderId" element={<OrderTrackingPage />} />
                <Route path="/creator-dashboard" element={<CreatorDashboardPage />} />
                <Route path="/live-schedule" element={<LiveSchedulePage />} />
                <Route path="/affiliate-manager" element={<AffiliateManagerPage />} />
                <Route path="/seller-dashboard" element={<SellerDashboardPage />} />
                <Route path="/seller/products" element={<ProductManagementPage />} />
                <Route path="/seller/add-product" element={<AddProductPage />} />
                <Route path="/seller/edit-product/:id" element={<EditProductPage />} />
                <Route path="/seller/orders" element={<SellerOrdersPage />} />
                <Route path="/seller/order-detail/:id" element={<OrderDetailPage />} />
                <Route path="/seller/logistics" element={<LogisticsPage />} />
                <Route path="/seller/settings" element={<StoreSettingsPage />} />
                <Route path="/seller/analytics" element={<SellerAnalyticsPage />} />
                <Route path="/seller/customers" element={<SellerCustomersPage />} />
                <Route path="/seller/reviews" element={<SellerReviewsPage />} />
                <Route path="/seller/support" element={<SellerSupportPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/payment-guide" element={<PaymentGuide />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/privacy-preferences" element={<PrivacyPreferencesPage />} />
                <Route path="/legal/terms" element={<TermsPage />} />
                <Route path="/legal/privacy" element={<PrivacyPage />} />
                <Route path="/community-guidelines" element={<CommunityGuidelinesPage />} />
                <Route path="/copyright" element={<CopyrightPage />} />
                <Route path="/safety" element={<SafetyPage />} />
                <Route path="/safety-trust" element={<SafetyTrustPage />} />
                <Route path="/child-safety" element={<ChildSafetyPage />} />
                <Route path="/legal/child-safety" element={<ChildSafetyPage />} />
                <Route path="/accessibility" element={<AccessibilityPage />} />
                <Route path="/settings/privacy" element={<PrivacySettingsPage />} />
                <Route path="/settings/security" element={<SecuritySettingsPage />} />
                <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
                <Route path="/settings/account-management" element={<AccountManagementPage />} />
                <Route path="/seller/kyc-verification" element={<KYCVerificationPage />} />
                <Route path="/user/order-tracking" element={<OrderTrackingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/sell-on-ezyify" element={<SellOnEzyifyPage />} />
                <Route path="/creator-program" element={<CreatorProgramPage />} />
                <Route path="/press" element={<PressPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/success-stories" element={<SuccessStoriesPage />} />
                <Route path="/investors" element={<InvestorsPage />} />
                <Route path="/for-creators" element={<ForCreatorsPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/report-problem" element={<ReportProblemPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="/offline" element={<OfflinePage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/profile/followers" element={<FollowersPage />} />
                <Route path="/profile/:username/followers" element={<FollowersPage />} />
                <Route path="/profile/:username/following" element={<FollowersPage />} />
                <Route path="/seller/earnings" element={<EarningsPage />} />
                <Route path="/seller/withdraw" element={<WithdrawPage />} />
                <Route path="/seller/payout-settings" element={<PayoutSettingsPage />} />
                <Route path="/seller/security-monitor" element={<SecurityMonitorPage />} />
                <Route path="/orders/:id/refund/new" element={<RefundRequestPage />} />
                <Route path="/orders/:id/refund" element={<RefundStatusPage />} />
                {/* Legacy Figma-era paths; the case now lives under the order. */}
                <Route path="/orders/refund-request" element={<Navigate to="/orders" replace />} />
                <Route path="/orders/refund-status/:refundId" element={<Navigate to="/orders?filter=refunds" replace />} />
                <Route path="/orders/return-request" element={<Navigate to="/orders" replace />} />
                <Route path="/orders/dispute" element={<Navigate to="/orders?filter=refunds" replace />} />
                <Route path="/orders/dispute/:disputeId" element={<Navigate to="/orders?filter=refunds" replace />} />
                <Route path="/orders/refund-negotiation" element={<Navigate to="/orders?filter=refunds" replace />} />
                <Route path="/user/refund-history" element={<Navigate to="/orders?filter=refunds" replace />} />
                <Route path="/admin/disputes" element={<DisputeResolutionDashboard />} />
                <Route path="/affiliate-rules" element={<AffiliateRulesPage />} />
                <Route path="/referral-tracking" element={<ReferralTrackingPage />} />
                <Route path="/verification-status" element={<VerificationStatusPage />} />
                <Route path="/transparency" element={<TransparencyPage />} />
                <Route path="/commission-policy" element={<CommissionPolicyPage />} />
                <Route path="/user/multi-seller-order-tracking" element={<MultiSellerOrderTrackingPage />} />
                <Route path="/admin/users" element={<UserManagementDashboard />} />
                <Route path="/admin/moderation" element={<ContentModerationQueue />} />
                <Route path="/admin/fraud" element={<FraudDetectionDashboard />} />
                <Route path="/admin/operations/seller-approval" element={<SellerApprovalQueue />} />
                <Route path="/live-shopping" element={<LiveShoppingPage />} />
                {devRoutes}
                {/* Catch-all: any unmatched path shows 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      </QueryClientProvider>
      </EzyifyContext.Provider>
    </ErrorBoundary>
  );
}