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
          <md-list-item>
            R (Result) : 
            {{ioDependencies['R']}}
            <md-button @click="showSelection('R')">Select dependencies</md-button>

          </md-list-item>
          <md-list-item
            v-for="(algorithmIndexName, index) of Object.keys(algorithms)"
            :key="index">
            {{algorithmIndexName}} : {{ioDependencies[algorithmIndexName]}} <md-button @click="showSelection(algorithmIndexName)">Select dependencies</md-button>

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



export default {
  props: ['STEPPERS_DATA', 'stepper', 'algorithms', 'inputs','ioDependencies'],
  components: {
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

</style>
