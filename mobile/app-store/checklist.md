# App Store submission checklist

Use this as your master list. Tick items as you go.

**App:** Simple Punjabi  
**Bundle ID:** `com.sachchopra.simplepunjabi`

---

## Before enrollment is approved

- [x] Take screenshots (map, quiz with roman text, medal screen; optional: info panel)
- [x] Draft store copy → [listing.md](listing.md)
- [x] Publish privacy & support → follow [docs/github-pages-setup.md](../../docs/github-pages-setup.md)
- [x] Privacy URL (same for Support): `https://sachinchopra35.github.io/Quizlet-App/`
- [x] QA on device: offline, persistence, mute, beast mode, scroll-after-round

---



## After enrollment is approved



### Apple Developer portal

- [ ] [developer.apple.com](https://developer.apple.com) — confirm account is active
- [ ] **Identifiers** → register App ID: `com.sachchopra.simplepunjabi`
- [ ] No special capabilities needed (no push, HealthKit, etc.)



### Xcode (local)

```bash
cd mobile
npm run build
npx cap copy ios
npx cap open ios
```

- [ ] **Signing & Capabilities** → Team = your paid developer account
- [ ] **Bundle Identifier** = `com.sachchopra.simplepunjabi`
- [ ] Export compliance: `ITSAppUsesNonExemptEncryption` = NO (set in `capacitor.config.ts` / Info.plist — skips the encryption questionnaire on upload)
- [ ] Set **Version** (Marketing) = `1.0.0`, **Build** = `1`
- [ ] Run on device once to verify signing works
- [ ] Delete old app from phone if you still have the `com.local...` build



### App Store Connect — create app

- [ ] [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps** → **+** → New App
- [ ] Platform: iOS
- [ ] Name: **Simple Punjabi**
- [ ] Primary language: English (U.K.) or English (U.S.) — your choice
- [ ] Bundle ID: `com.sachchopra.simplepunjabi`
- [ ] SKU: e.g. `simple-punjabi-2026` (internal only, anything unique)



### App Store Connect — App Information


| Field                | Source                                                                |
| -------------------- | --------------------------------------------------------------------- |
| Name                 | [listing.md](listing.md)                                              |
| Subtitle             | [listing.md](listing.md)                                              |
| Privacy Policy URL   | your hosted URL                                                       |
| Category (primary)   | Education                                                             |
| Category (secondary) | Reference (optional)                                                  |
| Content Rights       | You own the content                                                   |
| Age Rating           | Complete questionnaire → expect **4+** (see [listing.md](listing.md)) |




### App Store Connect — Pricing

- [ ] Price: **Free**
- [ ] Availability: countries you want (default: all)



### App Store Connect — App Privacy

- [ ] **Data Not Collected** (no data linked to user, no tracking)
- [ ] If asked about local storage on device only — not “collected” in Apple’s sense for network transmission



### App Store Connect — version 1.0.0 page


| Field                            | Source                                           |
| -------------------------------- | ------------------------------------------------ |
| Screenshots                      | 6.7" and 6.5" iPhone (required sizes in Connect) |
| Promotional Text                 | [listing.md](listing.md)                         |
| Description                      | [listing.md](listing.md)                         |
| Keywords                         | [listing.md](listing.md)                         |
| Support URL                      | your hosted URL                                  |
| Marketing URL                    | optional — leave blank or personal site          |
| What's New                       | [listing.md](listing.md)                         |
| Build                            | select uploaded build (after archive step)       |
| App Review Information → Notes   | [review-notes.md](review-notes.md)               |
| App Review Information → Contact | your name, email, phone                          |
| Sign-in required?                | **No**                                           |




### Upload build from Xcode

- [ ] Device dropdown → **Any iOS Device (arm64)**
- [ ] **Product → Archive**
- [ ] **Distribute App** → **App Store Connect** → Upload
- [ ] Wait for processing in Connect (often 15–60 min)
- [ ] Attach build to version 1.0.0



### TestFlight (recommended)

- [ ] Install via TestFlight on your phone
- [ ] Smoke test one more time
- [ ] Optional: invite 1–2 friends



### Submit

- [ ] **Add for Review** → Submit
- [ ] Tag git: `git tag v1.0.0` (optional but recommended)

---



## After submission

- [ ] Watch email for review (often 1–3 days)
- [ ] If **Rejected**: read reason, fix, bump build number, re-upload, resubmit
- [ ] If **Approved**: release manually or automatic — your choice in Connect

---



## Quick reference — where does each doc go?


| Doc in this folder                     | Goes to                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| [listing.md](listing.md)               | App Store Connect (name, subtitle, description, keywords, promotional text, What's New) |
| [privacy-policy.md](privacy-policy.md) | Host on web → Privacy Policy URL in App Information                                     |
| [support.md](support.md)               | Host on web → Support URL on version page                                               |
| [review-notes.md](review-notes.md)     | App Review Notes field only (not public)                                                |


