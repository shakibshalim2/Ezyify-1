# Mobile E2E (Maestro)

Flows run on the **signed release APK**, never Expo Go.

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
adb install apps/mobile/android/app/build/outputs/apk/release/app-release.apk
maestro test apps/mobile/.maestro          # all flows
maestro test apps/mobile/.maestro/01-first-run.yaml
```

Selectors use `testID`s (`login-email`, `login-password`, `tab-home`, `tab-shop`, `tab-cart`) so copy changes
don't break flows. CI runs them in `android-release.yml` on an emulator after the 16 KB check when
`RUN_MAESTRO=true` is set on the dispatch.
