<template lang="pug">
  div
    ui-switch(
      v-model="this.enabled",
      @change="change()"
    ) {{ this.description }}
      span.subtitle {{ this.subtitle }}

</template>

<script>
module.exports = {
  props: ["name", "enabled", "description", "subtitle"],
  methods: {
    change() {
      this.enabled = !this.enabled;
      let temp = {};
      temp[this.name] = this.enabled;
      chrome.storage.sync.set(temp);
    }
  }
};
</script>

<style scoped>
.subtitle {
  margin-left: 10px;
  color: lightgray;
}
</style>
