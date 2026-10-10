# Anycap

Select text or a link in any Mac app, then click Anycap in PopClip to save it.
A web address becomes a link; other text becomes a note. A selection containing
a detected link keeps the selected words with that link.

Requires macOS 26 or newer, [Anycap](https://anycap.co) installed in
`/Applications` or `~/Applications`, and PopClip build 6221 or newer.
Double-click the extension package to install it.

The extension sends the selection to Anycap's bundled MCP helper on your Mac.
It makes no network requests itself. Anycap may fetch link metadata and applies
the sync and AI settings you chose in the app. No separate account, Python,
server, or additional runtime is required.

The shell action is needed to run the local helper over standard input and
output. Its JavaScript runs through macOS's built-in JavaScript for Automation
with Foundation; it sends no Apple events and requests no automation access.

Report problems through this repository's GitHub issues.
