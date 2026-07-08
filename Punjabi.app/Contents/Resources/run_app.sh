#!/bin/bash
# Streamlit via venv; headless + Chrome; logs for Dock/GUI launches (no Terminal).
if [[ -z "${HOME:-}" ]]; then
  export HOME="$(eval echo "~$(/usr/bin/id -un)")"
fi
LOG="${HOME}/Library/Logs/PunjabiVocab.log"
mkdir -p "$(dirname "$LOG")"
if ! : >>"$LOG" 2>/dev/null; then
  LOG="${TMPDIR:-/tmp}/PunjabiVocab.log"
  mkdir -p "$(dirname "$LOG")" 2>/dev/null || true
fi
exec >>"$LOG" 2>&1
echo "==== $(/bin/date) run_app.sh pid=$$ argv0=$0 ===="

set -eo pipefail
# Optional: set PUNJABI_VOCAB_ROOT if $0 does not live inside the project (legacy Punjabi.app).
if [[ -n "${PUNJABI_VOCAB_ROOT:-}" ]]; then
  ROOT="$PUNJABI_VOCAB_ROOT"
else
  ROOT="$(cd "$(dirname "$0")" && pwd)"
fi
echo "ROOT=$ROOT"
PY="$ROOT/venv/bin/python"
if [[ ! -f "$PY" ]]; then
  echo "Missing venv python: $PY"
  /usr/bin/osascript -e 'display dialog "Missing venv Python. Check PunjabiVocab.log in ~/Library/Logs" with title "Punjabi vocab" buttons {"OK"} default button "OK"' || true
  exit 1
fi

PORT="${STREAMLIT_PORT:-8501}"
URL="http://127.0.0.1:${PORT}/"

cd "$ROOT"
echo "Starting streamlit on port $PORT ..."

"$PY" -m streamlit run "$ROOT/app.py" --server.headless true --server.port "$PORT" &
ST_PID=$!
echo "streamlit pid=$ST_PID"

cleanup() {
  kill "$ST_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

ready=0
for _ in {1..90}; do
  if /usr/bin/curl -sf "http://127.0.0.1:${PORT}/_stcore/health" >/dev/null 2>&1; then
    ready=1
    break
  fi
  /bin/sleep 0.5
done

if [[ "$ready" -ne 1 ]]; then
  echo "Streamlit did not become ready on port $PORT"
  /bin/sleep 1
  if /usr/bin/grep -q "PermissionError" "$LOG" 2>/dev/null && /usr/bin/grep -q "pyvenv.cfg" "$LOG" 2>/dev/null; then
    /usr/bin/osascript -e 'display dialog "macOS blocked Python from reading your venv under Documents (see ~/Library/Logs/PunjabiVocab.log).

Fix: System Settings, Privacy and Security, Full Disk Access, add Punjabi.app and enable it.

Or move this project out of Documents, or run ./run_app.sh from Terminal." with title "Punjabi vocab" buttons {"OK"} default button "OK"' || true
  else
    /usr/bin/osascript -e 'display dialog "Streamlit did not start in time. Open ~/Library/Logs/PunjabiVocab.log for details." with title "Punjabi vocab" buttons {"OK"} default button "OK"' || true
  fi
  exit 1
fi

echo "Opening browser..."
if [[ -d "/Applications/Google Chrome.app" ]] || [[ -d "${HOME}/Applications/Google Chrome.app" ]]; then
  /usr/bin/open -a "Google Chrome" "$URL"
else
  /usr/bin/open "$URL"
fi

trap - EXIT
wait "$ST_PID"
echo "streamlit exited $?"
