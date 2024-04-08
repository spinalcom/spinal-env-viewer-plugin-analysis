<template>
  <md-dialog
    :md-active.sync="showDialog"
    :md-click-outside-to-close="false"
    @md-closed="closeDialog(false)"
    class="mdDialog"
  >
    <md-dialog-title class="mdDialogTitle"> Create Analytic </md-dialog-title>

    <md-dialog-content class="mdDialogContainer">
      <md-steppers
        :md-active-step.sync="stepper.active"
        @md-changed="changeStep"
        md-linear
      >
        <analytic-name
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          v-bind:analyticName.sync="analyticName"
          v-bind:analyticDescription.sync="analyticDescription"
          v-bind:analyticShouldTriggerAtStart.sync="analyticShouldTriggerAtStart"
          v-bind:analyticShouldCatchUpPastExecutions.sync="analyticShouldCatchUpPastExecutions"
          v-bind:analyticStatus.sync="analyticStatus"
          :editable="true"
        ></analytic-name>

         <followed-entity
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          :entityType="entityType"
          v-bind:followedEntity.sync="followedEntity"
        ></followed-entity>

        <input-configuration
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          :entityType="entityType"
          :followedEntity="followedEntity"
          @addInput="addInput"
          @removeInput="removeInput"
          v-bind:inputs.sync="inputs"
        >
        </input-configuration>

        <trigger-configuration
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          :inputs="inputs"
          @addTrigger="addTrigger"
          @removeTrigger="removeTrigger"
          v-bind:triggers.sync="triggers"
        >
        </trigger-configuration>

        <algorithm-configuration
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          @addAlgorithm="addAlgorithm"
          @removeAlgorithm="removeAlgorithm"
          v-bind:algorithms.sync="algorithms"
          >
        </algorithm-configuration>


        <result-configuration
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          :inputs="inputs"
          v-bind:resultName.sync="resultName"
          v-bind:resultType.sync="resultType"
          v-bind:intervalTime.sync="intervalTime"
          v-bind:ticketContextId.sync="ticketContextId"
          v-bind:ticketProcessId.sync="ticketProcessId"
          v-bind:phoneNumber.sync="phoneNumber"
          v-bind:phoneMessage.sync="phoneMessage"
          v-bind:gChatMessage.sync="gChatMessage"
          v-bind:gChatSpaceName.sync="gChatSpaceName"
          v-bind:alarmPriority.sync="alarmPriority">
        </result-configuration>


        <io-dependencies
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          :inputs="inputs"
          :algorithms="algorithms"
          v-bind:ioDependencies.sync="ioDependencies"
          >
        </io-dependencies>

        <summary-analytic
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          :analyticName="analyticName"
          :trackingMethods="trackingMethods"
          :followedEntity="followedEntity"
          :algorithm="algorithm"
          :algorithmParameters="algorithmParameters"
          :resultName="resultName"
          :resultType="resultType"
          :intervalTime="intervalTime"
        >
        </summary-analytic> 
      </md-steppers>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary" @click="closeDialog(false)"
        >Close</md-button
      >

      <md-button
        class="md-primary"
        v-if="stepper.active !== this.STEPPERS_DATA.summary"
        @click="PassToNextStep"
        >Next
      </md-button>
      <md-button
        v-if="stepper.active === this.STEPPERS_DATA.summary"
        :disabled="isSaveButtonDisabled()"
        class="md-primary"
        @click="closeDialog(true)"
        >Save</md-button
      >
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import {
  spinalAnalyticService,
  CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS,
  CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS,
  CATEGORY_ATTRIBUTE_RESULT_PARAMETERS,
  CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS,
  CATEGORY_ATTRIBUTE_TWILIO_PARAMETERS,
  CATEGORY_ATTRIBUTE_ANALYTIC_PARAMETERS,
  CATEGORY_ATTRIBUTE_IO_DEPENDENCIES,
  CATEGORY_ATTRIBUTE_TRIGGER_PARAMETERS,
  CATEGORY_ATTRIBUTE_ALGORITHM_INDEX_MAPPING,
  CATEGORY_ATTRIBUTE_GCHAT_PARAMETERS,
  ATTRIBUTE_GCHAT_MESSAGE,
  ATTRIBUTE_GCHAT_SPACE,
  ATTRIBUTE_PHONE_NUMBER,
  ATTRIBUTE_PHONE_MESSAGE,
  ATTRIBUTE_SEPARATOR,
  ATTRIBUTE_TRACKING_METHOD,
  ATTRIBUTE_FILTER_VALUE,
  ATTRIBUTE_TIMESERIES,
  ATTRIBUTE_RESULT_NAME,
  ATTRIBUTE_RESULT_TYPE,
  ATTRIBUTE_ANALYTIC_STATUS,
  ATTRIBUTE_ANALYTIC_DESCRIPTION,
  ATTRIBUTE_SEARCH_DEPTH,
  ATTRIBUTE_STRICT_DEPTH,
  ATTRIBUTE_SEARCH_RELATIONS,
  ATTRIBUTE_TIMESERIES_VALUE_AT_START,
  ATTRIBUTE_TRIGGER_AT_START,
  ATTRIBUTE_TICKET_CONTEXT_ID,
  ATTRIBUTE_TICKET_PROCESS_ID,
  ATTRIBUTE_ALARM_PRIORITY,
  ATTRIBUTE_VALUE_SEPARATOR,
  ATTRIBUTE_LAST_EXECUTION_TIME,
  ATTRIBUTE_ANALYTIC_PAST_EXECUTIONS,
  ANALYTIC_RESULT_TYPE,
  TRACK_METHOD,
  ALGORITHMS,
  ANALYTIC_STATUS
} from 'spinal-model-analysis';

