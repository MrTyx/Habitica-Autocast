<template lang="pug">
  #app
    #wrapper
      ui-tabs(type="icon-and-text", raised)
        ui-tab(title="Automagic", icon="settings_backup_restore")
          .block.block-margin-bottom
            option-row(
              icon="sync"
              name="autoLevel"
              v-bind:enabled="autoLevelEnable"
              description="Allocate Stat Points"
              subtitle="Mixmax me bro. I got dragons to slay.")
            .subblock
              ui-select(
                icon="control_point"
                :options="stats"
                v-model="autoLevelModel"
                @change="setAutolevel()")

          .block.block-margin-bottom
            option-row(
              name="autoCast"
              v-bind:enabled="autoCastEnable"
              description="Cast Spell"
              subtitle="I attack the darkness!")
            .subblock
              ui-select(
                icon="whatshot"
                :options="spells"
                type="image"
                v-model="autoCastSpellModel"
                @change="setAutocastSpell()")
              ui-select(
                icon="games"
                :options="tasks",
                v-model="autoCastTaskModel"
                @change="setAutocastTask()")

          .block.block-margin-bottom
            option-row(
              name="autoGems"
              v-bind:enabled="autoGemsEnable"
              description="Buy Gems"
              subtitle="Truly, truly outrageous")

          .block.block-margin-bottom
            option-row(
              name="autoArmoire"
              v-bind:enabled="autoArmoireEnable"
              description="Buy Enchanted Armoire"
              subtitle="It's dangerous to go alone! Take this")

          .block.block-margin-bottom
            option-row(
              name="autoFeed"
              v-bind:enabled="autoFeedEnable"
              description="Feed Pets"
              subtitle="Like Pokemon, but worse.")

          .block.block-margin-bottom
            option-row(
              name="autoQuest"
              v-bind:enabled="autoQuestEnable"
              description="Start New Quest"
              subtitle="")


          .block.block-margin-bottom
            option-row(
              name="randomizeMount"
              v-bind:enabled="randomizeMountEnable"
              description="Randomize Mount"
              subtitle="Why would you want this?")

          .block
            option-row(
              name="randomizePet"
              v-bind:enabled="randomizePetEnable"
              description="Randomize Pet"
              subtitle="Or this?")

        ui-tab(title="Youtube", icon="play_circle_outline")
          youtube-playerlister

        ui-tab(title="Settings", icon="settings")
          .block.block-margin-bottom
            option-row(
              name="master"
              v-bind:enabled="masterEnable"
              description="Master Enable Switch"
              subtitle="Shut it down!"
            )
          .block.block-margin-bottom
            option-row(
              name="debug"
              v-bind:enabled="debugEnable"
              description="Debug Mode"
              subtitle="Johnny, I'm dying, I'm dying"
            )
          .block
            option-row(
              name="limits"
              v-bind:enabled="limitsEnable"
              description="Limits"
              subtitle="Renzokuken indicator?"
            )
            ui-textbox(
              icon="whatshot"
              type="number"
              :min="0"
              placeholder="Minimum Mana"
              v-model="minimumMana"
              @change="setMinimumMana"
            )
            ui-textbox(
              icon="attach_money"
              type="number"
              :min="0"
              placeholder="Minimum Gold"
              v-model="minimumGold"
              @change="setMinimumGold"
            )

        ui-tab(title="About", icon="help_outline") To be done
</template>

