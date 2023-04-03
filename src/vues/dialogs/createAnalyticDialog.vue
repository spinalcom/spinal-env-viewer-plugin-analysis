<template>
  <md-dialog
    :md-active.sync="showDialog"
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
        <!-- Analytic name -->
        <md-step
          class="mdStep"
          :id="STEPPERS_DATA.analytic"
          md-label="Analytic"
          :md-done.sync="stepper.first"
        >
          <md-content class="contents">
            <md-field class="fixed-size-field">
              <label>Analytic name</label>
              <md-input v-model="analyticName"></md-input>
            </md-field>
          </md-content>
        </md-step>

        <!-- Followed entity -->
        <md-step
          class="mdStep"
          :id="STEPPERS_DATA.followedEntity"
          md-label="Followed entity"
          :md-done.sync="stepper.second"
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
          :md-done.sync="stepper.third"
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
          :md-done.sync="stepper.fourth"
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
          :md-done.sync="stepper.fifth"
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
  name: 'createAnalyticDialog',
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
    this.CONST_CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS = CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS
    this.STEPPERS_DATA = {
      analytic: 'first',
      followedEntity: 'second',
      trackingMethod: 'third',
      config: 'fourth',
      recap: 'fifth',
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
      ticketContextId:'',
      ticketProcessId:'',

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
        const ITrackingMethod = {
          name: 'TrackingMethod',
          trackMethod: this.trackingMethod,
          filterValue: this.filterValue,
        };

        const trackingMethodInfo =
          await spinalAnalyticService.addInputTrackingMethod(
            ITrackingMethod,
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
        const IConfig = {
          algorithm: this.algorithm,
          resultType: this.resultType,
          resultName: this.resultName,
          intervalTime: this.intervalTime,
        };

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

        const configInfo = await spinalAnalyticService.addConfig(
          IConfig,
          formattedAlgorithmParams,
          analyticInfo.id.get(),
          contextId
        );

        if(this.ticketContextId && this.ticketProcessId){
          const formattedTicketAttributes = [];
          formattedTicketAttributes.push({
            name: "ticketContextId",
            value: this.ticketContextId,
            type: 'string',
          });
          formattedTicketAttributes.push({
            name: "ticketProcessId",
            value: this.ticketProcessId,
            type: 'string',
          });

          await spinalAnalyticService.addAttributesToConfig(configInfo.id.get(),this.CONST_CATEGORY_ATTRIBUTE_TICKET_LOCALIZATION_PARAMETERS,
          formattedTicketAttributes);
        }
        
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
      return this.entityType.includes('Group');
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
