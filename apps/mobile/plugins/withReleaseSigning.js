// Config plugin: durable release signing for `expo prebuild`.
// Reads the upload keystore from android/keystore.properties (git-ignored) or EZYIFY_UPLOAD_* env vars,
// so `./gradlew :app:bundleRelease` produces a Play-ready, signed .aab without EAS.
const { withAppBuildGradle } = require('expo/config-plugins');

const SIGNING_BLOCK = `
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            def props = new Properties()
            def propsFile = rootProject.file('keystore.properties')
            if (propsFile.exists()) {
                propsFile.withInputStream { props.load(it) }
            }
            def storePath = props['storeFile'] ?: System.getenv('EZYIFY_UPLOAD_STORE_FILE')
            if (storePath) {
                storeFile file(storePath)
                storePassword props['storePassword'] ?: System.getenv('EZYIFY_UPLOAD_STORE_PASSWORD')
                keyAlias props['keyAlias'] ?: System.getenv('EZYIFY_UPLOAD_KEY_ALIAS')
                keyPassword props['keyPassword'] ?: System.getenv('EZYIFY_UPLOAD_KEY_PASSWORD')
            }
        }
    }`;

const withReleaseSigning = config =>
  withAppBuildGradle(config, mod => {
    let gradle = mod.modResults.contents;
    if (gradle.includes("rootProject.file('keystore.properties')")) return mod;

    gradle = gradle.replace(/\n\s*signingConfigs \{[\s\S]*?\n    \}/, SIGNING_BLOCK);

    // Release builds use the upload key when configured, else fail loudly instead of shipping a debug-signed artifact.
    gradle = gradle.replace(
      /release \{\n(\s*)\/\/ Caution![^\n]*\n\s*\/\/ see[^\n]*\n\s*signingConfig signingConfigs\.debug/,
      (_m, indent) =>
        `release {\n${indent}signingConfig signingConfigs.release.storeFile ? signingConfigs.release : signingConfigs.debug\n${indent}if (!signingConfigs.release.storeFile && gradle.startParameter.taskNames.any { it.toLowerCase().contains('release') }) {\n${indent}    logger.warn('WARNING: no upload keystore configured (android/keystore.properties or EZYIFY_UPLOAD_* env). Release artifact will be debug-signed and NOT accepted by Google Play.')\n${indent}}`,
    );

    mod.modResults.contents = gradle;
    return mod;
  });

module.exports = withReleaseSigning;
