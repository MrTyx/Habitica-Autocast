<template lang="pug">
  #app
    #wrapper
      ui-tabs(
        type="text",
        raised
      )
        ui-tab(title="Auto Actions")
          option-row(name="autobuyArmoire", v-bind:enabled="autobuyArmoire", description="Autobuy Enchanted Armoire")
          option-row(name="autobuyGems", v-bind:enabled="autobuyGems", description="Autobuy Gems")
          option-row(name="autocastSpell", v-bind:enabled="autocastSpell", description="Autocast Spell")
          option-row(name="autofeedPets", v-bind:enabled="autofeedPets", description="Autofeed Pets")
          option-row(name="autostartQuest", v-bind:enabled="autostartQuest", description="Autostart New Quest")
          option-row(name="autolevelStats", v-bind:enabled="autolevelStats", description="Auto Level Up Stats")
        ui-tab(title="Randomize")
          option-row(name="randomizeMount", v-bind:enabled="randomizeMount", description="Randomize Mount")
          option-row(name="randomizePet", v-bind:enabled="randomizePet", description="Randomize Pet")
        ui-tab(title="Youtube Playlist-er")
        ui-tab(title="Settings") favicon
</template>

<script>
export default {
  name: "main",
  data() {
    return {
      autobuyArmoire: false,
      autobuyGems: false
    };
  },
  mounted() {
    chrome.storage.sync.get(["autobuyArmoire", "autobuyGems"], items => {
      this.autobuyArmoire = items.autobuyArmoire ? true : false;
      this.autobuyGems = items.autobuyGems ? true : false;
    });
  }
};
</script>

<style scoped>
#wrapper {
  display: flex;
  justify-content: center;
  max-width: 1280px;
  margin: 0 auto;
}
</style>
