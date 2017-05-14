<template lang="pug">
  #app
    h1 Test
    ui-textbox(
      error="The username may not be more than 16 characters",
      help="Pick a unique username not more than 16 characters",
      label="User ID",
      placeholder="Enter your User ID",
      :maxlength="16",
      :invalid="userID.length > 16",
      v-model="userID"
    )
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      userID: "",
      apiToken: ""
    };
  }
};
</script>
