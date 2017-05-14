import Vue from "vue";
// import VueRouter from "vue-router";
import KeenUI from "keen-ui";
import app from "./app.vue";

// Vue.use(VueRouter);
Vue.use(KeenUI);

// const routes = [{ path: "/", component: Hello }];
//
// const router = new VueRouter({
//   routes, // short for routes: routes
//   mode: "history"
// });

new Vue({
  el: "#app",
  render: h => h(app)
});
