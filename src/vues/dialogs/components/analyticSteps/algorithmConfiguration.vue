<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.algorithmConfiguration"
    md-label="Algorithms"
    :md-done.sync="stepper.fifth"
  >
    <md-content class="contents md-scrollbar">
        <p>
        An algorithm is a function that the analytic uses to get the work done.
        </p>

      <div v-for="(algorithmIndexName, index) of Object.keys(localAlgorithms)" :key="index" class="block">
        <b>Algorithm {{algorithmIndexName}}</b>
        <md-field class="fixed-size-field">
          <label>Algorithm</label>
          <md-select @md-selected="resetParams(algorithmIndexName)" v-model="algorithms[algorithmIndexName].name">
            <md-option
              v-for="data of algo_names"
              :key="data.name"
              :value="data.name"
            >{{ data.name }}</md-option
            >
          </md-select>
        </md-field>

        <div v-if="algorithms[algorithmIndexName].name != ''">
        <p>
          <strong> Description : </strong>
          {{ algos[algorithms[algorithmIndexName].name].description }}</p
        >
        </div>

      <!-- 
      <div v-if="algorithm != ''">
        <div v-if="algos[algorithm].requiredParams == 'boolean'">
          <div
          class="fixed-size-field"
          v-for="(item, index) of inputs"
          :key="index"
        >
          <label> {{ index }} </label>
          <md-radio value="false">
            False
          </md-radio>
          <md-radio value="true">
            True
          </md-radio>
        </div>
        </div>
        <div v-else-if="algos[algorithm].requiredParams == 'number'">
          <md-field
            class="fixed-size-field"
            v-for="(item, index) of inputs"
            :key="index"
          >
            <label> {{ index }} </label>
            <md-input
              @change="update('algorithmParameters',localAlgorithmParameters)"
              type="number"
              v-model="localAlgorithmParameters[index]"
            ></md-input>
          </md-field>
        </div>
        <div v-else-if="algos[algorithm].requiredParams == 'string'">
          <md-field
            class="fixed-size-field"
            v-for="(item, index) of inputs"
            :key="index"
          >
            <label> {{ index }} </label>
            <md-input
              @change="update('algorithmParameters',localAlgorithmParameters)"
              v-model="localAlgorithmParameters[index]"
            ></md-input>
          </md-field>
        </div>
        -->

        <div v-if="algorithms[algorithmIndexName].name != ''">
          <md-field
            class="fixed-size-field"
            v-for="(item, index) in algos[algorithms[algorithmIndexName].name].requiredParams"
            :key="index"
          >
            <label>{{ item.name }}, {{ item.description }}</label>
            <md-input
              :type="item.type"
              v-model="algorithms[algorithmIndexName].params[index]"
            ></md-input>
          </md-field>
        </div>

        <md-button
          class="md-accent"
          @click="removeAlgorithm(algorithmIndexName)">
          Remove
        </md-button>
        
      </div>

      <md-button
        class="md-primary"
        @click="addAlgorithm"
      >
        Add Algorithm
      </md-button> 

    </md-content>
  </md-step>
</template>

<script>
import { algos} from 'spinal-model-analysis';

export default {
  props: ['STEPPERS_DATA', 'stepper','entityType','followedEntity'
  ,'inputs', 'algorithms','algorithms_parameters' ],
  components: {
  },
  data() {
    return {
        localAlgorithms: this.algorithms,      
    };
  },
  created() {
    this.algos = algos;
  },
  methods: {
    addAlgorithm() {
      console.log('clicked on button add Algorithm');
      this.$emit('addAlgorithm');
    },
    removeAlgorithm(algoIndexName){
      this.$emit('removeAlgorithm',algoIndexName);
    },
    resetParams(algoIndexName){
      this.algorithms[algoIndexName].params = [];
    }
    
  },
  computed: {
    algo_names() {
      return Object.values(algos);
    },
  },

  watch:{
    algorithms(){
      console.log('parent algorithms changed')
      this.localAlgorithms = this.algorithms;
    }
  }
};
</script>

<style scoped>
.block {
  border: 2px dashed #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  width: 90%;
}


</style>

