// Optional breach lookup via the public Have I Been Pwned API.
// Requires the USER's OWN API key (free to request at haveibeenpwned.com/API/Key).
// The key and the email you check are sent only to haveibeenpwned.com,
// directly from your browser — this extension has no server of its own.

const HIBP_BASE = "https://haveibeenpwned.com/api/v3";

export async function checkBreaches(email, apiKey) {
  if (!apiKey) throw new Error("Missing HIBP API key. Get one at haveibeenpwned.com/API/Key.");
  const res = await fetch(`${HIBP_BASE}/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
    headers: {
      "hibp-api-key": apiKey,
      "user-agent": "privacy-footprint-cleaner-portfolio-project",
    },
  });

  if (res.status === 404) return [];
  if (res.status === 401) throw new Error("Invalid API key.");
  if (res.status === 429) throw new Error("Rate limited by HIBP — wait a minute and try again.");
  if (!res.ok) throw new Error(`HIBP request failed (${res.status}).`);

  return res.json();
}
