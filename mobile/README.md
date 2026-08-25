# Simple Punjabi on iPhone (offline)

This folder is a **phone version** of your vocab quiz. It does **not** use Streamlit. Your word lists are copied from `punjabi_vocab/` and baked into the app when you build it.

Your Mac desktop app (`run_app.sh` / Dock) is unchanged. Use that to edit CSVs as usual.

---

## Words you’ll see

| Term | What it means |
|------|----------------|
| **Terminal** | The Mac app where you type commands (black or white window with a prompt). |
| **npm** | A tool that runs project scripts. You never install things manually — `npm install` does it. |
| **Vite** | A local preview server. When you run `npm run dev`, Terminal “belongs” to Vite until you stop it. |
| **Xcode** | Apple’s app for putting the quiz on your iPhone. You click buttons there; not much typing. |

---

## One-time setup on your Mac

1. Install **Xcode** from the Mac App Store (large download).
2. Install **Node.js** from [https://nodejs.org](https://nodejs.org) — choose the **LTS** installer.
3. Open **Terminal** (Spotlight: type `Terminal`).

Go to this project’s mobile folder (copy-paste the whole line, press Enter):

```bash
cd "/Users/sachinchopra/Projects/Quizlet App/mobile"
```

Install dependencies (only needed once, or after pulling big git changes):

```bash
npm install
```

Wait until it finishes. You should get your prompt back (no spinner).

---

## “My Terminal is stuck on Vite” — read this

When you run:

```bash
npm run dev
```

Terminal shows lots of lines and ends with something like:

```text
  ➜  Local:   http://localhost:5173/
```

That means **Vite is running**. The window is busy serving the quiz in your browser. You **cannot** type another command in that same window until you stop it.

**You have two options:**

### Option A — Stop Vite (get the prompt back)

Press **`Control + C`** on the keyboard (hold Control, tap C).

You should see the prompt again (e.g. `yourname@Mac mobile %`). Now you can run `npm test` or anything else.

### Option B — Keep Vite running (use a second Terminal)

1. **Terminal → New Tab** (or **Shell → New Tab**), or open Terminal again from Spotlight.
2. In the **new** tab, run:

```bash
cd "/Users/sachinchopra/Projects/Quizlet App/mobile"
npm test
```

The first tab can keep Vite open; the second tab runs tests.

**You do not need Vite running to install the app on your iPhone.** For the phone, use the “Put the app on your iPhone” section below, not `npm run dev`.

---

## What should I run? (pick one goal)

### Goal 1 — I want the app on my iPhone (most people want this)

In Terminal:

```bash
cd "/Users/sachinchopra/Projects/Quizlet App/mobile"
npm run cap:sync
npm run cap:open
```

- `cap:sync` — copies your latest CSVs, builds the app, updates the iOS project. Takes a short while.
- `cap:open` — opens **Xcode**.

Then in **Xcode** (not Terminal):

1. Plug in your iPhone with a cable.
2. In the left sidebar, click the blue **App** project.
3. Open **Signing & Capabilities**.
4. Under **Team**, choose your **Apple ID** (add it in Xcode → Settings → Accounts if needed).
5. At the top, next to the Play button, pick **your iPhone** (not a simulator).
6. Click the **Play ▶** button.
7. On the iPhone: if asked, tap **Trust** / allow the developer.

You should get a **Simple Punjabi** icon on your home screen. It works **offline** — no Mac needed after install.

**Free Apple ID:** the app may stop opening after about **7 days**. Plug in the phone and press **Play ▶** in Xcode again (about a minute).

---

### Goal 2 — I want to try the quiz in Chrome on my Mac (optional)

```bash
cd "/Users/sachinchopra/Projects/Quizlet App/mobile"
npm run dev
```

Open the link it prints (usually `http://localhost:5173`).

When you’re done, press **`Control + C`** in that Terminal window to stop Vite.

---

### Goal 3 — I want to run tests (optional)

Tests check that spelling-matcher logic still works. **Not required** to use the app on your phone.

**If Vite is running:** use a **new Terminal tab** (see above), or press **`Control + C`** first.

```bash
cd "/Users/sachinchopra/Projects/Quizlet App/mobile"
npm test
```

It should say all tests passed, then return to the prompt.

---

## After you edit vocab CSVs on the Mac

1. Save your changes in `punjabi_vocab/` (same as for the desktop quiz).
2. In Terminal:

```bash
cd "/Users/sachinchopra/Projects/Quizlet App/mobile"
npm run cap:sync
```

3. In Xcode, press **Play ▶** again to update the phone.

---

## If Xcode complains about CocoaPods (uncommon)

Only if Xcode shows an error mentioning **Pods** or **pod install**:

```bash
cd "/Users/sachinchopra/Projects/Quizlet App/mobile/ios/App"
pod install
```

If `pod` is not found:

```bash
sudo gem install cocoapods
```

Then run `pod install` again. You may need your Mac password for `sudo`.

---

## App icon

The shipped icon is **ਪ on off-white** (`mobile/icon-variants/02-pa-off-white.png`). Regenerate all variants or reinstall into Xcode assets:

```bash
./venv/bin/python scripts/build_icon_variants.py --install-ios
```

Then rebuild in Xcode (Product → Clean Build Folder → Run).

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| `command not found: npm` | Install Node.js from nodejs.org, quit and reopen Terminal. |
| Terminal won’t accept typing | Vite (or something else) is running — **Control + C** or use a new tab. |
| `npm run cap:open` does nothing | Install Xcode from the App Store. |
| iPhone not listed in Xcode | Unlock phone, tap Trust This Computer, try another cable. |
| App won’t open on phone after a week | Normal with free Apple ID — Run ▶ from Xcode again. |
| Build fails: `Sandbox: bash deny` / `Pods-App-frameworks.sh` | Xcode’s **User Script Sandboxing** blocks CocoaPods. This repo sets it to **No** in the iOS project; if it comes back after a fresh `cap add ios`, open **App** target → **Build Settings** → search **User Script Sandboxing** → set to **No**, then **Product → Clean Build Folder** and Run again. |

---

## Folder map (for curiosity)

| Folder / file | Purpose |
|---------------|---------|
| `src/` | Quiz code (matching, rounds, UI, sounds) |
| `public/data/` | Copy of your CSVs (auto-generated; don’t edit here) |
| `ios/` | Xcode project (auto-generated) |
| `../punjabi_vocab/` | **Edit vocab here** — source of truth |

Desktop quiz code stays in `../vocab_quiz/` and `../app.py`.