import analyticNameVue from './components/analyticSteps/analyticName.vue';
import followedEntityVue from './components/analyticSteps/followedEntity.vue';
import inputConfiguration from './components/analyticSteps/inputConfiguration.vue';
import triggerConfiguration from './components/analyticSteps/triggerConfiguration.vue';
import algorithmConfiguration from './components/analyticSteps/algorithmConfiguration.vue';
import resultConfiguration from './components/analyticSteps/resultConfiguration.vue';
import IODependenciesVue from './components/analyticSteps/IODependencies.vue';
import configurationVue from './components/analyticSteps/configuration.vue';
import summaryVue from './components/analyticSteps/summary.vue';


export default {
  name: 'createAnalyticDialog',
  props: ['onFinised'],
  components: {
    'analytic-name': analyticNameVue,
    'followed-entity': followedEntityVue,
    'input-configuration': inputConfiguration,
    'trigger-configuration': triggerConfiguration,
    'algorithm-configuration': algorithmConfiguration,
    'result-configuration': resultConfiguration,
    'io-dependencies': IODependenciesVue,
    'configuration': configurationVue,
    'summary-analytic': summaryVue,
  },
  data() {

    this.STEPPERS_DATA = {
      analytic: 'first',
      followedEntity: 'second',
      inputConfiguration: 'third',
      triggerConfiguration: 'fourth',
      algorithmConfiguration: 'fifth',
      resultConfiguration: 'sixth',
      IODependencies : 'seventh',
      summary : 'eighth',
    };

    return {
      showDialog: true,
      showPreviewDialog: false,

      // Analytic attributes data
      analyticName: '',
      analyticDescription:'',
      analyticShouldTriggerAtStart : false,
      analyticShouldCatchUpPastExecutions : false,
      analyticStatus : false,


      // Inputs -> Followed Entity -> attribute data
      followedEntity: undefined, 

      // Inputs  -> Tracking Method -> attribute data
      inputs: { },


      // Config -> trigger attribute data
      triggers: { },

      // Config -> Algorithms attribute data
      algorithms: {},

      // Config -> I/O Dependencies attribute data
      ioDependencies : { R : ""},

      // Config -> Result attribute data
      resultType : '',
      resultName : '', 
      ticketContextId: '',
      ticketProcessId: '',
      phoneNumber:'',
      phoneMessage:'',
      alarmPriority: null,
      gChatMessage : '',
      gChatSpaceName : '',
      
      selectedNode: undefined,
      entityType: undefined,

      stepper: {
        active: this.STEPPERS_DATA.analytic,
        first: false,
        second: false,
        third: false,
        fourth: false,
        fifth: false,
        sixth: false,
        seventh: false,
        eighth: false,
      },
    };
  },

  created() {
    this.ANALYTIC_STATUS = ANALYTIC_STATUS;
  },

  methods: {
    opened(option) {
      this.selectedNode = option.selectedNode;
      this.entityType = this.selectedNode.entityType.get();
    },

    async removed(res) {
      if (res.closeResult) {

        // there must be a better way to get the context id...
        const contextId = Object.keys(this.selectedNode.contextIds.get())[0];

        //create analytic Node
        const IAnalytic = {
          name: this.analyticName,
          description: '',
        };

        const analyticInfo = await spinalAnalyticService.addAnalytic(
          IAnalytic,
          contextId,
          this.selectedNode.id.get()
        );

        //create trackingMethod Node
        const trackingMethodAttributes = this.getTrackingMethodAttributes();
        console.log('trackingMethodAttributes :', trackingMethodAttributes);
        
        const trackingMethodInfo =
          await spinalAnalyticService.addInputTrackingMethod(
            trackingMethodAttributes,
            contextId,
            analyticInfo.id.get()
          );



        //create followedEntity Node

        const followedEntityInfo =
          await spinalAnalyticService.addInputLinkToFollowedEntity(
            contextId,
            analyticInfo.id.get(),
            this.followedEntity
        );


        //create config Node
        const configAttributes = {};


        //Add all analytic parameters ( description, status, triggerAtStart)
        const analyticAttributes = this.getAnalyticAttributes();
        configAttributes[
          CATEGORY_ATTRIBUTE_ANALYTIC_PARAMETERS
        ] = analyticAttributes;


        const triggerAttributes = this.getTriggerAttributes();
        configAttributes[
          CATEGORY_ATTRIBUTE_TRIGGER_PARAMETERS
        ] = triggerAttributes;


        const resultAttributes = this.getResultAttributes();
        configAttributes[CATEGORY_ATTRIBUTE_RESULT_PARAMETERS] = resultAttributes;
        


        const algorithmParametersAttributes = this.getAlgorithmParametersAttributes();
        configAttributes[CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS] =
          algorithmParametersAttributes;
        
        const algorithmMappingAttributes = this.getAlgorithmMappingAttributes();
        configAttributes[CATEGORY_ATTRIBUTE_ALGORITHM_INDEX_MAPPING] = algorithmMappingAttributes;

        const ioAttributes = this.getIOAttributes();
        configAttributes[CATEGORY_ATTRIBUTE_IO_DEPENDENCIES] = ioAttributes;
        
        if (this.ticketContextId && this.ticketProcessId) {
          const ticketAttributes = this.getTicketAttributes();
          configAttributes[
            CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS
          ] = ticketAttributes;
        }

        if(this.resultType == ANALYTIC_RESULT_TYPE.SMS){
          const smsAttributes = this.getSMSAttributes();
          configAttributes[
            CATEGORY_ATTRIBUTE_TWILIO_PARAMETERS
          ] = smsAttributes;
        };

        if([ANALYTIC_RESULT_TYPE.GCHAT_MESSAGE,ANALYTIC_RESULT_TYPE.GCHAT_ORGAN_CARD].includes(this.resultType)){
          const gChatAttributes = this.getGChatAttributes();
          configAttributes[
            CATEGORY_ATTRIBUTE_GCHAT_PARAMETERS
          ] = gChatAttributes;
        };
        
        console.log('configAttributes :', configAttributes);

        const configInfo = await spinalAnalyticService.addConfig(
          configAttributes,
          analyticInfo.id.get(),
          contextId
        );
      }

      this.showDialog = false;
    },

    closeDialog(closeResult) {
      if (typeof this.onFinised === 'function') {
        this.onFinised({
          closeResult,
          analyticName: this.analyticName,
        });
      }
    },

    addInput() {
      let length = Object.keys(this.inputs).length;
      console.log('adding input');
      this.inputs = { ...this.inputs, [`I${length}`]: { trackingMethod: '', filterValue: '', searchDepth:0, strictDepth:false, searchRelations:'', timeseriesIntervalTime : 0 , timeseriesValueAtStart : false }};
    },

    removeInput(inputName) {
      delete this.inputs[inputName];
      let index = Number(inputName.match(/(\d+)/)[0]);
      // shift back all the inputs after the deleted one.
      let i = index;
      while (this.inputs[`I${i + 1}`] !== undefined) {
        this.inputs[`I${i}`] = this.inputs[`I${i + 1}`];
        i++;
      }
      // Remove the last item.
      delete this.inputs[`I${i}`];

      this.inputs = { ...this.inputs };
      console.log("deleted input : ", inputName);
    },

    addTrigger() {
      let length = Object.keys(this.triggers).length;
      console.log('adding input');
      this.triggers = { ...this.triggers, [`T${length}`]: { triggerType: '', triggerValue: '', changeOfValueThreshold : 0 }};
      
    },

    removeTrigger(triggerName) {
      delete this.triggers[triggerName];
      let index = Number(triggerName.match(/(\d+)/)[0]);
      // shift back all the elements after the deleted one.
      let i = index;
      while (this.triggers[`T${i + 1}`] !== undefined) {
        this.triggers[`T${i}`] = this.triggers[`T${i + 1}`];
        i++;
      }
      // Remove the last item.
      delete this.triggers[`T${i}`];

      this.triggers = { ...this.triggers };
      console.log("deleted trigger : ", triggerName);
    },

    addAlgorithm(){
      let length = Object.keys(this.algorithms).length;
      console.log('adding algorithm');
      this.algorithms = { ...this.algorithms, [`A${length}`]: { name :'', params: []}};
    },

    removeAlgorithm(algorithmIndexName){
      delete this.algorithms[algorithmIndexName];
      let index = Number(algorithmIndexName.match(/(\d+)/)[0]);
      // shift back all the elements after the deleted one.
      let i = index;
      while (this.algorithms[`A${i + 1}`] !== undefined) {
        this.algorithms[`A${i}`] = this.algorithms[`A${i + 1}`];
        i++;
      }
      // Remove the last item.
      delete this.algorithms[`A${i}`];

      this.algorithms = { ...this.algorithms };
      console.log("deleted algorithm : ", algorithmIndexName);
    },

    changeStep(stepId) {
      this.stepper.active = stepId;
    },

    PassToNextStep() {
      switch (this.stepper.active) {
        case this.STEPPERS_DATA.analytic:
          this.stepper.first = true;
          this.stepper.active = this.STEPPERS_DATA.followedEntity;
          break;
        case this.STEPPERS_DATA.followedEntity:
          this.stepper.second = true;
          this.stepper.active = this.STEPPERS_DATA.inputConfiguration;
          break;
        case this.STEPPERS_DATA.inputConfiguration:
          this.stepper.third = true;
          this.stepper.active = this.STEPPERS_DATA.triggerConfiguration;
          break;
        case this.STEPPERS_DATA.triggerConfiguration:
          this.stepper.fourth = true;
          this.stepper.active = this.STEPPERS_DATA.algorithmConfiguration;
          break;
        case this.STEPPERS_DATA.algorithmConfiguration:
          this.stepper.fifth = true;
          this.stepper.active = this.STEPPERS_DATA.resultConfiguration;
          break;
        case this.STEPPERS_DATA.resultConfiguration:
          this.stepper.sixth = true;
          this.stepper.active = this.STEPPERS_DATA.IODependencies;
          break;
        case this.STEPPERS_DATA.IODependencies:
          this.stepper.seventh = true;
          this.stepper.active = this.STEPPERS_DATA.summary;
          break;
        case this.STEPPERS_DATA.summary:
          this.stepper.eighth = true;
          this.stepper.active = this.STEPPERS_DATA.summary;
          break;
      }
    },

    isSaveButtonDisabled() {
      return (
        this.analyticName === '' ||
        this.algorithm === '' ||
        this.resultType === '' ||
        this.resultName === '' ||
        this.intervalTime === null ||
        !this.followedEntity
      );
    },

    getTrackingMethodAttributes(){
      const trackingMethodAttributes = {};
      for ( const inputKey of Object.keys(this.inputs))
      {
        trackingMethodAttributes[inputKey] = []
        trackingMethodAttributes[inputKey].push({ name: `${ATTRIBUTE_TRACKING_METHOD}`,
                  type: 'string',
                  value: this.inputs[inputKey].trackingMethod });
        trackingMethodAttributes[inputKey].push({ name: `${ATTRIBUTE_FILTER_VALUE}`,
                  type: 'string',
                  value: this.inputs[inputKey].filterValue });
        trackingMethodAttributes[inputKey].push({ name: `${ATTRIBUTE_SEARCH_DEPTH}`,
                  type: 'number',
                  value: this.inputs[inputKey].searchDepth });
        trackingMethodAttributes[inputKey].push({ name: `${ATTRIBUTE_STRICT_DEPTH}`,
                  type: 'boolean',
                  value: this.inputs[inputKey].strictDepth });
        trackingMethodAttributes[inputKey].push({ name: `${ATTRIBUTE_SEARCH_RELATIONS}`,
                  type: 'string',
                  value: this.inputs[inputKey].searchRelations });
        
        if([TRACK_METHOD.CONTROL_ENDPOINT_NAME_FILTER,TRACK_METHOD.ENDPOINT_NAME_FILTER].includes(this.inputs[inputKey].trackingMethod) ){
          trackingMethodAttributes[inputKey].push({ name: `${ATTRIBUTE_TIMESERIES}`,
                  type: 'number',
                  value: this.inputs[inputKey].timeseriesIntervalTime });
          trackingMethodAttributes[inputKey].push({ name: `${ATTRIBUTE_TIMESERIES_VALUE_AT_START}`,
                  type: 'boolean',
                  value: this.inputs[inputKey].timeseriesValueAtStart });
          
          
        }
        
      }
      return trackingMethodAttributes;
    },

    getAnalyticAttributes(){
      const analyticAttributes = [];
      analyticAttributes.push({
        name: `${ATTRIBUTE_ANALYTIC_DESCRIPTION}`,
        type: 'string',
        value: this.analyticDescription,
      });
      analyticAttributes.push({
        name: `${ATTRIBUTE_ANALYTIC_STATUS}`,
        type: 'string',
        value: this.analyticStatus? ANALYTIC_STATUS.ACTIVE : ANALYTIC_STATUS.INACTIVE,
      });
      analyticAttributes.push({
        name: `${ATTRIBUTE_TRIGGER_AT_START}`,
        type: 'boolean',
        value: this.analyticShouldTriggerAtStart,
      });
      analyticAttributes.push({
        name: `${ATTRIBUTE_ANALYTIC_PAST_EXECUTIONS}`,
        type: 'boolean',
        value: this.analyticShouldCatchUpPastExecutions,
      });
      analyticAttributes.push({
        name: `${ATTRIBUTE_LAST_EXECUTION_TIME}`,
        type: 'string',
        value: Date.now(),
      });
      return analyticAttributes;
    },

    getResultAttributes(){
      const resultAttributes = [];
      resultAttributes.push({
        name: `${ATTRIBUTE_RESULT_TYPE}`,
        type: 'string',
        value: this.resultType,
      });
      resultAttributes.push({
        name: `${ATTRIBUTE_RESULT_NAME}`,
        type: 'string',
        value: this.resultName,
      });
      return resultAttributes;
    },

    getAlgorithmParametersAttributes(){
      const algorithmParametersAttributes = [];
      for (const algorithmIndexName of Object.keys(this.algorithms)) {
        let algoName = this.algorithms[algorithmIndexName].name;
        const doc = ALGORITHMS[algoName].requiredParams;
        for(let i = 0 ; i<this.algorithms[algorithmIndexName].params.length; i++){
          algorithmParametersAttributes.push({
            name: `${algorithmIndexName}${ATTRIBUTE_SEPARATOR}${doc[i].name}`,
            value: doc[i].type === 'number' ? + this.algorithms[algorithmIndexName].params[i] : this.algorithms[algorithmIndexName].params[i],
            type: doc[i].type,
          });
        }
      }
      return algorithmParametersAttributes;
    },

    getAlgorithmMappingAttributes(){
      const algorithmMappingAttributes = [];
      for (const algorithmIndexName of Object.keys(this.algorithms)) {
        algorithmMappingAttributes.push({
          name: `${algorithmIndexName}`,
          type: 'string',
          value: this.algorithms[algorithmIndexName].name,
        });
      }
      return algorithmMappingAttributes;
    },

    getTicketAttributes(){
      const ticketAttributes = [];
      ticketAttributes.push({
        name: `${ATTRIBUTE_TICKET_CONTEXT_ID}`,
        type: 'string',
        value: this.ticketContextId,
      });
      ticketAttributes.push({
        name: `${ATTRIBUTE_TICKET_PROCESS_ID}`,
        type: 'string',
        value: this.ticketProcessId,
      });
      if(this.alarmPriority){
          ticketAttributes.push({
            name: `${ATTRIBUTE_ALARM_PRIORITY}`,
            value: this.alarmPriority,
            type: 'number',
          });
        }
      return ticketAttributes;
    },

    getSMSAttributes(){
      const smsAttributes = [];
      smsAttributes.push({
        name: `${ATTRIBUTE_PHONE_NUMBER}`,
        type: 'string',
        value: this.phoneNumber,
      });
      smsAttributes.push({
        name: `${ATTRIBUTE_PHONE_MESSAGE}`,
        type: 'string',
        value: this.phoneMessage,
      });
      return smsAttributes;
    },

    getGChatAttributes(){
      const gChatAttributes = [];
      gChatAttributes.push({
        name: `${ATTRIBUTE_GCHAT_MESSAGE}`,
        type: 'string',
        value: this.gChatMessage,
      });
      gChatAttributes.push({
        name: `${ATTRIBUTE_GCHAT_SPACE}`,
        type: 'string',
        value: this.gChatSpaceName,
      });
      return gChatAttributes;
    },
    

    getIOAttributes(){
      const ioAttributes = [];
      for (const ioDependencyName of Object.keys(this.ioDependencies)) {
        let str = "";
        for (const ioDependency of this.ioDependencies[ioDependencyName]) {
          str += `${ioDependency}${ATTRIBUTE_VALUE_SEPARATOR}`;
        }
        str = str.slice(0, -1);
        ioAttributes.push({
          name: `${ioDependencyName}`,
          type: 'string',
          value: str,
        });
      }
      return ioAttributes;
    },

    getTriggerAttributes(){
      const triggerAttributes = [];
      for (const triggerIndex of Object.keys(this.triggers)) {
        let str = `${this.triggers[triggerIndex].triggerType}${ATTRIBUTE_VALUE_SEPARATOR}${this.triggers[triggerIndex].triggerValue}`;
        if (this.triggers[triggerIndex].changeOfValueThreshold !== null) {
          str += `${ATTRIBUTE_VALUE_SEPARATOR}${this.triggers[triggerIndex].changeOfValueThreshold}`;
        }
        triggerAttributes.push({
          name: `${triggerIndex}`,
          type: 'string',
          value: str,
        });
      }
      return triggerAttributes;
    },
    
  },
};
</script>

<style scoped>
.mdDialog {
  width: 1200px;
  max-width: 1500px;
  height: 600px;
}

.mdDialog .mdDialogTitle {
  text-align: center;
}
.md-button {
    padding: 10px 20px;
    border-radius: 5px;
    transition: background-color 0.3s;
}
.mdDialog .mdDialogContainer {
  width: 1200px;
  max-width: 1500px;
  height: 100%;
  overflow: auto;
}

.fixed-size-field {
  width: 85%;
  max-width: 85%;
}

.md-dialog-actions {
  padding: 8px 16px; /* Add this line */
  margin: 0; /* Add this line */
}

.md-button {
  margin: 0 8px; /* Add this line */
}

.mdDialog .mdDialogContainer .mdStep {
  height: 350px;
  padding: 10px 0px;
  overflow: auto;
}
</style>

<style>
.mdDialog .mdDialogContainer .mdStep .md-stepper-content.md-active {
  width: 100%;
  height: 100%;
}
.fixed-size-field {
  width: 85%;
  max-width: 85%;
}

.mdDialog .mdDialogContainer .mdStep .contents {
  width: 100%;
  height: 100%;
  align-items: center;
  overflow: auto;
}
</style>
