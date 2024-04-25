<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.IODependencies"
    md-label="IO"
    :md-done.sync="stepper.seventh"
  >
    <md-content class="contents md-scrollbar">
      <div v-if="Object.keys(algorithms).length==0">
        <p>
          <b>Warning</b>
          An analytic must have a minimum of 1 algorithm. Please add an
          algorithm first
        </p>
      </div>
      <div v-else>
        <p>
          Dependencies :
        </p>

        <md-list>
          <md-list-item class="pretty-list-item">
            R (Result) : 
              <div class="draggable-item">
                Final Result : {{ ioDependencies['R'][0] }}
              </div>
          
            <md-button @click="showSelection('R')">Select dependencies</md-button>

          </md-list-item>
          <md-list-item
            v-for="(algorithmIndexName, index) of Object.keys(algorithms)"
            :key="index" class="pretty-list-item">
            {{algorithmIndexName}} : 
          
        <draggable v-model="ioDependencies[algorithmIndexName]" @end="updateDependenciesOrder(algorithmIndexName)">
          <div v-for="(dep,indexDep) in ioDependencies[algorithmIndexName]" :key="dep" class="draggable-item">
            Input {{ indexDep+1 }} : {{ dep }}
          </div>
        </draggable>
            <md-button @click="showSelection(algorithmIndexName)">Select dependencies</md-button>

          </md-list-item>
        </md-list>
      </div>
      <input-selection-table
        :algorithms="algorithms"
        :inputs="inputs"
        :ioDependencies="ioDependencies"
        :showSelectionDialog="showSelectionDialog"
        :selectedAlgorithm="selectedAlgorithm"
        @closeSelectionDialog="closeSelectionDialog"
        @sendSelectedInputs="saveSelectedDependencies"
        >
      </input-selection-table>
    </md-content>
  </md-step>
</template>

<script>
import inputSelectionTableVue from './inputSelectionTable.vue';
import draggable from "vuedraggable";
import { spinalAnalyticService } from 'spinal-model-analysis'



export default {
  props: ['STEPPERS_DATA', 'stepper', 'algorithms', 'inputs','ioDependencies'],
  components: {
    draggable,
    'input-selection-table': inputSelectionTableVue,
  },
  data() {
    return {
      showSelectionDialog: false,
      selectedAlgorithm : '',
    };
  },
  created() {},
  methods: {
    updateDependenciesOrder(algorithmIndexName) {
      console.log("Updated order for:", algorithmIndexName);
      console.log(this.ioDependencies[algorithmIndexName]);
    },

    showSelection(indexName) {
      this.selectedAlgorithm = indexName;
      this.showSelectionDialog = true;
      
    },
    closeSelectionDialog(){
        this.showSelectionDialog = false;
    },

    saveSelectedDependencies(selectedItems) {
      console.log("saving selected dependencies : ", selectedItems)
      console.log(" to ", this.selectedAlgorithm)

      let indexNames = selectedItems.map(item => item.indexName);
      this.ioDependencies[this.selectedAlgorithm]=indexNames;

      console.log("ioDependencies : ", this.ioDependencies)
    },

    
  },
  computed: {},

  watch: {},
};
</script>

<style scoped>
.draggable-item {
  display: inline-block;
  margin: 0 5px;
  padding: 5px 10px;
  border-radius: 4px;
  background-color: #484848;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.draggable-item:hover {
  background-color: #232323;
  cursor: grab;
}

.draggable-item:active {
  background-color: #572727;
  cursor: grabbing;
}


.pretty-list-item {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    border-bottom: 1px solid #ccc !important;
    padding-bottom: 10px !important;
    margin-bottom: 10px !important; 
}

md-button {
  margin-left: 20px;
}
</style>
