<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.analytic"
    md-label="Analytic"
    :md-done.sync="stepper.first"
    :md-editable="editable"
  >
    <md-content class="contents">
      <md-field class="fixed-size-field">
        <label>Analytic name</label>
        <md-input @change="updateAnalyticName" v-model="localAnalyticName" ></md-input>
      </md-field>
    </md-content>
  </md-step>
</template>

<script>
export default {
  props: ['STEPPERS_DATA', 'stepper', 'analyticName','editable'],
  data() {
    return {
      localAnalyticName: this.analyticName,
    };
  },
  methods: {
    updateAnalyticName() {
      this.$emit('update:analyticName', this.localAnalyticName);
    },
  },
  watch: {
    analyticName() {
      this.localAnalyticName = this.analyticName;
    },
  },
};
</script>
