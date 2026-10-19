var AUTH_URL = "https://konto.biedronka.pl/realms/loyalty/protocol/openid-connect/auth";
var CLIENT_ID = "cma20";
var REDIRECT = "app://cma20.biedronka.pl";

var origin = "";
var access = "";
var refresh = "";
var pkce = "";
var imported = {};
var rows = [];
var page = 1;
var archived = false;
var busy = false;
var loading = false;
var importing = false;
var finishing = false;
var results = false;
var more = false;
var empty = "";
var session = "";
var status = "";

var originEl = document.getElementById("origin");
var signedOutEl = document.getElementById("signed-out");
var signedInEl = document.getElementById("signed-in");
var sessionEl = document.getElementById("session");
var statusEl = document.getElementById("status");
var resultsEl = document.getElementById("results");
var rowsEl = document.getElementById("rows");
var codeEl = document.getElementById("code");
var signInEl = document.getElementById("sign-in");
var finishEl = document.getElementById("finish");
var signOutEl = document.getElementById("sign-out");
var importAllEl = document.getElementById("import-all");
var moreEl = document.getElementById("more");

signInEl.addEventListener("click", function () {
  startSignIn().catch(function (err) {
    setStatus(messageOf(err));
    render();
  });
});
finishEl.addEventListener("click", function () {
  finishSignIn(codeEl.value);
});
signOutEl.addEventListener("click", signOut);
importAllEl.addEventListener("click", importAll);
moreEl.addEventListener("click", function () {
  loadBills(false);
});

connectRedirects();
boot();

function connectRedirects() {
  var port = chrome.runtime.connect({ name: "cowkoszyku-biedronka" });
  port.onMessage.addListener(function (msg) {
    if (!msg || msg.type !== "biedronka-redirect" || !msg.url) return;
    codeEl.value = msg.url;
    setStatus("The helper filled the redirect. Click Finish sign-in.");
    render();
  });
  port.onDisconnect.addListener(function () {
    setTimeout(connectRedirects, 400);
  });
}

function boot() {
  chrome.storage.session.get(["cowkoszykuOrigin", "accessToken", "refreshToken", "pkce"]).then(function (stored) {
    origin = String(stored.cowkoszykuOrigin || "");
    access = String(stored.accessToken || "");
    refresh = String(stored.refreshToken || "");
    pkce = String(stored.pkce || "");
    showSession();
    render();
    if (!origin) return;
    if (access || refresh) loadBills(true);
  });
}

function signedIn() {
  return Boolean(access || refresh);
}

function showSession() {
  if (!signedIn()) {
    session = "";
    return;
  }
  var payload = jwtPayload(access);
  session =
    typeof payload.exp === "number"
      ? "Signed in · access token until " + new Date(payload.exp * 1000).toLocaleString("pl-PL")
      : "Signed in.";
}

function saveTokens() {
  return chrome.storage.session.set({
    accessToken: access,
    refreshToken: refresh,
    pkce: pkce,
  });
}

function setStatus(text) {
  status = text || "";
}

async function startSignIn() {
  if (!origin) return;
  var next = await generatePkce();
  pkce = next.verifier;
  await saveTokens();
  codeEl.value = "";
  setStatus("Sign in in the Biedronka tab. The redirect will land here.");
  render();
  var opened = window.open(authorizationURL(next.challenge), "_blank");
  if (!opened) {
    setStatus("Popup blocked. Allow popups for this extension, then click Sign in again.");
    render();
  }
}

async function finishSignIn(raw) {
  if (finishing) return;
  if (!pkce) {
    setStatus("Start sign-in again so this page still has the PKCE verifier.");
    render();
    return;
  }
  var code;
  try {
    code = authCodeFromRedirect(raw);
  } catch (err) {
    setStatus(messageOf(err));
    render();
    return;
  }
  finishing = true;
  busy = true;
  render();
  try {
    var next = await tokenRequest({ grant_type: "authorization_code", code: code, code_verifier: pkce });
    if (!next.access_token) throw new Error("token rejected");
    pkce = "";
    remember(next);
    await saveTokens();
    showSession();
    codeEl.value = "";
    setStatus("Signed in. Loading bills…");
    render();
    await loadBills(true);
  } catch (err) {
    setStatus(messageOf(err));
    codeEl.value = "";
  } finally {
    finishing = false;
    busy = false;
    render();
  }
}

