import Vue from "vue";
import KeenUI from "keen-ui";
import popup from "./templates/popup.vue";

Vue.use(KeenUI);

new Vue({
  el: "#popup",
  render: h => h(popup)
});
