// A note on file length. It would be nice to break each function into its
// own file but at the time of writing, exporting async function is not working
// in babel. I would like to fix this in the future but at present, it is what
// it is.

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
let awaitCache = false;
let count = {
  armoire: 0,
  gem: 0,
  spell: 0,
  stat: 0,
  feed: {}
};

// Logging each action to chrome storage so they can be used in the popup
const printLog = async function(message) {
  const c = new Date();

  // We need to do some formatting of the date. Mainly to pad the minutes.
  let datetime = `${c.getDate()} ${c.getHours()}:${c.getMinutes() < 10
    ? "0"
    : ""}${c.getMinutes()}`;

  // Because setting storage is a asyncronyous, we need to return a promise.
  // And we can only push values to a chrome.storage array by getting that
  // array, pushing the value and then writing it. Unfortunate, but there is
  // no API alternative.
  chrome.storage.sync.get(["logs"], function(items) {
    // Sanity check for if logs are defined. Shouldn't be necessary but...
    if (items.logs === undefined) items.logs = [];
    items.logs.push({ datetime, message });
    // We want to limit the log length to something sane.
    items.logs = items.logs.slice(-50);

    chrome.storage.sync.set(items, () => {
      awaitCache = false;
    });
  });
  return;
};

// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const log = async function(message) {
  let awaitDelay = 1000;
  while (awaitCache) {
    debug("sleep", `${awaitDelay}ms to log '${message}'`);
    await sleep(awaitDelay);
    awaitDelay *= 2;
  }
  awaitCache = true;
  printLog(message);
  return;
};

// Debug gives more detailed messages into console.log and is toggled on by the
// setting to enable debugging in options page.
const debug = (caller, message) => {
  // Better to check if it is enabled here rather than at every call.
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

// Main process loop for each of our functions.
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
  debug("process", "Done.");
};

// Buy Enchanted Armoires
const autoArmoire = async function() {
  // First we need to define the limit we don't want to spend below. It starts
  // at 100 because obviously we can't buy it if we have less than that.
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
      // await log("Bought enchanted armoire");
      count.armoire++;
      debug("autoArmoire", "Bought Enchanted Armoire");

      // If it succeeds, decrease how much gold we think we have and call again.
      userData.stats.gp -= 100;
      await autoArmoire();
    }
  } catch (e) {
    debug("autoArmoire", e.message);
  }
  if (count.armoire > 0) {
    await log(`Bought ${count.armoire} enchanted armoire(s).`);
    count.armoire = 0;
  }
  return;
};

// Auto Use Skill (or Cast Spell)
const autoCast = async function() {
  // We need to know the cost of the spell so we can factor it into the limits.
  let limit = userOptions.autoCast.spell.cost;
  if (userOptions.limits.enabled) limit += userOptions.limits.mana;
  if (userOptions.autoCast.spell.cost > userData.stats.mp) {
    debug("autoCast", "Exiting with insufficient mana");
    return;
  }

  // const done = async function() {};

  // Unfortunately we have to do manual string concatenation here. At this
  // point in time, axios is having trouble we correctly sending url params.
  // Sucks, but oh well. Now we only want to set a target, if that spell is one
  // of the four spells that require a target task
  let url = `https://habitica.com/api/v3/user/class/cast/${userOptions.autoCast
    .spell.id}`;
  if (userOptions.autoCast.spell.requireID) {
    if (!userOptions.autoCast.task.id) {
      debug("autoCast", "No task ID set.");
      return;
    }
    url = `${url}?targetId=${userOptions.autoCast.task.id}`;
  }

  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      debug("autoCast", `Used ${userOptions.autoCast.spell.name}`);
      count.spell++;
      // await log(`Used ${userOptions.autoCast.spell.name}`);

      // If it succeeds, decrease how much mana we think we have and call again.
      userData.stats.mp -= userOptions.autoCast.spell.cost;
      await autoCast();
    }
  } catch (e) {
    debug("autoCast", e.message);
  }
  if (count.spell > 0) {
    await log(`Used ${userOptions.autoCast.spell.name} ${count.spell} time(s)`);
    count.spell = 0;
  }
  return;
};

