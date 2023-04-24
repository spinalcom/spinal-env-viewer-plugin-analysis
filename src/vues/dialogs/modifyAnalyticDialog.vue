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
        
        <!-- Followed entity -->
        <md-step
          class="mdStep"
          :id="STEPPERS_DATA.followedEntity"
          md-label="Followed entity"
          :md-done.sync="stepper.first"
        >
          <md-content class="contents md-scrollbar">
            <div>
              <p>
                The followed entity is the source that is providing the
                inputs.</p
              >
              <p>
                For exemple, if the target entity type is Room and the followed
                entity is a room, the analytic will be applied to that specific
                room.</p
              >
              <p>
                If the target entity type is Room and the followed entity is a
                group of rooms, the analytic will be applied to all the rooms of
                the group.</p
              >

              <p>
                <strong> Currently selected node </strong>:
                {{ !followedEntity ? 'None' : followedEntityName }}
              </p>
              <md-button @click="showSelectGroupEntityDialog = true">
                Follow group entity
              </md-button>

              <md-button
                v-if="!isGroupEntitySelected"
                @click="showSelectSpatialEntityDialog = true"
              >
                Follow spatial entity
              </md-button>
            </div>

            <link-to-entity
              v-if="entityType"
              :visible="showSelectGroupEntityDialog"
              :entityType="
                entityType.includes('Group') ? entityType : entityType + 'Group'
              "
              @closeSelection="closeSelectGroupEntityDialog"
            />

            <link-to-spatial-entity
              v-if="entityType"
              :visible="showSelectSpatialEntityDialog"
              :entityType="entityType"
              @closeSelection="closeSelectSpatialEntityDialog"
            />
          </md-content>
        </md-step>

        <!-- Tracking method -->
        <md-step
          class="mdStep"
          :id="STEPPERS_DATA.trackingMethod"
          md-label="Tracking method"
          :md-done.sync="stepper.second"
        >
          <md-content class="">
            <md-field class="fixed-size-field">
              <label>Tracking Method</label>
              <md-select v-model="trackingMethod">
                <md-option
                  v-for="data of CONST_TRACK_METHOD"
                  :key="data"
                  :value="data"
                  >{{ data }}</md-option
                >
              </md-select>
            </md-field>
            <md-field class="fixed-size-field" v-if="trackingMethod != ''">
              <label>Filter Value ( Case sensitive )</label>
              <md-input v-model="filterValue"></md-input>
            </md-field>
            <md-button
              class="md-primary"
              :disabled="isPreviewDisabled"
              @click="getPreviewData()"
            >
              Preview
            </md-button>
          </md-content>
          <md-content class="contents md-scrollbar">
            <div class="json-preview">
              <pre>{{ prettyData }}</pre>
            </div>
          </md-content>
        </md-step>

        <!-- CONFIGURATION -->
        <md-step
          class="mdStep"
          :id="STEPPERS_DATA.config"
          md-label="Configuration"
          :md-done.sync="stepper.third"
        >
          <md-content class="contents md-scrollbar">
            <md-field class="fixed-size-field">
              <label>Algorithm</label>
              <md-select v-model="algorithm">
                <md-option
                  v-for="data of CONST_ALGORITHMS"
                  :key="data"
                  :value="data"
                  >{{ data }}</md-option
                >
              </md-select>
            </md-field>

            <!-- Algorithm Description -->
            <div v-if="algorithm != ''">
              <p>
                <strong> Description : </strong>
                {{ CONST_ALGO_DOC_DESCRIPTION[algorithm] }}</p
              >
            </div>

            <!-- Algorithm Parameters -->
            <div v-if="algorithm != ''">
              <md-field
                class="fixed-size-field"
                v-for="(item, index) in algo_doc"
                :key="index"
              >
                <label>{{ item.name }}, {{ item.description }}</label>
                <md-input
                  :type="item.type"
                  v-model="algorithmParameters[index]"
                ></md-input>
              </md-field>
            </div>

            <md-field class="fixed-size-field">
              <label>Result name</label>
              <md-input v-model="resultName"></md-input>
            </md-field>
            <md-field class="fixed-size-field">
              <label>Result type</label>
              <md-select v-model="resultType">
                <md-option
                  v-for="data of CONST_ANALYTIC_RESULT_TYPE"
                  :key="data"
                  :value="data"
                  >{{ data }}</md-option
                >
              </md-select>
            </md-field>

            <div v-if="resultType == CONST_ANALYTIC_RESULT_TYPE.TICKET">
              <md-field class="fixed-size-field">
                <label>Ticket/Alarm context id</label>
                <md-input v-model="ticketContextId"></md-input>
              </md-field>
              <md-field class="fixed-size-field">
                <label>Ticket/Alarm process id </label>
                <md-input v-model="ticketProcessId"></md-input>
              </md-field>
            </div>

            <md-field class="fixed-size-field">
              <label
                >Interval time (ms), 0 will make the analytic behave in COV
                mode</label
              >
              <md-input type="number" v-model="intervalTime"></md-input>
            </md-field>
          </md-content>
        </md-step>

        <!-- RECAP -->
        <md-step
          class="mdStep"
          :id="STEPPERS_DATA.recap"
          md-label="Summary"
          :md-done.sync="stepper.fourth"
        >
          <md-content class="contents md-scrollbar">
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
  ENTITY_TYPES,
  CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS,
  CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS,
  CATEGORY_ATTRIBUTE_RESULT_PARAMETERS,
  CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS,
  ALGORITHMS,
  ALGO_DOC,
  ALGO_DOC_DESCRIPTION,
  ANALYTIC_RESULT_TYPE,
  TRACK_METHOD,
  findControlEndpoints,
  findEndpoints,
} from 'spinal-model-analysis';

