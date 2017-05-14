import Vue from "vue";
import KeenUI from "keen-ui";

import main from "./templates/main.vue";
import login from "./templates/login.vue";

Vue.use(KeenUI);

chrome.storage.sync.get(["userID", "apiToken"], function(items) {
  if (items.userID !== undefined) {
    new Vue({
      el: "#app",
      render: h => h(main)
    });
  } else {
    new Vue({
      el: "#app",
      render: h => h(login)
    });
  }
});
