<!--
Copyright 2020 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <md-dialog :md-active.sync="showDialog"
             @md-closed="closeDialog(false)"
             class="mdDialog">
    <md-dialog-title class="mdDialogTitle">Create Analytic
    </md-dialog-title>

    <md-dialog-content class="mdDialogContainer">

      <md-steppers :md-active-step.sync="stepper.active"
                   @md-changed="changeStep"
                   md-linear>

        <md-step class="mdStep"
                 :id="STEPPERS_DATA.analytic"
                 md-label="Analytic"
                 :md-done.sync="stepper.first">
          <md-content class="contents">
            <md-field>
              <label>Analytic name</label>
              <md-input v-model="analyticName"></md-input>
            </md-field>
          </md-content>

        </md-step>

        <!-- INPUTS -->
        <md-step class="mdStep"
                 :id="STEPPERS_DATA.inputs"
                 md-label="Inputs"
                 :md-done.sync="stepper.second">
          <md-content class="contents md-scrollbar">

            <md-field>
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
            <md-field v-if="trackingMethod!=''">
              <label>Filter Value</label>
              <md-input v-model="filterValue"></md-input>
            </md-field>

            <div>
              <md-button v-if="isGroupEntitySelected" @click="showSelectGroupEntityDialog = true">
                Follow entity
                <md-icon v-if="followedEntity==''">add</md-icon>
                <md-icon v-else>done</md-icon>
              </md-button>
              <md-button v-else @click="showSelectSpatialEntityDialog = true">
                Follow entity
                <md-icon v-if="followedEntity==''">add</md-icon>
                <md-icon v-else>done</md-icon>
              </md-button>
            
            </div>
            
            <link-to-entity v-if="this.entityType && this.entityType.includes('Group')"
                            :visible="showSelectGroupEntityDialog" 
                            :entityType="entityType"
                            @closeSelection="closeSelectGroupEntityDialog"
                            />

            <link-to-spatial-entity v-else
                            :visible="showSelectSpatialEntityDialog" 
                            :entityType="entityType"
                            @closeSelection="closeSelectSpatialEntityDialog"
                            />
          </md-content>

        </md-step>

        <!-- CONFIG -->
        <md-step class="mdStep"
                 :id="STEPPERS_DATA.config"
                 md-label="Config"
                 :md-done.sync="stepper.third">
          <md-content class="contents md-scrollbar">
            <md-field>
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

            <!-- Algorithm Parameters -->
            <div v-if="algorithm != ''">
              <md-field 
                      v-for="(item, index) in algo_doc" :key="index">
              <label>{{item.name}}, {{item.description}}</label>
              <md-input :type="item.type" v-model="algorithmParameters[index]"></md-input>
              </md-field>
            </div>
            
            <md-field>
                <label>Result name</label>
                <md-input v-model="resultName"></md-input>
            </md-field>
            <md-field>
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
            <md-field>
                <label>Interval time (ms), 0 will make the analytic behave in COV mode</label>
                <md-input type="number" v-model="intervalTime"></md-input>
            </md-field>

          </md-content>
        </md-step>

        <!-- RECAP -->
        <md-step class="mdStep"
                 :id="STEPPERS_DATA.recap"
                 md-label="Recap"
                 :md-done.sync="stepper.fourth">


        </md-step>

      </md-steppers>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Close</md-button>

      <md-button class="md-primary"
                 v-if="stepper.active !== this.STEPPERS_DATA.recap"
                 @click="PassToNextStep">Next
      </md-button>
      <md-button v-if="stepper.active === this.STEPPERS_DATA.recap"
                 :disabled="isSaveButtonDisabled()"
                 class="md-primary"
                 @click="closeDialog(true)">Save</md-button>
    </md-dialog-actions>

  </md-dialog>
</template>

<script>

import { spinalAnalyticService , ENTITY_TYPES ,
          ALGORITHMS, ALGO_DOC, ANALYTIC_RESULT_TYPE, TRACK_METHOD} from "spinal-model-analysis";

import testDialogVue from './components/testDialog.vue';
import linkToEntityVue from './components/linkToEntity.vue';
import linkToSpatialEntityVue from './components/linkToSpatialEntity.vue';

