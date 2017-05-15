import * as axios from "axios";

let apiToken;
let userID;

let userData;
let userOptions;
let headers;

let process = () => {
  console.log(userOptions);
  if (userOptions.autolevel) autolevel();
  if (userOptions.autocast) castSpell();
  if (userOptions.autobuyArmoire && userData.stats.gp > 100) buyArmoire();
};

//
let autolevel = () => {
  if (userData.stats.points === 0) return;
  if (userOptions.autolevelValue === undefined) return;
  let url = `https://habitica.com/api/v3/user/allocate?stat=${userOptions.autolevelValue}`;
  axios.post(url, {}, { headers }).then(response => {
    if (response.status === 200) {
      userData.stats.points--;
      if (userData.stats.points > 0) autolevel();
    }
  }, console.log);
};

let castSpell = () => {
  // Well this is annoying. We have to do manual string concat because axios
  // is mutating the params string somehow and I can't quite diagnose it
  if (userOptions.autocastSpellValue === undefined) return;
  let url = `https://habitica.com/api/v3/user/class/cast/${userOptions.autocastSpellValue}`;
  if (userOptions.autocastTaskValue) {
    url = `${url}?targetId=${userOptions.autocastTaskValue}`;
  }
  axios.post(url, {}, { headers }).then(response => {
    if (response.status === 200) castSpell();
  }, console.log);
};

let buyGem = () => {};

let buyArmoire = () => {
  axios
    .post("https://habitica.com/api/v3/user/buy-armoire", {}, { headers })
    .then(response => {
      console.log("buyArmoire", response);
      if (response.status === 200) {
        userData.stats.gp -= 100;
        if (userData.stats.gp > 300) {
          buyArmoire();
        }
      }
    });
};

chrome.storage.sync.get(
  [
    "userID",
    "apiToken",
    "autolevel",
    "autolevelValue",
    "autocast",
    "autocastSkillName",
    "autocastTaskID",
    "autobuyArmoire",
    "autobuyGems",
    "autofeedPets",
    "autostartQuest",
    "autolevelStats",
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
