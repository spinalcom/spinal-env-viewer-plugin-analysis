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
  <v-popover offset="16"
             :auto-hide="false"
             :open="show">

    <md-button class="tooltip-target md-fab md-mini md-primary">
      <md-icon>add</md-icon>
    </md-button>

    <template slot="popover">
      <div class="popoverContainer">
        <div class="_popoverContent">
          <md-field>
            <label>Entity name</label>
            <md-input v-model="name"></md-input>
          </md-field>

          <md-field>
            <label>Entity standard name e.g : Room , Floor etc ...</label>
            <md-input v-model="standard_name"></md-input>
          </md-field>


          <md-field>
            <label>Entity type</label>
            <md-select v-model="entityType">
              <md-option v-for="type in Object.keys(ENTITY_TYPES)"
                         :key="type"
                         :value="type">
                {{type}}
              </md-option>
            </md-select>
          </md-field>

          
        </div>

        <div class="_popoverBtn">
          <md-button class="btn md-dense md-primary"
                     v-close-popover>Close</md-button>

          <md-button class="btn md-dense md-primary"
                     :disabled="disabled()"
                     @click="addEntity"
                     v-close-popover>ADD</md-button>

        </div>
      </div>

    </template>
  </v-popover>
</template>

<script>

import { ENTITY_TYPES } from "spinal-model-analysis";


export default {
  name: "addItemsPopover",
  components: {

  },
  data() {
    return {
      ENTITY_TYPES : ENTITY_TYPES,
      name: "",
      standard_name :"",
      entityType: "",
      show: false,
    };
  },
  methods: {
    OpenAttribute() {
      this.show = !this.show;
    },
    addEntity() {
      this.$emit("addEntity", { name: this.name, standard_name: this.standard_name, entityType:ENTITY_TYPES[this.entityType]});
      this.name = "";
      this.standard_name = "";
      this.entityType = "";
    },
    disabled() {
      return this.name.trim().length === 0;
    },
  },
};
</script>

<style scoped>
.popoverContainer {
  width: 350px;
  height: 300px;
}

.popoverContainer ._popoverContent {
  height: 250px;
}

.popoverContainer ._popoverContent .colorPicker {
  width: 100%;
  height: 100px;
}

.popoverContainer ._popoverBtn {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.popoverContainer ._popoverBtn .btn {
  font-size: 15px;
  margin-right: 10px;
  cursor: pointer;
}
</style>