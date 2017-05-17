<template lang="pug">
  div
    space.description {{ this.description }}
    span.subtitle {{ this.subtitle }}
    ui-switch(
      v-model="this.enabled"
      @change="change()"
    )#switch

</template>

<script>
module.exports = {
  props: ["name", "enabled", "description", "subtitle"],
  methods: {
    change() {
      this.enabled = !this.enabled;
      chrome.storage.sync.get(this.name, obj => {
        let temp = {};
        temp[this.name] = obj[this.name];
        temp[this.name].enabled = this.enabled;
        chrome.storage.sync.set(temp);
      });
    }
  }
};
</script>

<style scoped>
#switch {
  float: right;
}
.description {
  font-size: 1.5em;
  line-height: 2em;
  font-weight: bold;
}
.subtitle {
  margin-left: 10px;
  font-size: 1.5em;
  color: lightgray;
}
</style>
