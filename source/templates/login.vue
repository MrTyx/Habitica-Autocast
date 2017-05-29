<template lang="pug">
  #app
    #wrapper
      #box.border-color-primary-dark.bg-color-primary-light
        h2 Get your UserID and Api Token from&nbsp;
          a(href="https://habitica.com/#/options/settings/api") here
        ui-textbox(
          label="User ID",
          :invalid="userID.length > 36",
          v-model="userID"
        )
        ui-textbox(
          label="API Token",
          :invalid="apiToken.length > 36",
          v-model="apiToken"
        )
        ui-button(
          raised,
          :size="large",
          :loading="loading"
          color="primary"
          @click="submit()"
        )#submit SUBMIT
        ui-alert(
          @dismiss="showErrorBar=false",
          type="error",
          v-show="showErrorBar"
        ) {{ errorMessage }}
</template>

<script>
export default {
  name: "login",
  data: function() {
    return {
      userID: "",
      apiToken: "",
      loading: false,
      showErrorBar: false
    };
  },
  methods: {
    submit() {
      this.loading = true;
      this.axios
        .get("https://habitica.com/api/v3/tasks/user", {
          headers: {
            "x-api-user": this.userID,
            "x-api-key": this.apiToken
          }
        })
        .then(
          success => {
            chrome.storage.sync.set({
              userID: this.userID,
              apiToken: this.apiToken
            });
            console.log("YES!");
            window.location.reload();
          },
          error => {
            this.loading = false;
            this.errorMessage = `[${error.response.status}] ${error.response.statusText}`;
            this.showErrorBar = true;
          }
        );
    }
  }
};
</script>

<style scoped>
#wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%
}
#box {
  /*padding: 10px 30px 20px 30px;*/
  padding: 20px 50px 30px 50px;
  border-width: medium;
  border-style: solid;
  border-radius: 20px;
  min-width: 600px;
}
#box h1 {
  color: #2196f3;
}

#box h2 {
  text-align: center;
}

#box h2 a {
  color: #2196f3;
}

#submit {
  width: 100%;
}

</style>
