<template lang="pug">
  div
    space.description {{ this.desc }}
    span.subtitle {{ this.sub }}
    ui-switch(
      v-model="enabled"
      @change="change()"
    )#switch
</template>

<script>
module.exports = {
  props: ["name", "desc", "sub"],
  data() {
    return {
      enabled: false
    };
  },
  methods: {
    change() {
      chrome.storage.sync.get(this.name, obj => {
        obj[this.name].enabled = this.enabled;
        let temp = {};
        temp[this.name] = obj[this.name];
        temp[this.name].enabled = this.enabled;
        chrome.storage.sync.set(temp);
      });
    },
    set(value) {
      this.enabled = value;
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