import testDialogVue from './components/testDialog.vue';
import linkToEntityVue from './components/linkToEntity.vue';
import linkToSpatialEntityVue from './components/linkToSpatialEntity.vue';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

export default {
  name: 'modifyAnalyticDialog',
  props: ['onFinised'],
  components: {
    'test-dialog': testDialogVue,
    'link-to-entity': linkToEntityVue,
    'link-to-spatial-entity': linkToSpatialEntityVue,
  },
  data() {
    this.CONST_ALGORITHMS = ALGORITHMS;
    this.CONST_ANALYTIC_RESULT_TYPE = ANALYTIC_RESULT_TYPE;
    this.CONST_TRACK_METHOD = TRACK_METHOD;
    this.CONST_ALGO_DOC = ALGO_DOC;
    this.CONST_ALGO_DOC_DESCRIPTION = ALGO_DOC_DESCRIPTION;
    this.CONST_CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS =
      CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS;
    this.CONST_CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS =
      CATEGORY_ATTRIBUTE_ALGORTHM_PARAMETERS;
    this.CONST_CATEGORY_ATTRIBUTE_RESULT_PARAMETERS =
      CATEGORY_ATTRIBUTE_RESULT_PARAMETERS;
    this.CONST_CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS = 
      CATEGORY_ATTRIBUTE_TRACKING_METHOD_PARAMETERS;
    this.STEPPERS_DATA = {
      followedEntity: 'first',
      trackingMethod: 'second',
      config: 'third',
      recap: 'fourth',
    };
    return {
      showDialog: true,
      showSelectSpatialEntityDialog: false,
      showSelectGroupEntityDialog: false,
      analyticName: '',
      algorithm: '',
      resultType: '',
      resultName: '',
      intervalTime: null,
      algorithmParameters: [],
      trackingMethod: '',
      filterValue: '',
      followedEntity: undefined,
      selectedNode: undefined,
      entityType: undefined,
      previewData: '',
      ticketContextId: '',
      ticketProcessId: '',

      stepper: {
        active: this.STEPPERS_DATA.followedEntity,
        first: false,
        second: false,
        third: false,
        fourth: false,
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
      if (this.resultType === this.CONST_ANALYTIC_RESULT_TYPE.TICKET){
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
            { name: 'filterValue', type: 'string', value: this.filterValue }
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

        console.log('configAttributes :', configAttributes);
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

    closeSelectSpatialEntityDialog(selectedEntity) {
      console.log('selected Entity :', selectedEntity);
      this.followedEntity = selectedEntity;
      this.showSelectSpatialEntityDialog = false;
    },

    closeSelectGroupEntityDialog(selectedGroup) {
      console.log('selected Entity :', selectedGroup);
      this.followedEntity = selectedGroup;
      console.log('this.followedEntity :', this.followedEntity);
      this.showSelectGroupEntityDialog = false;
    },

    disabledButton() {
      return false;
    },

    changeStep(stepId) {
      if (stepId === this.STEPPERS_DATA.analytic) {
        this.stepper.active = stepId;
      }
    },

    PassToNextStep() {
      switch (this.stepper.active) {
        case this.STEPPERS_DATA.followedEntity:
          this.stepper.first = true;
          this.stepper.active = this.STEPPERS_DATA.trackingMethod;
          break;
        case this.STEPPERS_DATA.trackingMethod:
          this.stepper.second = true;
          this.stepper.active = this.STEPPERS_DATA.config;
          break;
        case this.STEPPERS_DATA.config:
          this.stepper.third = true;
          this.stepper.active = this.STEPPERS_DATA.recap;
          break;
        case this.STEPPERS_DATA.recap:
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

    async getPreviewData() {
      const getCapturedInputs = async (entity) => {
        const capturedInputs =
          await spinalAnalyticService.applyTrackingMethodWithParams(
            this.trackingMethod,
            this.filterValue,
            entity
          );
        return capturedInputs.map((input) => input.name.get());
      };

      const processSubEntities = async (
        subEntities,
        parentEntityName,
        previewData
      ) => {
        for (const subEntity of subEntities) {
          const subEntityName = subEntity.name.get();
          const capturedInputs = await getCapturedInputs(subEntity);
          previewData[parentEntityName][subEntityName] = capturedInputs;
        }
      };

      console.log('Calling getPreviewData');

      const followedEntityInfo = SpinalGraphService.getInfo(
        this.followedEntity
      );
      const followedEntityName = followedEntityInfo.name.get();
      const previewData = { [followedEntityName]: {} };

      if (this.entityType === followedEntityInfo.type.get()) {
        const capturedInputs = await getCapturedInputs(followedEntityInfo);
        previewData[followedEntityName] = capturedInputs;
      } else {
        const isGroup = followedEntityInfo.type.get().includes('Group');
        let subEntities;
        if (isGroup) {
          const relationNameToSubEntities = 'groupHas' + this.entityType;
          subEntities = await SpinalGraphService.getChildren(
            followedEntityInfo.id.get(),
            [relationNameToSubEntities]
          );
        } else {
          console.log('Getting sub entities through spatial context');
          const spatialContextId =
            SpinalGraphService.getContext('spatial').info.id.get();
          subEntities = await SpinalGraphService.findInContextByType(
            this.followedEntity,
            spatialContextId,
            this.entityType
          );
        }

        await processSubEntities(subEntities, followedEntityName, previewData);
      }

      console.log('previewData :', previewData);
      //this.previewData = JSON.stringify(previewData, null, 2);
      this.previewData = previewData;
    },
  },

  computed: {
    algo_doc() {
      return ALGO_DOC[this.algorithm];
    },

    isGroupEntitySelected() {
      if (this.selectedNode === undefined) return false;
      return this.entityType ? this.entityType.includes('Group') : false;
    },

    followedEntityName() {
      if (!this.followedEntity) return '';
      const info = SpinalGraphService.getInfo(this.followedEntity);
      console.log(info);
      return `${info.name.get()} | Type : ${info.type.get()} | Node id : ${info.id.get()}`;
    },

    isPreviewDisabled() {
      return (
        !this.followedEntity ||
        this.trackingMethod === '' ||
        this.filterValue === ''
      );
    },

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

    prettyData() {
      return JSON.stringify(this.previewData, null, 2);
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

.mdDialog .mdDialogContainer .mdStep .contents {
  width: 100%;
  height: 100%;
  align-items: center;
  overflow: auto;
}

.mdDialog .mdDialogContainer .mdStep .contents .summary-item {
  padding: 8px 0;
  font-size: 16px;
  line-height: 1.5;
}

.mdDialog .mdDialogContainer .mdStep .contents .summary-item strong {
  margin-right: 8px;
}

.json-preview {
  background-color: #1e1e1e;
  border: 2px solid #3a3a3a;
  border-radius: 8px;
  padding: 20px;
  color: #ffffff;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.json-preview pre {
  margin: 0;
}
</style>

<style>
.mdDialog .mdDialogContainer .mdStep .md-stepper-content.md-active {
  width: 100%;
  height: 100%;
}
</style>
