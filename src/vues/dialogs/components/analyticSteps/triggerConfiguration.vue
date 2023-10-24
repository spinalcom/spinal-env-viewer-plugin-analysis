<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.triggerConfiguration"
    md-label="Triggers"
    :md-done.sync="stepper.fourth"
  >
    <md-content class="contents md-scrollbar">
        <p>
        A trigger is a condition that must be met for the analytic to be executed.
        For exemple you can bind on one of the inputs to execute the analytic when
        the value of the input is changed.
        Or you can add a time based trigger that will make the analytic execute every 20000 ms ( 20s ).

        </p>

      <div v-for="([triggerName, value]) in Object.entries(localTriggers)" :key="triggerName" class="block">

        <b>Trigger {{triggerName}}</b>
        <md-field class="fixed-size-field">
          <label>Trigger type</label>
          <md-select v-model="value.triggerType" @md-selected="resetInfo(value)">
            <md-option
              v-for="data of TRIGGER_TYPE"
              :key="data"
              :value="data"
            >{{ data }}</md-option
            >
          </md-select>
        </md-field>

        
        <md-field class="fixed-size-field"  v-if="value.triggerType == TRIGGER_TYPE.INTERVAL_TIME">
          <label> Interval time value (ms) </label>
          <md-input type="number" min="0" v-model="value.triggerValue"></md-input>
        </md-field>
        <md-field class="fixed-size-field" v-if="showInputSelection(value.triggerType)">
          <label>Input selection (which input do you want to use for change of value tracking)</label>
          <md-select v-model="value.triggerValue">
            <md-option
              v-for="data of Object.keys(inputs)"
              :key="data"
              :value="data"
            >{{ data }}</md-option
            >
          </md-select>
        </md-field>  
        <md-field class="fixed-size-field"  v-if="value.triggerType == TRIGGER_TYPE.CHANGE_OF_VALUE_WITH_THRESHOLD">
          <label> Threshold value  (any change greater than treshold value will trigger analytic) </label>
          <md-input type="number" min="0" v-model="value.changeOfValueThreshold"></md-input>
        </md-field>


        <md-button
          class="md-accent"
          @click="removeTrigger(triggerName)">
          Remove
        </md-button>
        
      </div>

      <md-button
        class="md-primary"
        @click="addTrigger"
      >
        Add Trigger
      </md-button>

    </md-content>
  </md-step>
</template>

<script>
import { TRIGGER_TYPE } from 'spinal-model-analysis';


export default {
  props: ['STEPPERS_DATA', 'stepper'
  ,'inputs', 'triggers' ],
  components: {
  },
  data() {
    return {
        localTriggers: this.triggers,
        showPreviewDialog:false,
        previewData: '',
      
    };
  },
  created() {
    this.TRIGGER_TYPE = TRIGGER_TYPE;
  },
  methods: {
    addTrigger() {
      console.log('clicked on button add Trigger');
      this.$emit('addTrigger');
    },
    removeTrigger(triggerName){
      this.$emit('removeTrigger',triggerName);
    },
    showInputSelection(triggerType){
      return [TRIGGER_TYPE.CHANGE_OF_VALUE_WITH_THRESHOLD, TRIGGER_TYPE.CHANGE_OF_VALUE].includes(triggerType);
    },

    resetInfo(triggerInfo){
      console.log('reset info');
      triggerInfo.changeOfValueThreshold = null;
      triggerInfo.triggerValue = '';
    },


  },
  computed: {
    
    

    
  },

  watch:{
    triggers(){
      console.log('parent triggers changed')
      this.localTriggers = this.triggers;
    }
  }
};
</script>

<style scoped>
.block {
  border: 2px dashed #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  width: 90%;
}


</style>

