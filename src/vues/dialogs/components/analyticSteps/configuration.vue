<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.config"
    md-label="Configuration"
    :md-done.sync="stepper.fourth"
  >
    <md-content class="contents md-scrollbar">
      <md-field class="fixed-size-field">
        <label>Algorithm</label>
        <md-select @md-selected="update('algorithm',localAlgorithm)" v-model="localAlgorithm">
          <md-option
            v-for="data of algo_names"
            :key="data.name"
            :value="data.name"
            >{{ data.name }}</md-option
          >
        </md-select>
      </md-field>

      <!-- Algorithm Description -->
      <div v-if="algorithm != ''">
        <p>
          <strong> Description : </strong>
          {{ algos[algorithm].description }}</p
        >
      </div>

      <!-- Algorithm Parameters -->
      <div v-if="algorithm != ''">
        <md-field
          class="fixed-size-field"
          v-for="(item, index) in algos[algorithm].requiredParams"
          :key="index"
        >
          <label>{{ item.name }}, {{ item.description }}</label>
          <md-input
            @change="update('algorithmParameters',localAlgorithmParameters)"
            :type="item.type"
            v-model="localAlgorithmParameters[index]"
          ></md-input>
        </md-field>
      </div>

      <md-field class="fixed-size-field">
        <label>Result name</label>
        <md-input
          @change="update('resultName',localResultName)"
          v-model="localResultName"
        ></md-input>
      </md-field>
      <md-field class="fixed-size-field">
        <label>Result type</label>
        <md-select @md-selected="update('resultType',localResultType)" v-model="localResultType">
          <md-option
            v-for="data of CONST_ANALYTIC_RESULT_TYPE"
            :key="data"
            :value="data"
            >{{ data }}</md-option
          >
        </md-select>
      </md-field>

      <div v-if="requireTicketLocalization">
        <md-field class="fixed-size-field">
          <label>Ticket/Alarm context id</label>
          <md-input
           @change="update('ticketContextId',localTicketContextId)"
            v-model="localTicketContextId"
          ></md-input>
        </md-field>
        <md-field class="fixed-size-field">
          <label>Ticket/Alarm process id </label>
          <md-input
            @change="update('ticketProcessId',localTicketProcessId)"
            v-model="localTicketProcessId"
          ></md-input>
        </md-field>
      </div>

      <md-field class="fixed-size-field">
        <label
          >Interval time (ms), 0 will make the analytic behave in COV
          mode</label
        >
        <md-input
          @change="update('intervalTime',localIntervalTime)"
          type="number"
          v-model="localIntervalTime"
        ></md-input>
      </md-field>
    </md-content>
  </md-step>
</template>

<script>
import {
  ANALYTIC_RESULT_TYPE,
  algos
} from 'spinal-model-analysis';

export default {
  props: [
    'STEPPERS_DATA',
    'stepper',
    'algorithm',
    'algorithmParameters',
    'resultName',
    'resultType',
    'intervalTime',
    'ticketContextId',
    'ticketProcessId',
  ],
  components: {},
  data() {
    return {
      localAlgorithm: this.algorithm,
      localAlgorithmParameters: this.algorithmParameters,
      localResultName: this.resultName,
      localResultType: this.resultType,
      localIntervalTime: this.intervalTime,
      localTicketContextId: this.ticketContextId,
      localTicketProcessId: this.ticketProcessId,
    };
  },
  created(){
    this.CONST_ANALYTIC_RESULT_TYPE = ANALYTIC_RESULT_TYPE;
  },
  methods: {
    update(key, value) {
      if (key == 'algorithm' && this.algorithm != value){
        this.update('algorithmParameters', [])
      }
      this.$emit(`update:${key}`, value);
    },
  },
  computed: {
    algo_names() {
      return Object.values(algos);
    },
    algos() {
      return algos;
    },

    requireTicketLocalization() {
      return (
        [this.CONST_ANALYTIC_RESULT_TYPE.TICKET, this.CONST_ANALYTIC_RESULT_TYPE.ALARM].includes(this.localResultType)
      );
    },
  },

  watch: {
    algorithm() {
      this.localAlgorithm = this.algorithm;
    },
    algorithmParameters() {
      this.localAlgorithmParameters = this.algorithmParameters;
    },
    resultName() {
      this.localResultName = this.resultName;
    },
    resultType() {
      this.localResultType = this.resultType;
    },
    intervalTime() {
      this.localIntervalTime = this.intervalTime;
    },
    ticketContextId() {
      this.localTicketContextId = this.ticketContextId;
    },
    ticketProcessId() {
      this.localTicketProcessId = this.ticketProcessId;
    },
  },
};
</script>
