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
        <md-select @md-selected="updateAlgorithm" v-model="localAlgorithm">
          <md-option
            v-for="data of CONST_ALGORITHMS"
            :key="data"
            :value="data"
            >{{ data }}</md-option
          >
        </md-select>
      </md-field>

      <!-- Algorithm Description -->
      <div v-if="algorithm != ''">
        <p>
          <strong> Description : </strong>
          {{ CONST_ALGO_DOC_DESCRIPTION[algorithm] }}</p
        >
      </div>

      <!-- Algorithm Parameters -->
      <div v-if="algorithm != ''">
        <md-field
          class="fixed-size-field"
          v-for="(item, index) in algo_doc"
          :key="index"
        >
          <label>{{ item.name }}, {{ item.description }}</label>
          <md-input
            @change="updateAlgorithmParameters"
            :type="item.type"
            v-model="localAlgorithmParameters[index]"
          ></md-input>
        </md-field>
      </div>

      <md-field class="fixed-size-field">
        <label>Result name</label>
        <md-input
          @change="updateResultName"
          v-model="localResultName"
        ></md-input>
      </md-field>
      <md-field class="fixed-size-field">
        <label>Result type</label>
        <md-select @md-selected="updateResultType" v-model="localResultType">
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
            @change="updateTicketContextId"
            v-model="localTicketContextId"
          ></md-input>
        </md-field>
        <md-field class="fixed-size-field">
          <label>Ticket/Alarm process id </label>
          <md-input
            @change="updateTicketProcessId"
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
          @change="updateIntervalTime"
          type="number"
          v-model="localIntervalTime"
        ></md-input>
      </md-field>
    </md-content>
  </md-step>
</template>

<script>
import {
  ALGORITHMS,
  ANALYTIC_RESULT_TYPE,
  ALGO_DOC,
  ALGO_DOC_DESCRIPTION,
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
    this.CONST_ALGORITHMS = ALGORITHMS;
    this.CONST_ANALYTIC_RESULT_TYPE = ANALYTIC_RESULT_TYPE;
    this.CONST_ALGO_DOC = ALGO_DOC;
    this.CONST_ALGO_DOC_DESCRIPTION = ALGO_DOC_DESCRIPTION;
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
  methods: {
    updateAlgorithm() {
      if (this.localAlgorithm != this.algorithm) {
        this.localAlgorithmParameters = [];
      }
      this.$emit('update:algorithm', this.localAlgorithm);
    },
    updateAlgorithmParameters() {
      this.$emit('update:algorithmParameters', this.localAlgorithmParameters);
    },
    updateIntervalTime() {
      this.$emit('update:intervalTime', this.localIntervalTime);
    },
    updateResultName() {
      this.$emit('update:resultName', this.localResultName);
    },
    updateResultType() {
      this.$emit('update:resultType', this.localResultType);
    },
    updateTicketContextId() {
      this.$emit('update:ticketContextId', this.localTicketContextId);
    },
    updateTicketProcessId() {
      this.$emit('update:ticketProcessId', this.localTicketProcessId);
    },
  },
  computed: {
    algo_doc() {
      return ALGO_DOC[this.localAlgorithm];
    },

    requireTicketLocalization() {
      return (
        this.localResultType == this.CONST_ANALYTIC_RESULT_TYPE.TICKET ||
        this.localResultType == this.CONST_ANALYTIC_RESULT_TYPE.ALARM
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
