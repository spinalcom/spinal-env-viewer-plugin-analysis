<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.recap"
    md-label="Summary"
    :md-done.sync="stepper.fifth"
  >
    <md-content class="contents md-scrollbar">
      <p>
        Please check that all the information are correct before saving the
        analytic.
      </p>
      <div
        v-for="(field, index) in summaryList"
        :key="index"
        class="summary-item"
      >
        <strong>{{ field.label }}:</strong>
        {{ field.value === '' ? 'Missing !' : field.value }}
      </div>
    </md-content>
  </md-step>
</template>

<script>

export default {
  props: [
    'STEPPERS_DATA',
    'stepper',
    'analyticName',
    'trackingMethod',
    'filterValue',
    'followedEntity',
    'algorithm',
    'algorithmParameters',
    'resultName',
    'resultType',
    'intervalTime',
  ],
  data() {

    return {

    };
  },
  methods: {},
  computed: {
    summaryList() {
      return [
        { label: 'Analytic Name', value: this.analyticName },
        { label: 'Tracking Method', value: this.trackingMethod },
        { label: 'Filter Value', value: this.filterValue },
        { label: 'Followed Entity', value: this.followedEntity },
        { label: 'Algorithm', value: this.algorithm },
        {
          label: 'Algorithm Parameters',
          value: JSON.stringify(this.algorithmParameters),
        },
        { label: 'Result Name', value: this.resultName },
        { label: 'Result Type', value: this.resultType },
        { label: 'Interval Time (ms)', value: this.intervalTime },
      ];
    },
  },
};
</script>

<style scoped>
.summary-item {
  padding: 8px 0;
  font-size: 16px;
  line-height: 1.5;
}

.summary-item strong {
  margin-right: 8px;
}
</style>
