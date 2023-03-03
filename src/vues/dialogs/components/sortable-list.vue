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
  <md-content class="myContainer md-scrollbar">
    <md-button  class="md-dense md-primary"
                @click="addAllStandardEntities()">
                Add all standard entities
    </md-button>
    <div class="myFabs">
      <addItemsPopover @addEntity="addEntity"></addItemsPopover>
    </div>


    <draggable v-if="itemsSorted.length > 0"
               group="entities"
               @start="drag=true"
               @end="drag=false"
               v-model="itemsSorted">
      <div class="listeItemDraggable"
           v-for="element in itemsSorted"
           :key="element.order">
        <div class="left">
          <div class="name">
            {{element.name}}
          </div>
        </div>

        <div class="right">
          <md-button class="md-icon-button md-dense md-accent"
                     @click="deleteItem(element.order)">
            <md-icon>delete_forever</md-icon>
          </md-button>
        </div>

      </div>
    </draggable>

    <div v-else
         class="empty">
      No entities created
    </div>

    

  </md-content>
</template>

<script>
import draggable from "vuedraggable";
import addItemsPopover from "./addItemsPopover.vue";
export default {
  name: "Sortable-List",
  components: { addItemsPopover, draggable },
  props: {
    items: { default: [] },
  },
  data() {
    return {
      itemsSorted: [],
    };
  },
  mounted() {
    this.itemsSorted = this.items;
  },
  methods: {
    addEntity(res) {
      res["order"] = this.items.length;
      this.$emit("addEntity", res);
    },
    deleteItem(order) {
      this.$emit("delete", order);
    },
    addAllStandardEntities(){
      this.$emit("addAllStandardEntities");
    }
  },
  watch: {
    items() {
      this.itemsSorted = this.items;
    },
  },
};
</script>

<style scoped>
.myContainer {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}

.myContainer .myFabs {
  width: 50px;
  position: absolute;
  top: 0px;
  right: 10px;
}

.myContainer .empty {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.listeItemDraggable {
  width: 100%;
  height: 50px;
  /* background: grey; */
  border: 1px dashed grey;
  color: #ffffff;
  margin-bottom: 5px;
  margin-top: 5px;
  display: flex;
}

.listeItemDraggable .left {
  flex: 1 1 80%;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 1.5em;
}

.listeItemDraggable .right {
  flex: 1 1 20%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.listeItemDraggable .left .name {
  margin-left: 10px;
}

.listeItemDraggable .left .color {
  height: 100%;
  width: 10px;
}
</style>