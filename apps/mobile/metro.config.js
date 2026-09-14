// Expo auto-configures Metro for pnpm workspaces (SDK 52+).
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// pnpm installs one copy of a peer-dependent package per peer set (react 18 for @ezyify/core's dev deps, react 19 here),
// so context-based singletons would otherwise be bundled twice and the app would see "No QueryClient set".
// Resolve them from this app's node_modules regardless of the importing module.
const SINGLETONS = ['react', 'react-dom', 'react-native', '@tanstack/react-query', 'zustand'];
const appOrigin = path.join(__dirname, 'index.js');
const baseResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const pinned = SINGLETONS.some(n => moduleName === n || moduleName.startsWith(`${n}/`));
  const resolve = baseResolve ?? context.resolveRequest;
  if (!pinned) return resolve(context, moduleName, platform);
  // Fall back to the importer's own resolution for transitive deps that the pinned copy cannot see.
  try {
    return resolve({ ...context, originModulePath: appOrigin }, moduleName, platform);
  } catch {
    return resolve(context, moduleName, platform);
  }
};

module.exports = config;
