#!/bin/bash
# opencode-memory Auto-Update Script
# Usage: ./update.sh [--auto]

set -e

REPO_DIR="C:/Users/WINDOWS 10/.gemini/antigravity/opencode-mem"
AUTO_MODE=false

if [ "$1" = "--auto" ]; then
  AUTO_MODE=true
fi

cd "$REPO_DIR"

echo "=== opencode-memory Updater ==="
echo ""

# Check if git repo
if [ ! -d ".git" ]; then
  echo "❌ Not a git repository. Run from the opencode-memory directory."
  exit 1
fi

# Check upstream remote
if ! git remote get-url upstream &>/dev/null; then
  echo "Adding upstream remote..."
  git remote add upstream https://github.com/thedotmack/claude-mem.git
fi

# Fetch upstream
echo "📥 Fetching upstream (claude-mem)..."
git fetch upstream

# Get latest commit hash
UPSTREAM_LATEST=$(git rev-parse upstream/master_L)
LOCALATEST=$(git rev-parse master)

if [ "$UPSTREAM_LATEST" = "$LOCAL_LATEST" ]; then
  echo "✅ Already up to date with upstream!"
  exit 0
fi

# Show what's new
echo ""
echo "📋 New commits available:"
git log --oneline master..upstream/master | head -10
echo ""

if [ "$AUTO_MODE" = true ]; then
  echo "🔄 Auto-updating..."
  git merge upstream/master --no-edit
  echo "📦 Rebuilding..."
  npm run build
  echo "✅ Update complete!"
  echo ""
  echo "⚠️  Restart OpenCode to load new version"
else
  echo "To update, run: $0 --auto"
  echo "Or manually: git merge upstream/master && npm run build"
fi
