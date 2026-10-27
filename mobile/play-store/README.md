# Google Play materials — Simple Punjabi

Checklist and notes for the Android / Google Play release.

| File | Purpose |
|------|---------|
| [checklist.md](checklist.md) | Step-by-step: account → build → listing → release |

## Reuse from iOS

Most copy and legal pages are shared with the App Store folder:

| iOS source | Play Store use |
|------------|----------------|
| [../app-store/listing.md](../app-store/listing.md) | Short & full description (adapt formatting) |
| [../app-store/privacy-policy.md](../app-store/privacy-policy.md) | Same URL — update TTS wording for Android before publishing |
| [../app-store/support.md](../app-store/support.md) | Same support URL |

**Privacy & support URL (same as iOS):**

```
https://sachinchopra35.github.io/Quizlet-App/
```

## App identity

| Field | Value |
|-------|-------|
| Package name | `com.sachchopra.simplepunjabi` |
| App name | Simple Punjabi |

Must match `mobile/capacitor.config.ts` `appId`.

## Current status

- [ ] Google Play Developer account created and verified
- [ ] Android Studio installed
- [ ] `@capacitor/android` added and app runs on device/emulator
- [ ] Release AAB uploaded to Play Console
- [ ] Production release