function signOut() {
  access = "";
  refresh = "";
  pkce = "";
  page = 1;
  archived = false;
  rows = [];
  results = false;
  more = false;
  showSession();
  setStatus("Signed out.");
  saveTokens();
  render();
}

async function markKnown(batch) {
  var ids = [];
  for (var i = 0; i < batch.length; i++) {
    if (batch[i] && batch[i].id) ids.push(String(batch[i].id));
  }
  if (!ids.length || !origin) return;
  try {
    var res = await fetch(origin + "/api/biedronka/imported", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ids.slice(0, 200) }),
    });
    if (!res.ok) return;
    var data = await res.json();
    var known = data && data.ids ? data.ids : [];
    for (var j = 0; j < known.length; j++) {
      if (known[j]) imported[known[j]] = true;
    }
  } catch (err) {
    /* the list still works; Import will skip duplicates */
  }
}

async function loadBills(reset) {
  if (loading) return;
  if (!access && !refresh) {
    setStatus("Sign in with Moja Biedronka first.");
    render();
    return;
  }
  loading = true;
  busy = true;
  render();
  try {
    await ensureFresh();
    if (reset) {
      page = 1;
      archived = false;
      rows = [];
    }
    setStatus("Loading page " + page + "…");
    render();
    var payload = await biedronkaCall("transactions", {
      access_token: access,
      page: page,
      archived: archived,
    });
    var batch = Array.isArray(payload.transactions)
      ? payload.transactions
      : Array.isArray(payload.results)
        ? payload.results
        : [];
    rows = rows.concat(batch);
    await markKnown(batch);
    var fromArchive = archived;
    var next = Number(payload.next_page);
    if (next && next > page) page = next;
    else if (!archived) {
      archived = true;
      page = 1;
    } else page = 0;
    var n = rows.length;
    empty = !n ? (fromArchive ? "No older bills." : "No current bills from the last 12 days. Load more for older bills.") : "";
    results = true;
    more = page > 0;
    setStatus(n ? n + (n === 1 ? " bill loaded." : " bills loaded.") : "");
  } catch (err) {
    setStatus(messageOf(err));
  } finally {
    loading = false;
    busy = false;
    render();
  }
}

function canImport(tx) {
  return Boolean(tx.id && !imported[tx.id] && tx.cowkoszyku_status !== "imported" && tx.cowkoszyku_status !== "skipped");
}

function label(tx) {
  if (!tx.id) return "";
  if (tx.cowkoszyku_status === "imported") return "imported";
  if (tx.cowkoszyku_status === "skipped") return "already in";
  if (tx.cowkoszyku_error) return tx.cowkoszyku_error;
  if (imported[tx.id]) return "already in";
  return "";
}

async function importOne(tx) {
  if (importing || loading || !canImport(tx)) return;
  importing = true;
  setStatus("Importing…");
  render();
  try {
    tx.cowkoszyku_error = "";
    await ensureFresh();
    await ensureReceipt(tx);
    await postImport(tx);
    setStatus(tx.cowkoszyku_status === "skipped" ? "Already in receipts." : "Imported. Open the receipt to edit products or the visit.");
  } catch (err) {
    tx.cowkoszyku_error = messageOf(err);
    setStatus(tx.cowkoszyku_error);
  }
  importing = false;
  render();
}

