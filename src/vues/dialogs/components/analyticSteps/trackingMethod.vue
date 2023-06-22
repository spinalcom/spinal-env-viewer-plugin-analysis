<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.trackingMethod"
    md-label="Tracking method"
    :md-done.sync="stepper.third"
  >
    <md-content class="contents md-scrollbar">
      <p>Each tracking method is an input for the algorithm</p>
      <div v-for="(tracking, index) in localTrackingMethods" :key="index" class="trackingMethodBlock">
      <b>Tracking Method {{index+1}}</b>
      <md-field class="fixed-size-field">
        <label>Tracking Method</label>
        <md-select v-model="tracking.trackingMethod">
          <md-option
            v-for="data of CONST_TRACK_METHOD"
            :key="data"
            :value="data"
          >{{ data }}</md-option
          >
        </md-select>
      </md-field>
      <md-button
        class="md-primary"
        :disabled="isShowAvailableDataDisabled(tracking)"
        @click="getPreviewData(tracking)"
      >
        Show available data
      </md-button>
      <md-field class="fixed-size-field"  v-if="tracking.trackingMethod != ''">
        <label>Filter Value ( Case sensitive )</label>
        <md-input v-model="tracking.filterValue"></md-input>
      </md-field>

      <md-switch v-model="tracking.removeFromAnalysis"> Algorithm should ignore this input </md-switch>
      <md-switch v-model="tracking.removeFromBinding"> Binding process should ignore this input </md-switch>



      <md-button
        class="md-primary"
        :disabled="isPreviewDisabled(tracking)"
        @click="getPreviewData(tracking)"
      >
        Preview input
      </md-button>
      <md-button
        class="md-accent"
        @click="removeTrackingMethod(index)">
        Remove
      </md-button>

    </div>

    <md-button
      class="md-primary"
      @click="addTrackingMethod"
    >
      Add Tracking Method
    </md-button>

    

      <md-field class="fixed-size-field">
        <label> Timeseries interval time (ms) </label>
        <md-input type="number" @change="updateTrackingIntervalTime" v-model="localTrackingIntervalTime"></md-input>
      </md-field>
      <p>
        Interval time from which to gather data. Must be positive or null. If
        null (equal 0), only the currentValue will be picked, otherwise, the
        data will be picked from the current time at which the analytic will be
        run to (currentTime - intervalTime). Beware, if the interval time > 0,
        make sure the control-endpoint/ endpoint has timeseries.
      </p>
      <md-button
        class="md-primary"
        :disabled="isGlobalPreviewDisabled"
        @click="getGlobalPreviewData()"
      >
        Preview All inputs
      </md-button>
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
import { TRACK_METHOD, spinalAnalyticService } from 'spinal-model-analysis';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import previewDialogVue from '../previewDialog.vue';

export default {
  props: ['STEPPERS_DATA', 'stepper','entityType','followedEntity'
  ,'trackingMethods', 'trackingIntervalTime' ],
  components: {
    'preview-dialog': previewDialogVue,
  },
  data() {
    this.CONST_TRACK_METHOD = TRACK_METHOD;
    return {
        localTrackingMethods : this.trackingMethods,
        localTrackingIntervalTime: this.trackingIntervalTime,
        showPreviewDialog:false,
        previewData: '',
      
    };
  },
  methods: {
    updateTrackingIntervalTime() {
      this.$emit('update:trackingIntervalTime', this.localTrackingIntervalTime);
    },
    updateTrackingMethods() {
      this.$emit('update:trackingMethods', this.localTrackingMethods);
    },
    addTrackingMethod() {
      this.$emit('addTrackingMethod');
    },
    removeTrackingMethod(index){
      this.$emit('removeTrackingMethod',index);
    },

    async getCapturedInputs(tracking,entity){
      const capturedInput =
          await spinalAnalyticService.applyTrackingMethodWithParams(
            tracking.trackingMethod,
            tracking.filterValue,
            entity
          );
        if (!capturedInput) return "!! Not found !!";
        if(Array.isArray(capturedInput)) return capturedInput.map(el => el.name.get());
        return capturedInput.name.get();
    },

    async updatePreviewData(tracking,subEntities,parentEntityName,previewData){
          for (const subEntity of subEntities) {
          let subEntityName = subEntity.name.get();
          subEntityName = subEntityName.replace(/(\r\n|\n|\r)/gm, "");
          const capturedInputs = await this.getCapturedInputs(tracking,subEntity);
          previewData[parentEntityName][subEntityName] = capturedInputs;
        }
        },
    async getPreviewData(tracking) {
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
          const spatialContextId =
            SpinalGraphService.getContext('spatial').info.id.get();
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
    },


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

    filterValue(){
      this.localFilterValue = this.filterValue;
    },
    trackingIntervalTime(){
      this.localTrackingIntervalTime = this.trackingIntervalTime;
    },
    trackingMethods(){
      this.localTrackingMethods = this.trackingMethods;
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

