<template lang="pug">
  #popup
    ui-toolbar(
      brand="Magic Wand"
      text-color="white"
      type="clear"
      removeNavIcon="true"
      :raised="false"
    )
      div(slot="actions")
        ui-icon-button(
          color="red"
          icon="clear"
          type="secondary"
          @click="clearLog()"
          )
        ui-icon-button(
          color="white"
          icon="settings"
          type="secondary"
          @click="goToOptions()"
        )
    #table
      table
        tr(v-for="log in logs")
          td
            b {{ log.datetime }}
            span  {{ log.message }}
</template>

<script>
module.exports = {
  name: "popup",
  data() {
    return {
      logs: []
    };
  },
  methods: {
    clearLog() {
      this.logs = [];
      chrome.storage.sync.set({ logs: [] });
    },
    goToOptions() {
      if (chrome.runtime.openOptionsPage) {
        // New way to open options pages, if supported (Chrome 42+).
        chrome.runtime.openOptionsPage();
      } else {
        // Reasonable fallback.
        window.open(chrome.runtime.getURL("app.html"));
      }
    }
  },
  mounted() {
    chrome.storage.sync.get(["logs"], items => {
      this.logs = items.logs.reverse();
    });
  }
};
</script>

<style scoped>
#wrapper {
  display: flex;
  justify-content: center;
  width: 400px;
  height: 400px;
  margin: 20px auto;
}
#table { }
table {
  width: 100%;
  height: 400px;
  margin: auto;
  display: block;
  overflow-y: scroll;
}
tr {
  border-top: 1px solid #C1C3D1;
  border-bottom: 1px solid #C1C3D1;
  color:#666B85;
  font-size:1em;
  font-weight:normal;
  text-shadow: 0 1px 1px rgba(256, 256, 256, 0.1);
}
td {
  background:#FFFFFF;
  padding: 5px;
  text-align:left;
  vertical-align:middle;
  text-shadow: -1px -1px 1px rgba(0, 0, 0, 0.1);
  border-right: 1px solid #C1C3D1;
  width: 400px;
}

</style>