export default {
  name: "createAnalyticDialog",
  props: ["onFinised"],
  components: {
    "test-dialog": testDialogVue,
    "link-to-entity": linkToEntityVue,
    "link-to-spatial-entity": linkToSpatialEntityVue
  },
  data() {  
    this.CONST_ALGORITHMS = ALGORITHMS;
    this.CONST_ANALYTIC_RESULT_TYPE = ANALYTIC_RESULT_TYPE;
    this.CONST_TRACK_METHOD = TRACK_METHOD;
    this.CONST_ALGO_DOC = ALGO_DOC;
    

    this.STEPPERS_DATA = {
      analytic: "first",
      inputs: "second",
      config: "third",
      recap: "fourth"
    };
    return {  
      showDialog: true,
      showSelectSpatialEntityDialog: false,
      showSelectGroupEntityDialog:false,
      analyticName: "",
      algorithm:"",
      resultType:"",
      resultName:"",
      intervalTime: null,
      algorithmParameters:[],
      trackingMethod :"",
      filterValue :"",
      followedEntity :"",
      selectedNode : undefined,
      entityType : undefined,

      stepper: {
        active: this.STEPPERS_DATA.analytic,
        first: false,
        second: false,
        third: false,
        fourth: false,
      },
    };
  },
  methods: {
    opened(option) {
      this.selectedNode = option.selectedNode;
      this.entityType= this.selectedNode.entityType.get();
    },

    async removed(res) {
      if (res.closeResult){
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
        const contextId = Object.keys(this.selectedNode.contextIds.get())[0]

        //create analytic Node
        const IAnalytic = {
            name: this.analyticName,
            description :""
        };
        const analyticInfo = await spinalAnalyticService.addAnalytic(IAnalytic,contextId,this.selectedNode.id.get());
        
        
        //create trackingMethod Node
        const ITrackingMethod = {
            name: "TrackingMethod",
            trackMethod: this.trackingMethod,
            filterValue: this.filterValue
        }

        const trackingMethodInfo = await spinalAnalyticService.addInputTrackingMethod(ITrackingMethod,contextId,analyticInfo.id.get());
        
        //create followedEntity Node
        const followedEntityInfo = await spinalAnalyticService.addInputLinkToFollowedEntity(contextId,
        analyticInfo.id.get(),this.followedEntity);


        //create config Node
        const IConfig  = {
            algorithm: this.algorithm,
            resultType: this.resultType,
            resultName:this.resultName,
            intervalTime: this.intervalTime,

        };

        const formattedAlgorithmParams = [];
        const doc = this.CONST_ALGO_DOC[this.algorithm];
        for (let i = 0; i < this.algorithmParameters.length; i++) {
          const paramValue = this.algorithmParameters[i];
          formattedAlgorithmParams.push({
            name: doc[i].name,
            value: doc[i].type ==="number" ? +paramValue : paramValue,
            type : doc[i].type
          });
        }
        
        const configInfo = await spinalAnalyticService.addConfig(IConfig,formattedAlgorithmParams,analyticInfo.id.get(),contextId);

      }
      
      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        this.onFinised({
          closeResult,
          analyticName: this.analyticName
        });
      }
    },

    closeSelectSpatialEntityDialog (selectedEntity) {
      this.followedEntity = selectedEntity;
      this.showSelectSpatialEntityDialog = false;
    },

    closeSelectGroupEntityDialog(selectedGroup){
      console.log("selected Entity :", selectedGroup);
      this.followedEntity = selectedGroup;
      this.showSelectGroupEntityDialog = false;
    },

    disabledButton() {
      return false;
    },

    changeStep(stepId) {
      if (stepId === this.STEPPERS_DATA.analytic) {
        this.stepper.active = stepId;
        this.stepper.first = false;
      }
    },

    PassToNextStep() {
      switch(this.stepper.active) {
        case this.STEPPERS_DATA.analytic:
          this.stepper.first = true;
          this.stepper.active = this.STEPPERS_DATA.inputs;
          break;
        case this.STEPPERS_DATA.inputs:
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

    isSaveButtonDisabled(){
      if (this.analyticName === "" || this.algorithm === "" ||
           this.resultType === "" || this.resultName === "" || this.intervalTime === null || this.trackingMethod === "" || this.filterValue === "" || this.followedEntity === ""){
        return true;
      }
      return false;
    }
  },
  computed : {
    algo_doc () {
      return ALGO_DOC[this.algorithm];
    },
    isGroupEntitySelected(){
      if (this.selectedNode === undefined) return false;
      return this.selectedNode.entityType.get().includes("Group");
    },

    


  }
};
</script>

<style scoped>
/* .dialogForm { 
   display: flex; 
  flex-direction: column; 
 } */

.mdDialog {
  width: 800px;
  height: 550px;
}

.mdDialog .mdDialogTitle {
  text-align: center;
}

.mdDialog .mdDialogContainer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mdDialog .mdDialogContainer .mdStep {
  height: 350px;
  overflow: hidden;
  padding: 10px 0px;
}

.mdDialog .mdDialogContainer .mdStep .contents {
  width: 100%;
  height: 100%;
  align-items: center;
  overflow: auto;
}




/* .mdDialog .mdDialogContainer .contents.contextName {
  display: flex;
  align-items: center;
}

.mdDialog .mdDialogContainer .actions {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: flex-end;
} */
</style>

<style>
.mdDialog .mdDialogContainer .mdStep .md-stepper-content.md-active {
  width: 100%;
  height: 100%;
}
</style>