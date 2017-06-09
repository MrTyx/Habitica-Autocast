// On fresh install of extension, open the options page
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == "install") {
    chrome.runtime.openOptionsPage();
  } else if (details.reason == "update") {
    chrome.storage.sync.get(["logs"], items => {
      const c = new Date();
      const datetime = `${c.getDate()} ${c.getHours()}:${c.getMinutes() < 10
        ? "0"
        : ""}${c.getMinutes()}`;
      const manifest = chrome.runtime.getManifest();
      if (manifest.version === undefined) return;
      if (items.logs === undefined) items.logs = [];
      const message = `Magic Wand updated to version ${manifest.version}`;
      items.logs.push({ datetime, message });
      chrome.storage.sync.set(items);
    });
  }
});