// Auto Feed Pets
const autoFeed = async function() {
  let foods = userData.items.food;
  let pets = userData.items.pets;
  let mounts = Object.keys(userData.items.mounts).filter(
    // Filter all the mounts to where the key-pair is true
    // If a user has used Key to Kennel, the key-pair will be null
    k => userData.items.mounts[k]
  );

  // We want to build an array that we can process in a loop. So, for each
  // pet "suffix", get all the pets named Pet-Suffix and the foods that suffix
  // prefers. Those are stored in variables/foodLookup.js and variables/petSuffix.js

  // First the pets
  Object.keys(pets)
    .filter(
      // If a pet is -1 it is unhatched.
      // If a pet is 0, the user has used Key to the Kennels
      k => pets[k] > 0
    )
    .filter(
      // If you have the mount, you can't feed the pet
      k => mounts.indexOf(k) === -1
    )
    .filter(
      // So, annoyingly grouping by suffix isn't a perfect system because
      // Habitica has unfeedable pets. Most of these have a suffix that isn't
      // in our array (eg Wolf-Veteran) and so will be checked in the following
      // forEach and ignored. But some do (eg Turkey-Base). Hence this solution.
      // It is not the best.
      k => unfeedablePets.indexOf(k) === -1
    )
    .forEach(k => {
      let i = k.indexOf("-"); // Check for Pet-Suffix format
      if (i === -1) return; // If it doesn't exist (for some reason), skip
      let suffix = k.substring(i + 1); // Get everything after the "-"

      // If the suffix doesn't exist in our array, skip it. This will affect
      // pets such as Wolf-Veteran. Otherwise, it should be good to go.
      if (petSuffix[suffix] === undefined) return;
      petSuffix[suffix].pets[k] = userData.items.pets[k];
    });

  // After processing the pets, the food is much simpler
  Object.keys(foods)
    .filter(
      // When you use a food, the key-pair still exists at Food: 0
      k => foods[k] > 0
    )
    .forEach(key => {
      // Just a bit of a sanity check to make sure that the food exists in our
      // lookup table. This should never fail but it is better to be safe.
      let s = foodLookup[key];
      if (s !== undefined) petSuffix[s].foods[key] = foods[key];
    });

  // This is feed function that is used in the loop below for each food.
  // We could process a failure here but better to do it in the main loop.
  const feed = async function(food, pet) {
    const url = `https://habitica.com/api/v3/user/feed/${pet}/${food}`;
    const response = await axios.post(url, {}, { headers });
    return response;
  };

  // We have built the array and are ready to process the main loop
  await Object.keys(petSuffix).forEach(s => {
    // If you either have (1) no pets or (2) no food, then no point
    if (petSuffix[s].pets.length === 0) return;
    if (petSuffix[s].foods.length === 0) return;

    let pets = Object.keys(petSuffix[s].pets);

    // We process from the direction of the food. For each food, feed a pet
    // rather than for each pet, get a food. It is simpler.
    Object.keys(petSuffix[s].foods).forEach(async function(food) {
      // If number of pets for this suffix are 0, then stop loop.
      let n = pets.length;
      let go = !(n === 0);
      while (go) {
        try {
          // Have to use pets[n-1] because we are using array.length
          let pet = pets[n - 1];
          const response = await feed(food, pet);

          if (response.status === 200) {
            // await log(`Fed ${food} to ${pet}`);
            debug("autoFeed", `Fed ${food} to ${pet}`);
            if (!count.feed[food]) count.feed[food] = {};
            if (!count.feed[food][pet]) count.feed[food][pet] = 0;
            console.log(count.feed);
            count.feed[food][pet]++;

            // Increment the pet's "feedness" by 5. They start at 5 when
            // hatched and at 50 are fully fed into mounts.
            petSuffix[s].pets[pet] += 5;
            petSuffix[s].foods[food]--;

            // If the pet is above 50, we have hatched it into a mount, and can
            // remove it from our array of pets to be processed. Also we need
            // to update our pointer.
            if (petSuffix[s].pets[pet] >= 50) {
              if (count.feed[food][pet] > 0) {
                await log(`Fed ${count.feed[food][pet]} ${food}(s) to ${pet}`);
                count.feed[food][pet] = 0;
              }
              pets.pop();
              n--;
              pet = pets[n - 1];
            }
            // If we are out of pets or out of food, time to stop.
            if (petSuffix[s].foods[food] <= 0 || pets.length <= 0) {
              if (count.feed[food][pet] > 0) {
                await log(`Fed ${count.feed[food][pet]} ${food}(s) to ${pet}`);
                count.feed[food][pet] = 0;
              }
              go = false;
            }
          }
        } catch (e) {
          // We should realistically never reach this catch block but because
          // this is easily the most complicated function in this script it
          // would be a good idea to play it safe
          debug("autoFeed", `${food} to ${pets[n - 1]} got error ${response}`);
          go = false;
        }
      }
    });
  });
  return;
};

