import { hostnameFromUrl, getCookiesForHostname, clearCookiesForHostname, clearAllCookies } from "../lib/cookies.js";
import { loadBrokers, buildOptOutEmail } from "../lib/brokers.js";
import { checkBreaches } from "../lib/hibp.js";
import { get, set, getBrokerStatuses, setBrokerStatus, getProfile, setProfile } from "../lib/storage.js";

// ---------- Tabs ----------
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

// ---------- Trackers & Cookies ----------
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function refreshTrackerTab() {
  const tab = await getActiveTab();
  const hostname = tab ? hostnameFromUrl(tab.url) : null;

  const cookies = hostname ? await getCookiesForHostname(hostname) : [];
  document.getElementById("site-cookie-count").textContent = cookies.length;

  const { totalBlocked = 0 } = await get("totalBlocked");
  document.getElementById("total-blocked-count").textContent = totalBlocked;

  const { trackingEnabled = true } = await get("trackingEnabled");
  document.getElementById("tracking-toggle").checked = trackingEnabled;
}

document.getElementById("tracking-toggle").addEventListener("change", async (e) => {
  const enabled = e.target.checked;
  await chrome.declarativeNetRequest.updateEnabledRulesets(
    enabled
      ? { enableRulesetIds: ["tracker_rules"] }
      : { disableRulesetIds: ["tracker_rules"] }
  );
  await set({ trackingEnabled: enabled });
});

document.getElementById("clear-site-cookies").addEventListener("click", async () => {
  const tab = await getActiveTab();
  const hostname = hostnameFromUrl(tab?.url);
  const statusEl = document.getElementById("cookie-status");
  if (!hostname) {
    statusEl.textContent = "No se pudo determinar el sitio activo.";
    return;
  }
  const cleared = await clearCookiesForHostname(hostname);
  statusEl.textContent = `${cleared} cookies borradas de ${hostname}.`;
  refreshTrackerTab();
});

document.getElementById("clear-all-cookies").addEventListener("click", async () => {
  const statusEl = document.getElementById("cookie-status");
  const cleared = await clearAllCookies();
  statusEl.textContent = `${cleared} cookies borradas en total.`;
  refreshTrackerTab();
});

// ---------- Data Brokers ----------
async function refreshProfileForm() {
  const profile = await getProfile();
  document.getElementById("profile-name").value = profile.name || "";
  document.getElementById("profile-city").value = profile.city || "";
  document.getElementById("profile-region").value = profile.region || "";
  document.getElementById("profile-country").value = profile.country || "";
}

document.getElementById("save-profile").addEventListener("click", async () => {
  await setProfile({
    name: document.getElementById("profile-name").value.trim(),
    city: document.getElementById("profile-city").value.trim(),
    region: document.getElementById("profile-region").value.trim(),
    country: document.getElementById("profile-country").value.trim(),
  });
  renderBrokers();
});

function statusLabel(status) {
  return { pending: "Pendiente", requested: "Solicitada", confirmed: "Confirmada" }[status] || "Pendiente";
}

async function renderBrokers() {
  const [brokers, statuses, profile] = await Promise.all([loadBrokers(), getBrokerStatuses(), getProfile()]);
  const list = document.getElementById("broker-list");
  list.innerHTML = "";

  let confirmedCount = 0;

  for (const broker of brokers) {
    const status = statuses[broker.id]?.status || "pending";
    if (status === "confirmed") confirmedCount += 1;

    const card = document.createElement("div");
    card.className = "broker-card";

    const actionHtml =
      broker.optOutMethod === "email"
        ? `<button class="secondary" data-action="email" data-id="${broker.id}">Generar email</button>`
        : `<button class="secondary" data-action="open" data-id="${broker.id}">Abrir página de baja</button>`;

    card.innerHTML = `
      <h3>${broker.name}</h3>
      <div class="broker-meta">${broker.domain} · ${broker.category}${broker.verifyBeforeUse ? " · verifica el enlace antes de usar" : ""}</div>
      ${broker.notes ? `<div class="broker-notes">${broker.notes}</div>` : ""}
      <div class="broker-actions">
        ${actionHtml}
        <select data-id="${broker.id}" class="status-select">
          <option value="pending" ${status === "pending" ? "selected" : ""}>Pendiente</option>
          <option value="requested" ${status === "requested" ? "selected" : ""}>Solicitada</option>
          <option value="confirmed" ${status === "confirmed" ? "selected" : ""}>Confirmada</option>
        </select>
      </div>
    `;
    list.appendChild(card);
  }

  document.getElementById("broker-progress-fill").style.width = `${Math.round((confirmedCount / brokers.length) * 100)}%`;
  document.getElementById("broker-progress-text").textContent = `${confirmedCount} de ${brokers.length} bajas confirmadas`;

  list.querySelectorAll('[data-action="open"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      const broker = brokers.find((b) => b.id === btn.dataset.id);
      chrome.tabs.create({ url: broker.optOutUrl });
    });
  });

  list.querySelectorAll('[data-action="email"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      const broker = brokers.find((b) => b.id === btn.dataset.id);
      const recipient = broker.optOutEmail || window.prompt(`Introduce el email de contacto de privacidad de ${broker.name} (búscalo en su web oficial):`, "");
      if (!recipient) return;
      chrome.tabs.create({ url: buildOptOutEmail(broker, profile, recipient) });
    });
  });

  list.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", async () => {
      await setBrokerStatus(select.dataset.id, select.value);
      renderBrokers();
    });
  });
}

// ---------- Breach check ----------
document.getElementById("hibp-check").addEventListener("click", async () => {
  const resultEl = document.getElementById("hibp-result");
  const apiKey = document.getElementById("hibp-key").value.trim();
  const email = document.getElementById("hibp-email").value.trim();
  resultEl.textContent = "Buscando…";

  try {
    const breaches = await checkBreaches(email, apiKey);
    if (breaches.length === 0) {
      resultEl.textContent = "No se encontraron brechas conocidas para este email.";
      return;
    }
    resultEl.innerHTML = breaches
      .map((b) => `<div class="breach-item"><strong>${b.Name}</strong> — ${b.BreachDate}</div>`)
      .join("");
  } catch (err) {
    resultEl.textContent = err.message;
  }
});

// ---------- Init ----------
refreshTrackerTab();
refreshProfileForm();
renderBrokers();
