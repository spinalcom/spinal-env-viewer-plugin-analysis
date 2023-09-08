<template>
    <md-dialog :md-click-outside-to-close="false" :md-close-on-esc="false" class="mdDialog" :md-active.sync="showSelectionDialog">
      
      <!-- Inputs Table -->
      <md-table v-model="inputListComputed" md-card @md-selected="onSelectInput" :md-selected-value.sync="selectedInputs" class="table">
        <md-table-toolbar>
          <h1 class="md-title table-title">Inputs</h1>
        </md-table-toolbar>
        <md-table-toolbar slot="md-table-alternate-header" slot-scope="{ count }">
          <div class="md-toolbar-section-start">{{ getAlternateLabel(count) }}</div>
          <div class="md-toolbar-section-end">
            <md-button @click="deleteAllInputSelection" class="md-icon-button delete-button">
              <md-icon >delete</md-icon>
            </md-button>
          </div>
        </md-table-toolbar>
      
      
      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="multiple" md-auto-select
      :md-disabled="isResultSelection"
      :class="{ 'disabled-row': isResultSelection}"
      >
        <md-table-cell md-label="Index Name"> {{item.indexName}} </md-table-cell>
        <md-table-cell md-label="Tracking Method"> {{item.trackingMethod}} </md-table-cell>
        <md-table-cell md-label="Filter value"> {{item.filterValue}} </md-table-cell>
        <md-table-cell md-numeric md-label="Timeseries"> {{item.timeseriesIntervalTime}} </md-table-cell>
      </md-table-row>


    </md-table>

    
    <md-table v-model="algorithmListComputed" md-card @md-selected="onSelectAlgorithm" class="table"
    :md-selected-value.sync="selectedAlgorithms">
        <md-table-toolbar>
          <h1 class="md-title table-title">Algorithms</h1>
        </md-table-toolbar>
      <md-table-toolbar slot="md-table-alternate-header" slot-scope="{ count }">
        <div class="md-toolbar-section-start">{{ getAlternateLabel(count) }}</div>

        <div class="md-toolbar-section-end">
          <md-button @click="deleteAllAlgoSelection" class="md-icon-button">
            <md-icon>delete</md-icon>
          </md-button>
        </div>
      </md-table-toolbar>

      <md-table-row slot="md-table-row" slot-scope="{ item }" :md-selectable="isResultSelection? 'single': 'multiple'" md-auto-select 
      :md-disabled="disableSameAlgorithmSelection(item.indexName)"
      :class="{ 'disabled-row': disableSameAlgorithmSelection(item.indexName) }">
        <md-table-cell md-label="Index Name"> {{item.indexName}} </md-table-cell>
        <md-table-cell md-label="Algorithm name"> {{item.name}} </md-table-cell>
        <md-table-cell md-label="Parameters"> {{item.params}} </md-table-cell>
      </md-table-row>
    </md-table>
    <md-dialog-actions class="dialog-actions">
        <md-button class="md-accent action-button" @click="closeDialog">Close</md-button>
        <md-button class="md-primary action-button" @click="sendSelected">Save</md-button>
      </md-dialog-actions>


  </md-dialog>
</template>

<script>
export default {
  props: ['selectedAlgorithm','algorithms', 'inputs','showSelectionDialog'],
  components: {},
  data() {
    return {
      selectedInputs: [],
      selectedAlgorithms : [],

    };
  },
  created() {
  
  },
  methods: {
    deleteAllInputSelection(){
        console.log("deleteAllInputSelection")
        this.selectedInputs = [];
    },
    deleteAllAlgoSelection(){
        this.selectedAlgorithms = [];
    },

    closeDialog(){
        this.selectedAlgorithms = [];
        this.selectedInputs = [];
        this.$emit("closeSelectionDialog");
    },
    sendSelected() 
    {
      this.$emit('sendSelectedInputs', this.selectedInputs.concat(this.selectedAlgorithms));
      this.$emit("closeSelectionDialog");
      this.selectedAlgorithms = [];
      this.selectedInputs = [];
      console.log("sendSelectedEvent :" , this.selectedAlgorithms)
    },
    onSelectInput (items) {
        console.log("onSelectInputEvent :" , items)
        this.selectedInputs = items

    },
    onSelectAlgorithm ( items ) {
        console.log("onSelectAlgorithmEvent :" , items)
        this.selectedAlgorithms = items
    },
    getAlternateLabel (count) {
        let plural = ''

        if (count > 1) {
          plural = 's'
        }
        return `${count} Item${plural} selected`
    },

    flattenObject(obj) {
    const flattened = [];
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const flatItem = {
                indexName: key,
                ...obj[key]
            };
            flattened.push(flatItem);
        }
    }
    return flattened;
    },

    disableSameAlgorithmSelection(indexName){
        return indexName == this.selectedAlgorithm;
    },

    
    
  },
  computed: {
    inputListComputed: {
        get() {
            return this.flattenObject(this.inputs);
        },
        set(newValue) {
            
        }
    },
    algorithmListComputed: {
        get() {
            return this.flattenObject(this.algorithms);
        },
        set(newValue) {
            
        }
    },

    isResultSelection(){
        return  this.selectedAlgorithm == 'R';
    }

  },

  watch: {},
};
</script>

<style  scoped>
.mdDialog {
    z-index: 1000 !important;
    width: 100%;
    height: 100%;
    padding: 20px;
}

.table {
    margin-bottom: 20px;
    border: 1px dashed #ccc;
}

.table md-table-row {
    border-bottom: 1px dashed #ccc;
}

.table-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
}

.delete-button {
    color: #f44336; /* Red color for delete */
}

.selected-label {
    font-weight: 600;
    margin-top: 10px;
}

.selected-content {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 5px;
    margin-top: 5px;
}

.dialog-actions {
    display: flex;
    justify-content: right;
    margin-top: 20px;
}

.action-button {
    padding: 10px 20px;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.action-button:hover {
    background-color: #f5f5f5;
}

.disabled-row {
    background-color: #f0f0f026; /* Light grey background */
    color: #aaa; /* Grey text */
    pointer-events: none; /* Makes the row non-interactive */
}
</style>