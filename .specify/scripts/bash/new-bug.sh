#!/usr/bin/env bash
# =============================================================================
# new-bug.sh — Scaffold a new bug report from the template
#
# Usage:
#   bash .specify/scripts/bash/new-bug.sh <category> "<title>"
#
# Example:
#   bash .specify/scripts/bash/new-bug.sh networking "SignalR Failed to Fetch"
#   bash .specify/scripts/bash/new-bug.sh auth "Session not persisting after login"
#
# Categories: signalr | auth | database | frontend | backend | networking | other
# =============================================================================

set -e

# ── Args ─────────────────────────────────────────────────────────────────────
CATEGORY="${1}"
TITLE="${2}"

if [[ -z "$CATEGORY" || -z "$TITLE" ]]; then
  echo "❌ Usage: bash new-bug.sh <category> \"<title>\""
  echo "   Example: bash new-bug.sh networking \"SignalR Failed to Fetch\""
  exit 1
fi

# ── Paths ─────────────────────────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
TEMPLATE="$REPO_ROOT/.specify/templates/bug-report-template.md"
INDEX="$REPO_ROOT/errors/README.md"
CATEGORY_DIR="$REPO_ROOT/errors/$CATEGORY"

# ── Auto-increment ID ─────────────────────────────────────────────────────────
# Reads all BUG-NNN entries from the index and picks the next number
LAST_ID=$(grep -oP 'BUG-\K\d+' "$INDEX" 2>/dev/null | sort -n | tail -1)
NEXT_NUM=$(( ${LAST_ID:-0} + 1 ))
BUG_ID=$(printf "BUG-%03d" "$NEXT_NUM")

# ── Slug (title → kebab-case) ─────────────────────────────────────────────────
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
FILENAME="${BUG_ID}-${SLUG}.md"
DATE_ISO=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_SHORT=$(date -u +"%Y-%m-%d")

# ── Create category folder if needed ─────────────────────────────────────────
mkdir -p "$CATEGORY_DIR"

OUTPUT_FILE="$CATEGORY_DIR/$FILENAME"

if [[ -f "$OUTPUT_FILE" ]]; then
  echo "⚠️  File already exists: $OUTPUT_FILE"
  exit 1
fi

# ── Copy template and replace placeholders ────────────────────────────────────
sed \
  -e "s/{{ID}}/${BUG_ID#BUG-}/g" \
  -e "s/{{TITLE}}/$TITLE/g" \
  -e "s/{{CATEGORY}}/$CATEGORY/g" \
  -e "s/{{DATE_ISO}}/$DATE_ISO/g" \
  -e "s/{{TAGS}}/$CATEGORY/g" \
  "$TEMPLATE" > "$OUTPUT_FILE"

echo "✅ Created: errors/$CATEGORY/$FILENAME"

# ── Append entry to the bug index ─────────────────────────────────────────────
# Find the last row in the table and append after it
INDEX_ROW="| [$BUG_ID]($CATEGORY/$FILENAME) | $TITLE | $CATEGORY | 🔴 \`open\` | $DATE_SHORT |"

# Append the new row at the end of the index table
echo "$INDEX_ROW" >> "$INDEX"

echo "✅ Added to: errors/README.md"
echo ""
echo "📋 Next steps:"
echo "   1. Open: errors/$CATEGORY/$FILENAME"
echo "   2. Fill in the ## System Context section"
echo "   3. Paste the error message into ## The Error"
echo "   4. Run the systematic-debugging skill"
