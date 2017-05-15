<template lang="pug">
  #app
    ui-textbox(
      floating-label
      label="Playlist URL"
      v-model="playlistURL"
    )
    ui-textbox(
      disabled
      floating-label
      label="Playlist ID (computed)"
      v-model="playlistId"
    )
    ui-button(
      raised
      :size="large"
      :loading="loading"
      color="primary"
      @click="request()"
    )#request REQUEST
    hr
    ui-textbox(
      :multi-line="true"
      autosize="true"
      v-model="playlistString"
      ref="textarea"
    )
</template>

<script>
module.exports = {
  data() {
    return {
      playlistURL: "",
      playlistData: [],
      playlistString: ""
    };
  },
  computed: {
    playlistId: function() {
      let matches = this.playlistURL.match(/list=(.*?)(&|$)/);
      if (matches !== null && matches.length > 0) return matches[1];
      return "";
    }
  },
  methods: {
    updateString(title, id, pos, pId) {
      this.playlistString += `[${title}](https://www.youtube.com/watch?v=${id}&index=${pos}&list=${pId})\n`;
    },
    request() {
      var opts = {
        part: "snippet",
        playlistId: this.playlistId,
        maxResults: 50
      };

      // Recursive process loop (get playlist in chunks of 50)
      let process = () => {
        gapi.client.load("youtube", "v3", () => {
          let req = gapi.client.youtube.playlistItems.list(opts);
          req.execute(res => {
            for (let i = 0; i < res.items.length; i++) {
              this.updateString(
                res.items[i].snippet.title,
                res.items[i].snippet.resourceId.videoId,
                res.items[i].snippet.position,
                res.items[i].snippet.playlistId
              );
            }
            if (res.nextPageToken !== undefined) {
              opts.pageToken = res.nextPageToken;
              process(res.nextPageToken);
            } else {
              // Cause we programmatically set the textarea, we have to trigger the
              // resize event so it knows whats up. But for some reason, we have to
              // wait a second. See the below link
              //  https://github.com/JosephusPaye/Keen-UI/issues/303
              setTimeout(() => {
                this.$refs.textarea.refreshSize();
              }, 1000);
            }
          });
        });
      };

      gapi.client.setApiKey("AIzaSyDXaxjq4Vu38QQ7gtJdVjxLlmaoyhnxeIo");
      process();
    }
  }
};
</script>

<style scoped>

</style>
