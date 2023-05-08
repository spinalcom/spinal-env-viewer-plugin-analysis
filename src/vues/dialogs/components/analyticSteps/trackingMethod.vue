<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.trackingMethod"
    md-label="Tracking method"
    :md-done.sync="stepper.third"
  >
    <md-content class="contents md-scrollbar">
      <md-field class="fixed-size-field">
        <label>Tracking Method</label>
        <md-select @md-selected="updateTrackingMethod" v-model="localTrackingMethod">
          <md-option
            v-for="data of CONST_TRACK_METHOD"
            :key="data"
            :value="data"
            >{{ data }}</md-option
          >
        </md-select>
      </md-field>
      <md-field class="fixed-size-field"  v-if="trackingMethod != ''">
        <label>Filter Value ( Case sensitive )</label>
        <md-input @change="updateFilterValue" v-model="localFilterValue"></md-input>
      </md-field>
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
        :disabled="isPreviewDisabled"
        @click="getPreviewData()"
      >
        Preview
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
  props: ['STEPPERS_DATA', 'stepper','entityType','followedEntity',
  'trackingMethod', 'filterValue', 'trackingIntervalTime' ],
  components: {
    'preview-dialog': previewDialogVue,
  },
  data() {
    this.CONST_TRACK_METHOD = TRACK_METHOD;
    return {
        localTrackingMethod: this.trackingMethod,
        localFilterValue: this.filterValue,
        localTrackingIntervalTime: this.trackingIntervalTime,
        showPreviewDialog:false,
        previewData: '',
      
    };
  },
  methods: {
    updateTrackingMethod() {
      this.$emit('update:trackingMethod', this.localTrackingMethod);
    },
    updateFilterValue() {
      this.$emit('update:filterValue', this.localFilterValue);
    },
    updateTrackingIntervalTime() {
      this.$emit('update:trackingIntervalTime', this.localTrackingIntervalTime);
    },
    async getPreviewData() {
      this.showPreviewDialog = true;
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

    closePreviewDialog(){
      this.showPreviewDialog = false;
    },

  },
  computed: {
    isPreviewDisabled() {
      return (
        !this.followedEntity ||
        this.trackingMethod === '' ||
        this.filterValue === ''
      );
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
    trackingMethod(){
      this.localTrackingMethod = this.trackingMethod;
    },
    filterValue(){
      this.localFilterValue = this.filterValue;
    },
    trackingIntervalTime(){
      this.localTrackingIntervalTime = this.trackingIntervalTime;
    }
  }
};
</script>
