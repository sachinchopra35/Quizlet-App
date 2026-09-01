# Simple Punjabi

Offline iOS app for learning spoken Punjabi with everyday sentences, typed in English letters. Built with TypeScript, Vite, and Capacitor.

## Quick start

```bash
cd mobile
npm install
npm test
npm run cap:sync
npm run cap:open
```

In Xcode: set your signing team, select your iPhone, press Run.

Full setup, troubleshooting, and App Store steps: **[mobile/README.md](mobile/README.md)** and **[mobile/app-store/checklist.md](mobile/app-store/checklist.md)**.

## Project layout

| Path | Purpose |
|------|---------|
| [`mobile/`](mobile/) | The app — source code, tests, iOS project |
| [`vocab/`](vocab/) | **Edit vocab here** — CSV source of truth (`en` and `lang` columns) |
| [`docs/`](docs/) | GitHub Pages site for App Store privacy and support URLs |

When you build the app, CSVs from `vocab/` are copied into `mobile/public/data/` automatically.

## Vocab format

Each `*.csv` in `vocab/` needs two columns: `en` (English) and `lang` (romanized Punjabi). Extra columns are ignored; empty rows are skipped.

After editing vocab:

```bash
cd mobile
npm run cap:sync
```

Then rebuild in Xcode to update your phone.

## Public URLs (App Store)

Privacy and support pages are hosted via GitHub Pages from `docs/`. Setup guide: **[docs/github-pages-setup.md](docs/github-pages-setup.md)**.
