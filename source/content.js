import * as axios from "axios";
// axios.get("https://api.github.com/users/MrTyx").then(function(response) {
//   console.log(response.data); // ex.: { user: 'Your User'}
//   console.log(response.status); // ex.: 200
// });

let userID;
let apiToken;
let userData;
let userOptions;
let headers;

let process = () => {
  console.log(userData, userOptions);
  console.log(userData.stats.gp);
  if (userOptions.autobuyArmoire && userData.stats.gp > 100) buyArmoire();
};

let castSpell = () => {
  axios
    .post("https://habitica.com/api/v3/user/class/cast/:spellId")
    .then(response => {
      console.log("castSpell", response);
      if (response.status !== 200) return;
    });
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
  ["userID", "apiToken", "autobuyArmoire", "autobuyGems"],
  items => {
    userID = items.userID;
    apiToken = items.apiToken;
    userOptions = items;
    if (userID === undefined || apiToken === undefined) return;
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
