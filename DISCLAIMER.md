# Disclaimer

This is an educational portfolio project. Read this before using or
publishing it.

## What this extension does

- Blocks known tracker/ad domains locally using Chrome's
  `declarativeNetRequest` API (the same mechanism used by mainstream
  ad-blocking extensions).
- Lets you inspect and delete cookies for the active site or for the whole
  browser, using the standard `cookies` API.
- Keeps a local, editable directory of well-known data brokers with links to
  **their own official opt-out pages**, and helps you draft an email
  requesting deletion of your data.
- Optionally checks a breach database (Have I Been Pwned) **using your own
  API key**, calling their public API directly from your browser.

## What this extension deliberately does NOT do

- It does **not** scrape, automate form submission, solve CAPTCHAs, or send
  any request to a data broker on your behalf. Every opt-out action opens a
  page or a pre-filled email draft for **you** to review and send yourself.
- It does **not** run a backend server. No personal data is transmitted
  anywhere except when you explicitly click a link that opens a third-party
  site or your own email client, and (opt-in) when you use the breach-check
  feature with your own API key.
- It does **not** guarantee that any data broker will honor a removal
  request, that the listed opt-out URLs are current, or that your
  information will stay removed — data brokers commonly re-scrape public
  records over time.

## Why it's built this way

A disclaimer or license clause does not make an otherwise unlawful action
(e.g. automating around a site's anti-bot protections, or violating its
Terms of Service) lawful. This project avoids that risk entirely by keeping
a human in the loop for every action that reaches a third party, and by never
storing or transmitting your personal data through infrastructure the author
controls.

## No warranty, no legal advice

This software is provided "as is", without warranty of any kind — see
[LICENSE](LICENSE). Nothing here is legal advice. Data protection laws
(GDPR, CCPA/CPRA, or others) vary by jurisdiction and by company; consult a
qualified professional for your specific situation. The broker directory in
[`extension/data/brokers.json`](extension/data/brokers.json) is provided for
convenience only — verify each URL on the broker's own site before use, as
these pages change without notice.

## Trademarks

Company and product names referenced in the broker directory belong to their
respective owners. This project is not affiliated with, endorsed by, or
sponsored by any of them.
