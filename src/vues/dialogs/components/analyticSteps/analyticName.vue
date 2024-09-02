<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.analytic"
    md-label="Analytic"
    :md-done.sync="stepper.first"
  >
    <md-content class="contents">
      <md-field class="fixed-size-field">
        <label>Analytic name</label>
        <md-input
          :disabled="!editable"
          @change="update('analyticName',localAnalyticName)"
          v-model="localAnalyticName"
        ></md-input>
      </md-field>

      <md-field class="fixed-size-field">
        <label>Analytic Description</label>
        <md-input
          @change="update('analyticDescription',localAnalyticDescription)"
          v-model="localAnalyticDescription"
        ></md-input>
      </md-field>
        <md-switch
          @change="update('analyticShouldTriggerAtStart',localAnalyticShouldTriggerAtStart)"
          v-model="localAnalyticShouldTriggerAtStart"
        >Should force trigger at start : <b>{{ localAnalyticShouldTriggerAtStart ? 'Yes': 'No'}} </b> </md-switch>
        
        <!-- <md-switch
          @change="update('analyticShouldCatchUpPastExecutions',localAnalyticShouldCatchUpPastExecutions)"
          v-model="localAnalyticShouldCatchUpPastExecutions"
        >Should catch up missed executions (only works for timeseries based calculations and cron or interval time triggers ) : <b>{{ localAnalyticShouldCatchUpPastExecutions ? 'Yes': 'No'}} </b> </md-switch> -->
        <md-switch
          @change="update('analyticStatus',localAnalyticStatus)"
          v-model="localAnalyticStatus"
        >Analytic Status : <b> {{localAnalyticStatus ? 'Active' : 'Inactive'}} </b> </md-switch>

        
        <md-field
            class="fixed-size-field"
            
          >
            <label> Cron syntax </label>
            <md-input
             @change="update('analyticAggregateExecution',localAnalyticAggregateExecution)"
              v-model="localAnalyticAggregateExecution"
            ></md-input>
            
          </md-field>
          <p>
          Aggregate Execution to a specific time : (leave empty to disable this feature)
        </p>
      
    </md-content>
  </md-step>
</template>

<script>
import { CONSTANTS } from "spinal-model-analysis"
export default {
  props: [
    'STEPPERS_DATA',
    'stepper',
    'analyticName',
    'analyticDescription',
    'analyticShouldTriggerAtStart',
    //'analyticShouldCatchUpPastExecutions',
    'analyticAggregateExecution',
    'analyticStatus',
    'editable',
  ],
  data() {
    return {
      localAnalyticName: this.analyticName,
      localAnalyticDescription: this.analyticDescription,
      localAnalyticShouldTriggerAtStart: this.analyticShouldTriggerAtStart,
      //localAnalyticShouldCatchUpPastExecutions : this.analyticShouldCatchUpPastExecutions,
      localAnalyticAggregateExecution: this.analyticAggregateExecution,
      localAnalyticStatus: this.analyticStatus,
      statuSwitchValue : this.computedStatuSwitchValue,
    };
  },
  created() {
    this.ANALYTIC_STATUS = CONSTANTS.ANALYTIC_STATUS;
  },

  computed : {
    computedAnalyticStatus () {
      return this.statuSwitchValue ? CONSTANTS.ANALYTIC_STATUS.ACTIVE : CONSTANTS.ANALYTIC_STATUS.INACTIVE;
    },

    computedStatuSwitchValue () {
      return this.localAnalyticStatus === CONSTANTS.ANALYTIC_STATUS.ACTIVE;
    },

  },
  methods: {
    update(key, value) {
      console.log('update ', key, value);
      this.$emit(`update:${key}`, value);
    },
  },
  watch: {
    analyticName() {
      this.localAnalyticName = this.analyticName;
    },
    analyticDescription() {
      this.localAnalyticDescription = this.analyticDescription;
    },
    analyticShouldTriggerAtStart() {
      this.localAnalyticShouldTriggerAtStart = this.analyticShouldTriggerAtStart;
    },
    analyticShouldCatchUpPastExecutions() {
      this.localAnalyticShouldCatchUpPastExecutions = this.analyticShouldCatchUpPastExecutions;
    },
    analyticStatus() {
      this.localAnalyticStatus = this.analyticStatus;
    },
    analyticAggregateExecution() {
      this.localAnalyticAggregateExecution = this.analyticAggregateExecution;
    },
  },
};
</script>
