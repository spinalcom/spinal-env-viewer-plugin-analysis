<template>
  <md-dialog
    :md-active.sync="showDialog"
    :md-click-outside-to-close="false"
    @md-closed="closeDialog(false)"
    class="mdDialog"
  >
    <md-dialog-title class="mdDialogTitle"> Modify Analytic </md-dialog-title>

    <md-dialog-content class="mdDialogContainer">
      <md-steppers
        :md-active-step.sync="stepper.active"
        @md-changed="changeStep"
        md-linear
      >
        <analytic-name
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          :editable="false"
          v-bind:analyticName.sync="analyticName"
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
          v-bind:trackingMethod.sync="trackingMethod"
          v-bind:filterValue.sync="filterValue"
          v-bind:trackingIntervalTime.sync="trackingIntervalTime"
        >
        </tracking-method>

        <configuration
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          v-bind:algorithm.sync="algorithm"
          v-bind:algorithmParameters.sync="algorithmParameters"
          v-bind:resultName.sync="resultName"
          v-bind:resultType.sync="resultType"
          v-bind:intervalTime.sync="intervalTime"
          v-bind:ticketContextId.sync="ticketContextId"
          v-bind:ticketProcessId.sync="ticketProcessId"
        >
        </configuration>

        <summary-analytic
          :STEPPERS_DATA="STEPPERS_DATA"
          :stepper="stepper"
          :analyticName="analyticName"
          :trackingMethod="trackingMethod"
          :filterValue="filterValue"
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
  ANALYTIC_RESULT_TYPE,
  ALGO_DOC,
} from 'spinal-model-analysis';

import analyticNameVue from './components/analyticSteps/analyticName.vue';
import followedEntityVue from './components/analyticSteps/followedEntity.vue';
import trackingMethodVue from './components/analyticSteps/trackingMethod.vue';
import configurationVue from './components/analyticSteps/configuration.vue';
import summaryVue from './components/analyticSteps/summary.vue';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

