console.log("test1");
chrome.storage.sync.get(["userID"], items => {
  console.log(items);
});
