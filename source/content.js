import * as axios from "axios";

let apiToken;
let userID;
let userData;
let userOptions;
let headers;

let process = () => {
  if (userOptions.autoLevel.enabled) autoLevel();
  if (userOptions.autoCast.enabled) autoCast();
  if (userOptions.autoGems.enabled) autoGems();
  if (userOptions.autoArmoire.enabled) autoArmoire();
  if (userOptions.autoFeed.enabled) autoFeed();
  if (userOptions.autoQuest.enabled) autoQuest();
  if (userOptions.autobuyArmoire && userData.stats.gp > 100) buyArmoire();
};

let autoArmoire = () => {
  axios
    .post("https://habitica.com/api/v3/user/buy-armoire", {}, { headers })
    .then(res => {
      if (res.status === 200) {
        userData.stats.gp -= 100;
        if (userData.stats.gp > 300) {
          autoArmoire();
        }
      }
    });
};

let autoCast = () => {
  // Well this is annoying. We have to do manual string concat because axios
  // is mutating the params string somehow and I can't quite diagnose it
  if (userOptions.autoCast.spell.id === undefined) return;
  let url = `https://habitica.com/api/v3/user/class/cast/${userOptions.autocastSpellValue}`;
  if (userOptions.autoCast.task.id) {
    url = `${url}?targetId=${userOptions.autocastTaskValue}`;
  }
  axios.post(url, {}, { headers }).then(res => {
    if (res.status === 200) autoCast();
  }, console.log);
};

let autoFeed = () => {};

let autoGems = () => {};

let autoLevel = () => {
  if (userData.stats.points === 0) return;
  let url = `https://habitica.com/api/v3/user/allocate?stat=${userOptions.autoLevel.id}`;
  axios.post(url, {}, { headers }).then(res => {
    if (res.status === 200) {
      userData.stats.points--;
      if (userData.stats.points > 0) autoLevel();
    }
  }, console.log);
};

chrome.storage.sync.get(
  [
    "userID",
    "apiToken",
    "autoArmoire",
    "autoCast",
    "autoFeed",
    "autoGems",
    "autoLevel",
    "autoQuest",
    "randomizeMount",
    "randomizePet"
  ],
  items => {
    userID = items.userID;
    apiToken = items.apiToken;
    if (userID === undefined || apiToken === undefined) return;

    userOptions = items;
    headers = {
      "x-api-user": userID,
      "x-api-key": apiToken
    };
    axios
      .get("https://habitica.com/api/v3/user", { headers })
      .then(response => {
        userData = response.data.data;
        process();
      });
  }
);
