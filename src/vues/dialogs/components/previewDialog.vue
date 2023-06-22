<template>
  <div>
    <md-dialog
      :md-click-outside-to-close="false"
      :md-close-on-esc="false"
      class="mdDialog"
      :md-active.sync="visible"
    >
      <md-dialog-title>Preview captured data</md-dialog-title>
      
      <md-content class="content md-scrollbar">
        <div class="json-preview">
          <pre>{{ data }}</pre>
        </div>
      </md-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="close">Close</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
export default {
  name: 'previewDialog',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    data: {
      type: String,
      required: true,
    },
  },
  data: () => ({}),
  methods: {
    close() {
      this.$emit('closeDialog');
    },
  },
};
</script>

<style scoped>
.mdDialog {
  transform: translate(-50%, -50%) scale(1) !important;
  z-index: 1000 !important;
}
.content {
  max-height: 400px;
  width: 700px;
  overflow-y: auto;
}
.json-preview {
  margin: 20px;
  background-color: #1e1e1e;
  border: 2px solid #3a3a3a;
  border-radius: 8px;
  padding: 20px;
  color: #ffffff;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.json-preview pre {
  margin: 10px;
}
</style>
