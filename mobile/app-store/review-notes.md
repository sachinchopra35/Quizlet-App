# App Review notes

Materials for **Simple Punjabi** resubmission after Guideline 2.1 — Information Needed.

---

## App Review Information → Notes field

Paste into **App Store Connect → App Review Information → Notes** (and keep for future builds). Not shown to the public.

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



## Resubmission quick checklist

- [ ] Record 2–3 min screen video on physical iPhone (launch → map → level → quiz → medal)
- [ ] Attach video or paste link in Resolution Center reply (text above)
- [ ] Update Notes field (first block above) with date and build number
- [ ] Xcode: bump **Build** to `2` (or next), archive, upload to App Store Connect
- [ ] Attach new build to version 1.0.0
- [ ] Send Resolution Center reply
- [ ] Submit for review