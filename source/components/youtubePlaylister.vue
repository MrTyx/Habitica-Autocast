<template lang="pug">
  #app
    .block.block-margin-bottom
      span.title Playlist URL
      ui-textbox(
        placeholder="https://www.youtube.com/playlist?list=PLAYLIST_ID"
        icon="play_circle_outline"
        v-model="playlistURL"
      )
      ui-textbox(
        disabled
        placeholder="PLAYLIST_ID"
        icon="label_outline"
        v-model="playlistId"
      )
    .block.block-margin-bottom
      span.title Extras
      ui-textbox(
        icon="last_page"
        placeholder="Prefix"
        v-model="prefix"
      )
      ui-textbox(
        icon="first_page"
        placeholder="Suffix"
        v-model="suffix"
      )
    div.block-margin-bottom
      ui-button(
        raised
        :size="large"
        :loading="loading"
        color="primary"
        ref="request"
        @click="request()"
      )#request REQUEST

    .block
      span.title Output
      ui-textbox(
        placeholder="[prefix title suffix](url)"
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
      playlistString: "",
      prefix: "",
      suffix: ""
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
      this.playlistString += `[${this.prefix}${title}${this.suffix}](https://www.youtube.com/watch?v=${id}&index=${pos}&list=${pId})\n`;
    },
    request() {
      var opts = {
        part: "snippet",
        playlistId: this.playlistId,
        maxResults: 50
      };

      // Recursive process loop (get playlist in chunks of 50)
      let process = () => {
        this.playlistString = "";
        this.$refs.request.loading = true;
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
                this.$refs.request.loading = false;
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
.block {
  background-color: #eee;
  padding: 10px 20px;
}
.block-margin-bottom {
  margin-bottom: 20px;
}
.title {
  font-size: 1.5em;
  line-height: 2em;
  font-weight: bold;
}
#request {
  width: 100%;
}
</style>
