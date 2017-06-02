<template lang="pug">
  #app
    #wrapper
      ui-tabs(type="icon-and-text", raised)
        ui-tab(title="Automagic", icon="settings_backup_restore")
          .block.block-margin-bottom
            option-row(ref="autoLevel", name="autoLevel", desc="Allocate Stat Points", sub="Minmax me bro. I got dragons to slay.")
            .subblock
              ui-select(
                icon="control_point"
                :options="stats"
                v-model="autoLevelModel"
                @input="setAutolevel()")

          .block.block-margin-bottom
            option-row(ref="autoCast", name="autoCast", desc="Use Skill", sub="I attack the darkness!")
            .subblock
              ui-select(
                icon="whatshot"
                type="image"
                :options="spells"
                v-model="autoCastSpellModel"
                @change="setAutocastSpell()")
              ui-select(
                icon="games"
                :options="tasks",
                v-model="autoCastTaskModel"
                @change="setAutocastTask()")


          option-row(ref="autoGems", name="autoGems", desc="Buy Gems", sub="Truly, truly outrageous").block.block-margin-bottom
          option-row(ref="autoArmoire", name="autoArmoire", desc="Buy Enchanted Armoire", sub="It's dangerous to go alone! Take this").block.block-margin-bottom
          option-row(ref="autoFeed", name="autoFeed", desc="Feed Pets", sub="Like Pokemon, but worse.").block.block-margin-bottom
          option-row(ref="autoQuest", name="autoQuest", desc="Use Random Quest Scroll", sub="Never give up, never surrender.").block.block-margin-bottom
          option-row(ref="randomizeMount", name="randomizeMount", desc="Randomize Mount", sub="Why would you want this?").block.block-margin-bottom
          option-row(ref="randomizePet", name="randomizePet", desc="Randomize Pet", sub="Or this?").block

        ui-tab(title="Youtube", icon="play_circle_outline")
          youtube-playerlister

        ui-tab(title="Settings", icon="settings")
          option-row(ref="master", name="master", desc="Master Enable Switch", sub="Shut it down!").block.block-margin-bottom
          option-row(ref="debug", name="debug", desc="Debug Mode", sub="Johnny, I'm dying, I'm dying").block.block-margin-bottom
          .block
            option-row(ref="limits", name="limits", desc="Limits", sub="Renzokuken indicator?")
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
            i This is saved when you click off.

        ui-tab(title="About", icon="help_outline")
          img(src="../images/icon128.png", style="padding:20px", align="right")
          .block.block-margin-bottom
            .heading Automagic
            .text
              | These are functions as part of a content script that is injected in your page when
              |  you browse to Habitica. If you enable debug mode, then open the inspect menu (
              kbd  Ctrl+Shift+I
              | ), you can see what it is doing. These functions are processed in the order
              |  listed. So it will try to allocate stat points before casting a spell, etc.
              |  If it succeeds, it creates a log entry.
            br
            .text.
              The hard limits under settings apply to everything. So if you set the minimum
              gold to 50, it won't try to buy gems unless your gold is > 70, and it won't
              try to buy enchanted armoires unless your gold is > 150. Also because of ordering
              this means that if buying gems puts you below 150, the enchanted armoire
              function won't fire.

          .block.block-margin-bottom
            .heading Youtube Playlist
            .text
              | I watch a lot of youtube playlist content (OpenCourseWare etc). Ordinarily I processed these with
              code  youtube-dl --get-id --get-title URL
              | . But I got tired of that manual process and so I wrote this script.

          .block
            .heading Future Features
            .text.
              I intend to add more features as I personally see fit. If you want something,
              send me an email at camerontyrel@gmail.com or message me on Habitica, my
              username is MrTyx.

</template>

<script>
import { spells } from "../variables/spells.js";
import { stats } from "../variables/stats.js";

