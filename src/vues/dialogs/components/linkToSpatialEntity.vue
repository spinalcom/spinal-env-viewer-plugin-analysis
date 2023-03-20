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
  <md-dialog
    class="mdDialogContainer"
    :md-active.sync="visible"
  >
    <md-dialog-title class="dialogTitle"
      >Link to {{ this.entityType }}</md-dialog-title
    >
    <md-dialog-content class="content">
      <div class="section">
        <link-template
          :title="'Buildings'"
          :data="data"
          :itemSelected="buildingSelected"
          @select="selectContext"
        ></link-template>
      </div>

      <div class="section" v-if="this.entityType != 'geographicBuilding'">
        <link-template
          :title="'Floors'"
          :data="floors"
          :itemSelected="floorSelected"
          @select="selectCategory"
          :disableBtn="!buildingSelected"
        ></link-template>
      </div>

      <div class="section" v-if="this.entityType == 'geographicRoom'">
        <link-template
          :title="'Rooms'"
          :data="rooms"
          :itemSelected="roomSelected"
          @select="selectGroup"
          :disableBtn="!floorSelected"
        ></link-template>
      </div>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="closeDialog(false)"
        >Close</md-button
      >
      <md-button
        class="md-primary"
        :disabled="disabled()"
        @click="closeDialog(true)"
        >Save</md-button
      >
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import attributeService from '../../../services/index';

import { spinalPanelManagerService } from 'spinal-env-viewer-panel-manager-service';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

import linkToGroupTemplate from './linkerTemplate.vue';

export default {
  name: 'spatialSelectComponent',
  components: {
    'link-template': linkToGroupTemplate,
  },
  props: ['visible', 'entityType'],
  data() {
    return {
      showDialog: true,
      data: [],
      rooms: [],
      floors: [],
      buildingSelected: undefined,
      floorSelected: undefined,
      roomSelected: undefined,
      items: [],
      spatialContextId: undefined,
    };
  },

  mounted() {
    console.log('mounted');
    this.getAllData();
    this.spatialContextId =
      SpinalGraphService.getContext('spatial').info.id.get();
  },

  methods: {
    opened(option) {},

    closeDialog(closeResult) {
      if (!closeResult) {
        this.$emit('closeSelection', undefined);
      } else {
        switch (this.entityType) {
          case 'geographicBuilding':
            this.$emit('closeSelection', this.buildingSelected);
          case 'geographicFloor':
            this.$emit('closeSelection', this.floorSelected);
          case 'geographicRoom':
            this.$emit('closeSelection', this.roomSelected);
        }
      }
    },

    getAllData() {
      attributeService.getAllSpatialBuildings().then((res) => {
        this.data = res;
        //this.updateCategory();
        //this.updateGroups();
      });
    },

    disabled() {
      switch (this.entityType) {
        case 'geographicBuilding':
          return !this.buildingSelected;
        case 'geographicFloor':
          return !this.floorSelected;
        case 'geographicRoom':
          return !this.roomSelected;
      }
    },

    //////////////////////////////////////////////////////////////////
    // Modify
    //////////////////////////////////////////////////////////////////
    updateCategory() {
      // this.floorSelected = undefined;
      this.floors = [];
      if (this.buildingSelected) {
        SpinalGraphService.findInContextByType(
          this.buildingSelected,
          this.spatialContextId,
          'geographicFloor'
        ).then((res) => {
          this.floors = res;
        });
      }
    },

    updateGroups() {
      // this.roomSelected = undefined;
      this.rooms = [];
      if (this.floorSelected) {
        SpinalGraphService.findInContextByType(
          this.floorSelected,
          this.spatialContextId,
          'geographicRoom'
        ).then((res) => {
          this.rooms = res;
        });
      }
    },

    selectContext(id) {
      console.log('select building ', id);
      this.buildingSelected = id;
    },

    selectCategory(id) {
      console.log('select floor ', id);
      this.floorSelected = id;
    },

    selectGroup(id) {
      console.log('select room ', id);
      this.roomSelected = id;
    },
  },
  watch: {
    buildingSelected() {
      this.floorSelected = undefined;
      this.roomSelected = undefined;

      this.updateCategory();
      this.updateGroups();
    },

    floorSelected() {
      this.roomSelected = undefined;

      this.updateGroups();
    },
  },
};
</script>

<style scoped>
.mdDialogContainer {
  transform: translate(-50%, -50%) scale(1) !important;
  z-index: 1000 !important;
  width: 100%;
  height: 600px;
}

.mdDialogContainer .dialogTitle {
  text-align: center;
}

.mdDialogContainer .content {
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
}

.mdDialogContainer .content .section {
  flex: 1;
  border: 1px solid grey;
  border-radius: 4% 4% 0 0;
  padding: 15px;
}

/* .mdIcon {
  display: flex;
  align-items: center;
} */
</style>

<style>
.mdDialogContainer .md-dialog-container {
  max-width: 100%;
  max-height: 100%;
}
</style>
