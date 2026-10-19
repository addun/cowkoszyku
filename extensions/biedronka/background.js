const REDIRECT_PREFIX = "app://cma20.biedronka.pl";

var ports = [];
var lastSent = { url: "", at: 0 };

function biedronkaCallbackUrl(url) {
  if (typeof url !== "string") return "";
  var idx = url.indexOf(REDIRECT_PREFIX);
  if (idx < 0) return "";
  var raw = url.slice(idx).split(/\s/)[0].replace(/[.,;"']+$/g, "");
  try {
    raw = decodeURIComponent(raw);
  } catch (err) {}
  if (raw.indexOf(REDIRECT_PREFIX) !== 0) return "";
  if (!/[?&#]code=/.test(raw)) return "";
  return raw;
}

function headerLocation(headers) {
  if (!headers) return "";
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i].name).toLowerCase() === "location") {
      return String(headers[i].value || "");
    }
  }
  return "";
}

function pageOrigin(sender) {
  try {
    var raw = sender && sender.tab && sender.tab.url ? sender.tab.url : "";
    var u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return u.origin;
  } catch (err) {
    return "";
  }
}

function notifyCowkoszyku(url) {
  ports.forEach(function (port) {
    try {
      port.postMessage({ type: "biedronka-redirect", url: url });
    } catch (err) {}
  });
}

function openImport(origin, sendResponse) {
  if (!origin) {
    sendResponse({ ok: false, error: "unknown site" });
    return;
  }
  var importUrl = chrome.runtime.getURL("import.html");
  chrome.storage.session.set({ cowkoszykuOrigin: origin }, function () {
    chrome.tabs.query({ url: importUrl }, function (tabs) {
      var existing = tabs && tabs[0];
      if (existing && existing.id) {
        chrome.tabs.update(existing.id, { active: true, url: importUrl }, function () {
          sendResponse({ ok: true });
        });
        return;
      }
      chrome.tabs.create({ url: importUrl }, function () {
        sendResponse({ ok: true });
      });
    });
  });
}

function captureRedirect(url, closeTabId) {
  var callback = biedronkaCallbackUrl(url);
  if (!callback) return false;
  var now = Date.now();
  if (callback === lastSent.url && now - lastSent.at < 3000) return true;
  lastSent = { url: callback, at: now };
  notifyCowkoszyku(callback);
  if (typeof closeTabId === "number" && closeTabId >= 0) {
    chrome.tabs.remove(closeTabId, function () {
      void chrome.runtime.lastError;
    });
  }
  return true;
}

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name !== "cowkoszyku-biedronka") return;
  ports.push(port);
  port.onDisconnect.addListener(function () {
    ports = ports.filter(function (p) {
      return p !== port;
    });
  });
});

chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    captureRedirect(headerLocation(details.responseHeaders), details.tabId);
  },
  { urls: ["https://konto.biedronka.pl/*"], types: ["main_frame", "sub_frame"] },
  ["responseHeaders", "extraHeaders"]
);

chrome.webNavigation.onErrorOccurred.addListener(function (details) {
  if (details.frameId !== 0) return;
  if (details.error !== "net::ERR_UNKNOWN_URL_SCHEME") return;
  captureRedirect(details.url, details.tabId);
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (!msg || !msg.type) return;
  if (msg.type === "open-import") {
    openImport(pageOrigin(sender), sendResponse);
    return true;
  }
  if (msg.type === "biedronka-redirect" && msg.url) {
    var tabId = sender && sender.tab ? sender.tab.id : -1;
    captureRedirect(msg.url, tabId);
    sendResponse({ ok: true });
    return;
  }
  if (msg.type !== "biedronka-api") return;
  biedronkaApi(msg).then(sendResponse, function (err) {
    sendResponse({ ok: false, error: err && err.message ? err.message : "could not reach Biedronka" });
  });
  return true;
});

var API_BASE = "https://api.prod.biedronka.cloud/api/v7";
var TOKEN_URL = "https://konto.biedronka.pl/realms/loyalty/protocol/openid-connect/token";
var CLIENT_ID = "cma20";
var REDIRECT_URI = "app://cma20.biedronka.pl";
var MAX_BODY = 5 << 20;
var TX_ID = /^[\p{L}\p{N}_-]+$/u;