export default {
  name: "main",
  data() {
    return {
      autoLevelModel: {},
      autoCastSpellModel: {},
      autoCastTaskModel: {},
      minimumGold: 0,
      minimumMana: 0,
      tasks: [],
      stats,
      spells
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
        "logs",
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

        // DEFINE SCHEMA: Master Enable
        if (items.master === undefined) {
          items.master = { enabled: true };
          chrome.storage.sync.set({ master: items.master });
        }

        // DEFINE SCHEMA: Debug Enable
        if (items.debug === undefined) {
          items.debug = { enabled: false };
          chrome.storage.sync.set({ debug: items.debug });
        }

        // DEFINE SCHEMA: Limits
        if (items.limits === undefined) {
          items.limits = {
            enabled: false,
            gold: 0,
            mana: 0
          };
          chrome.storage.sync.set({ limits: items.limits });
        }

        // DEFINE SCHEMA: Log Messages
        if (items.logs === undefined) {
          items.logs = [];
          chrome.storage.sync.set({ logs: items.logs });
        }

        // DEFINE SCHEMA: Auto Level
        if (items.autoLevel === undefined) {
          items.autoLevel = {
            enabled: false,
            index: 0,
            id: this.stats[0].value,
            name: this.stats[0].label
          };
          chrome.storage.sync.set({ autoLevel: items.autoLevel });
        }

        // DEFINE SCHEMA: Auto Cast
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
            cost: this.spells[1].cost,
            requireID: this.spells[1].requireID
          };
          items.autoCast.task = {
            id: "",
            name: ""
          };
          chrome.storage.sync.set({ autoCast: items.autoCast });
        }

        // DEFINE SCHEMA: Auto Gems
        if (items.autoGems === undefined) {
          items.autoGems = { enabled: false };
          chrome.storage.sync.set({ autoGems: items.autoGems });
        }

        // DEFINE SCHEMA: Auto Armoire
        if (items.autoArmoire === undefined) {
          items.autoArmoire = { enabled: false };
          chrome.storage.sync.set({ autoArmoire: items.autoArmoire });
        }

        // DEFINE SCHEMA: Auto Feed
        if (items.autoFeed === undefined) {
          items.autoFeed = { enabled: false };
          chrome.storage.sync.set({ autoFeed: items.autoFeed });
        }

        // DEFINE SCHEMA: Auto Quest
        if (items.autoQuest === undefined) {
          items.autoQuest = { enabled: false };
          chrome.storage.sync.set({ autoQuest: items.autoQuest });
        }

        // DEFINE SCHEMA: Randomize Mount
        if (items.randomizeMount === undefined) {
          items.randomizeMount = { enabled: false };
          chrome.storage.sync.set({ randomizeMount: items.randomizeMount });
        }

        // DEFINE SCHEMA: Randomize Pet
        if (items.randomizePet === undefined) {
          items.randomizePet = { enabled: false };
          chrome.storage.sync.set({ randomizePet: items.randomizePet });
        }

        // Populate the switches
        this.$refs.autoLevel.set(items.autoLevel.enabled);
        this.$refs.autoCast.set(items.autoCast.enabled);
        this.$refs.autoGems.set(items.autoGems.enabled);
        this.$refs.autoArmoire.set(items.autoArmoire.enabled);
        this.$refs.autoFeed.set(items.autoFeed.enabled);
        this.$refs.autoQuest.set(items.autoQuest.enabled);
        this.$refs.randomizeMount.set(items.randomizeMount.enabled);
        this.$refs.randomizePet.set(items.randomizePet.enabled);
        this.$refs.master.set(items.master.enabled);
        this.$refs.debug.set(items.debug.enabled);
        this.$refs.limits.set(items.limits.enabled);

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
            obj.autoCast.spell.index = i;
            obj.autoCast.spell.id = this.spells[i].value;
            obj.autoCast.spell.name = this.spells[i].label;
            obj.autoCast.spell.cost = this.spells[i].cost;
            obj.autoCast.spell.requireID = this.spells[i].requireID;
            chrome.storage.sync.set(obj);
          });
          return;
        }
      }
    },
    setAutocastTask() {
      chrome.storage.sync.get("autoCast", obj => {
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
.heading {
  display: block;
  font-size: 1.5em;
  line-height: 2em;
  font-weight: bold;
}
.text {
  font-size: 1.2em;
  line-height: 1.2em;
  text-align: justify;
}
.block {
  background-color: #eee;
  padding: 10px 20px;
}
.block-margin-bottom {
  margin-bottom: 20px;
}
.subblock { }
</style>
