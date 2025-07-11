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
          v-bind:analyticName.sync="analyticName"
          v-bind:analyticDescription.sync="analyticDescription"
          v-bind:analyticShouldTriggerAtStart.sync="
            analyticShouldTriggerAtStart
          "
          v-bind:analyticAggregateExecution.sync="
            analyticAggregateExecution
          "
          v-bind:analyticStatus.sync="analyticStatus"
          :editable="false"
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
          v-bind:shouldCreateEndpointIfNotExist.sync="
            shouldCreateEndpointIfNotExist
          "
          v-bind:endpointModifyAttrInstead.sync="endpointModifyAttrInstead"
          v-bind:endpointCreationUnit.sync="endpointCreationUnit"
          v-bind:endpointCreationMaxDays.sync="endpointCreationMaxDays"
          v-bind:ticketContextId.sync="ticketContextId"
          v-bind:ticketProcessId.sync="ticketProcessId"
          v-bind:phoneNumber.sync="phoneNumber"
          v-bind:phoneMessage.sync="phoneMessage"
          v-bind:gChatMessage.sync="gChatMessage"
          v-bind:gChatSpaceName.sync="gChatSpaceName"
          v-bind:alarmPriority.sync="alarmPriority"
          v-bind:resultCategoryName.sync="resultCategoryName"
          v-bind:resultCreateAttributeIfNotExist.sync="resultCreateAttributeIfNotExist"
        >
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
      <md-button class="md-accent" @click="deleteAnalytic"
        >Delete Analytic</md-button
      >
      <md-button class="md-primary" @click="updateLastExecutionTime">
        Force update last execution time
      </md-button>

      <div>
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
      </div>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import {
  spinalAnalyticNodeManagerService,
  spinalAnalyticExecutionService,
  CONSTANTS,
  ALGORITHMS
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
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import AttributeService, {
  attributeService,
} from 'spinal-env-viewer-plugin-documentation-service';

export default {
  name: 'modifyAnalyticDialog',
  props: ['onFinised'],
  components: {
    'analytic-name': analyticNameVue,
    'followed-entity': followedEntityVue,
    'input-configuration': inputConfiguration,
    'trigger-configuration': triggerConfiguration,
    'algorithm-configuration': algorithmConfiguration,
    'result-configuration': resultConfiguration,
    'io-dependencies': IODependenciesVue,
    configuration: configurationVue,
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
      IODependencies: 'seventh',
      summary: 'eighth',
    };

    return {
      showDialog: true,
      showPreviewDialog: false,

      // Analytic attributes data
      analyticName: '',
      analyticDescription: '',
      analyticShouldTriggerAtStart: undefined,
      //analyticShouldCatchUpPastExecutions: undefined,
      analyticAggregateExecution: undefined,
      analyticStatus: undefined,
      analyticLastExecutionTime: undefined,

      // Inputs -> Followed Entity -> attribute data
      followedEntity: undefined,

      // Inputs  -> Tracking Method -> attribute data
      inputs: {},

      // Config -> trigger attribute data
      triggers: {},

      // Config -> Algorithms attribute data
      algorithms: {},

      // Config -> I/O Dependencies attribute data
      ioDependencies: { R: '' },

      // Config -> Result attribute data
      resultType: '',
      resultName: '',
      shouldCreateEndpointIfNotExist: false,
      endpointCreationUnit: '',
      endpointCreationMaxDays: null,
      endpointModifyAttrInstead: '',
      ticketContextId: '',
      ticketProcessId: '',
      phoneNumber: '',
      phoneMessage: '',
      alarmPriority: null,
      gChatMessage: '',
      gChatSpaceName: '',
      resultCategoryName: '',
      resultCreateAttributeIfNotExist: false,

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
  methods: {
    async opened(option) {
      this.selectedNode = option.selectedNode;
      // selectedNode is the analytic node
      const selectedNodeId = this.selectedNode.id.get();
      const entity = await spinalAnalyticNodeManagerService.getEntityFromAnalytic(
        selectedNodeId
      );
      this.entityType = entity.entityType.get();
      this.analyticName = this.selectedNode.name.get();
      const followedEntityNode = await spinalAnalyticNodeManagerService.getFollowedEntity(
        selectedNodeId
      );
      this.followedEntity = followedEntityNode
        ? followedEntityNode.id.get()
        : undefined;

      // need to get all the category names first
      const trackingMethodNodeRef =
        await spinalAnalyticNodeManagerService.getTrackingMethod(selectedNodeId);
      const parseInputs =
        await spinalAnalyticNodeManagerService.getAllCategoriesAndAttributesFromNode(
          trackingMethodNodeRef.id.get()
        );
      for (const inputKey of Object.keys(parseInputs)) {
        this.inputs[inputKey] = {
          trackingMethod: parseInputs[inputKey][CONSTANTS.ATTRIBUTE_TRACKING_METHOD],
          filterValue: parseInputs[inputKey][CONSTANTS.ATTRIBUTE_FILTER_VALUE],
          searchDepth: parseInputs[inputKey][CONSTANTS.ATTRIBUTE_SEARCH_DEPTH],
          strictDepth: parseInputs[inputKey][CONSTANTS.ATTRIBUTE_STRICT_DEPTH],
          searchRelations: parseInputs[inputKey][CONSTANTS.ATTRIBUTE_SEARCH_RELATIONS],
          timeseriesIntervalTime: parseInputs[inputKey][CONSTANTS.ATTRIBUTE_TIMESERIES],
          timeseriesValueAtStart:
            parseInputs[inputKey][CONSTANTS.ATTRIBUTE_TIMESERIES_VALUE_AT_START],
          captureAllModels:
            parseInputs[inputKey][CONSTANTS.ATTRIBUTE_MULTIPLE_MODELS] || false,
        };
      }

      this.inputs = { ...this.inputs };
      //this.input = Object.assign({}, this.inputs);

      console.log(this.inputs);
      const configNode = await spinalAnalyticNodeManagerService.getConfig(selectedNodeId);
      const analyticAttributes =
        await spinalAnalyticNodeManagerService.getAttributesFromNode(
          configNode.id.get(),
          CONSTANTS.CATEGORY_ATTRIBUTE_ANALYTIC_PARAMETERS
        );
      console.log('analyticAttributes :', analyticAttributes);
      this.analyticDescription =
        analyticAttributes[CONSTANTS.ATTRIBUTE_ANALYTIC_DESCRIPTION];
      this.analyticStatus =
        analyticAttributes[CONSTANTS.ATTRIBUTE_ANALYTIC_STATUS] ===
        CONSTANTS.ANALYTIC_STATUS.ACTIVE;
      this.analyticShouldTriggerAtStart =
        analyticAttributes[CONSTANTS.ATTRIBUTE_TRIGGER_AT_START];
      this.analyticShouldCatchUpPastExecutions =
        analyticAttributes[CONSTANTS.ATTRIBUTE_ANALYTIC_PAST_EXECUTIONS];
      this.analyticAggregateExecution =
        analyticAttributes[CONSTANTS.ATTRIBUTE_AGGREGATE_EXECUTION_TIME];
      this.analyticLastExecutionTime=
        analyticAttributes[CONSTANTS.ATTRIBUTE_LAST_EXECUTION_TIME];
      const triggerAttributes =
        await spinalAnalyticNodeManagerService.getAttributesFromNode(
          configNode.id.get(),
          CONSTANTS.CATEGORY_ATTRIBUTE_TRIGGER_PARAMETERS
        );
      for (const triggerKey of Object.keys(triggerAttributes)) {
        let triggerValue = triggerAttributes[triggerKey].split(
          CONSTANTS.ATTRIBUTE_VALUE_SEPARATOR
        );
        this.triggers[triggerKey] = {
          triggerType: triggerValue[0],
          triggerValue: triggerValue[1],
          changeOfValueThreshold: triggerValue[2] ? triggerValue[2] : null,
        };
      }
      this.triggers = { ...this.triggers };

      const algorithmMappingAttributes =
        await spinalAnalyticNodeManagerService.getAttributesFromNode(
          configNode.id.get(),
          CONSTANTS.CATEGORY_ATTRIBUTE_ALGORITHM_INDEX_MAPPING
        );
      for (const algorithmIndexName of Object.keys(
        algorithmMappingAttributes
      )) {
        this.algorithms[algorithmIndexName] = {
          name: algorithmMappingAttributes[algorithmIndexName],
          params: [],
        };
      }
      const algorithmParametersAttributes =
        await spinalAnalyticNodeManagerService.getAttributesFromNode(
          configNode.id.get(),
          CONSTANTS.CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS
        );
      for (const algorithmIndexName of Object.keys(this.algorithms)) {
        let algoName = this.algorithms[algorithmIndexName].name;
        const doc = ALGORITHMS[algoName].requiredParams;
        for (let i = 0; i < doc.length; i++) {
          this.algorithms[algorithmIndexName].params.push(
            algorithmParametersAttributes[
              `${algorithmIndexName}${CONSTANTS.ATTRIBUTE_SEPARATOR}${doc[i].name}`
            ]
          );
        }
      }
      this.algorithms = { ...this.algorithms };

      const resultAttributes =
        await spinalAnalyticNodeManagerService.getAttributesFromNode(
          configNode.id.get(),
          CONSTANTS.CATEGORY_ATTRIBUTE_RESULT_PARAMETERS
        );
      this.resultType = resultAttributes[CONSTANTS.ATTRIBUTE_RESULT_TYPE];
      this.resultName = resultAttributes[CONSTANTS.ATTRIBUTE_RESULT_NAME];

      this.endpointModifyAttrInstead =
        resultAttributes[CONSTANTS.ATTRIBUTE_MODIFY_ATTR_INSTEAD];
      
      this.shouldCreateEndpointIfNotExist =
        resultAttributes[CONSTANTS.ATTRIBUTE_CREATE_ENDPOINT_IF_NOT_EXIST];

      if(this.resultType === CONSTANTS.ANALYTIC_RESULT_TYPE.ATTRIBUTE_CREATE_OR_MOD){
        this.resultCreateAttributeIfNotExist =
          resultAttributes[CONSTANTS.ATTRIBUTE_RESULT_CREATE_ATTRIBUTE_IF_NOT_EXIST];
        this.resultCategoryName =
          resultAttributes[CONSTANTS.ATTRIBUTE_RESULT_CATEGORY_NAME];
      }

      if (
        [CONSTANTS.ANALYTIC_RESULT_TYPE.TICKET, CONSTANTS.ANALYTIC_RESULT_TYPE.ALARM].includes(
          this.resultType
        )
      ) {
        const ticketAttributes =
          await spinalAnalyticNodeManagerService.getAttributesFromNode(
            configNode.id.get(),
            CONSTANTS.CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS
          );
        this.ticketContextId = ticketAttributes[CONSTANTS.ATTRIBUTE_TICKET_CONTEXT_ID];
        this.ticketProcessId = ticketAttributes[CONSTANTS.ATTRIBUTE_TICKET_PROCESS_ID];
        if (this.resultType === CONSTANTS.ANALYTIC_RESULT_TYPE.ALARM) {
          this.alarmPriority = ticketAttributes[CONSTANTS.ATTRIBUTE_ALARM_PRIORITY];
        }
      }
      if ([CONSTANTS.ANALYTIC_RESULT_TYPE.SMS].includes(this.resultType)) {
        const smsAttributes = await spinalAnalyticNodeManagerService.getAttributesFromNode(
          configNode.id.get(),
          CONSTANTS.CATEGORY_ATTRIBUTE_TWILIO_PARAMETERS
        );
        this.phoneNumber = smsAttributes[CONSTANTS.ATTRIBUTE_PHONE_NUMBER];
        this.phoneMessage = smsAttributes[CONSTANTS.ATTRIBUTE_PHONE_MESSAGE];
      }

      if (
        [
        CONSTANTS.ANALYTIC_RESULT_TYPE.GCHAT_MESSAGE,
        CONSTANTS.ANALYTIC_RESULT_TYPE.GCHAT_ORGAN_CARD,
        ].includes(this.resultType)
      ) {
        const gChatAttributes =
          await spinalAnalyticNodeManagerService.getAttributesFromNode(
            configNode.id.get(),
            CONSTANTS.CATEGORY_ATTRIBUTE_GCHAT_PARAMETERS
          );
        this.gChatMessage = gChatAttributes[CONSTANTS.ATTRIBUTE_GCHAT_MESSAGE];
        this.gChatSpaceName = gChatAttributes[CONSTANTS.ATTRIBUTE_GCHAT_SPACE];
      }

      if (this.resultType === CONSTANTS.ANALYTIC_RESULT_TYPE.ENDPOINT) {
        const endpointCreationAttributes =
          await spinalAnalyticNodeManagerService.getAttributesFromNode(
            configNode.id.get(),
            CONSTANTS.CATEGORY_ATTRIBUTE_ENDPOINT_PARAMETERS
          );
        this.endpointCreationUnit =
          endpointCreationAttributes[CONSTANTS.ATTRIBUTE_CREATE_ENDPOINT_UNIT];
        this.endpointCreationMaxDays =
          endpointCreationAttributes[CONSTANTS.ATTRIBUTE_CREATE_ENDPOINT_MAX_DAYS];
      }
      const ioAttributes = await spinalAnalyticNodeManagerService.getAttributesFromNode(
        configNode.id.get(),
        CONSTANTS.CATEGORY_ATTRIBUTE_IO_DEPENDENCIES
      );
      for (const ioDependencyName of Object.keys(ioAttributes)) {
        let ioDependencyValue = ioAttributes[ioDependencyName].split(
          CONSTANTS.ATTRIBUTE_VALUE_SEPARATOR
        );
        this.ioDependencies[ioDependencyName] = ioDependencyValue;
      }
      this.ioDependencies = { ...this.ioDependencies };
    },

    async removed(res) {
      if (res.closeResult) {
        // there must be a better way to get the context id...
        const contextId = Object.keys(this.selectedNode.contextIds.get())[0];
        const followedEntityNodeRef =
          await spinalAnalyticNodeManagerService.getFollowedEntity(
            this.selectedNode.id.get()
          );
        if (
          followedEntityNodeRef &&
          followedEntityNodeRef.id.get() !== this.followedEntity
        ) {
          console.log('change followed entity');
          await spinalAnalyticNodeManagerService.removeLinkToFollowedEntity(
            this.selectedNode.id.get(),
            followedEntityNodeRef.id.get()
          );
          await spinalAnalyticNodeManagerService.addInputLinkToFollowedEntity(
            contextId,
            this.selectedNode.id.get(),
            this.followedEntity
          );
        }
        if (!followedEntityNodeRef) {
          await spinalAnalyticNodeManagerService.addInputLinkToFollowedEntity(
            contextId,
            this.selectedNode.id.get(),
            this.followedEntity
          );
        }
        const trackingMethodAttributes = this.getTrackingMethodAttributes();
        console.log('trackingMethodAttributes :', trackingMethodAttributes);
        const trackingMethodNodeRef =
          await spinalAnalyticNodeManagerService.getTrackingMethod(
            this.selectedNode.id.get()
          );
        const trackingMethodNode = SpinalGraphService.getRealNode(
          trackingMethodNodeRef.id.get()
        );
        await spinalAnalyticNodeManagerService.addAttributesToNode(
          trackingMethodNode,
          trackingMethodAttributes
        );

        const configAttributes = {};
        const analyticAttributes = this.getAnalyticAttributes();
        configAttributes[CONSTANTS.CATEGORY_ATTRIBUTE_ANALYTIC_PARAMETERS] =
          analyticAttributes;

        const resultAttributes = this.getResultAttributes();
        configAttributes[CONSTANTS.CATEGORY_ATTRIBUTE_RESULT_PARAMETERS] =
          resultAttributes;

        const algorithmParametersAttributes =
          this.getAlgorithmParametersAttributes();
        configAttributes[CONSTANTS.CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS] =
          algorithmParametersAttributes;

        const algorithmMappingAttributes = this.getAlgorithmMappingAttributes();
        configAttributes[CONSTANTS.CATEGORY_ATTRIBUTE_ALGORITHM_INDEX_MAPPING] =
          algorithmMappingAttributes;

        if (this.ticketContextId && this.ticketProcessId) {
          const ticketAttributes = this.getTicketAttributes();
          configAttributes[CONSTANTS.CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS] =
            ticketAttributes;
        }

        if (this.resultType == CONSTANTS.ANALYTIC_RESULT_TYPE.SMS) {
          const smsAttributes = this.getSMSAttributes();
          configAttributes[CONSTANTS.CATEGORY_ATTRIBUTE_TWILIO_PARAMETERS] =
            smsAttributes;
        }

        if (
          [
          CONSTANTS.ANALYTIC_RESULT_TYPE.GCHAT_MESSAGE,
          CONSTANTS.ANALYTIC_RESULT_TYPE.GCHAT_ORGAN_CARD,
          ].includes(this.resultType)
        ) {
          const gChatAttributes = this.getGChatAttributes();
          configAttributes[CONSTANTS.CATEGORY_ATTRIBUTE_GCHAT_PARAMETERS] =
            gChatAttributes;
        }

        if (
          this.resultType == CONSTANTS.ANALYTIC_RESULT_TYPE.ENDPOINT &&
          this.shouldCreateEndpointIfNotExist
        ) {
          const endpointCreationAttributes =
            this.getEndpointCreationAttributes();
          configAttributes[CONSTANTS.CATEGORY_ATTRIBUTE_ENDPOINT_PARAMETERS] =
            endpointCreationAttributes;
        }

        const ioAttributes = this.getIOAttributes();
        configAttributes[CONSTANTS.CATEGORY_ATTRIBUTE_IO_DEPENDENCIES] = ioAttributes;

        const triggerAttributes = this.getTriggerAttributes();
        configAttributes[CONSTANTS.CATEGORY_ATTRIBUTE_TRIGGER_PARAMETERS] =
          triggerAttributes;

        await spinalAnalyticNodeManagerService.deleteConfigNode(
          this.selectedNode.id.get()
        );
        console.log('configAttributes :', configAttributes);
        const configInfo = await spinalAnalyticNodeManagerService.addConfig(
          configAttributes,
          this.selectedNode.id.get(),
          contextId
        );

        /*const configNodeRef = await spinalAnalyticNodeManagerService.getConfig(
          this.selectedNode.id.get()
        );
        const configNode = SpinalGraphService.getRealNode(
          configNodeRef.id.get()
        );
        await spinalAnalyticNodeManagerService.addAttributesToNode(
          configNode,
          configAttributes
        );*/
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

    deleteAnalytic() {
      spinalAnalyticNodeManagerService.deleteAnalytic(this.selectedNode.id.get());
      this.closeDialog(false);
    },

    updateLastExecutionTime() {
      this.analyticLastExecutionTime =
      spinalAnalyticExecutionService.updateLastExecutionTime(
          this.selectedNode.id.get()
        );
      this.closeDialog(false);
    },

    addInput() {
      let length = Object.keys(this.inputs).length;
      console.log('adding input');
      this.inputs = {
        ...this.inputs,
        [`I${length}`]: {
          trackingMethod: '',
          filterValue: '',
          searchDepth: 0,
          strictDepth: false,
          searchRelations: '',
          timeseriesIntervalTime: 0,
          timeseriesValueAtStart: false,
          captureAllModels: false,
        },
      };
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
      console.log('deleted input : ', inputName);
    },

    addTrigger() {
      let length = Object.keys(this.triggers).length;
      console.log('adding input');
      this.triggers = {
        ...this.triggers,
        [`T${length}`]: {
          triggerType: '',
          triggerValue: '',
          changeOfValueThreshold: 0,
        },
      };
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
      console.log('deleted trigger : ', triggerName);
    },

    addAlgorithm() {
      let length = Object.keys(this.algorithms).length;
      console.log('adding algorithm');
      this.algorithms = {
        ...this.algorithms,
        [`A${length}`]: { name: '', params: [] },
      };
    },

    removeAlgorithm(algorithmIndexName) {
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
      console.log('deleted algorithm : ', algorithmIndexName);
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

    getTrackingMethodAttributes() {
      const trackingMethodAttributes = {};
      for (const inputKey of Object.keys(this.inputs)) {
        trackingMethodAttributes[inputKey] = [];
        trackingMethodAttributes[inputKey].push({
          name: `${CONSTANTS.ATTRIBUTE_TRACKING_METHOD}`,
          type: 'string',
          value: this.inputs[inputKey].trackingMethod,
        });
        trackingMethodAttributes[inputKey].push({
          name: `${CONSTANTS.ATTRIBUTE_FILTER_VALUE}`,
          type: 'string',
          value: this.inputs[inputKey].filterValue,
        });
        trackingMethodAttributes[inputKey].push({
          name: `${CONSTANTS.ATTRIBUTE_SEARCH_DEPTH}`,
          type: 'number',
          value: this.inputs[inputKey].searchDepth,
        });

        trackingMethodAttributes[inputKey].push({
          name: `${CONSTANTS.ATTRIBUTE_STRICT_DEPTH}`,
          type: 'boolean',
          value: this.inputs[inputKey].strictDepth,
        });

        trackingMethodAttributes[inputKey].push({
          name: `${CONSTANTS.ATTRIBUTE_SEARCH_RELATIONS}`,
          type: 'string',
          value: this.inputs[inputKey].searchRelations,
        });

        if (
          [
            CONSTANTS.TRACK_METHOD.CONTROL_ENDPOINT_NAME_FILTER,
            CONSTANTS.TRACK_METHOD.ENDPOINT_NAME_FILTER,
          ].includes(this.inputs[inputKey].trackingMethod)
        ) {
          trackingMethodAttributes[inputKey].push({
            name: `${CONSTANTS.ATTRIBUTE_TIMESERIES}`,
            type: 'number',
            value: this.inputs[inputKey].timeseriesIntervalTime,
          });
          trackingMethodAttributes[inputKey].push({
            name: `${CONSTANTS.ATTRIBUTE_TIMESERIES_VALUE_AT_START}`,
            type: 'boolean',
            value: this.inputs[inputKey].timeseriesValueAtStart,
          });
          trackingMethodAttributes[inputKey].push({
            name: `${CONSTANTS.ATTRIBUTE_MULTIPLE_MODELS}`,
            type: 'boolean',
            value: this.inputs[inputKey].captureAllModels,
          });
        }
      }
      return trackingMethodAttributes;
    },

    getAnalyticAttributes() {
      const analyticAttributes = [];
      analyticAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_ANALYTIC_DESCRIPTION}`,
        type: 'string',
        value: this.analyticDescription,
      });
      analyticAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_ANALYTIC_STATUS}`,
        type: 'string',
        value: this.analyticStatus
          ? CONSTANTS.ANALYTIC_STATUS.ACTIVE
          : CONSTANTS.ANALYTIC_STATUS.INACTIVE,
      });
      analyticAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_TRIGGER_AT_START}`,
        type: 'boolean',
        value: this.analyticShouldTriggerAtStart,
      });
      analyticAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_AGGREGATE_EXECUTION_TIME}`,
        type: 'string',
        value: this.analyticAggregateExecution,
      });
      analyticAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_LAST_EXECUTION_TIME}`,
        type: 'number',
        value: this.analyticLastExecutionTime,
      });
      return analyticAttributes;
    },

    getResultAttributes() {
      const resultAttributes = [];
      resultAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_RESULT_TYPE}`,
        type: 'string',
        value: this.resultType,
      });
      resultAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_RESULT_NAME}`,
        type: 'string',
        value: this.resultName,
      });
      resultAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_MODIFY_ATTR_INSTEAD}`,
        type: 'string',
        value: this.endpointModifyAttrInstead,
      });

      if( this.resultType === CONSTANTS.ANALYTIC_RESULT_TYPE.ATTRIBUTE_CREATE_OR_MOD){
        resultAttributes.push({
          name: `${CONSTANTS.ATTRIBUTE_RESULT_CATEGORY_NAME}`,
          type: 'string',
          value: this.resultCategoryName,
        });
        resultAttributes.push({
          name: `${CONSTANTS.ATTRIBUTE_RESULT_CREATE_ATTRIBUTE_IF_NOT_EXIST}`,
          type: 'boolean',
          value: this.resultCreateAttributeIfNotExist,
        });
      }

      if (this.resultType === CONSTANTS.ANALYTIC_RESULT_TYPE.ENDPOINT) {
        resultAttributes.push({
          name: `${CONSTANTS.ATTRIBUTE_CREATE_ENDPOINT_IF_NOT_EXIST}`,
          type: 'boolean',
          value: this.shouldCreateEndpointIfNotExist,
        });
      }
      return resultAttributes;
    },

    getAlgorithmParametersAttributes() {
      const algorithmParametersAttributes = [];
      for (const algorithmIndexName of Object.keys(this.algorithms)) {
        let algoName = this.algorithms[algorithmIndexName].name;
        const doc = ALGORITHMS[algoName].requiredParams;
        for (
          let i = 0;
          i < this.algorithms[algorithmIndexName].params.length;
          i++
        ) {
          algorithmParametersAttributes.push({
            name: `${algorithmIndexName}${CONSTANTS.ATTRIBUTE_SEPARATOR}${doc[i].name}`,
            value:
              doc[i].type === 'number'
                ? +this.algorithms[algorithmIndexName].params[i]
                : this.algorithms[algorithmIndexName].params[i],
            type: doc[i].type,
          });
        }
      }
      return algorithmParametersAttributes;
    },

    getAlgorithmMappingAttributes() {
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

    getTicketAttributes() {
      const ticketAttributes = [];
      ticketAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_TICKET_CONTEXT_ID}`,
        type: 'string',
        value: this.ticketContextId,
      });
      ticketAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_TICKET_PROCESS_ID}`,
        type: 'string',
        value: this.ticketProcessId,
      });
      if (this.alarmPriority) {
        ticketAttributes.push({
          name: `${CONSTANTS.ATTRIBUTE_ALARM_PRIORITY}`,
          value: this.alarmPriority,
          type: 'number',
        });
      }
      return ticketAttributes;
    },

    getEndpointCreationAttributes() {
      const endpointCreationAttributes = [];
      endpointCreationAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_CREATE_ENDPOINT_UNIT}`,
        type: 'string',
        value: this.endpointCreationUnit,
      });
      endpointCreationAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_CREATE_ENDPOINT_MAX_DAYS}`,
        type: 'number',
        value: this.endpointCreationMaxDays,
      });
      return endpointCreationAttributes;
    },

    getSMSAttributes() {
      const smsAttributes = [];
      smsAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_PHONE_NUMBER}`,
        type: 'string',
        value: this.phoneNumber,
      });
      smsAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_PHONE_MESSAGE}`,
        type: 'string',
        value: this.phoneMessage,
      });
      return smsAttributes;
    },

    getGChatAttributes() {
      const gChatAttributes = [];
      gChatAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_GCHAT_MESSAGE}`,
        type: 'string',
        value: this.gChatMessage,
      });
      gChatAttributes.push({
        name: `${CONSTANTS.ATTRIBUTE_GCHAT_SPACE}`,
        type: 'string',
        value: this.gChatSpaceName,
      });
      return gChatAttributes;
    },

    getIOAttributes() {
      const ioAttributes = [];
      for (const ioDependencyName of Object.keys(this.ioDependencies)) {
        let str = '';
        for (const ioDependency of this.ioDependencies[ioDependencyName]) {
          str += `${ioDependency}${CONSTANTS.ATTRIBUTE_VALUE_SEPARATOR}`;
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

    getTriggerAttributes() {
      const triggerAttributes = [];
      for (const triggerIndex of Object.keys(this.triggers)) {
        let str = `${this.triggers[triggerIndex].triggerType}${CONSTANTS.ATTRIBUTE_VALUE_SEPARATOR}${this.triggers[triggerIndex].triggerValue}`;
        if (this.triggers[triggerIndex].changeOfValueThreshold !== null) {
          str += `${CONSTANTS.ATTRIBUTE_VALUE_SEPARATOR}${this.triggers[triggerIndex].changeOfValueThreshold}`;
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
  display: flex;
  justify-content: space-between;
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