// Buy Gems
const autoGems = async function() {
  // We want to define the gold limit to not spend us below
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
      // await log("Bought a gem");
      debug("autoGems", "Bought a gem");
      count.gem++;

      // If it succeeds, decrease how much gold we think we have, and call again.
      userData.stats.gp -= 20;
      await autoGems();
    }
  } catch (e) {
    debug("autoGems", e.message);
  }
  if (count.gem > 0) {
    await log(count.gem, `Bought ${count.gem} gem(s).`);
    count.gem = 0;
  }
  return;
};

// Auto assign stat points to one of the fours attributes (int, str, con, per)
const autoLevel = async function() {
  // Obviously if you have no available points, we can just exit
  if (userData.stats.points === 0) {
    debug("autoLevel", "Exiting with no available stat points");
    return;
  }

  const url = `https://habitica.com/api/v3/user/allocate?stat=${userOptions
    .autoLevel.id}`;
  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      // await log(`Allocated a point to ${userOptions.autoLevel.name}`);
      debug("autoLevel", `Allocated a point to ${userOptions.autoLevel.name}`);
      count.stat++;

      // If it succeeds, call again. It is rather unlikely that a user has
      // multiple stat points to spend, but they could.
      userData.stats.points--;
      await autoLevel();
    }
  } catch (e) {
    debug("autoLevel", e.message);
  }
  if (count.stat > 0) {
    await log(
      `Allocated ${count.stat} point(s) to ${userOptions.autoLevel.name}`
    );
    count.stat = 0;
  }
  return;
};

// Use a new quest scroll if the user isn't on a quest.
const autoQuest = async function() {
  // If you are on a quest, then we can just exit.
  if (userData.party.quest.key !== null) {
    debug("autoQuest", "Exiting with active quest");
    return;
  }

  // We need to parse out what quests you got.
  const quests = userData.items.quests;
  const groupID = userData.party["_id"];
  const keys = Object.keys(quests).filter(
    // Even after using a scroll, Habitica keeps the key-pair as Key: 0
    k => quests[k] > 0
  );

  // Pick a random key from our list of quest keys. http://stackoverflow.com/a/5915122
  const key = keys[Math.floor(Math.random() * keys.length)];
  const url = `https://habitica.com/api/v3/groups/${groupID}/quests/invite/${key}`;

  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      await log(`Started quest ${key}`);
      debug("autoQuest", `Started quest ${key}`);
    }
  } catch (e) {
    debug("autoQuest", e.message);
  }
  return;
};

// Randomize the Mount
const randomizeMount = async function() {
  const mounts = userData.items.mounts;
  const keys = Object.keys(mounts).filter(
    // Mounts are stored as "Key: true" when first hatched. After the user uses
    // Key to Kennel, the Gen 1 pets are set to "Key: null"
    k => mounts[k]
  );

  // Pick a random key from our list. http://stackoverflow.com/a/5915122
  const key = keys[Math.floor(Math.random() * keys.length)];
  const url = `https://habitica.com/api/v3/user/equip/mount/${key}`;

  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      await log(`Changed mount to ${key}`);
      debug("randomizeMount", `Changed mount to ${key}`);
    }
  } catch (e) {
    debug("randomizeMount", e.message);
  }
  return;
};

// Randomize the Pet
const randomizePet = async function() {
  const pets = userData.items.pets;
  const keys = Object.keys(pets).filter(
    // Pets are stored as "Key: feedness". If you feed a pet all the way to a
    // mount, it will be "Key: -1" and if you use Key to Kennel, it will be
    // "Key: 0". We want to ignore both cases.
    k => pets[k] > 0
  );

  // Pick a random key from our list. http://stackoverflow.com/a/5915122
  const key = keys[Math.floor(Math.random() * keys.length)];
  const url = `https://habitica.com/api/v3/user/equip/pet/${key}`;

  try {
    const response = await axios.post(url, {}, { headers });
    if (response.status === 200) {
      await log(`Changed pet to ${key}`);
      debug("randomizePet", `Changed pet to ${key}`);
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
      // If our master toggle is disabled, we can just exit.
      if (!items.master.enabled) return;

      // Sanity checks for our User ID and API Token
      userID = items.userID;
      apiToken = items.apiToken;
      if (userID === undefined || apiToken === undefined) {
        await log("Exiting with no User ID and/or API Token");
        debug("main", "Exiting with no User ID and/or API Token");
        return;
      }

      // We need to store two arrays for each function; options and data.
      // Options are what the user has set in the Magic Wand Options page and
      // are stored in userOptions. Data is the user data returned by the API
      // call (items, pets, etc) and are stored in userData.
      userOptions = items;

      // Since we use the same headers in every call, might as well build it now.
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

// Initiate main loop.
main();
