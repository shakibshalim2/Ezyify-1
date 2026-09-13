import React from 'react';
import { useLocation } from 'react-router';
import { InstantPreviewLoaderV2 } from './PreRenderedShell';

/**
 * Smart loader that shows appropriate skeleton based on route
 * Provides instant visual feedback with realistic placeholders
 * Uses world-class performance optimized loader
 */
export function RouteAwareLoader() {
  const location = useLocation();
  const path = location.pathname;

  // For world-class performance, use the same ultra-lightweight loader for all routes
  // This ensures consistent instant rendering regardless of destination
  return <InstantPreviewLoaderV2 />;
}