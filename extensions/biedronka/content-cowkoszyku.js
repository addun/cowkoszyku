document.documentElement.dataset.cowkoszykuBiedronkaExt = "1";

document.addEventListener(
  "click",
  function (event) {
    var node = event.target && event.target.closest && event.target.closest("[data-cowkoszyku-open-import]");
    if (!node || node.disabled) return;
    chrome.runtime.sendMessage({ type: "open-import", origin: location.origin }, function (response) {
      var status = document.getElementById("open-status");
      if (!status) return;
      var failed = chrome.runtime.lastError;
      if (failed || !response || !response.ok) {
        status.textContent = "The helper could not open the import page. Reload the extension, then refresh.";
      }
    });
  },
  true
);
