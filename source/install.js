// On fresh install of extension, open the options page
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == "install") {
    chrome.runtime.openOptionsPage();
  }
});
