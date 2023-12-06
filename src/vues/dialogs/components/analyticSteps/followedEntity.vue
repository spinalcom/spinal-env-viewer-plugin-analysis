<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.followedEntity"
    md-label="Anchor"
    :md-done.sync="stepper.second"
  >
    <md-content class="contents md-scrollbar">
      <div>
        <p> The followed entity (Anchor) is the source that is providing the inputs.</p>
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

        <md-button
        @click="showSelectContextEntityDialog = true"
        > Follow Context </md-button>


      </div>


      <link-to-context
        v-if="entityType"
        :visible="showSelectContextEntityDialog"
        :entityType="entityType"
        @closeSelection="closeSelectContextEntityDialog"
      />

      <link-to-entity
        v-if="entityType && entityType != 'MonitoringServiceOrgan'"
        :visible="showSelectGroupEntityDialog"
        :entityType="
          entityType.includes('Group') ? entityType : entityType + 'Group'
        "
        @closeSelection="closeSelectGroupEntityDialog"
      />

      <link-to-spatial-entity
        v-if="entityType && entityType != 'MonitoringServiceOrgan'"
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
import linkToContextVue from '../linkToContext.vue';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

export default {
  props: ['STEPPERS_DATA', 'stepper', 'entityType', 'followedEntity'],
  components: {
    'link-to-entity': linkToEntityVue,
    'link-to-spatial-entity': linkToSpatialEntityVue,
    'link-to-context': linkToContextVue,
  },
  data() {
    return {
      localFollowedEntity: this.followedEntity,
      showSelectSpatialEntityDialog: false,
      showSelectGroupEntityDialog: false,
      showSelectContextEntityDialog: false,
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
    closeSelectContextEntityDialog(selectedEntity) {
      console.log('selected Entity :', selectedEntity);
      this.$emit('update:followedEntity', selectedEntity);
      this.showSelectContextEntityDialog = false;
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
