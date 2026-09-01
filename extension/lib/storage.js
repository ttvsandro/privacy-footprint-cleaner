// Thin wrapper around chrome.storage.local. Everything the app persists
// (profile info, broker statuses, settings) stays on this device only —
// nothing is ever sent to a remote server.

export async function getAll() {
  return chrome.storage.local.get(null);
}

export async function get(keys) {
  return chrome.storage.local.get(keys);
}

export async function set(values) {
  return chrome.storage.local.set(values);
}

export async function getBrokerStatuses() {
  const { brokerStatuses = {} } = await get("brokerStatuses");
  return brokerStatuses;
}

export async function setBrokerStatus(brokerId, status) {
  const brokerStatuses = await getBrokerStatuses();
  brokerStatuses[brokerId] = { status, updatedAt: new Date().toISOString() };
  await set({ brokerStatuses });
  return brokerStatuses;
}

export async function getProfile() {
  const { profile = { name: "", city: "", region: "", country: "" } } = await get("profile");
  return profile;
}

export async function setProfile(profile) {
  await set({ profile });
}
