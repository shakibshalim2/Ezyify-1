# Android release — signed AAB / APK (no Expo Go)

The mobile app is a normal native Android project generated once by
`expo prebuild` and committed under `apps/mobile/android`. It is built and
signed with Gradle exactly like a Flutter or plain Android app. Expo Go is
**not** involved at any point; end users install the signed APK/AAB.

## 1. One‑time: create the upload keystore (never commit it)

```bash
keytool -genkeypair -v \
  -keystore ezyify-upload.keystore \
  -alias ezyify-upload \
  -keyalg RSA -keysize 4096 -validity 10000 \
  -storetype PKCS12
```

Two equivalent ways to hand the key to Gradle (both git‑ignored):

**a) Local file** — copy `apps/mobile/keystore.properties.example` to
`apps/mobile/android/keystore.properties` and drop the keystore in
`apps/mobile/android/app/`:

```properties
storeFile=ezyify-upload.keystore
storePassword=********
keyAlias=ezyify-upload
keyPassword=********
```

**b) Environment variables** (CI):

```bash
EZYIFY_UPLOAD_STORE_FILE=/home/you/keys/ezyify-upload.keystore
EZYIFY_UPLOAD_STORE_PASSWORD=********
EZYIFY_UPLOAD_KEY_ALIAS=ezyify-upload
EZYIFY_UPLOAD_KEY_PASSWORD=********
```

Enroll the app in **Play App Signing** on first upload; Google keeps the app
signing key, you keep only the upload key above.

## 2. Gradle signing config (Phase 4.3 — done)

Signing is injected by the config plugin `apps/mobile/plugins/withReleaseSigning.js`
every time `expo prebuild` runs, so it survives regeneration of `android/`. The
generated `android/app/build.gradle` contains:

```groovy
signingConfigs {
    release {
        // keystore.properties → EZYIFY_UPLOAD_* env → (unsigned warning)
        def props = new Properties()
        def propsFile = rootProject.file('keystore.properties')
        if (propsFile.exists()) propsFile.withInputStream { props.load(it) }
        def storePath = props['storeFile'] ?: System.getenv('EZYIFY_UPLOAD_STORE_FILE')
        if (storePath) { storeFile file(storePath); storePassword …; keyAlias …; keyPassword … }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release.storeFile ? signingConfigs.release : signingConfigs.debug
        // logs a loud WARNING when a release task runs without an upload key
        minifyEnabled true          // android.enableMinifyInReleaseBuilds (expo-build-properties)
        shrinkResources true        // android.enableShrinkResourcesInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

`expo-build-properties` in `app.config.ts` pins `compileSdk`/`targetSdk` 36,
`minSdk` 24, R8 + resource shrinking on, and modern (16 KB‑aligned) packaging.

## 3. Build commands

```bash
pnpm install                               # repo root
cd apps/mobile
pnpm assets                                     # only if the brand mark/colours changed (re-renders icon, adaptive, splash, notification, store art)
pnpm android:prebuild                           # only if app.config.ts / plugins / assets changed (regenerates android/)
cd android
./gradlew :app:bundleRelease              # → app/build/outputs/bundle/release/app-release.aab (Play Store)
./gradlew :app:assembleRelease            # → app/build/outputs/apk/release/app-release.apk (sideload/testing)
```

Equivalent EAS local build (still offline, still no Expo Go):

```bash
eas build --platform android --profile production --local
```

## 4. Verify the artifact

```bash
# signature
apksigner verify --print-certs app-release.apk
# bundle contents / 16 KB page alignment of native libs
bundletool build-apks --bundle app-release.aab --output out.apks --mode=universal
```

Install on a device: `adb install app-release.apk`.

## 5. Versioning

`versionCode`/`versionName` live in `apps/mobile/app.config.ts` and are
rendered into `android/app/build.gradle` by prebuild. Bump before each Play
upload with `pnpm --filter @ezyify/mobile bump:version-code` (updates both
files); bump `version` by hand for user‑visible releases.

## 6. Play Console requirements (checklist)

- Target SDK 36 (set) — required for new uploads since 2026‑08‑31
- Upload `.aab` only; internal testing track first, then closed → production
- Data safety form, privacy policy URL, account deletion URL + in‑app flow
- UGC: report/block/mute, moderation queue, terms of service
- Content rating questionnaire, ads declaration (none), target audience 18+
- Physical goods paid via third‑party processor (Stripe) — no Play Billing
- Store listing: 512 px icon, 1024×500 feature graphic, ≥4 phone screenshots

## 7. CI

`.github/workflows/android-release.yml` decodes the keystore from
`ANDROID_KEYSTORE_BASE64`, writes `gradle.properties` from secrets, runs
`bundleRelease`, uploads the `.aab` artifact, and (on tags) pushes it to the
Play internal track with `r0adkll/upload-google-play`.

## 6. Push notifications (FCM) — `google-services.json`

`expo-notifications` uses Firebase Cloud Messaging on Android. Download
`google-services.json` from Firebase Console → Project settings → *Your apps* →
`com.ezyify.app` and place it at `apps/mobile/google-services.json` (git‑ignored;
a placeholder `google-services.json.example` keeps `expo prebuild` working). In
CI the file is written from the `GOOGLE_SERVICES_JSON` secret. Upload the FCM
**service account JSON** to the backend (`apps/api`) — the app itself only needs
the client config.

## 7. Before the first Play upload

1. Follow `docs/plan/PLAY_STORE_CHECKLIST.md` end‑to‑end (Data safety, permissions, account deletion URL, content rating).
2. Enrol in Play App Signing, then copy the **App signing key certificate SHA‑256** into
   `apps/web/public/.well-known/assetlinks.json` and redeploy the web app so App Links verify.
3. Run the 16 KB check locally if you built outside CI:
   `$ANDROID_HOME/build-tools/36.0.0/../../` → `check_elf_alignment.sh app-release.apk`.
