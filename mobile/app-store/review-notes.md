# App Review notes

Materials for **Simple Punjabi** App Store submissions.

---

## App Review Information → Notes field (version 1.0.1 update)

Paste into **App Store Connect → App Review Information → Notes** when submitting **version 1.0.1**. Not shown to the public.

Replace `BUILD_NUMBER` with the build you upload from Xcode (e.g. `2` or `3`).

```
Simple Punjabi is an offline vocabulary and sentence practice app. Users type translations; there is no account, login, or server. Progress (medals, mute, question direction) is stored locally on the device only.

No microphone, camera, location, or tracking. Text-to-speech uses the built-in iOS speech synthesiser for optional question audio.

Roman-script Punjabi only (no Gurmukhi). No user-generated content. No in-app purchases.

How to test: open app → tap any level on the map → optionally expand “Show words list” → Start Quiz → complete a short round.

New in version 1.0.1 (build BUILD_NUMBER, September 2026): This is a routine update after 1.0.0 was approved and released. Changes are UX and content polish only — no new permissions, accounts, or network features.

• Levels 1–2: level popup highlights “Show words list” with a blue button-style prompt and arrow before the user starts the quiz.
• Levels 3–5: “Show words list” uses a subtle animated hint (colour + small arrow) to encourage previewing vocabulary.
• Level 6 onward: standard expander with no tutorial animation.
• Improved answer matching for common roman-script spelling variations.
• Visual polish on map buttons and early-level rounds.

Beast Mode remains at the bottom of the map (10 random questions from across the course).

Developer testing shortcuts (not shown in the UI): during any quiz round, type one of these as an answer to complete the round instantly for review testing:
• letmewin100 — perfect round (gold medal)
• letmewin90 — one miss (silver medal)
• letmewin80 — two misses (bronze medal)

Existing users: progress and medals migrate automatically on first launch of this build; no login or cloud sync.

Guideline 2.1: Original approval on version 1.0.0; screen recording and full answers were provided in the Resolution Center on 7 September 2026. No new review concerns expected for this update.
```

---

## App Review Information → Notes field (version 1.0.0 — archived)

Kept for reference from the first submission / resubmission.

```
Simple Punjabi is an offline vocabulary and sentence practice app. Users type translations; there is no account, login, or server. Progress (medals, mute, question direction) is stored locally on the device only.

No microphone, camera, location, or tracking. Text-to-speech uses the built-in iOS speech synthesiser for optional question audio.

Roman-script Punjabi only (no Gurmukhi). No user-generated content. No in-app purchases.

How to test: open app → tap any level on the map → complete a short quiz round. Beast Mode is at the bottom of the map, which selects 10 random questions taken from the other quiz rounds.

Developer testing shortcut (not shown in the UI): during any quiz round, type letmewin100 as an answer to instantly complete the round with a perfect score. This is retained for post-release maintenance and testing only; regular users are unlikely to discover it.

Guideline 2.1 (Information Needed): A screen recording and full answers to Apple’s six questions were sent in the Resolution Center reply on 7th September 2026. Build 2 includes minor UX refinements since the first submission (e.g. Larger arrow at the beginning, clearer tutorial hints)
```



---



## Resolution Center reply (Guideline 2.1)

Paste into **App Store Connect → Resolution Center** when replying to the Guideline 2.1 message. Attach the screen recording to the reply if the upload control allows it; otherwise upload the video to iCloud/Drive and paste the link in section 1.

```
Hello App Review,

Thank you for your message. Please find the requested information below. I have also added a summary to the App Review Information → Notes field for future submissions.

1. Screen recording

- Attached: screen recording captured on a physical iPhone running iOS 26, demonstrating the app from launch through a typical quiz session.

The recording shows: app launch → welcome map → tap a level → view words list → Start Quiz → type answers → level complete / medal. No account registration, login, account deletion, user-generated content, or content reporting flows are shown because the app does not include those features.

2. App purpose and target audience

Simple Punjabi helps English speakers learn spoken Punjabi using everyday sentences typed in English letters (roman script). It is aimed at beginners and heritage learners who want practical conversation practice without learning Gurmukhi first. The app teaches useful real-life phrases (for example, household and daily situations) rather than textbook-only vocabulary.

3. Setup and access to main features

No setup, login, or credentials are required.

- Install and open the app.
- Scroll the map and tap any level circle.
- Optionally expand “Show words list” to preview vocabulary.
- Tap Start Quiz, type answers in the text field, and complete the round to earn a medal.
- Beast Mode (bottom of the map) runs 10 random questions from across the course.
- Settings (gear icon on map header): question direction (English ↔ Punjabi) and mute for optional speech.

All progress is saved locally on the device. The app works fully offline after installation.

4. External services, tools, or platforms

The app does not use external servers, authentication, analytics, payments, or third-party AI for its core functionality. Content and quiz logic are bundled in the app. Optional text-to-speech uses Apple’s built-in iOS speech synthesiser only. No network connection is required for normal use.

5. Regional differences

There are no regional differences in features or content. The app behaves the same in all regions and does not geo-restrict content. All material is included in the app bundle and works offline everywhere.

6. Regulated industry / protected third-party material

Not applicable. Simple Punjabi is an original offline language-learning app. It does not operate in a highly regulated industry and does not include protected third-party media requiring separate authorization.

Additional notes

- Sign-in required: No
- In-app purchases: None (free app)
- Demo account: Not applicable

Thank you for reviewing Simple Punjabi. Please let me know if you need anything else.

Best regards,
Sachin Chopra
```

---



## Review contact

Fill in App Store Connect separately (unchanged):

- **First name / Last name:** Sachin Chopra
- **Phone:** +447921060035
- **Email:** [sachchopra@gmail.com](mailto:sachchopra@gmail.com)
- **Sign-in required:** No

---



## Version 1.0.1 update checklist (post-launch)

Use after **1.0.0 is already live** on the App Store. Copy for this release is in [listing.md](listing.md) (What’s New) and the **Notes field (version 1.0.1 update)** block above.

- [ ] `git checkout after-build-two` and run `npm test` in `mobile/`
- [ ] `npm run cap:sync` then `npm run cap:open`
- [ ] Xcode: **Version** = `1.0.1`, **Build** = next unused number (e.g. `2`)
- [ ] Run on a physical iPhone; test levels 1, 3, and 6 popups + one quiz
- [ ] **Product → Archive** → upload to App Store Connect
- [ ] Wait for build processing (often 15–60 min)
- [ ] App Store Connect → **+ Version** → `1.0.1` → attach build
- [ ] Paste **What’s New** from [listing.md](listing.md) → version 1.0.1 section
- [ ] Paste **App Review Notes** from above (replace `BUILD_NUMBER`)
- [ ] Optional: install via TestFlight and smoke-test
- [ ] **Submit for Review** (no Resolution Center reply needed unless Apple messages you)
- [ ] After approval: release manually or automatically
- [ ] Optional: `git tag v1.0.1`

---

## Resubmission quick checklist (Guideline 2.1 — archived)

- [ ] Record 2–3 min screen video on physical iPhone (launch → map → level → quiz → medal)
- [ ] Attach video or paste link in Resolution Center reply (text above)
- [ ] Update Notes field (first block above) with date and build number
- [ ] Xcode: bump **Build** to `2` (or next), archive, upload to App Store Connect
- [ ] Attach new build to version 1.0.0
- [ ] Send Resolution Center reply
- [ ] Submit for review