async function importAll() {
  if (importing || loading) return;
  var todo = rows.filter(canImport).length;
  if (!todo) {
    setStatus("Nothing new to import.");
    render();
    return;
  }
  importing = true;
  var importedCount = 0;
  var skipped = 0;
  var failed = 0;
  render();
  try {
    await ensureFresh();
    for (var i = 0; i < rows.length; i++) {
      var tx = rows[i];
      if (!canImport(tx)) {
        if (tx.id && imported[tx.id]) skipped++;
        continue;
      }
      setStatus("Importing " + (importedCount + skipped + failed + 1) + " of " + todo + "…");
      render();
      try {
        await ensureReceipt(tx);
        await postImport(tx);
        if (tx.cowkoszyku_status === "skipped") skipped++;
        else importedCount++;
      } catch (err) {
        tx.cowkoszyku_error = messageOf(err);
        failed++;
      }
    }
    var parts = [];
    if (importedCount) parts.push("imported " + importedCount);
    if (skipped) parts.push("skipped " + skipped);
    if (failed) parts.push("failed " + failed);
    setStatus(parts.join(", ") + ". Open a receipt to edit products or the visit.");
  } finally {
    importing = false;
    render();
  }
}

async function ensureFresh() {
  var payload = jwtPayload(access);
  if (typeof payload.exp === "number" && payload.exp - 60 > Date.now() / 1000) return;
  if (!refresh) return;
  var next = await tokenRequest({ grant_type: "refresh_token", refresh_token: refresh });
  remember({ access_token: next.access_token, refresh_token: next.refresh_token || refresh });
  await saveTokens();
  showSession();
}

async function ensureReceipt(tx) {
  if (tx.receipt) return;
  setStatus("Loading receipt " + (tx.receipt_num || tx.id) + "…");
  render();
  tx.receipt = await biedronkaCall("transaction", { access_token: access, id: String(tx.id) });
  tx.source = "details";
}

async function postImport(tx) {
  var res = await fetch(origin + "/api/biedronka/import", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      id: String(tx.id),
      date: tx.date || "",
      store_name: tx.store_name || "",
      receipt_num: tx.receipt_num || "",
      total_price: Number(tx.total_price) || 0,
      receipt: tx.receipt,
    }),
  });
  var out = await readJSON(res);
  if (out && out.status === "skipped") {
    tx.cowkoszyku_status = "skipped";
    if (tx.id) imported[tx.id] = true;
    return;
  }
  tx.cowkoszyku_status = "imported";
  tx.receipt_id = out && out.receipt_id;
  if (tx.id) imported[tx.id] = true;
}

function remember(next) {
  if (next.access_token) access = next.access_token;
  if (next.refresh_token) refresh = next.refresh_token;
}

function importable() {
  return rows.filter(canImport).length;
}

