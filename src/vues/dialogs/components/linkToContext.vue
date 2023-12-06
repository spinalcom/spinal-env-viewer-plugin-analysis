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
  <md-dialog class="mdDialogContainer" :md-active.sync="visible">
    <md-dialog-title class="dialogTitle">Link to context</md-dialog-title>
    <md-dialog-content class="content">
      <div class="section">
        <link-template
          :title="'Contexts'"
          :data="data"
          :itemSelected="contextSelected"
          @select="selectContext"
        ></link-template>
      </div>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="closeDialog(false)"
        >Close</md-button
      >
      <md-button
        class="md-primary"
        :disabled="!contextSelected"
        @click="closeDialog(true)"
        >Save</md-button
      >
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import attributeService from '../../../services/index';

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
      contextSelected: undefined,
      items: [],
    };
  },

  mounted() {
    this.getAllData();
  },

  methods: {
    closeDialog(closeResult) {
      if (!closeResult) {
        this.$emit('closeSelection', undefined);
      } else {
        this.$emit('closeSelection', this.contextSelected);
      }
    },

    getAllData() {
      attributeService.getAllContexts().then((res) => {
        this.data = res;
      });
    },

    //////////////////////////////////////////////////////////////////
    // Modify
    //////////////////////////////////////////////////////////////////

    selectContext(id) {
      console.log('select context ', id);
      this.contextSelected = id;
    },
  },
  watch: {
    // buildingSelected() {
    //   this.floorSelected = undefined;
    //   this.roomSelected = undefined;
    //   this.updateCategory();
    //   this.updateGroups();
    // },
    // floorSelected() {
    //   this.roomSelected = undefined;
    //   this.updateGroups();
    // },
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
