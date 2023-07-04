<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.followedEntity"
    md-label="Followed entity"
    :md-done.sync="stepper.second"
  >
    <md-content class="contents md-scrollbar">
      <div>
        <p> The followed entity is the source that is providing the inputs.</p>
        <p>
          For exemple, if the target entity type is Room and the followed entity
          is a room, the analytic will be applied to that specific room.</p
        >
        <p>
          If the target entity type is Room and the followed entity is a group
          of rooms, the analytic will be applied to all the rooms of the
          group.</p
        >
        <p>
          <strong> Currently selected node </strong>:
          {{ !followedEntity ? 'None' : followedEntityName }}
        </p>
        <md-button @click="showSelectGroupEntityDialog = true">
          Follow group entity
        </md-button>

        <md-button
          v-if="showSpatialSelector"
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
</template>

<script>
import linkToEntityVue from '../linkToEntity.vue';
import linkToSpatialEntityVue from '../linkToSpatialEntity.vue';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

export default {
  props: ['STEPPERS_DATA', 'stepper', 'entityType', 'followedEntity'],
  components: {
    'link-to-entity': linkToEntityVue,
    'link-to-spatial-entity': linkToSpatialEntityVue,
  },
  data() {
    return {
      localFollowedEntity: this.followedEntity,
      showSelectSpatialEntityDialog: false,
      showSelectGroupEntityDialog: false,
    };
  },
  methods: {
    closeSelectSpatialEntityDialog(selectedEntity) {
      console.log('selected Entity :', selectedEntity);
      this.$emit('update:followedEntity', selectedEntity);
      this.showSelectSpatialEntityDialog = false;
    },

    closeSelectGroupEntityDialog(selectedGroup) {
      console.log('selected Entity :', selectedGroup);
      this.$emit('update:followedEntity', selectedGroup);
      this.showSelectGroupEntityDialog = false;
    },
  },
  computed: {

    showSpatialSelector(){
      if (!this.entityType) return false;
      return !this.entityType.includes('Group') && this.entityType !== 'BIMObject';
    },

    followedEntityName() {
      if (!this.followedEntity) return '';
      const info = SpinalGraphService.getInfo(this.followedEntity);
      console.log(info);
      return `${info.name.get()} | Type : ${info.type.get()} | Node id : ${info.id.get()}`;
    },
  },
};
</script>
