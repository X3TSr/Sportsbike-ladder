#!/bin/sh
# Bump the ?v= cache-busting stamp on every local CSS and JS reference.
#
# Why this exists: the host serves index.html with max-age=0 but scripts and
# styles with max-age=14400. A browser therefore keeps four-hour-old assets
# while the HTML updates immediately, and a page can end up with new markup
# wired to old JavaScript — which is exactly how the year selector rendered
# as an empty row. Versioned URLs make new HTML request new files.
#
# Run this whenever you change anything under styles/ or scripts/, then commit
# index.html along with the change.
#
#   ./bump-assets.sh

set -e
cd "$(dirname "$0")"

STAMP=$(date -u +%Y%m%d%H%M)

sed -i.bak -E "s|(href=\"styles/[^\"?]+\.css)(\?v=[^\"]*)?\"|\1?v=$STAMP\"|g; \
               s|(src=\"scripts/[^\"?]+\.js)(\?v=[^\"]*)?\"|\1?v=$STAMP\"|g" index.html
rm -f index.html.bak

echo "asset version -> $STAMP"
grep -c "?v=$STAMP" index.html | sed 's/^/references updated: /'
