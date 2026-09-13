import { lazy } from 'react';
import { Route } from 'react-router';

/**
 * Internal launch/QA/validation dashboards. They ship with the Figma export but are
 * engineering tooling, not product surface, so they only mount in dev builds.
 */
const PlatformOverviewPage = lazy(() => import('../pages/PlatformOverviewPage'));
const LaunchControlCenter = lazy(() => import('../pages/LaunchControlCenter'));
const APIIntegrationPlayground = lazy(() => import('../pages/APIIntegrationPlayground'));
const BackendIntegrationStatus = lazy(() => import('../pages/BackendIntegrationStatus'));
const APITestingDashboard = lazy(() => import('../pages/APITestingDashboard'));
const PreLaunchQADashboard = lazy(() => import('../pages/PreLaunchQADashboard'));
const RealTimeAnalyticsDashboard = lazy(() => import('../pages/RealTimeAnalyticsDashboard'));
const CustomerSupportAdminPanel = lazy(() => import('../pages/CustomerSupportAdminPanel'));
const PaymentSystemStatusPage = lazy(() => import('../pages/admin/PaymentSystemStatusPage'));
const IconGeneratorPage = lazy(() => import('../pages/admin/IconGeneratorPage'));
const LaunchDashboardPage = lazy(() => import('../pages/admin/LaunchDashboardPage'));
const PreDeploymentCheckerPage = lazy(() => import('../pages/admin/PreDeploymentCheckerPage'));
const PerformanceVerificationDashboard = lazy(() => import('../pages/admin/PerformanceVerificationDashboard'));
const ProductionValidationCenter = lazy(() => import('../pages/admin/ProductionValidationCenter'));
const LaunchPreparationCenter = lazy(() => import('../pages/admin/LaunchPreparationCenter'));
const AutomatedLaunchDashboard = lazy(() => import('../pages/admin/AutomatedLaunchDashboard'));
const MasterLaunchControl = lazy(() => import('../pages/admin/MasterLaunchControl'));
const LaunchExecutionConsole = lazy(() => import('../pages/admin/LaunchExecutionConsole'));
const LaunchDayCommandCenter = lazy(() => import('../pages/admin/LaunchDayCommandCenter'));
const MarketingAcquisitionHub = lazy(() => import('../pages/admin/MarketingAcquisitionHub'));
const AnalyticsBusinessIntelligence = lazy(() => import('../pages/admin/AnalyticsBusinessIntelligence'));
const PostLaunchGrowthCenter = lazy(() => import('../pages/admin/PostLaunchGrowthCenter'));
const PerformanceMonitoringDashboard = lazy(() => import('../pages/admin/PerformanceMonitoringDashboard'));
const SystemArchitectureVisualizerPage = lazy(() => import('../components/SystemArchitectureVisualizer'));

export const devRoutes = import.meta.env.DEV
  ? [
      <Route key="/platform-overview" path="/platform-overview" element={<PlatformOverviewPage />} />,
      <Route key="/launch-control" path="/launch-control" element={<LaunchControlCenter />} />,
      <Route key="/api-integration-playground" path="/api-integration-playground" element={<APIIntegrationPlayground />} />,
      <Route key="/backend-integration-status" path="/backend-integration-status" element={<BackendIntegrationStatus />} />,
      <Route key="/api-testing-dashboard" path="/api-testing-dashboard" element={<APITestingDashboard />} />,
      <Route key="/pre-launch-qa-dashboard" path="/pre-launch-qa-dashboard" element={<PreLaunchQADashboard />} />,
      <Route key="/real-time-analytics-dashboard" path="/real-time-analytics-dashboard" element={<RealTimeAnalyticsDashboard />} />,
      <Route key="/customer-support-admin-panel" path="/customer-support-admin-panel" element={<CustomerSupportAdminPanel />} />,
      <Route key="/admin/payment-system-status" path="/admin/payment-system-status" element={<PaymentSystemStatusPage />} />,
      <Route key="/admin/icon-generator" path="/admin/icon-generator" element={<IconGeneratorPage />} />,
      <Route key="/admin/launch-dashboard" path="/admin/launch-dashboard" element={<LaunchDashboardPage />} />,
      <Route key="/admin/pre-deployment-checker" path="/admin/pre-deployment-checker" element={<PreDeploymentCheckerPage />} />,
      <Route key="/admin/performance-verification" path="/admin/performance-verification" element={<PerformanceVerificationDashboard />} />,
      <Route key="/admin/production-validation" path="/admin/production-validation" element={<ProductionValidationCenter />} />,
      <Route key="/admin/launch-preparation" path="/admin/launch-preparation" element={<LaunchPreparationCenter />} />,
      <Route key="/admin/automated-launch-dashboard" path="/admin/automated-launch-dashboard" element={<AutomatedLaunchDashboard />} />,
      <Route key="/admin/master-launch-control" path="/admin/master-launch-control" element={<MasterLaunchControl />} />,
      <Route key="/admin/launch-execution-console" path="/admin/launch-execution-console" element={<LaunchExecutionConsole />} />,
      <Route key="/admin/launch-command-center" path="/admin/launch-command-center" element={<LaunchDayCommandCenter />} />,
      <Route key="/admin/marketing-acquisition" path="/admin/marketing-acquisition" element={<MarketingAcquisitionHub />} />,
      <Route key="/admin/analytics-bi" path="/admin/analytics-bi" element={<AnalyticsBusinessIntelligence />} />,
      <Route key="/admin/growth-center" path="/admin/growth-center" element={<PostLaunchGrowthCenter />} />,
      <Route key="/admin/performance-monitoring" path="/admin/performance-monitoring" element={<PerformanceMonitoringDashboard />} />,
      <Route key="/admin/system-architecture" path="/admin/system-architecture" element={<SystemArchitectureVisualizerPage />} />,
    ]
  : null;
