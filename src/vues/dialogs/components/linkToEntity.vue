<template>
   <md-dialog
      class="mdDialogContainer"
      :md-active.sync="visible"
    >
      <md-dialog-title class="dialogTitle">Link to Group</md-dialog-title>
      <md-dialog-content class="content">
   

         <div class="section">
            <link-template
               :title="'Contexts'"
               :data="data"
               :itemSelected="contextSelected"
               @select="selectContext"
            ></link-template>
         </div>

         <div class="section">
            <link-template
               :title="'Categories'"
               :data="categories"
               :itemSelected="categorySelected"
               @select="selectCategory"
               :disableBtn="!contextSelected"
            ></link-template>

         </div>

         <div class="section">
            <link-template
               :title="'Groups'"
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
      };
   },

   mounted() {
      this.type = this.entityType + "Context";
      this.getAllData();
   
   },

   methods: {

      closeDialog(closeResult) {
         if(!closeResult) {
            this.$emit("closeSelection", undefined);
         }
         else {
            this.$emit("closeSelection",this.groupSelected)
         }
         
      },
   
      getAllData() {
         attributeService.getAllGroupContext(this.type).then((res) => {
            this.data = res;
            this.updateCategory();
            this.updateGroups();
         });
      },
      
      getGroups() {
         this.groupSelected = undefined;

         if (this.contextSelected && this.categorySelected) {
            let context = this.data.find(
               (el) => el.id === this.contextSelected
            );
            if (context) {
               let category = context.category.find(
                  (el) => el.id == this.categorySelected
               );

               if (category) return category.groups;
            }
         }
         return [];
      },

      disabled() {
         return !(
            this.contextSelected &&
            this.categorySelected &&
            this.groupSelected
         );
      },

      //////////////////////////////////////////////////////////////////
      // Modify
      //////////////////////////////////////////////////////////////////

      updateCategory() {
         // this.categorySelected = undefined;
         this.categories = [];
         if (this.contextSelected) {
            let val = this.data.find((el) => el.id === this.contextSelected);
            if (val) this.categories = val.category;
         }
      },

      updateGroups() {
         // this.groupSelected = undefined;
         this.groups = [];
         if (this.contextSelected && this.categorySelected) {
            let context = this.data.find(
               (el) => el.id === this.contextSelected
            );
            if (context) {
               let category = context.category.find(
                  (el) => el.id == this.categorySelected
               );

               if (category) this.groups = category.groups;
            }
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