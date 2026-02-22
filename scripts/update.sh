#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
AUTO_MODE=false

if [[ "${1:-}" == "--auto" ]]; then
  AUTO_MODE=true
fi

cd "${REPO_DIR}"

echo "=== opencode-memory updater ==="
echo

if [[ ! -d ".git" ]]; then
  echo "Not a git repository: ${REPO_DIR}"
  exit 1
fi

if ! git remote get-url upstream >/dev/null 2>&1; then
  echo "Adding upstream remote..."
  git remote add upstream https://github.com/thedotmack/claude-mem.git
fi

echo "Fetching upstream..."
git fetch upstream

BRANCH="master"
if git show-ref --verify --quiet refs/heads/main; then
  BRANCH="main"
fi

UPSTREAM_LATEST=$(git rev-parse "upstream/${BRANCH}")
LOCAL_LATEST=$(git rev-parse "${BRANCH}")

if [[ "${UPSTREAM_LATEST}" == "${LOCAL_LATEST}" ]]; then
  echo "Already up to date with upstream/${BRANCH}."
  exit 0
fi

echo
echo "New commits:"
git log --oneline "${BRANCH}..upstream/${BRANCH}" | head -10
echo

if [[ "${AUTO_MODE}" == "true" ]]; then
  echo "Merging upstream/${BRANCH}..."
  git merge "upstream/${BRANCH}" --no-edit
  echo "Building..."
  npm run build
  echo "Update complete. Restart OpenCode to load updates."
else
  echo "Run with --auto to merge + build automatically."
fi
