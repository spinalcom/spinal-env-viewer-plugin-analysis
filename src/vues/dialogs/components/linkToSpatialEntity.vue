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
      @md-closed="closeDialog(false)"
   >
      <md-dialog-title class="dialogTitle">Link To {{this.entityType}}</md-dialog-title>
      <md-dialog-content class="content">

         <div class="section" >
            <link-template
               :title="'Buildings'"
               :data="data"
               :itemSelected="contextSelected"
               @select="selectContext"
            ></link-template>
         </div>

         <div class="section" v-if="this.entityType != 'geographicBuilding'">
            <link-template
               :title="'Floors'"
               :data="categories"
               :itemSelected="categorySelected"
               @select="selectCategory"
               :disableBtn="!contextSelected"
            ></link-template>

         </div>

         <div class="section" v-if="this.entityType == 'geographicRoom'">
            <link-template
               :title="'Rooms'"
               :data="groups"
               :itemSelected="groupSelected"
               @select="selectGroup"
               :disableBtn="!categorySelected"
            ></link-template>
         </div>
      </md-dialog-content>
      <md-dialog-actions>
         <md-button
            class="md-primary"
            @click="closeDialog(false)"
         >Close</md-button>
         <md-button
            class="md-primary"
            :disabled="disabled()"
            @click="closeDialog(true)"
         >Save</md-button>
      </md-dialog-actions>
   </md-dialog>

</template>

<script>
import attributeService from "../../../services/index";


import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

import linkToGroupTemplate from "./linkerTemplate.vue";

export default {
   name: "dialogComponent",
   components: {
      "link-template": linkToGroupTemplate,
   },
   props: ["visible","entityType"],
   data() {
      return {
         showDialog: true,
         data: [],
         groups: [],
         categories: [],
         contextSelected: undefined,
         categorySelected: undefined,
         groupSelected: undefined,
         items: [],
         type: undefined,
         callback: undefined,
         spatialContextId : undefined,
      };
   },

   mounted() {
      this.type = this.entityType+"Context"; // normalement pas besoin
      this.getAllData();
      this.spatialContextId = SpinalGraphService.getContext("spatial").info.id.get();
   
   },

   methods: {
      opened(option) {

      },

      closeDialog(closeResult) {
         switch(this.entityType) {
            case "geographicBuilding":
               this.$emit("closeSelection",this.contextSelected)
            case "geographicFloor":
               this.$emit("closeSelection",this.categorySelected)
            case "geographicRoom":
               this.$emit("closeSelection",this.groupSelected)
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
         switch(this.entityType) {
            case "geographicBuilding":
               return !this.contextSelected;
            case "geographicFloor":
               return !this.categorySelected;
            case "geographicRoom":
               return !this.groupSelected;
         }
      },

      //////////////////////////////////////////////////////////////////
      // Modify
      //////////////////////////////////////////////////////////////////
      updateCategory() {
         // this.categorySelected = undefined;
         this.categories = [];
         if (this.contextSelected) {
            SpinalGraphService.findInContextByType(this.contextSelected, this.spatialContextId,"geographicFloor").then((res) => {
               this.categories = res;
            });
         }
      },

      updateGroups() {
         // this.groupSelected = undefined;
         this.groups = [];
         if(this.categorySelected) {
            SpinalGraphService.findInContextByType(this.categorySelected, this.spatialContextId,"geographicRoom").then((res) => {
               this.groups = res;
            });
         }
      },

      selectContext(id) {
         this.contextSelected = id;
      },

      selectCategory(id) {
         this.categorySelected = id;
      },

      selectGroup(id) {
         this.groupSelected = id;
      },
   },
   watch: {
      contextSelected() {
         this.categorySelected = undefined;
         this.groupSelected = undefined;

         this.updateCategory();
         this.updateGroups();
      },

      categorySelected() {
         this.groupSelected = undefined;

         this.updateGroups();
      },
   },
};
</script>

<style scoped>
.mdDialogContainer {
   transform: translate(-50%,-50%) scale(1) !important;
   z-index: 1000 !important;
   width: 100%;
   height: 600px;
}

.mdDialogContainer .dialogTitle {
   text-align: center;
}

.mdDialogContainer .content {
   display: flex;
   justify-content: space-between;
   align-items: stretch;
}

.mdDialogContainer .content .section {
   width: 30%;
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