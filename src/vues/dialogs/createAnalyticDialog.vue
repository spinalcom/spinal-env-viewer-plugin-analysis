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
          :editable="true"
        ></analytic-name>

        <followed-entity
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          :entityType="entityType"
          v-bind:followedEntity.sync="followedEntity"
        ></followed-entity>

        <tracking-method
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          :entityType="entityType"
          :followedEntity="followedEntity"
          @addTrackingMethod="addTrackingMethod"
          @removeTrackingMethod="removeTrackingMethod"
          v-bind:trackingMethods.sync="trackingMethods"
          v-bind:trackingIntervalTime.sync="trackingIntervalTime"
        >
        </tracking-method>

        <configuration
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          :inputs="trackingMethods"
          v-bind:algorithm.sync="algorithm"
          v-bind:algorithmParameters.sync="algorithmParameters"
          v-bind:resultName.sync="resultName"
          v-bind:resultType.sync="resultType"
          v-bind:intervalTime.sync="intervalTime"
          v-bind:ticketContextId.sync="ticketContextId"
          v-bind:ticketProcessId.sync="ticketProcessId"
          v-bind:alarmPriority.sync="alarmPriority"
          v-bind:triggerAtStart.sync="triggerAtStart"
        >
        </configuration>

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
        v-if="stepper.active !== this.STEPPERS_DATA.recap"
        @click="PassToNextStep"
        >Next
      </md-button>
      <md-button
        v-if="stepper.active === this.STEPPERS_DATA.recap"
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
  algos,
} from 'spinal-model-analysis';

import analyticNameVue from './components/analyticSteps/analyticName.vue';
import followedEntityVue from './components/analyticSteps/followedEntity.vue';
import trackingMethodVue from './components/analyticSteps/trackingMethod.vue';
import configurationVue from './components/analyticSteps/configuration.vue';
import summaryVue from './components/analyticSteps/summary.vue';

