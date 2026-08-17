# Vocab quiz

Small Streamlit app that quizzes you on vocabulary: it shows a prompt in one language and you type the translation. Pick any `*.csv` in **`punjabi_vocab/`**, choose whether you translate **from English** or **to English**, and answer in rounds (it tracks first-try correctness).

**Input:** CSV files in the **`punjabi_vocab/`** folder (next to `app.py`) with two columns: `en` (English) and `lang` (your target language). Extra columns are ignored; empty rows are skipped.

---

**Run it** (from this directory, after installing deps from `requirements.txt` into `venv`):

```bash
./run_app.sh
```

Or manually: `source venv/bin/activate` then `streamlit run ./app.py`.

**Mac shortcut:** Shortcuts → *Run Shell Script* → shell `/bin/bash`, script:

`"$HOME/Projects/Quizlet App/run_app.sh"` (adjust if you keep the project elsewhere)

Optional: add *Open URLs* → `http://localhost:8501` after a short *Wait*.

**Dock:** Drag **`Punjabi Tester.app`** into the Dock. All it does is run **`run_app.sh`** in this folder (same as `./run_app.sh` in Terminal), then exit — **one bounce** is normal. Keep **`Punjabi Tester.app`** in the project folder next to **`run_app.sh`** and **`app.py`**.

**Optional Finder launcher (`Punjabi.app`):** If you use it, keep it next to `app.py`. It runs a **bundled** copy of the script so Dock launches avoid path issues. When you edit **`run_app.sh`**, sync the bundle:

`cp run_app.sh "Punjabi.app/Contents/Resources/run_app.sh"`

Do **not** move only the `.app` to `/Applications` unless you also move the whole project or adjust paths.

If nothing seems to start, check **`~/Library/Logs/PunjabiVocab-dock.log`** (Dock shortcut) and **`~/Library/Logs/PunjabiVocab.log`** (`run_app.sh` / Streamlit). For **`Punjabi.app`**, also **`~/Library/Logs/PunjabiVocab-launcher.log`**. In Activity Monitor, Streamlit may appear as **Python**, not “Streamlit”.

If the launcher log shows **`Operation not permitted`** on `run_app.sh`, that is macOS blocking **execution** of scripts inside **Documents** when started from a Dock app. The launcher now runs the script via **stdin** (`bash -s`) to avoid that. If it still fails, move the project out of `Documents` or grant the app access under **System Settings → Privacy & Security → Files and Folders** (or Full Disk Access as a last resort).

**Dock + project in Documents:** If **`PunjabiVocab.log`** shows **`PermissionError: ... pyvenv.cfg`**, the GUI app is not allowed to read the venv under `~/Documents`. Add **`Punjabi.app`** under **System Settings → Privacy & Security → Full Disk Access** (click +, pick the app, enable the toggle), or move the whole project folder out of **Documents**, or keep using **`./run_app.sh`** from Terminal.

If the Dock icon **bounces once and nothing happens**, macOS is often running the app from a **temporary copy** (quarantine / App Translocation), so it cannot see `run_app.sh`. Fix:

```bash
xattr -cr "$HOME/Projects/Quizlet App/Punjabi Tester.app" "$HOME/Projects/Quizlet App/Punjabi.app"
```

(Adjust the path if yours differs.) Then open again. First time Gatekeeper complains: right-click → **Open** → **Open**.

The project is expected under **`~/Projects/Quizlet App`** (not under `Documents`) so Dock / Python can read the venv without Full Disk Access.

`run_app.sh` stops any existing Streamlit on port 8501, then starts a fresh server (so Dock launches always pick up your latest code). It runs Streamlit in headless mode (so the system default browser is not used), waits until the server is up, then opens **Google Chrome** to the app if Chrome is installed; otherwise it uses the default browser.

**Regenerate the Dock icon for Punjabi Tester** (ਪ on white) after editing the script or if the icon is missing:

```bash
./venv/bin/pip install pillow   # once
./venv/bin/python scripts/build_dock_icon.py
```

---

That opens the app in your browser.

---

## iPhone (offline, home-screen icon)

A **Capacitor** mobile app lives in [`mobile/`](mobile/). It bundles all `punjabi_vocab/*.csv` files and runs fully offline on your phone — no Streamlit, no Mac server.

```bash
cd mobile
npm install
npm run cap:sync
npm run cap:open
```

In **Xcode**: set your signing team, connect your iPhone, press Run.

Full steps (CocoaPods, cert refresh, app icon): **[mobile/README.md](mobile/README.md)**.
