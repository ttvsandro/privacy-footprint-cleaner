// Data broker directory + opt-out email template generator.
//
// IMPORTANT: this module never contacts any broker automatically. It only
// prepares a mailto: link or opens the broker's own official opt-out page
// in a new tab — the human always reviews and sends the request themselves.
// See DISCLAIMER.md for why that distinction matters.

export async function loadBrokers() {
  const url = chrome.runtime.getURL("data/brokers.json");
  const res = await fetch(url);
  return res.json();
}

export function buildOptOutEmail(broker, profile, recipientEmail) {
  const subject = `Data deletion request – ${profile.name || "[your name]"}`;
  const body = [
    `To whom it may concern at ${broker.name},`,
    "",
    `I am requesting that you delete any personal information you hold about me from your service (${broker.domain}).`,
    "",
    `Name: ${profile.name || "[your name]"}`,
    `Location: ${[profile.city, profile.region, profile.country].filter(Boolean).join(", ") || "[your city/region/country]"}`,
    "",
    "Please confirm in writing once the removal has been completed. If your jurisdiction offers a specific legal basis (e.g. GDPR Art. 17 right to erasure, or CCPA/CPRA right to delete), I invoke it here as applicable.",
    "",
    "Thank you,",
    profile.name || "[your name]",
  ].join("\n");

  const params = new URLSearchParams({ subject, body });
  const to = encodeURIComponent(recipientEmail || "");
  return `mailto:${to}?${params.toString()}`;
}