function render() {
  var on = signedIn();
  signedOutEl.hidden = on;
  signedInEl.hidden = !on;
  sessionEl.textContent = session;
  statusEl.hidden = !status;
  statusEl.textContent = status;
  originEl.textContent = origin ? "Saving into " + origin.replace(/^https?:\/\//, "") : "Open this from cowkoszyku.";
  signInEl.disabled = busy || !origin;
  finishEl.disabled = busy || !origin;
  importAllEl.disabled = importing || busy || importable() === 0;
  moreEl.hidden = !more;
  moreEl.disabled = busy;
  resultsEl.hidden = !results;
  rowsEl.replaceChildren();
  if (!results) return;
  if (!rows.length) {
    var emptyRow = document.createElement("tr");
    var emptyCell = document.createElement("td");
    emptyCell.colSpan = 4;
    emptyCell.className = "muted";
    emptyCell.textContent = empty || "No bills.";
    emptyRow.appendChild(emptyCell);
    rowsEl.appendChild(emptyRow);
    return;
  }
  rows.forEach(function (tx, index) {
    var tr = document.createElement("tr");
    tr.appendChild(cell(formatBillDate(tx.date)));
    tr.appendChild(cell(tx.store_name || ""));
    var money = cell(formatBillMoney(tx.total_price));
    money.className = "num";
    tr.appendChild(money);
    tr.appendChild(actionCell(tx, index));
    rowsEl.appendChild(tr);
  });
}

function actionCell(tx) {
  var td = document.createElement("td");
  if (canImport(tx)) {
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = "Import";
    button.disabled = importing || busy;
    button.addEventListener("click", function () {
      importOne(tx);
    });
    td.appendChild(button);
    return td;
  }
  td.textContent = label(tx);
  if (tx.receipt_id && origin) {
    td.appendChild(document.createTextNode(" "));
    var link = document.createElement("a");
    link.href = origin + "/admin/receipts/" + tx.receipt_id;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "Open";
    td.appendChild(link);
  }
  return td;
}

function cell(text) {
  var td = document.createElement("td");
  td.textContent = text;
  return td;
}

function biedronkaCall(op, fields) {
  return chrome.runtime.sendMessage(Object.assign({ type: "biedronka-api", op: op }, fields)).then(function (response) {
    if (!response || !response.ok) throw new Error((response && response.error) || "could not reach Biedronka");
    if (response.status < 200 || response.status >= 300) throw new Error(tokenError(response.body, response.status));
    return response.body;
  });
}

function tokenRequest(fields) {
  return biedronkaCall("token", fields);
}

async function readJSON(res) {
  var text = await res.text();
  var data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      data = text;
    }
  }
  if (!res.ok) throw new Error(tokenError(data, res.status));
  return data;
}

function tokenError(data, statusCode) {
  var record = data && typeof data === "object" ? data : null;
  var desc = record && record.error_description ? String(record.error_description) : "";
  var message = record && record.message ? String(record.message) : "";
  var err = record && record.error ? String(record.error) : "";
  if (err === "invalid_grant" || /code not valid/i.test(desc)) {
    return "That login code is expired or already used. Click Sign in again and finish SMS right away.";
  }
  if (desc) return desc;
  if (message) return message;
  if (err) return err;
  if (typeof data === "string" && data) return data.slice(0, 180);
  return "http " + statusCode;
}

function messageOf(err) {
  return err instanceof Error ? err.message : String(err);
}

function formatBillDate(raw) {
  if (!raw) return "";
  var d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleString("pl-PL");
}

function formatBillMoney(n) {
  if (n == null) return "";
  if (!Number.isFinite(Number(n))) return String(n);
  return Number(n).toFixed(2).replace(".", ",") + " zł";
}

async function generatePkce() {
  var raw = crypto.getRandomValues(new Uint8Array(32));
  var verifier = b64url(raw);
  var digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return { verifier: verifier, challenge: b64url(new Uint8Array(digest)) };
}

function b64url(bytes) {
  var bin = "";
  for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function authorizationURL(challenge) {
  var params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return AUTH_URL + "?" + params.toString();
}

function authCodeFromRedirect(value) {
  var raw = String(value || "").trim().replace(/^["']|["']$/g, "");
  if (!raw) throw new Error("missing auth code");
  var appIdx = raw.indexOf("app://");
  if (appIdx >= 0) raw = raw.slice(appIdx).split(/\s/)[0].replace(/[.,;"']+$/g, "");
  if (raw.indexOf("://") >= 0 || raw.indexOf("app:") === 0 || raw.indexOf("code=") >= 0) return codeFromRedirect(raw);
  return raw;
}

function codeFromRedirect(raw) {
  var parsed;
  try {
    parsed = new URL(raw);
  } catch (err) {
    throw new Error("missing auth code");
  }
  var code = parsed.searchParams.get("code");
  if (!code && parsed.hash) code = new URLSearchParams(parsed.hash.replace(/^#/, "")).get("code");
  if (!code) throw new Error("missing auth code");
  return code;
}

function jwtPayload(token) {
  var parts = String(token || "").split(".");
  if (parts.length < 2) return {};
  var padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  while (padded.length % 4) padded += "=";
  try {
    return JSON.parse(atob(padded)) || {};
  } catch (err) {
    return {};
  }
}