function biedronkaApi(msg) {
  if (msg.op === "token") return biedronkaToken(msg);
  if (msg.op === "transactions") return biedronkaTransactions(msg);
  if (msg.op === "transaction") return biedronkaTransaction(msg);
  return Promise.resolve({ ok: false, error: "unknown request" });
}

function biedronkaToken(msg) {
  var grant = String(msg.grant_type || "");
  var form = new URLSearchParams();
  form.set("client_id", CLIENT_ID);
  form.set("redirect_uri", REDIRECT_URI);
  form.set("grant_type", grant);
  if (grant === "refresh_token") {
    if (!msg.refresh_token) return Promise.resolve({ ok: false, error: "refresh_token is required" });
    form.set("refresh_token", String(msg.refresh_token));
  } else if (grant === "authorization_code") {
    var code = authCode(String(msg.code || ""));
    if (!code) return Promise.resolve({ ok: false, error: "missing auth code" });
    if (!msg.code_verifier) return Promise.resolve({ ok: false, error: "code_verifier is required" });
    form.set("code", code);
    form.set("code_verifier", String(msg.code_verifier));
  } else {
    return Promise.resolve({ ok: false, error: "unsupported grant" });
  }
  return fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: form.toString(),
  }).then(readBiedronka, networkError);
}

function biedronkaTransactions(msg) {
  if (!msg.access_token) return Promise.resolve({ ok: false, error: "missing token" });
  var page = Number(msg.page);
  if (!Number.isInteger(page) || page < 1) page = 1;
  var path = msg.archived ? "transactions/archived/" : "transactions/";
  var url = new URL(API_BASE + "/" + path);
  var range = last30DayRange();
  url.searchParams.set("page", String(page));
  url.searchParams.set("start_date", range.start);
  url.searchParams.set("end_date", range.end);
  return fetch(url.toString(), { headers: apiHeaders(String(msg.access_token)) }).then(readBiedronka, networkError);
}

function biedronkaTransaction(msg) {
  if (!msg.access_token) return Promise.resolve({ ok: false, error: "missing token" });
  var id = String(msg.id || "");
  if (!TX_ID.test(id)) return Promise.resolve({ ok: false, error: "invalid id" });
  var url = API_BASE + "/transactions/" + encodeURIComponent(id) + "/";
  return fetch(url, { headers: apiHeaders(String(msg.access_token)) }).then(readBiedronka, networkError);
}

function apiHeaders(token) {
  return {
    Authorization: "Bearer " + token,
    Accept: "application/json",
    "Accept-Language": "pl-PL",
  };
}

function readBiedronka(resp) {
  return resp.text().then(function (text) {
    if (text.length > MAX_BODY) return { ok: false, error: "response too large" };
    var body = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (err) {
        body = text;
      }
    }
    return { ok: true, status: resp.status, body: body };
  });
}

function networkError() {
  return { ok: false, error: "could not reach Biedronka" };
}

function last30DayRange() {
  var end = new Date();
  var start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 29);
  return { start: calendarDay(start), end: calendarDay(end) };
}

function calendarDay(d) {
  var m = String(d.getMonth() + 1);
  var day = String(d.getDate());
  if (m.length < 2) m = "0" + m;
  if (day.length < 2) day = "0" + day;
  return d.getFullYear() + "-" + m + "-" + day;
}

function authCode(value) {
  var raw = String(value || "").trim().replace(/^["']|["']$/g, "");
  if (!raw) return "";
  var app = raw.indexOf("app://");
  if (app >= 0) raw = raw.slice(app).split(/\s/)[0].replace(/[.,;"']+$/g, "");
  if (raw.indexOf("://") >= 0 || raw.indexOf("app:") === 0 || raw.indexOf("code=") >= 0) {
    try {
      var u = new URL(raw);
      var code = u.searchParams.get("code") || "";
      if (!code && u.hash) code = new URLSearchParams(u.hash.replace(/^#/, "")).get("code") || "";
      return code.trim();
    } catch (err) {
      return "";
    }
  }
  return raw;
}
