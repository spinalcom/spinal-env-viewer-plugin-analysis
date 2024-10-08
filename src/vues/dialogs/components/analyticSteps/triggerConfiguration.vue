<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.triggerConfiguration"
    md-label="Triggers"
    :md-done.sync="stepper.fourth"
  >
    <md-content class="contents md-scrollbar">
      <p>
        A trigger is a condition that must be met for the analytic to be
        executed. For exemple you can bind on one of the inputs to execute the
        analytic when the value of the input is changed. Or you can add a time
        based trigger that will make the analytic execute every 20000 ms ( 20s
        ).
      </p>

      <div
        v-for="[triggerName, value] in Object.entries(localTriggers)"
        :key="triggerName"
        class="block"
      >
        <b>Trigger {{ triggerName }}</b>
        <md-field class="fixed-size-field">
          <label>Trigger type</label>
          <md-select
            v-model="value.triggerType"
            @md-selected="resetInfo(value)"
          >
            <md-option v-for="data of TRIGGER_TYPE" :key="data" :value="data">{{
              data
            }}</md-option>
          </md-select>
        </md-field>

        <md-field
          class="fixed-size-field"
          v-if="value.triggerType == TRIGGER_TYPE.INTERVAL_TIME"
        >
          <label> Interval time value (ms) </label>
          <md-input
            type="number"
            min="0"
            v-model="value.triggerValue"
          ></md-input>
        </md-field>
        <md-field
          class="fixed-size-field"
          v-if="showInputSelection(value.triggerType)"
        >
          <label
            >Input selection (which input do you want to use for change of value
            tracking)</label
          >
          <md-select v-model="value.triggerValue">
            <md-option
              v-for="data of Object.keys(inputs)"
              :key="data"
              :value="data"
              >{{ data }}</md-option
            >
          </md-select>
        </md-field>
        <md-field
          class="fixed-size-field"
          v-if="
            value.triggerType == TRIGGER_TYPE.CHANGE_OF_VALUE_WITH_THRESHOLD
          "
        >
          <label>
            Threshold value (any change greater than treshold value will trigger
            analytic)
          </label>
          <md-input
            type="number"
            min="0"
            v-model="value.changeOfValueThreshold"
          ></md-input>
        </md-field>

        <div v-if="value.triggerType == TRIGGER_TYPE.CRON" >
          
          <md-button class="md-primary" @click="showCronHelper"> Need help ?
            <md-icon class="help-icon" @click="showCronHelper"
              >help</md-icon
            >
          </md-button>
          <md-field
            class="fixed-size-field"
            
          >
            <label> Cron pattern </label>
            <md-input
              v-model="value.triggerValue"
              placeholder="* * * * *"
            ></md-input>
            
          </md-field>
        </div>
        

        <md-button class="md-accent" @click="removeTrigger(triggerName)">
          Remove
        </md-button>
      </div>

      <md-button class="md-primary" @click="addTrigger">
        Add Trigger
      </md-button>
      <cron-help-dialog
          :showCronHelpModal="showCronHelpModal"
          @closeCronHelpDialog="showCronHelpModal = false"
        ></cron-help-dialog>
    </md-content>
  </md-step>
</template>

<script>
import { CONSTANTS } from 'spinal-model-analysis';
import cronHelpDialog from '../cronHelpDialog.vue';

export default {
  props: ['STEPPERS_DATA', 'stepper', 'inputs', 'triggers'],
  components: {
    'cron-help-dialog':cronHelpDialog,
  },
  data() {
    return {
      localTriggers: this.triggers,
      showPreviewDialog: false,
      showCronHelpModal: false,
      previewData: '',
    };
  },
  created() {
    this.TRIGGER_TYPE = CONSTANTS.TRIGGER_TYPE;
  },
  methods: {
    addTrigger() {
      console.log('clicked on button add Trigger');
      this.$emit('addTrigger');
    },
    removeTrigger(triggerName) {
      this.$emit('removeTrigger', triggerName);
    },
    showInputSelection(triggerType) {
      return [
        CONSTANTS.TRIGGER_TYPE.CHANGE_OF_VALUE_WITH_THRESHOLD,
        CONSTANTS.TRIGGER_TYPE.CHANGE_OF_VALUE,
      ].includes(triggerType);
    },

    showCronHelper() {
      this.showCronHelpModal = true;
      console.log('showCronHelper : ', this.showCronHelpModal);
    },

    resetInfo(triggerInfo) {
      console.log('reset info');
      triggerInfo.changeOfValueThreshold = null;
      triggerInfo.triggerValue = '';
    },
  },
  computed: {},

  watch: {
    triggers() {
      console.log('parent triggers changed');
      this.localTriggers = this.triggers;
    },
  },
};
</script>

<style scoped>
.block {
  border: 2px dashed #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  width: 90%;
}
.help-icon {
  cursor: pointer;
  margin-left: 10px;
}
</style>
