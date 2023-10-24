<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.inputConfiguration"
    md-label="Inputs"
    :md-done.sync="stepper.third"
  >
    <md-content class="contents md-scrollbar">
      <p>Each tracking method is an input for an algorithm</p>
      <p>
        The <b>search depth</b> is how deep the program should search for the tracked item. If 0, only the infered followed entities of
        the anchor will be considered.
      </p>
      <p>
        If the <b>strict depth</b> is true, the program will only consider the items found at exactly the given depth.
      </p>
      <p>
        The <b>search relations</b> are the relations that the program is allowed to use to find the tracked item.
      </p>
      <p>
        Timeseries interval time is how far in the past should the analytic gather data. Must be positive or null. If
        null (equal 0), only the currentValue will be picked, otherwise, the
        data will be picked from the current time at which the analytic will be
        run to (currentTime - intervalTime). Beware, if the interval time > 0,
        make sure the control-endpoint/ endpoint has timeseries.
      </p>
      <div v-for="([inputName, value]) in Object.entries(localInputs)" :key="inputName" class="trackingMethodBlock">

        <b>Input {{inputName}}</b>
        <md-field class="fixed-size-field">
          <label>Tracking Method</label>
          <md-select v-model="value.trackingMethod">
            <md-option
              v-for="data of TRACK_METHOD"
              :key="data"
              :value="data"
            >{{ data }}</md-option
            >
          </md-select>
        </md-field>
        <md-field class="fixed-size-field"  v-if="value.trackingMethod != ''">
          <label> Search Depth </label>
          <md-input type="number" min="0" v-model="value.searchDepth"></md-input>
        </md-field>
        <md-button
          class="md-primary"
          :disabled="isShowAvailableDataDisabled(value)"
          @click="scanRelations(value)"
        >
          Scan relations
        </md-button>
  
        <md-button
          class="md-primary"
          :disabled="isShowAvailableDataDisabled(value)"
          @click="getPreviewAvailableData(value)"
        >
          Show available data
        </md-button>

        <md-field class="fixed-size-field"  v-if="value.trackingMethod != '' && value.searchDepth>0" >
          <label> 
            Search Relations separated by comma (example: hasBimObject,relation2,... )
          </label>
          <md-input v-model="value.searchRelations"></md-input>
        </md-field>
        

        <md-field class="fixed-size-field"  v-if="value.trackingMethod != ''">
          <label> Filter Value ( Case sensitive )</label>
          <md-input v-model="value.filterValue"></md-input>
        </md-field>

        <md-switch v-if="value.trackingMethod != '' && value.searchDepth >0"
          v-model="value.strictDepth"
        >Data must be found at exactly depth {{value.searchDepth}} : <b> {{value.strictDepth ? 'Yes' : 'No'}} </b> 
        </md-switch>

        

        <md-field class="fixed-size-field"  v-if="showTimeSeriesField(value)">
          <label> Timeseries interval time ( 0 to only take current value )</label>
          <md-input type="number" min="0" v-model="value.timeseriesIntervalTime"></md-input>
        </md-field>
        
        <md-button
          class="md-primary"
          :disabled="isPreviewDisabled(value)"
          @click="getPreviewData(value)"
        >
          Preview input
        </md-button>
        <md-button
          class="md-accent"
          @click="removeInput(inputName)">
          Remove
        </md-button>
        
      </div>

      <md-button
        class="md-primary"
        @click="addInput"
      >
        Add Input
      </md-button>

      <!--     
      <md-button
        class="md-primary"
        :disabled="isGlobalPreviewDisabled"
        @click="getGlobalPreviewData()"
      >
      Preview All inputs
      </md-button> -->
    </md-content>
    <preview-dialog
      :visible="showPreviewDialog"
      :data="prettyData"
      @closeDialog="closePreviewDialog"
    >
    </preview-dialog>
  </md-step>
</template>

<script>
import { TRACK_METHOD, spinalAnalyticService, ATTRIBUTE_VALUE_SEPARATOR,
 getChoiceRelationsWithDepth, getAvailableData } from 'spinal-model-analysis';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import previewDialogVue from '../previewDialog.vue';

