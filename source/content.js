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

const log = async function(message) {
  const current = new Date();
  let datetime = `${current.getDate()} ${current.getHours()}:${current.getMinutes() < 10 ? "0" : ""}${current.getMinutes()}`;
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(["logs"], items => {
      if (items.logs === undefined) items.logs = [];
      items.logs.push({ datetime, message });
      items.logs = items.logs.slice(-20);
      chrome.storage.sync.set(items, resolve);
    });
  });
};

const debug = (caller, message) => {
  if (!userOptions.debug.enabled) return;
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
    debug("process", `autoLevel`);
    await autoLevel();
  }
  if (userOptions.autoCast && userOptions.autoCast.enabled) {
    debug("process", `autoCast`);
    await autoCast();
  }
  if (userOptions.autoGems && userOptions.autoGems.enabled) {
    debug("process", `autoGems`);
    await autoGems();
  }
  if (userOptions.autoArmoire && userOptions.autoArmoire.enabled) {
    debug("process", `autoArmoire`);
    await autoArmoire();
  }
  if (userOptions.autoFeed && userOptions.autoFeed.enabled) {
    debug("process", `autoFeed`);
    await autoFeed();
  }
  if (userOptions.autoQuest && userOptions.autoQuest.enabled) {
    debug("process", `autoQuest`);
    await autoQuest();
  }
  if (userOptions.randomizeMount && userOptions.randomizeMount.enabled) {
    debug("process", `randomizeMount`);
    await randomizeMount();
  }
  if (userOptions.randomizePet && userOptions.randomizePet.enabled) {
    debug("process", `randomizePet`);
    await randomizePet();
  }
};

const autoArmoire = async function() {
  let limit = 100;
  if (userOptions.limits.enabled) limit += userOptions.limits.gold;
  if (userData.stats.gp < limit) {
    debug("autoArmoire", `Exiting with GP of ${userData.stats.gp}`);
    return;
  }
  const url = `https://habitica.com/api/v3/user/buy-armoire`;
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      debug("autoArmoire", "Bought Enchanted Armoire");
      await log("Bought enchanted armoire");
      userData.stats.gp -= 100;
      await autoArmoire();
    }
  } catch (e) {
    debug("autoArmoire", e.message);
  }
  return;
};

const autoCast = async function() {
  let limit = userOptions.autoCast.spell.cost;
  if (userOptions.limits.enabled) limit += userOptions.limits.mana;
  if (userOptions.autoCast.spell.cost > userData.stats.mp) {
    debug("autoCast", "Exiting with insufficient mana");
    return;
  }
  let url = `https://habitica.com/api/v3/user/class/cast/${userOptions.autoCast.spell.id}`;
  if (userOptions.autoCast.task.id) {
    url = `${url}?targetId=${userOptions.autoCast.task.id}`;
  }
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      debug("autoCast", `Cast ${userOptions.autoCast.spell.name}`);
      await log(`Cast ${userOptions.autoCast.spell.name}`);
      await autoCast();
    }
  } catch (e) {
    debug("autoCast", e.message);
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

  const feed = async function(food, pet) {
    const url = `https://habitica.com/api/v3/user/feed/${pet}/${food}`;
    const response = await axios.post(url, {}, { headers });
    return response;
  };

  await Object.keys(petSuffix).forEach(s => {
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
            debug("autoFeed", `Fed ${food} to ${pets[n - 1]}`);
            await log(`Fed ${food} to ${pets[n - 1]}`);
            petSuffix[s].pets[pets[n - 1]] += 5;
            petSuffix[s].foods[food]--;
            if (petSuffix[s].pets[pets[n - 1]] >= 50) {
              pets.pop();
              n--;
            }
            go = !(petSuffix[s].foods[food] <= 0 || pets.length <= 0);
          }
        } catch (e) {
          debug("autoFeed", `${food} to ${pets[n - 1]} got error ${response}`);
          go = false;
        }
      }
    });
  });
  return;
};

const autoGems = async function() {
  let limit = 20;
  if (userOptions.limits.enabled) limit += userOptions.limits.gold;
  if (userData.stats.gp < limit) {
    debug("autoGems", `Exiting with GP of ${userData.stats.gp}`);
    return;
  }
  const url = `https://habitica.com/api/v3/user/purchase/gems/gem`;
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      debug("autoGems", "Bought a gem");
      await log("Bought a gem");
      userData.stats.gp -= 20;
      await autoGems();
    }
  } catch (e) {
    debug("autoGems", e.message);
  }
  return;
};

const autoLevel = async function() {
  if (userData.stats.points === 0) {
    debug("autoLevel", "Exiting with no available stat points");
    return;
  }
  const url = `https://habitica.com/api/v3/user/allocate?stat=${userOptions.autoLevel.id}`;
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      debug("autoLevel", `Allocated a point to ${userOptions.autoLevel.name}`);
      await log(`Allocated a point to ${userOptions.autoLevel.name}`);
      userData.stats.points--;
      await autoLevel();
    }
  } catch (e) {
    debug("autoLevel", e.message);
  }
  return;
};

const autoQuest = async function() {
  if (userData.party.quest.key !== null) {
    debug("autoQuest", "Exiting with active quest");
    return;
  }
  const quests = userData.items.quests;
  const groupID = userData.party["_id"];
  const keys = Object.keys(quests).filter(k => quests[k] > 0);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const url = `https://habitica.com/api/v3/groups/${groupID}/quests/invite/${key}`;
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      debug("autoQuest", `Started quest ${key}`);
      await log(`Started quest ${key}`);
    }
  } catch (e) {
    debug("autoQuest", e.message);
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
      debug("randomizeMount", `Changed mount to ${key}`);
      await log(`Changed mount to ${key}`);
    }
  } catch (e) {
    debug("randomizeMount", e.message);
  }
  return;
};

const randomizePet = async function() {
  const pets = userData.items.pets;
  const keys = Object.keys(pets).filter(k => pets[k] !== -1);
  //http://stackoverflow.com/a/5915122
  const key = keys[Math.floor(Math.random() * keys.length)];
  const url = `https://habitica.com/api/v3/user/equip/pet/${key}`;
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      debug("randomizePet", `Changed pet to ${key}`);
      await log(`Changed pet to ${key}`);
    }
  } catch (e) {
    debug("randomizePet", e.message);
  }
  return;
};

/* MAIN PROCESS */
const main = async function() {
  chrome.storage.sync.get(
    [
      "userID",
      "apiToken",
      "master",
      "debug",
      "limits",
      "autoArmoire",
      "autoCast",
      "autoFeed",
      "autoGems",
      "autoLevel",
      "autoQuest",
      "randomizeMount",
      "randomizePet"
    ],
    async function(items) {
      if (!items.master.enabled) return;

      userID = items.userID;
      apiToken = items.apiToken;
      if (userID === undefined || apiToken === undefined) {
        debug("main", "Exiting with no User ID and/or API Token");
        await log("Exiting with no User ID and/or API Token");
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
};
main();
