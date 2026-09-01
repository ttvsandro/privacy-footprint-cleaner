# Privacy Footprint Cleaner

A browser extension (Chrome Manifest V3) that helps you reduce your online
footprint — locally, with no backend and no automated bots. Built as a
portfolio project.

> **Read [DISCLAIMER.md](DISCLAIMER.md) before using or forking this.** It
> explains what the extension does and does not do, and why.

## Features

- **Tracker blocking** — blocks requests to ~20 well-known ad/tracking
  domains using `declarativeNetRequest`, with a live per-tab blocked count.
- **Cookie manager** — see and clear cookies for the current site, or wipe
  all cookies, with one click.
- **Data broker opt-out assistant** — a curated, editable list of well-known
  people-search / data-broker sites. For each one you can open its official
  opt-out page, or generate a pre-filled deletion-request email. You track
  the status (pending / requested / confirmed) locally.
- **Breach check (optional)** — look up an email against
  [Have I Been Pwned](https://haveibeenpwned.com) using your own free API
  key, called directly from your browser.

Everything is stored in `chrome.storage.local`. There is no server — nothing
leaves your machine unless you click a link that opens a third-party page,
open an email draft, or opt in to the breach-check call.

## Why it's built this way

Automating opt-out submissions against third-party sites (bots, CAPTCHA
bypass, scraping) can violate those sites' Terms of Service regardless of
any disclaimer in the code. This project sidesteps that entirely: it always
puts a human in the loop for anything that reaches a third party, so what it
does is exactly what any user could do by hand — just faster to organize.
See [DISCLAIMER.md](DISCLAIMER.md) for the full reasoning.

## Install (developer mode)

1. Clone this repo.
2. Open `chrome://extensions` in Chrome (or any Chromium-based browser).
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `extension/` folder.
5. Pin the extension and click its icon to open the popup.

## Project structure

```
extension/
  manifest.json          Manifest V3 config
  background.js          Service worker: tracker-block counter
  popup/                 Popup UI (HTML/CSS/JS, no framework)
  lib/                    cookies.js, brokers.js, hibp.js, storage.js
  data/brokers.json       Curated data-broker directory (edit freely)
  rules/tracker_rules.json  Static declarativeNetRequest block rules
```

## Known limitations

- The broker directory is a static, manually curated list. Opt-out URLs
  change over time — verify before relying on them (each entry is flagged
  `verifyBeforeUse: true` as a reminder).
- Blocked-tracker counting via `onRuleMatchedDebug` is intended for
  unpacked/developer-mode use, which fits a portfolio demo.
- The breach-check feature requires a personal HIBP API key (their free
  tier for account search was deprecated; check current pricing).

## License

[MIT](LICENSE) — provided as-is, no warranty. See [DISCLAIMER.md](DISCLAIMER.md).