<script>
export default {
  name: "main",
  data() {
    return {
      autoLevelEnable: false,
      autoLevelModel: {},
      autoCastEnable: false,
      autoCastSpellModel: {},
      autoCastTaskModel: {},
      autoArmoireEnable: false,
      autoGemsEnable: false,
      autoFeedEnable: false,
      autoQuestEnable: false,
      randomizeMountEnable: false,
      randomizePetEnable: false,
      masterEnable: false,
      debugEnable: false,
      limitsEnable: false,
      minimumGold: 0,
      minimumMana: 0,
      tasks: [],
      stats: [
        {
          value: "str",
          label: "Strength"
        },
        {
          value: "int",
          label: "Intelligence"
        },
        {
          value: "per",
          label: "Perception"
        },
        {
          value: "con",
          label: "Constitution"
        }
      ],
      spells: [
        {
          value: "fireball",
          label: "Burst of Flames",
          image: "images/skill_fireball.png",
          cost: 10,
          requireID: true
        },
        {
          value: "mpHeal",
          label: "Ethereal Surge",
          image: "images/skill_mpHeal.png",
          cost: 30,
          requireID: false
        },
        {
          value: "earth",
          label: "Earthquake",
          image: "images/skill_earth.png",
          cost: 35,
          requireID: false
        },
        {
          value: "frost",
          label: "Chilling Frost",
          image: "images/skill_frost.png",
          cost: 40,
          requireID: false
        },
        {
          value: "smash",
          label: "Brutal Smash",
          image: "images/skill_smash.png",
          cost: 10,
          requireID: true
        },
        {
          value: "defensiveStance",
          label: "Defensive Stance",
          image: "images/skill_defensiveStance.png",
          cost: 25,
          requireID: false
        },
        {
          value: "valorousPresence",
          label: "Valorous Presence",
          image: "images/skill_valorousPresence.png",
          cost: 20,
          requireID: false
        },
        {
          value: "intimidate",
          label: "Intimidating Gaze",
          image: "images/skill_intimidate.png",
          cost: 15,
          requireID: false
        },
        {
          value: "pickPocket",
          label: "Pickpocket",
          image: "images/skill_pickPocket.png",
          cost: 10,
          requireID: true
        },
        {
          value: "backStab",
          label: "Backstab",
          image: "images/skill_backStab.png",
          cost: 15,
          requireID: true
        },
        {
          value: "toolsOfTrade",
          label: "Tools of the Trade",
          image: "images/skill_toolsOfTrade.png",
          cost: 25,
          requireID: false
        },
        {
          value: "stealth",
          label: "Stealth",
          image: "images/skill_stealth.png",
          cost: 45,
          requireID: false
        },
        {
          value: "heal",
          label: "Healing Light",
          image: "images/skill_heal.png",
          cost: 15,
          requireID: false
        },
        {
          value: "protectAura",
          label: "Protective Aura",
          image: "images/skill_protectAura.png",
          cost: 30,
          requireID: false
        },
        {
          value: "brightness",
          label: "Searing Brightness",
          image: "images/skill_brightness.png",
          cost: 15,
          requireID: false
        },
        {
          value: "healAll",
          label: "Blessing",
          image: "images/skill_healAll.png",
          cost: 25,
          requireID: false
        }
      ]
    };
  },
  mounted() {
    chrome.storage.sync.get(
      [
        "userID",
        "apiToken",
        "enable",
        "debug",
        "limits",
        "autoLevel",
        "autoCast",
        "autoArmoire",
        "autoGems",
        "autoFeed",
        "autoQuest",
        "randomizeMount",
        "randomizePet"
      ],
      items => {
        // Fire off a request for user tasks
        this.axios
          .get("https://habitica.com/api/v3/tasks/user", {
            headers: {
              "x-api-user": items.userID,
              "x-api-key": items.apiToken
            }
          })
          .then(res => {
            for (let i = 0; i < res.data.data.length; i++) {
              this.tasks.push({
                label: res.data.data[i].text,
                value: res.data.data[i].id
              });
              if (res.data.data[i].text === items.autoCast.task.name) {
                this.autoCastTaskModel = this.tasks[i];
              }
            }
          });

        if (items.master === undefined) {
          items.master = { enabled: true };
          chrome.storage.sync.set({ master: items.master });
        }

        if (items.debug === undefined) {
          items.debug = { enabled: false };
          chrome.storage.sync.set({ debug: items.debug });
        }

        if (items.limits === undefined) {
          items.limits = {
            enabled: false,
            gold: 0,
            mana: 0
          };
          chrome.storage.sync.set({ limits: items.limits });
        }

        // Define schema for autoLevel object
        if (items.autoLevel === undefined) {
          items.autoLevel = {
            enabled: false,
            index: 0,
            id: this.stats[0].value,
            name: this.stats[0].label
          };
          chrome.storage.sync.set({ autoLevel: items.autoLevel });
        }

        // Define schema for autoCast object
        if (items.autoCast === undefined) {
          items.autoCast = {
            enabled: false,
            spell: {},
            task: {}
          };
          items.autoCast.spell = {
            index: 1,
            id: this.spells[1].value,
            name: this.spells[1].label,
            cost: this.spells[1].cost
          };
          items.autoCast.task = {
            id: "",
            name: ""
          };
          chrome.storage.sync.set({ autoCast: items.autoCast });
        }

        if (items.autoGems === undefined) {
          items.autoGems = { enabled: false };
          chrome.storage.sync.set({ autoGems: items.autoGems });
        }

        if (items.autoArmoire === undefined) {
          items.autoArmoire = { enabled: false };
          chrome.storage.sync.set({ autoArmoire: items.autoArmoire });
        }

        if (items.autoFeed === undefined) {
          items.autoFeed = { enabled: false };
          chrome.storage.sync.set({ autoFeed: items.autoFeed });
        }

        if (items.autoQuest === undefined) {
          items.autoQuest = { enabled: false };
          chrome.storage.sync.set({ autoQuest: items.autoQuest });
        }

        if (items.randomizeMount === undefined) {
          items.randomizeMount = { enabled: false };
          chrome.storage.sync.set({ randomizeMount: items.randomizeMount });
        }

        if (items.randomizePet === undefined) {
          items.randomizePet = { enabled: false };
          chrome.storage.sync.set({ randomizePet: items.randomizePet });
        }

        // Populate the switches
        this.autoLevelEnable = items.autoLevel.enabled;
        this.autoCastEnable = items.autoCast.enabled;
        this.autoGemsEnable = items.autoGems.enabled;
        this.autoArmoireEnable = items.autoArmoire.enabled;
        this.autoFeedEnable = items.autoFeed.enabled;
        this.autoQuestEnable = items.autoQuest.enabled;
        this.randomizeMountEnable = items.randomizeMount.enabled;
        this.randomizePetEnable = items.randomizePet.enabled;
        this.masterEnable = items.master.enabled;
        this.debugEnable = items.debug.enabled;
        this.limitsEnable = items.limits.enabled;

        // Populate the selects
        this.autoLevelModel = this.stats[items.autoLevel.index];
        this.autoCastSpellModel = this.spells[items.autoCast.spell.index];
        this.minimumMana = items.limits.mana;
        this.minimumGold = items.limits.gold;
      }
    );
  },
  methods: {
    setAutolevel() {
      for (let i = 0; i < this.stats.length; i++) {
        if (this.stats[i].value === this.autoLevelModel.value) {
          chrome.storage.sync.get("autoLevel", obj => {
            this.autoLevelEnable = obj.autoLevel.enabled;
            obj.autoLevel.index = i;
            obj.autoLevel.id = this.stats[i].value;
            obj.autoLevel.name = this.stats[i].label;
            chrome.storage.sync.set(obj);
          });
          return;
        }
      }
    },
    setAutocastSpell() {
      for (let i = 0; i < this.spells.length; i++) {
        if (this.spells[i] === this.autoCastSpellModel) {
          chrome.storage.sync.get("autoCast", obj => {
            this.autoCastEnable = obj.autoCast.enabled;
            obj.autoCast.spell.index = i;
            obj.autoCast.spell.id = this.spells[i].value;
            obj.autoCast.spell.name = this.spells[i].label;
            obj.autoCast.spell.cost = this.spells[i].cost;
            chrome.storage.sync.set(obj);
          });
          return;
        }
      }
    },
    setAutocastTask() {
      chrome.storage.sync.get("autoCast", obj => {
        this.autoCastEnable = obj.autoCast.enabled;
        obj.autoCast.task.id = this.autoCastTaskModel.value;
        obj.autoCast.task.name = this.autoCastTaskModel.label;
        chrome.storage.sync.set(obj);
      });
      return;
    },
    setMinimumMana() {
      chrome.storage.sync.get("limits", obj => {
        obj.limits.mana = +this.minimumMana;
        chrome.storage.sync.set(obj);
      });
      return;
    },
    setMinimumGold() {
      chrome.storage.sync.get("limits", obj => {
        obj.limits.gold = +this.minimumGold;
        chrome.storage.sync.set(obj);
      });
      return;
    }
  }
};
</script>

<style scoped>
#wrapper {
  display: flex;
  justify-content: center;
  max-width: 800px;
  margin: 20px auto;
}
.title {

}
.block {
  background-color: #eee;
  padding: 10px 20px;
}
.block-margin-bottom {
  margin-bottom: 20px;
}
.subblock {
  /*margin-left: 50px;*/
}
</style>
