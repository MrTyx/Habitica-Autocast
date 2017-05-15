<template lang="pug">
  #app
    #wrapper
      ui-tabs(type="text", raised)
        ui-tab(title="Auto Actions")
          .block
            div
              option-row(
                name="autolevel"
                v-bind:enabled="autolevel"
                description="Auto Level Up Stats")
            .subblock
              ui-select(
                :options="stats"
                v-model="autolevelModel"
                @change="setAutolevel()")
          hr
          .block
            div
              option-row(
                name="autocast"
                v-bind:enabled="autocast"
                description="Autocast Spell"
                subtitle="")
            .subblock
              ui-select(
                :options="spells"
                type="image"
                v-model="autocastSpellModel"
                @change="setAutocastSpell()")
              ui-select(
                :options="tasks",
                v-model="autocastTaskModel"
                @change="setAutocastTask()")
          hr
          .block
            option-row(
              name="autobuyArmoire"
              v-bind:enabled="autobuyArmoire"
              description="Autobuy Enchanted Armoire")
          hr
          .block
            option-row(
              name="autobuyGems"
              v-bind:enabled="autobuyGems"
              description="Autobuy Gems"
              subtitle="To be implemented")
          hr
          .block
            option-row(
              name="autofeedPets"
              v-bind:enabled="autofeedPets"
              description="Autofeed Pets"
              subtitle="To be implemented")
          hr
          .block
            option-row(
              name="autostartQuest"
              v-bind:enabled="autostartQuest"
              description="Autostart New Quest"
              subtitle="To be implemented")

        ui-tab(title="Randomizer")
          .block
            option-row(
              name="randomizeMount"
              v-bind:enabled="randomizeMount"
              description="Randomize Mount"
              subtitle="To be implemented")
          hr
          .block
            option-row(
              name="randomizePet"
              v-bind:enabled="randomizePet"
              description="Randomize Pet"
              subtitle="To be implemented")
        ui-tab(title="Youtube Playlist")
          .block
            youtube-playerlister
        ui-tab(title="About") To be done
</template>

<script>
export default {
  name: "main",
  data() {
    return {
      autolevel: false,
      autolevelIndex: 0,
      autolevelModel: {},
      autocast: false,
      autocastSpellModel: {},
      autocastSpellIndex: 0,
      autocastSpellValue: "",
      autocastTaskModel: {},
      autocastTaskLabel: "",
      autocastTaskValue: "",
      autobuyArmoire: false,
      autobuyGems: false,
      autofeedPets: false,
      autostartQuest: false,

      randomizeMount: false,
      randomizePet: false,
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
          requireID: true
        },
        {
          value: "mpHeal",
          label: "Ethereal Surge",
          image: "images/skill_mpHeal.png",
          requireID: false
        },
        {
          value: "earth",
          label: "Earthquake",
          image: "images/skill_earth.png",
          requireID: false
        },
        {
          value: "frost",
          label: "Chilling Frost",
          image: "images/skill_frost.png",
          requireID: false
        },
        {
          value: "smash",
          label: "Brutal Smash",
          image: "images/skill_smash.png",
          requireID: true
        },
        {
          value: "defensiveStance",
          label: "Defensive Stance",
          image: "images/skill_defensiveStance.png",
          requireID: false
        },
        {
          value: "valorousPresence",
          label: "Valorous Presence",
          image: "images/skill_valorousPresence.png",
          requireID: false
        },
        {
          value: "intimidate",
          label: "Intimidating Gaze",
          image: "images/skill_intimidate.png",
          requireID: false
        },
        {
          value: "pickPocket",
          label: "Pickpocket",
          image: "images/skill_pickPocket.png",
          requireID: true
        },
        {
          value: "backStab",
          label: "Backstab",
          image: "images/skill_backStab.png",
          requireID: true
        },
        {
          value: "toolsOfTrade",
          label: "Tools of the Trade",
          image: "images/skill_toolsOfTrade.png",
          requireID: false
        },
        {
          value: "stealth",
          label: "Stealth",
          image: "images/skill_stealth.png",
          requireID: false
        },
        {
          value: "heal",
          label: "Healing Light",
          image: "images/skill_heal.png",
          requireID: false
        },
        {
          value: "protectAura",
          label: "Protective Aura",
          image: "images/skill_protectAura.png",
          requireID: false
        },
        {
          value: "brightness",
          label: "Searing Brightness",
          image: "images/skill_brightness.png",
          requireID: false
        },
        {
          value: "healAll",
          label: "Blessing",
          image: "images/skill_healAll.png",
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
        "autolevel",
        "autolevelIndex",
        "autocast", // Boolean, do we autocast?
        "autocastSpellIndex", // Location in spells array, eg 1
        "autocastSpellValue", // Spell value used in url, eg fireball
        "autocastTaskLabel", // String value in tasks array from axios req
        "autobuyArmoire",
        "autobuyGems",
        "autofeedPets",
        "autostartQuest",

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
          .then(response => {
            for (let i = 0; i < response.data.data.length; i++) {
              this.tasks.push({
                label: response.data.data[i].text,
                value: response.data.data[i].id
              });
              if (response.data.data[i].text === this.autocastTaskLabel) {
                this.autocastTaskModel = this.tasks[i];
              }
            }
          });

        // Auto Level Stats
        this.autolevel = items.autolevel ? true : false;
        this.autolevelIndex = items.autolevelIndex;
        this.autolevelModel = this.stats[items.autolevelIndex];

        // Auto Cast Spell
        this.autocast = items.autocast ? true : false;
        this.autocastSpellIndex = items.autocastSpellIndex;
        this.autocastSpellModel = this.spells[items.autocastSpellIndex];
        this.autocastSpellName = items.autocastSpellName || "";
        this.autocastTaskLabel = items.autocastTaskLabel || "";

        this.autobuyArmoire = items.autobuyArmoire ? true : false;

        this.autobuyGems = items.autobuyGems ? true : false;

        this.autofeedPets = items.autofeedPets ? true : false;

        this.autostartQuest = items.autostartQuest ? true : false;

        this.randomizeMount = items.randomizeMount ? true : false;
        this.randomizePet = items.randomizePet ? true : false;
      }
    );
  },
  methods: {
    setAutolevel() {
      console.log(this.autolevelModel);
      for (let i = 0; i < this.stats.length; i++) {
        if (this.stats[i].value === this.autolevelModel.value) {
          this.autolevelIndex = i;
          chrome.storage.sync.set({
            autolevelIndex: i,
            autolevelValue: this.autolevelModel.value
          });
          return;
        }
      }
    },
    setAutocastSpell() {
      for (let i = 0; i < this.spells.length; i++) {
        if (this.spells[i].value === this.autocastSpellModel.value) {
          this.autocastSpellIndex = i;
          chrome.storage.sync.set({
            autocastSpellIndex: i,
            autocastSpellValue: this.autocastSpellModel.value
          });
          return;
        }
      }
    },
    setAutocastTask() {
      chrome.storage.sync.set({
        autocastTaskLabel: this.autocastTaskModel.label,
        autocastTaskValue: this.autocastTaskModel.value
      });
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
.block {
  background-color: #eee;
  padding: 10px 20px;
}
.subblock {
  margin-left: 50px;
}
</style>
