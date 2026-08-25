# GitHub Pages setup — step by step

This folder (`docs/`) becomes your public website for Apple’s **Privacy Policy URL** and **Support URL**.

**Your URL (after setup):**

```
https://sachinchopra35.github.io/Quizlet-App/
```

Use that **same URL** for both fields in App Store Connect.

---

## Part 1 — Push the website files to GitHub (Terminal)

You only do this once (or whenever you update the page).

### 1. Open Terminal

Spotlight → type **Terminal** → Enter.

### 2. Go to your project folder

Copy-paste this whole line and press Enter:

```bash
cd "/Users/sachinchopra/Projects/Quizlet App"
```

### 3. Check what changed

```bash
git status
```

You should see `docs/` as new files.

### 4. Add, commit, and push

```bash
git add docs/
git commit -m "Add GitHub Pages site for App Store privacy and support"
git push
```

If `git push` asks for authentication, use your usual GitHub login (SSH key or browser).

---

## Part 2 — Turn on GitHub Pages (in your browser)

### 1. Open your repo on GitHub

Go to: **https://github.com/sachinchopra35/Quizlet-App**

(If the repo is **private**, you need a **free GitHub account** — Pages on private repos is included on free plans for personal accounts. If Pages won’t enable, set the repo to **Public** under Settings → General → Danger zone, or use a public `simple-punjabi-pages` repo instead.)

### 2. Open Settings

Click **Settings** (top tab on the repo page — not your profile settings).

### 3. Open Pages

In the **left sidebar**, click **Pages**.

### 4. Configure the source

Under **Build and deployment**:

| Setting | Choose |
|---------|--------|
| **Source** | Deploy from a branch |
| **Branch** | `main` |
| **Folder** | `/docs` |

Click **Save**.

### 5. Wait

GitHub takes **1–5 minutes** to publish. Refresh the Pages settings screen — you should see:

> Your site is live at **https://sachinchopra35.github.io/Quizlet-App/**

### 6. Test in Safari

Open that URL on your Mac or iPhone. You should see:

- **Simple Punjabi** heading
- Privacy Policy section
- Support section

If you get **404**: wait another few minutes, then hard-refresh. Make sure you pushed `docs/index.html` to `main`.

---

## Part 3 — Paste into App Store Connect

When you create your app listing:

| Field | URL |
|-------|-----|
| **Privacy Policy URL** | `https://sachinchopra35.github.io/Quizlet-App/` |
| **Support URL** | `https://sachinchopra35.github.io/Quizlet-App/` |

Same URL twice is fine.

---

## Updating the page later

1. Edit `docs/index.html` (or the `.md` files in `mobile/app-store/` and sync HTML)
2. `git add`, `git commit`, `git push`
3. GitHub updates the site automatically within a few minutes

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 404 after 10+ minutes | Confirm branch is `main`, folder is `/docs`, and `docs/index.html` exists on GitHub (browse the repo online) |
| Pages option missing | Repo may need to be public, or wait until GitHub account email is verified |
| Old content showing | Hard refresh Safari (hold refresh on iPhone) or try a private browsing tab |
| Wrong URL | Pages URL is always `https://<username>.github.io/<repo-name>/` — repo name is case-sensitive (`Quizlet-App`) |
