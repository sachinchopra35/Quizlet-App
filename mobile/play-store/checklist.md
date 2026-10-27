# Google Play submission checklist

Use this as your master list. Tick items as you go.

**App:** Simple Punjabi  
**Package name:** `com.sachchopra.simplepunjabi`

---

## Phase 1 — Accounts & tooling (do these first, in parallel)

### Google Play Developer account

- [ ] Go to [play.google.com/console](https://play.google.com/console/signup)
- [ ] Pay the **$25 one-time** registration fee
- [ ] Complete identity verification (can take **1–3 days** — start now)
- [ ] Accept Developer Distribution Agreement

You can do everything in Phase 2 while waiting for verification.

### Android Studio (on your Mac)

- [ ] Install [Android Studio](https://developer.android.com/studio) (includes SDK + emulator)
- [ ] First launch: install default SDK components when prompted
- [ ] Optional: plug in an Android phone → enable **Developer options** → **USB debugging**

---

## Phase 2 — Add Android to this project

Run from the `mobile/` folder (after Android Studio is installed):

```bash
npm install @capacitor/android@^6.2.0
npx cap add android
npm run build
npx cap sync android
npx cap open android
```

- [ ] `android/` folder exists in `mobile/`
- [ ] App builds in Android Studio
- [ ] Run on emulator or physical device
- [ ] Smoke test: map, quiz, keyboard, offline, progress save, mute, speech (voices differ from iPhone)

### npm scripts (after Android is added)

Add convenience scripts to `package.json` (or run commands manually):

| Script | Purpose |
|--------|---------|
| `cap:sync:android` | build + `cap sync android` |
| `cap:open:android` | open Android Studio |
| `cap:sync:all` | sync iOS and Android |

---

## Phase 3 — Device QA (before store upload)

- [ ] Map scroll and level popups
- [ ] Quiz typing + soft keyboard (doesn’t hide the input?)
- [ ] Reveal Answer flow
- [ ] Medals and progress persist after force-quit
- [ ] Works fully offline (airplane mode)
- [ ] Text-to-speech on a real Android device (quality varies by phone)
- [ ] Back button / gesture doesn’t break quiz unexpectedly

---

## Phase 4 — Signing & release build

- [ ] Create upload keystore (once — **back up the `.jks` file and passwords securely**)
- [ ] Configure signing in Android Studio / `android/app/build.gradle`
- [ ] Set `versionName` (e.g. `1.0.0`) and increment `versionCode` (integer, e.g. `1`) for each upload
- [ ] **Build → Generate Signed Bundle / APK → Android App Bundle (.aab)**
- [ ] Enable [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756) (recommended — Google holds the app signing key)

---

## Phase 5 — Play Console — create app

After developer account is **verified**:

- [ ] Play Console → **Create app**
- [ ] App name: **Simple Punjabi**
- [ ] Default language: English
- [ ] App or game: **App**
- [ ] Free or paid: **Free**
- [ ] Declarations (policies, US export laws, etc.)

---

## Phase 6 — Store listing

| Field | Source |
|-------|--------|
| Short description (80 chars) | Adapt from [listing.md](../app-store/listing.md) subtitle |
| Full description | [listing.md](../app-store/listing.md) |
| App icon | 512×512 PNG — from `icon-variants/02-pa-off-white.png` |
| Feature graphic | **1024×500** banner (required — Apple doesn’t need this) |
| Phone screenshots | Capture on Android (min 2; recommend 4–8) |
| Category | **Education** |
| Contact email | Same as App Store support email |
| Privacy policy URL | `https://sachinchopra35.github.io/Quizlet-App/` |

### Privacy policy tweak

Before going live, update [privacy-policy.md](../app-store/privacy-policy.md) and `docs/index.html` so TTS mentions **device text-to-speech** (not only Apple’s synthesiser).

---

## Phase 7 — Policy forms

| Form | Your app (offline, no login) |
|------|------------------------------|
| **Data safety** | No data collected or shared; local progress on device only |
| **Content rating** | IARC questionnaire → expect low age rating (education, no violence) |
| **Target audience** | Not designed primarily for children (unless you declare otherwise) |
| **Ads** | No ads |
| **News app / COVID / etc.** | No — skip where not applicable |

---

## Phase 8 — Upload & release

Recommended path for first launch:

1. [ ] **Internal testing** track → upload `.aab` → install via internal test link
2. [ ] Fix any issues found
3. [ ] **Production** → create release → add release notes → submit for review

- [ ] Release notes: adapt “What’s New” from [listing.md](../app-store/listing.md)
- [ ] Wait for review (often hours to a few days for first app)

---

## Ongoing updates (both stores)

When you ship a vocab or bugfix update:

1. Edit `vocab/` and/or `mobile/src/`
2. `npm test`
3. `npm run build`
4. `npx cap sync ios` → archive in Xcode → App Store Connect
5. `npx cap sync android` → signed AAB → Play Console
6. Bump version on **both** platforms (they use different version fields)

**One codebase** — two upload steps, not two apps.

---

## Quick reference

| Doc | Goes to |
|-----|---------|
| [../app-store/listing.md](../app-store/listing.md) | Play Console descriptions |
| [../app-store/privacy-policy.md](../app-store/privacy-policy.md) | Hosted URL + Data safety |
| [../app-store/support.md](../app-store/support.md) | Store contact / support |
