import * as axios from "axios";

let apiToken;
let userID;
let userData;
let userOptions;
let headers;

let process = () => {
  console.log(userOptions);
  if (userOptions.autoLevel && userOptions.autoLevel.enabled) autoLevel();
  if (userOptions.autoCast && userOptions.autoCast.enabled) autoCast();
  if (userOptions.autoGems && userOptions.autoGems.enabled) autoGems();
  if (userOptions.autoArmoire && userOptions.autoArmoire.enabled) autoArmoire();
  if (userOptions.autoFeed && userOptions.autoFeed.enabled) autoFeed();
  if (userOptions.autoQuest && userOptions.autoQuest.enabled) autoQuest();
};

let autoArmoire = () => {
  if (user.stats.gp < 100) return;
  axios
    .post("https://habitica.com/api/v3/user/buy-armoire", {}, { headers })
    .then(res => {
      if (res.status === 200) {
        console.log("Bought Armoire");
        userData.stats.gp -= 100;
        autoArmoire();
      }
    });
};

let autoCast = () => {
  // Well this is annoying. We have to do manual string concat because axios
  // is mutating the params string somehow and I can't quite diagnose it
  if (userOptions.autoCast.spell.id === undefined) {
    console.log("No spell ID set, exiting");
    return;
  }
  let url = `https://habitica.com/api/v3/user/class/cast/${userOptions.autoCast.spell.id}`;
  if (userOptions.autoCast.task.id) {
    url = `${url}?targetId=${userOptions.autoCast.task.id}`;
  }
  axios.post(url, {}, { headers }).then(res => {
    if (res.status === 200) {
      console.log(`Cast ${userOptions.autoCast.spell.name}`);
      autoCast();
    }
  }, console.log);
};

let autoFeed = () => {};

let autoGems = () => {
  if (userData.stats.gp < 20) return;
  let url = `https://habitica.com/api/v3/user/purchase/gems/gem`;
  axios.post(url, {}, { headers }).then(res => {
    if (res.status === 200) {
      console.log(`Bought a gem`);
      userData.stats.gp -= 20;
      autoGems();
    }
  });
};

let autoLevel = () => {
  if (userData.stats.points === 0) return;
  let url = `https://habitica.com/api/v3/user/allocate?stat=${userOptions.autoLevel.id}`;
  axios.post(url, {}, { headers }).then(res => {
    if (res.status === 200) {
      console.log(`Allocated Stat Point to ${userOptions.autoLevel.name}`);
      userData.stats.points--;
      autoLevel();
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
    if (userID === undefined || apiToken === undefined) {
      console.log("No User ID and/or API Token, exiting.");
      return;
    }

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
