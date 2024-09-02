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
          {{ ALGORITHMS[algorithm].description }}</p
        >
      </div>

      <!-- Algorithm Parameters -->
      <div v-if="algorithm != ''">
        <div v-if="ALGORITHMS[algorithm].requiredParams == 'boolean'">
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
        <div v-else-if="ALGORITHMS[algorithm].requiredParams == 'number'">
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
        <div v-else-if="ALGORITHMS[algorithm].requiredParams == 'string'">
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

        <div v-else>
          <md-field
            class="fixed-size-field"
            v-for="(item, index) in ALGORITHMS[algorithm].requiredParams"
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
        <md-field class="fixed-size-field">
          <label> Alarm priority </label>
          <md-input
            type="number"
            @change="update('alarmPriority',localAlarmPriority)"
            v-model="localAlarmPriority"
          ></md-input>
        </md-field>
      </div>

      <div v-if="requirePhoneInformation">
        <md-field class="fixed-size-field">
          <label>Phone number</label>
          <md-input
           @change="update('phoneNumber',localPhoneNumber)"
            v-model="localPhoneNumber"
          ></md-input>
        </md-field>
        <md-field class="fixed-size-field">
          <label>Message</label>
          <md-input
           @change="update('phoneMessage',localPhoneMessage)"
           type="text"
            v-model="localPhoneMessage"
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

      <md-switch @change="update('triggerAtStart',localTriggerAtStart)" v-model="localTriggerAtStart"> Trigger instantly when organs starts </md-switch>

    </md-content>
  </md-step>
</template>

<script>
import {
  CONSTANTS,
  ALGORITHMS
} from 'spinal-model-analysis';

export default {
  props: [
    'STEPPERS_DATA',
    'stepper',
    'inputs',
    'algorithm',
    'algorithmParameters',
    'resultName',
    'resultType',
    'intervalTime',
    'ticketContextId',
    'ticketProcessId',
    'alarmPriority',
    'triggerAtStart',
    'phoneNumber',
    'phoneMessage'
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
      localAlarmPriority: this.alarmPriority,
      localPhoneNumber: this.phoneNumber,
      localPhoneMessage: this.phoneMessage,
      localTriggerAtStart: this.triggerAtStart,
    };
  },
  created(){
    this.CONST_ANALYTIC_RESULT_TYPE = CONSTANTS.ANALYTIC_RESULT_TYPE;
  },
  methods: {
    update(key, value) {
      console.log("update ", key, value)
      if (key == 'algorithm' && this.algorithm != value){
        this.update('algorithmParameters', [])
      }
      this.$emit(`update:${key}`, value);
    },
  },
  computed: {
    algo_names() {
      return Object.values(ALGORITHMS);
    },
    ALGORITHMS() {
      return ALGORITHMS;
    },

    requireTicketLocalization() {
      return (
        [this.CONST_ANALYTIC_RESULT_TYPE.TICKET, this.CONST_ANALYTIC_RESULT_TYPE.ALARM].includes(this.localResultType)
      );
    },

    requireAlarmPriority(){
      return this.localResultType == this.CONST_ANALYTIC_RESULT_TYPE.ALARM
    },

    requirePhoneInformation(){
      return this.localResultType == this.CONST_ANALYTIC_RESULT_TYPE.SMS
    }
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
    alarmPriority() {
      this.localAlarmPriority = this.alarmPriority;
    },
    triggerAtStart() {
      this.localTriggerAtStart = this.triggerAtStart;
    },

  },
};
</script>
