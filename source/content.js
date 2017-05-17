import * as axios from "axios";
import regeneratorRuntime from "regenerator-runtime";
import { foodLookup } from "./variables/foodLookup.js";
import { petSuffix } from "./variables/petSuffix.js";
import { unfeedablePets } from "./variables/unfeedablePets.js";

let apiToken;
let userID;
let userData;
let userOptions;
let headers;
const debug = true;

const log = (caller, message) => {
  if (!debug) return;
  const titleStyle = "color: red; font-weight: bold";
  const callerStyle = "color: green; font-weight: bold";
  const messageStyle = "color: black";
  console.log(
    "%c%s%c%s%c%s%c%s",
    titleStyle,
    "Magic Wand (",
    callerStyle,
    caller,
    titleStyle,
    ") ",
    messageStyle,
    message
  );
};

const process = async function() {
  if (userOptions.autoLevel && userOptions.autoLevel.enabled) {
    log("process", `autoLevel`);
    await autoLevel();
  }
  if (userOptions.autoCast && userOptions.autoCast.enabled) {
    log("process", `autoCast`);
    await autoCast();
  }
  if (userOptions.autoGems && userOptions.autoGems.enabled) {
    log("process", `autoGems`);
    await autoGems();
  }
  if (userOptions.autoArmoire && userOptions.autoArmoire.enabled) {
    log("process", `autoArmoire`);
    await autoArmoire();
  }
  if (userOptions.autoFeed && userOptions.autoFeed.enabled) {
    log("process", `autoFeed`);
    await autoFeed();
  }
  if (userOptions.autoQuest && userOptions.autoQuest.enabled) {
    log("process", `autoQuest`);
    await autoQuest();
  }
  if (userOptions.randomizeMount && userOptions.randomizeMount.enabled) {
    log("process", `randomizeMount`);
    await randomizeMount();
  }
  if (userOptions.randomizePet && userOptions.randomizePet.enabled) {
    log("process", `randomizePet`);
    await randomizePet();
  }
};

const autoArmoire = async function() {
  if (userData.stats.gp < 100) {
    log("autoArmoire", `Exiting with GP of ${user.stats.gp}`);
    return;
  }
  const url = `https://habitica.com/api/v3/user/buy-armoire`;
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      log("autoArmoire", "Bought Enchanted Armoire");
      userData.stats.gp -= 100;
      await autoArmoire();
    }
  } catch (e) {
    log("autoArmoire", e.message);
  }
  return;
};

const autoCast = async function() {
  if (userOptions.autoCast.spell.cost > userData.stats.mp) {
    log("autoCast", "Exiting with insufficient mana");
    return;
  }
  let url = `https://habitica.com/api/v3/user/class/cast/${userOptions.autoCast.spell.id}`;
  if (userOptions.autoCast.task.id) {
    url = `${url}?targetId=${userOptions.autoCast.task.id}`;
  }
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      log("autoCast", `Cast ${userOptions.autoCast.spell.name}`);
      await autoCast();
    }
  } catch (e) {
    log("autoCast", e.message);
  }
  return;
};

const autoFeed = async function() {
  let foods = userData.items.food;
  let mounts = Object.keys(userData.items.mounts).filter(
    k => userData.items.mounts[k]
  );

  Object.keys(userData.items.pets)
    .filter(k => userData.items.pets[k] !== -1)
    .filter(k => mounts.indexOf(k) === -1)
    .filter(k => unfeedablePets.indexOf(k) === -1)
    .forEach(k => {
      let i = k.indexOf("-");
      if (i === -1) return;
      let suffix = k.substring(i + 1);
      if (petSuffix[suffix] === undefined) return;
      petSuffix[suffix].pets[k] = userData.items.pets[k];
    });

  Object.keys(foods).filter(k => foods[k] > 0).forEach(key => {
    let s = foodLookup[key];
    if (s !== undefined) petSuffix[s].foods[key] = foods[key];
  });

  // console.log(JSON.stringify(petSuffix, null, 2));
  const feed = async function(food, pet) {
    const url = `https://habitica.com/api/v3/user/feed/${pet}/${food}`;
    const response = await axios.post(url, {}, { headers });
    return response;
  };

  Object.keys(petSuffix).forEach(s => {
    if (petSuffix[s].pets.length === 0) return;
    if (petSuffix[s].foods.length === 0) return;

    let pets = Object.keys(petSuffix[s].pets);

    Object.keys(petSuffix[s].foods).forEach(async function(food) {
      let n = pets.length;
      let go = !(n === 0);
      while (go) {
        try {
          const response = await feed(food, pets[n - 1]);
          if (response.status === 200) {
            log("autoFeed", `Feed ${food} to ${pets[n - 1]}`);
            petSuffix[s].pets[pets[n - 1]] += 5;
            petSuffix[s].foods[food]--;
            if (petSuffix[s].pets[pets[n - 1]] >= 50) {
              pets.pop();
              n--;
            }
            go = !(petSuffix[s].foods[food] <= 0 || pets.length <= 0);
          }
        } catch (e) {
          log(
            "autoFeed",
            `Tried to feed ${food} to ${pets[n - 1]}, got error ${response}`
          );
          go = false;
        }
      }
    });
  });
  return;
};

const autoGems = async function() {
  if (userData.stats.gp < 20) {
    log("autoGems", `Exiting with GP of ${user.stats.gp}`);
    return;
  }
  const url = `https://habitica.com/api/v3/user/purchase/gems/gem`;
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      log("autoGems", "Bought a gem");
      userData.stats.gp -= 20;
      await autoGems();
    }
  } catch (e) {
    log("autoGems", e.message);
  }
  return;
};

const autoLevel = async function() {
  if (userData.stats.points === 0) {
    log("autoLevel", "Exiting with no available stat points");
    return;
  }
  const url = `https://habitica.com/api/v3/user/allocate?stat=${userOptions.autoLevel.id}`;
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      log("autoLevel", `Allocated Stat Point to ${userOptions.autoLevel.name}`);
      userData.stats.points--;
      await autoLevel();
    }
  } catch (e) {
    log("autoLevel", e.message);
  }
  return;
};

const randomizeMount = async function() {
  const mounts = userData.items.mounts;
  const keys = Object.keys(mounts).filter(k => mounts[k]);
  //http://stackoverflow.com/a/5915122
  const key = keys[Math.floor(Math.random() * keys.length)];
  const url = `https://habitica.com/api/v3/user/equip/mount/${key}`;
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      log("randomizeMount", `Changed mount to ${key}`);
    }
  } catch (e) {
    log("randomizeMount", e.message);
  }
  return;
};

const randomizePet = async function() {
  const pets = userData.items.pets;
  const keys = Object.keys(pets).filter(k => userData.items.pets[k] !== -1);
  //http://stackoverflow.com/a/5915122
  const key = keys[Math.floor(Math.random() * keys.length)];
  const url = `https://habitica.com/api/v3/user/equip/pet/${key}`;
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      log("randomizePet", `Changed pet to ${key}`);
    }
  } catch (e) {
    log("randomizePet", e.message);
  }
  return;
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
      log("Main", "Exiting with no User ID and/or API Token");
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
        if (response.status === 200) {
          userData = response.data.data;
          process();
        }
      });
  }
);
