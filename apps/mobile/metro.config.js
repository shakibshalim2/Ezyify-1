// Expo auto-configures Metro for pnpm workspaces (SDK 52+); nothing monorepo-specific needed here.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