export default {
  props: ['STEPPERS_DATA', 'stepper','entityType','followedEntity'
  ,'inputs' ],
  components: {
    'preview-dialog': previewDialogVue,
  },
  data() {
    return {
        localInputs : this.inputs,
        showPreviewDialog:false,
        previewData: '',
        scannedRelations:'',
      
    };
  },
  created() {
    this.TRACK_METHOD = TRACK_METHOD;
  },
  methods: {
    
    addInput() {
      console.log('clicked on button add input');
      this.$emit('addInput');
    },
    removeInput(index){
      this.$emit('removeInput',index);
    },

    async getCapturedInputs(tracking,entity){
      console.log('Calling getCapturedInputs tracking:' ,tracking)
      const capturedInput =
          await spinalAnalyticService.applyTrackingMethodWithParams(
            entity,
            tracking.trackingMethod,
            tracking.filterValue,
            tracking.searchDepth,
            tracking.strictDepth,
            tracking.searchRelations.split(ATTRIBUTE_VALUE_SEPARATOR)
          );
        if (!capturedInput) return "!! Not found !!";
        console.log('capturedInput :', capturedInput);
        if(tracking.trackingMethod === this.TRACK_METHOD.ATTRIBUTE_NAME_FILTER){
          if (Array.isArray(capturedInput)) return capturedInput;
          return capturedInput.label.get();
        }
        if(Array.isArray(capturedInput)) return capturedInput.map(el => el.name.get());
        return capturedInput.name.get();
    },

    async scanRelations(tracking){
      this.showPreviewDialog = true;
      this.previewData = '';
      console.log('Calling scanRelations');
      
      const followedEntityInfo = SpinalGraphService.getInfo(
        this.followedEntity
      );
      const previewData = {};
      const entities  = await spinalAnalyticService.getWorkingFollowedEntitiesWithParam(followedEntityInfo,this.entityType);
      for (const subEntity of entities) {
        let subEntityName = subEntity.name.get();
        subEntityName = subEntityName.replace(/(\r\n|\n|\r)/gm, "");
        const relations = await getChoiceRelationsWithDepth(subEntity.id.get(),tracking.searchDepth);
        previewData[subEntityName] = relations;
      }
      this.previewData = previewData;

    },

    async getPreviewAvailableData(tracking){
      this.showPreviewDialog = true;
      this.previewData = '';
      console.log('Calling getPreviewAvailableData');
      const followedEntityInfo = SpinalGraphService.getInfo(
        this.followedEntity
      );
      const entities  = await spinalAnalyticService.getWorkingFollowedEntitiesWithParam(followedEntityInfo,this.entityType);
      const previewData = {};
      for (const subEntity of entities) {
        let subEntityName = subEntity.name.get();
        subEntityName = subEntityName.replace(/(\r\n|\n|\r)/gm, "");
        const availableData = await getAvailableData(
          tracking.trackingMethod,
          subEntity.id.get(),
          tracking.filterValue,
          tracking.searchDepth,
          tracking.strictDepth,
          tracking.searchRelations.split(ATTRIBUTE_VALUE_SEPARATOR));
        previewData[subEntityName] = availableData;
      }
      this.previewData = previewData;
    },

    async getPreviewData(tracking){
      this.showPreviewDialog = true;
      this.previewData = '';
      console.log('Calling getPreviewData');
      const followedEntityInfo = SpinalGraphService.getInfo(
        this.followedEntity
      );
      const entities  = await spinalAnalyticService.getWorkingFollowedEntitiesWithParam(followedEntityInfo,this.entityType);
      const previewData = {};
      for (const subEntity of entities) {
        let subEntityName = subEntity.name.get();
        subEntityName = subEntityName.replace(/(\r\n|\n|\r)/gm, "");
        const capturedInputs = await this.getCapturedInputs(tracking,subEntity);
        previewData[subEntityName] = capturedInputs;
      }
      
      //this.previewData = JSON.stringify(previewData, null, 2);
      this.previewData = previewData;

    },
    
    /*async getPreviewData2(tracking) {
      this.showPreviewDialog = true;
      this.previewData = '';
      console.log('Calling getPreviewData');

      const followedEntityInfo = SpinalGraphService.getInfo(
        this.followedEntity
      );

      let followedEntityName = followedEntityInfo.name.get();
      followedEntityName = followedEntityName.replace(/(\r\n|\n|\r)/gm, "");

      const previewData = { [followedEntityName]: {} };

      if (this.entityType === followedEntityInfo.type.get()) {
        const capturedInputs = await this.getCapturedInputs(tracking,followedEntityInfo);
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
          const spatialContextId = SpinalGraphService.getContext('spatial').info.id.get();
          subEntities = await SpinalGraphService.findInContextByType(
          this.followedEntity,
          spatialContextId,
          this.entityType
          );
        }

        await this.updatePreviewData(tracking,subEntities, followedEntityName, previewData);
      }

      console.log('previewData :', previewData);
      //this.previewData = JSON.stringify(previewData, null, 2);
      this.previewData = previewData;
    },*/


    closePreviewDialog(){
      this.showPreviewDialog = false;
    },

    isPreviewDisabled(tracking) {
      return (
        !this.followedEntity ||
        tracking.trackingMethod === ''
        || tracking.filterValue === ''
      );
    },
    isShowAvailableDataDisabled(tracking) {
      return (
        !this.followedEntity ||
        tracking.trackingMethod === ''
      );
    },
    showTimeSeriesField(tracking) {
      return  (tracking.trackingMethod === this.TRACK_METHOD.ENDPOINT_NAME_FILTER ||
       tracking.trackingMethod === this.TRACK_METHOD.CONTROL_ENDPOINT_NAME_FILTER);
    },

  },
  computed: {
    isGlobalPreviewDisabled() {
      return (
        true);
    },
    

    followedEntityName() {
      if (!this.followedEntity) return '';
      const info = SpinalGraphService.getInfo(this.followedEntity);
      console.log(info);
      return `${info.name.get()} | Type : ${info.type.get()} | Node id : ${info.id.get()}`;
    },
    prettyData() {
      return JSON.stringify(this.previewData, null, 2);
    },
  },

  watch:{
    inputs(){
      console.log('parent inputs changed')
      this.localInputs = this.inputs;
    }
  }
};
</script>

<style scoped>
.trackingMethodBlock {
  border: 2px dashed #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  width: 90%;
}


</style>