export default {
  name: 'createAnalyticDialog',
  props: ['onFinised'],
  components: {
    'analytic-name': analyticNameVue,
    'followed-entity': followedEntityVue,
    'tracking-method': trackingMethodVue,
    'configuration': configurationVue,
    'summary-analytic': summaryVue,
  },
  data() {
    this.CONST_CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS =
      CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS;
    this.CONST_CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS =
      CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS;
    this.CONST_CATEGORY_ATTRIBUTE_RESULT_PARAMETERS =
      CATEGORY_ATTRIBUTE_RESULT_PARAMETERS;
    this.CONST_CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS =
      CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS;
    this.STEPPERS_DATA = {
      analytic: 'first',
      followedEntity: 'second',
      trackingMethod: 'third',
      config: 'fourth',
      recap: 'fifth',
    };

    return {
      showDialog: true,
      showPreviewDialog: false,
      analyticName: '',

      // Inputs related data
      trackingMethods: [{ trackingMethod: '', filterValue: '', removeFromAnalysis: false }],
      trackingIntervalTime: '',
      followedEntity: undefined,

      //Config related data
      algorithm: '',
      resultType: '',
      resultName: '',
      intervalTime: null,
      algorithmParameters: [],
      ticketContextId: '',
      ticketProcessId: '',
      alarmPriority: null,
      triggerAtStart:false,


      selectedNode: undefined,
      entityType: undefined,

      stepper: {
        active: this.STEPPERS_DATA.analytic,
        first: false,
        second: false,
        third: false,
        fourth: false,
        fifth: false,
      },
    };
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
        const trackingMethodAttributes = {};
        trackingMethodAttributes[
          this.CONST_CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS
        ] = [{name : 'trackingIntervalTime', type: 'number', value: this.trackingIntervalTime}];

        for(let i = 0; i < this.trackingMethods.length; i++){
          trackingMethodAttributes[
            this.CONST_CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS
          ].push({ name: 'trackingMethod'+i, type: 'string', value: this.trackingMethods[i].trackingMethod });
          trackingMethodAttributes[
            this.CONST_CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS
          ].push({ name: 'filterValue'+i, type: 'string', value: this.trackingMethods[i].filterValue });
          trackingMethodAttributes[
            this.CONST_CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS
          ].push({ name: 'removeFromAnalysis'+i, type: 'boolean', value: this.trackingMethods[i].removeFromAnalysis });
          trackingMethodAttributes[
            this.CONST_CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS
          ].push({ name: 'removeFromBinding'+i, type: 'boolean', value: this.trackingMethods[i].removeFromBinding });
        }
        
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
        configAttributes[this.CONST_CATEGORY_ATTRIBUTE_RESULT_PARAMETERS] = [];
        configAttributes[this.CONST_CATEGORY_ATTRIBUTE_RESULT_PARAMETERS].push({
          name: 'resultType',
          type: 'string',
          value: this.resultType,
        });
        configAttributes[this.CONST_CATEGORY_ATTRIBUTE_RESULT_PARAMETERS].push({
          name: 'resultName',
          type: 'string',
          value: this.resultName,
        });
        const formattedAlgorithmParams = [];
        const doc = algos[this.algorithm].requiredParams;
        for (let i = 0; i < this.algorithmParameters.length; i++) {
          const paramValue = this.algorithmParameters[i];
          formattedAlgorithmParams.push({
            name: doc[i].name,
            value: doc[i].type === 'number' ? +paramValue : paramValue,
            type: doc[i].type,
          });
        }
        configAttributes[this.CONST_CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS] =
          formattedAlgorithmParams;
        configAttributes[
          this.CONST_CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS
        ].push({ name: 'algorithm', type: 'string', value: this.algorithm });
        configAttributes[
          this.CONST_CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS
        ].push({
          name: 'intervalTime',
          type: 'number',
          value: this.intervalTime,
        });
        configAttributes[
          this.CONST_CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS
        ].push({
          name: 'triggerAtStart',
          type: 'boolean',
          value: this.triggerAtStart,
        });

        if (this.ticketContextId && this.ticketProcessId) {
          const formattedTicketAttributes = [];
          formattedTicketAttributes.push({
            name: 'ticketContextId',
            value: this.ticketContextId,
            type: 'string',
          });
          formattedTicketAttributes.push({
            name: 'ticketProcessId',
            value: this.ticketProcessId,
            type: 'string',
          });
        
        if(this.alarmPriority){
          formattedTicketAttributes.push({
            name: 'alarmPriority',
            value: this.alarmPriority,
            type: 'number',
          });
        }
          configAttributes[
            this.CONST_CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS
          ] = formattedTicketAttributes;
  
        }
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

    addTrackingMethod() {
      this.trackingMethods.push({ trackingMethod: '', filterValue: '', removeFromAnalysis: false, removeFromBinding: false });
    },
    removeTrackingMethod(index) {
      this.trackingMethods.splice(index, 1);
    },
    changeStep(stepId) {
      console.log('changeStep :', stepId)
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
          this.stepper.active = this.STEPPERS_DATA.trackingMethod;
          break;
        case this.STEPPERS_DATA.trackingMethod:
          this.stepper.third = true;
          this.stepper.active = this.STEPPERS_DATA.config;
          break;
        case this.STEPPERS_DATA.config:
          this.stepper.fourth = true;
          this.stepper.active = this.STEPPERS_DATA.recap;
          break;
        case this.STEPPERS_DATA.recap:
          this.stepper.fifth = true;
          this.stepper.active = this.STEPPERS_DATA.recap;
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

  },
};
</script>

<style scoped>
.mdDialog {
  width: 1000px;
  max-width: 1000px;
  height: 600px;
}

.mdDialog .mdDialogTitle {
  text-align: center;
}

.mdDialog .mdDialogContainer {
  width: 1000px;
  max-width: 1000px;
  height: 100%;
  overflow: hidden;
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
  overflow: hidden;
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
