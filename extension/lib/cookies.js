// Cookie inspection/removal for the active tab. Uses the standard
// chrome.cookies API — no scraping, no third-party requests involved.

export function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export async function getCookiesForHostname(hostname) {
  if (!hostname) return [];
  const all = await chrome.cookies.getAll({});
  return all.filter((c) => c.domain.replace(/^\./, "") === hostname || hostname.endsWith(c.domain.replace(/^\./, "")));
}

export async function clearCookiesForHostname(hostname) {
  const cookies = await getCookiesForHostname(hostname);
  let cleared = 0;
  for (const cookie of cookies) {
    const protocol = cookie.secure ? "https://" : "http://";
    const url = `${protocol}${cookie.domain.replace(/^\./, "")}${cookie.path}`;
    const removed = await chrome.cookies.remove({ url, name: cookie.name, storeId: cookie.storeId });
    if (removed) cleared += 1;
  }
  return cleared;
}

export async function clearAllCookies() {
  const all = await chrome.cookies.getAll({});
  let cleared = 0;
  for (const cookie of all) {
    const protocol = cookie.secure ? "https://" : "http://";
    const url = `${protocol}${cookie.domain.replace(/^\./, "")}${cookie.path}`;
    const removed = await chrome.cookies.remove({ url, name: cookie.name, storeId: cookie.storeId });
    if (removed) cleared += 1;
  }
  return cleared;
}
