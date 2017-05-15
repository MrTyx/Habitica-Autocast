import Vue from "vue";
import KeenUI from "keen-ui";
import axios from "axios";
import VueAxios from "vue-axios";

import main from "./templates/main.vue";
import login from "./templates/login.vue";
import optionRow from "./components/optionRow.vue";
import youtubePlaylister from "./components/youtubePlaylister.vue";

Vue.use(VueAxios, axios);
Vue.use(KeenUI);

Vue.component("option-row", optionRow);
Vue.component("youtube-playerlister", youtubePlaylister);

chrome.storage.sync.get(["userID", "apiToken"], function(items) {
  if (items.userID !== undefined && items.apiToken !== undefined) {
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