export default {
  name: 'modifyAnalyticDialog',
  props: ['onFinised'],
  components: {
    'analytic-name': analyticNameVue,
    'followed-entity': followedEntityVue,
    'tracking-method': trackingMethodVue,
    'configuration': configurationVue,
    'summary-analytic': summaryVue,
  },
  data() {
    this.CONST_ALGO_DOC = ALGO_DOC;
    this.CONST_ANALYTIC_RESULT_TYPE = ANALYTIC_RESULT_TYPE;
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
      trackingMethod: '',
      filterValue: '',
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

      selectedNode: undefined,
      entityType: undefined,

      stepper: {
        active: this.STEPPERS_DATA.followedEntity,
        first: false,
        second: false,
        third: false,
        fourth: false,
        fifth: false,
      },
    };
  },
  methods: {
    async opened(option) {
      this.selectedNode = option.selectedNode;
      // selectedNode is the analytic node
      const selectedNodeId = this.selectedNode.id.get();
      const entity = await spinalAnalyticService.getEntityFromAnalytic(selectedNodeId);
      this.entityType = entity.entityType.get();
      this.analyticName = this.selectedNode.name.get();
      const followedEntityNode = await spinalAnalyticService.getFollowedEntity(selectedNodeId);
      this.followedEntity = followedEntityNode ? followedEntityNode.id.get() : undefined;
      const trackingMethodNode = await spinalAnalyticService.getTrackingMethod(selectedNodeId);
      const trackingParams = await spinalAnalyticService.getAttributesFromNode(
        trackingMethodNode.id.get(),
        this.CONST_CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS
      );
      const configNode = await spinalAnalyticService.getConfig(selectedNodeId);
      const configAlgoParams = await spinalAnalyticService.getAttributesFromNode(
        configNode.id.get(),
        this.CONST_CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS
      );
      const configResultParams = await spinalAnalyticService.getAttributesFromNode(
        configNode.id.get(),
        this.CONST_CATEGORY_ATTRIBUTE_RESULT_PARAMETERS
      );

      function extractParams(obj) {
        const params = Object.keys(obj).filter(key => /^p\d/.test(key));
        const extractedParams = [];

        for (const key of params) {
          extractedParams.push(obj[key]);
        }
        return extractedParams;
      }

      this.algorithm = configAlgoParams['algorithm'];
      this.intervalTime = configAlgoParams['intervalTime'];
      this.algorithmParameters = extractParams(configAlgoParams);
      this.resultType= configResultParams['resultType'];
      if ([this.CONST_ANALYTIC_RESULT_TYPE.TICKET,this.CONST_ANALYTIC_RESULT_TYPE.ALARM].includes(this.resultType)){
        const configTicketParameters = await spinalAnalyticService.getAttributesFromNode(
          configNode.id.get(),
          this.CONST_CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS
        );
        this.ticketContextId = configTicketParameters['ticketContextId'];
        this.ticketProcessId = configTicketParameters['ticketProcessId'];
      }
      this.resultName = configResultParams['resultName'];
      this.trackingMethod= trackingParams['trackMethod'];
      this.filterValue= trackingParams['filterValue'];
      this.trackingIntervalTime = trackingParams['trackingIntervalTime'];
    },

    async removed(res) {
      if (res.closeResult) {
        /*console.log({
          entity: this.selectedNode,
          Analytic_name: this.analyticName,
          algorithm: this.algorithm,
          resultType: this.resultType,
          resultName: this.resultName,
          intervalTime: this.intervalTime,
          algorithmParameters: this.algorithmParameters,
          trackingMethod: this.trackingMethod,
          filterValue: this.filterValue,
          followedEntity: this.followedEntity,
        })*/

        // there must be a better way to get the context id...
        const contextId = Object.keys(this.selectedNode.contextIds.get())[0];
        const followedEntityNodeRef = await spinalAnalyticService.getFollowedEntity(this.selectedNode.id.get());
        if (followedEntityNodeRef && followedEntityNodeRef.id.get() !== this.followedEntity) {
          console.log("change followed entity");
          await spinalAnalyticService.removeLinkToFollowedEntity(this.selectedNode.id.get(), followedEntityNodeRef.id.get());
          await spinalAnalyticService.addInputLinkToFollowedEntity(contextId,this.selectedNode.id.get(), this.followedEntity);
        }
        if(!followedEntityNodeRef){
          await spinalAnalyticService.addInputLinkToFollowedEntity(contextId,this.selectedNode.id.get(), this.followedEntity);
        }
        const trackingMethodAttributes = {};
        trackingMethodAttributes[this.CONST_CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS] =
          [
            { name: 'trackMethod', type: 'string', value: this.trackingMethod },
            { name: 'filterValue', type: 'string', value: this.filterValue },
            { name: 'trackingIntervalTime', type: 'number', value: this.trackingIntervalTime}
          ];
        const trackingMethodNodeRef = await spinalAnalyticService.getTrackingMethod(
          this.selectedNode.id.get(),
        );
        const trackingMethodNode =  SpinalGraphService.getRealNode(
          trackingMethodNodeRef.id.get(),
        );


        await spinalAnalyticService.addAttributesToNode(
          trackingMethodNode,
          trackingMethodAttributes,
        );




        const configAttributes = {};
        configAttributes[this.CONST_CATEGORY_ATTRIBUTE_RESULT_PARAMETERS] =
          [];
        configAttributes[
          this.CONST_CATEGORY_ATTRIBUTE_RESULT_PARAMETERS
        ].push({ name: 'resultType', type: 'string', value: this.resultType });
        configAttributes[
          this.CONST_CATEGORY_ATTRIBUTE_RESULT_PARAMETERS
        ].push({ name: 'resultName', type: 'string', value: this.resultName });

        const formattedAlgorithmParams = [];
        const doc = this.CONST_ALGO_DOC[this.algorithm];
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

          configAttributes[
            this.CONST_CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS
          ] = formattedTicketAttributes;
          /*await spinalAnalyticService.addAttributesToConfig(configInfo.id.get(),this.CONST_CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS,
          formattedTicketAttributes);*/
        }

        const configNodeRef = await spinalAnalyticService.getConfig(
          this.selectedNode.id.get()
        );
        const configNode = SpinalGraphService.getRealNode(
          configNodeRef.id.get()
        );
        await spinalAnalyticService.addAttributesToNode(
          configNode,
          configAttributes
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

    disabledButton() {
      return false;
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
        this.trackingMethod === '' ||
        this.filterValue === '' ||
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
