<template>
  <md-dialog
    :md-click-outside-to-close="false"
    :md-close-on-esc="false"
    class="mdDialog"
    :md-active.sync="showCronHelpModal"
  >
    <md-dialog-title>Cron Pattern Guide</md-dialog-title>
    <md-dialog-content>
      <p
        >This guide will help you understand how to create cron patterns for
        scheduling tasks. A cron pattern is composed of five fields separated by a blank space: (minute) (hour) (day of the month) (month) (day of the week)</p
      >
      <ul>
        <li><strong>Minute</strong> (0 - 59)</li>
        <li><strong>Hour</strong> (0 - 23)</li>
        <li><strong>Day of the Month</strong> (1 - 31)</li>
        <li><strong>Month</strong> (1 - 12 or JAN - DEC)</li>
        <li
          ><strong>Day of the Week</strong> (0 - 7, where 0 or 7 is Sunday, or
          SUN - SAT)</li
        >
      </ul>
      <p>A field may be an asterisk (*), which always stands for first-last</p>

      <p
        >Ranges of numbers are allowed. Ranges are two numbers separated with a
        hyphen. The specified range is inclusive. For example, 8-11 for an
        ''hour'' entry specifies execution at hours 8, 9, 10 and 11.</p
      >

      <p
        >Lists are allowed.  A list is a set of numbers (or ranges)
             separated by commas.  Examples: ``1,2,5,9'', ``0-4,8-12''.</p
      >

      <p>Here are some common examples:</p>
      <ul>
        <li><code>0 * * * *</code> - Every hour at the start of the hour.</li>
        <li><code>30 9 * * 1</code> - Every Monday at 9:30 AM.</li>
        <li
          ><code>0 0 1 * *</code> - The first day of every month at
          midnight.</li
        >
      </ul>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="closeDialog()">Close</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
export default {
  props: ['showCronHelpModal'],
  data() {
    return {};
  },
  methods: {
    closeDialog() {
      this.$emit('closeCronHelpDialog');
    },
  },
};
</script>

<style scoped>
.mdDialog {
  z-index: 1000 !important;
  width: 100%;
  padding: 20px;
  border-radius: 10px;
}

.md-dialog-content ul {
  padding-left: 20px;
  list-style-type: disc;
}
.md-dialog-content code {
  background-color: #e5e5e5;
  margin-bottom: 5px;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
