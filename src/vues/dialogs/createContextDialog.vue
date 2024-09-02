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
    <md-dialog-title class="mdDialogTitle">Create Analytic context
    </md-dialog-title>

    <md-dialog-content class="mdDialogContainer">

      <md-steppers :md-active-step.sync="stepper.active"
                   @md-changed="changeStep"
                   md-linear
                   class="mySteppers">
        <md-step class="mdStep"
                 :id="STEPPERS_DATA.context"
                 md-label="Context"
                 :md-done.sync="stepper.first">
          <md-content class="contents">
            <md-field>
              <label>Context name</label>
              <md-input v-model="inputValue"
                        ref="nameTextField"></md-input>
            </md-field>
          </md-content>

        </md-step>

        <md-step class="mdStep"
                 :id="STEPPERS_DATA.entities"
                 md-label="Entities"
                 :md-done.sync="stepper.second">

          <sortable-list :items="entities"
                         ref="draggableComponent"
                         @addEntity="addEntity"
                         @delete="deleteItem"
                         @addAllStandardEntities="addAllStandardEntities"></sortable-list>

        </md-step>

      </md-steppers>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Close</md-button>

      <md-button class="md-primary"
                 v-if="stepper.active === this.STEPPERS_DATA.context"
                 :disabled="!(inputValue.trim().length > 0)"
                 @click="PassToSecondStep">Next</md-button>

      <md-button v-if="stepper.active === this.STEPPERS_DATA.entities"
                 :disabled="disabledButton()"
                 class="md-primary"
                 @click="closeDialog(true)">Save</md-button>
    </md-dialog-actions>

  </md-dialog>
</template>

<script>

import { spinalAnalyticNodeManagerService , CONSTANTS } from "spinal-model-analysis";

import SortableList from "./components/sortable-list.vue";

export default {
  name: "createAnalyticContextDialog",
  props: ["onFinised"],
  components: {
    "sortable-list": SortableList,
  },
  data() {  
    this.STEPPERS_DATA = {
      context: "first",
      entities: "second",
    };
    return {
      showDialog: true,
      inputValue: "",
      entities: [], 
      stepper: {
        active: this.STEPPERS_DATA.context,
        first: false,
        second: false,
      },
    };
  },
  methods: {
    opened(option) {
      this.autoFocusNameInput();
    },

    async removed(res) {
      if (res.closeResult){
        const context = await spinalAnalyticNodeManagerService.createContext(res.inputValue.trim());
        for (const entity of res.entities){
          console.log("entity :",entity);
          const newEntity = {
            name : entity.name,
            standard_name: entity.standard_name,
            entityType: entity.entityType,
            description:""
          }
          const entityInfo = await spinalAnalyticNodeManagerService.addEntity(newEntity,context.id.get());
        }
      }
      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        const entities = this.getEntities();
        this.onFinised({
          closeResult,
          inputValue: this.inputValue,
          entities,
        });
      }
    },

    getEntities() {
      if (this.$refs.draggableComponent) {
        const entities = this.$refs.draggableComponent.itemsSorted;
        return entities.map((el, index) => {
          el.order = index;
          return el;
        });
      }
    },

    disabledButton() {
      const contextCondition = this.inputValue.trim().length === 0;
      const stepsCondition = this.entities.length === 0;
      return contextCondition || stepsCondition;
    },

    autoFocusNameInput() {
      setTimeout(() => {
        this.$refs["nameTextField"].$el.focus();
      }, 200);
    },

    changeStep(stepId) {
      if (stepId === this.STEPPERS_DATA.context) {
        this.stepper.active = stepId;
        this.stepper.first = false;
      }
    },

    PassToSecondStep() {
      this.stepper.first = true;
      this.stepper.active = this.STEPPERS_DATA.entities;
    },

    addEntity(res) {
      this.entities = [...this.entities, res];
    },

    deleteItem(order) {
      this.entities = this.entities.filter((el) => el.order !== order);
    },

    addAllStandardEntities(){
      this.entities = [];
      this.entities = [
        {name: "Building", standard_name: "Building", entityType: CONSTANTS.ENTITY_TYPES.BUILDING, description: "",order:0},
        {name: "Floor", standard_name: "Floor", entityType: CONSTANTS.ENTITY_TYPES.FLOOR, description: "",order:1},
        {name: "Room", standard_name: "Room", entityType: CONSTANTS.ENTITY_TYPES.ROOM, description: "",order:2},
        {name: "Equipment", standard_name: "Equipment", entityType: CONSTANTS.ENTITY_TYPES.EQUIPMENT, description: "",order:3},
        {name: "Floor Group", standard_name: "Floor Group", entityType: CONSTANTS.ENTITY_TYPES.FLOOR_GROUP, description: "",order:4},
        {name: "Room Group", standard_name: "Room Group", entityType: CONSTANTS.ENTITY_TYPES.ROOM_GROUP, description: "",order:5},
        {name: "Equipment Group", standard_name: "Equipment Group", entityType: CONSTANTS.ENTITY_TYPES.EQUIPMENT_GROUP, description: "",order:6},
      ]
    }
  },
};
</script>

<style scoped>
/* .dialogForm { 
   display: flex; 
  flex-direction: column; 
 } */

.mdDialog {
  width: 500px;
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
  display: flex;
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