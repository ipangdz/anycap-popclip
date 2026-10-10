#!/bin/zsh
# JXA and Foundation ship with macOS; no Python or additional runtime is needed.
exec /usr/bin/osascript -l JavaScript "${0:A:h}/save.js"
