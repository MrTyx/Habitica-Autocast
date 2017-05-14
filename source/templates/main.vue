<template lang="pug">
  #app
    #wrapper
      ui-tabs(
        type="text",
        raised
      )
        ui-tab(title="Auto Actions")
          ui-switch Autobuy Enchanted Armoire
        ui-tab(title="Books") My books
        ui-tab(title="Authors") Authors
        ui-tab(title="Collections") My collections
        ui-tab(title="Favourites") favicon
</template>

<script>
export default {
  name: "main",
  methods: {
    set(caller) {
      chrome.storage.sync.set("");
    }
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
