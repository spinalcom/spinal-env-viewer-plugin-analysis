<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.resultConfiguration"
    md-label="Result"
    :md-done.sync="stepper.sixth"
  >
    <md-content class="contents md-scrollbar">
      <p>
        The result is the output of the analytic. It can be something that will be  created,
         like a ticket, an alarm, or something
         that must be modified, like a control endpoint.
      </p>
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
      <p>
        For ticket/alarm, result name will be used as part of the ticket/alarm name.
        For control endpoints, result name will be used to find the control endpoint to update.
        In some cases result name is not used at all.
      </p> 

      <div v-if="requireTicketLocalization">
      <md-field class="fixed-size-field">
        <label> Ticket/Alarm context </label>
        <md-select @md-selected="update('ticketContextId',localTicketContextId)" v-model="localTicketContextId">
          <md-option
            v-for="data of alarmContexts"
            :key="data.id"
            :value="data.id"
            >{{ data.name }}</md-option
          >
        </md-select>
      </md-field>
        <md-field class="fixed-size-field">
          <label>Ticket/Alarm process id </label>
           <md-select @md-selected="update('ticketProcessId',localTicketProcessId)" v-model="localTicketProcessId">
            <md-option
              v-for="data of ticketProcesses"
              :key="data.id"
              :value="data.id"
              >{{ data.name }}</md-option
            >
        </md-select>
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
    </md-content>
  </md-step>
</template>

<script>
import {
  ANALYTIC_RESULT_TYPE
} from 'spinal-model-analysis';

import{ spinalServiceTicket } from "spinal-service-ticket";

export default {
  props: [
    'STEPPERS_DATA',
    'stepper',
    'resultName',
    'resultType',
    'ticketContextId',
    'ticketProcessId',
    'alarmPriority',
    'phoneNumber',
    'phoneMessage'
  ],
  components: {},
  data() {
    return {
      localResultName: this.resultName,
      localResultType: this.resultType,
      localIntervalTime: this.intervalTime,
      localTicketContextId: this.ticketContextId,
      localTicketProcessId: this.ticketProcessId,
      localAlarmPriority: this.alarmPriority,
      localPhoneNumber: this.phoneNumber,
      localPhoneMessage: this.phoneMessage,
      ticketProcesses: [],
      
    };
  },
  created(){
    this.CONST_ANALYTIC_RESULT_TYPE = ANALYTIC_RESULT_TYPE;
    this.alarmContexts = spinalServiceTicket.getContexts();


  },
  methods: {
    update(key, value) {
      console.log("update ", key, value)
      this.$emit(`update:${key}`, value);
    },

    async refreshContextProcesses(){
      const processes = await spinalServiceTicket.getAllProcess(this.localTicketContextId);
      for(const process of processes){
        this.ticketProcesses.push({name: process.name.get(), id: process.id.get()});
      }
    },
    




    
  },
  computed: {
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
    resultName() {
      this.localResultName = this.resultName;
    },
    resultType() {
      this.localResultType = this.resultType;
    },
    ticketContextId() {
      this.localTicketContextId = this.ticketContextId;
      this.refreshContextProcesses();
    },
    ticketProcessId() {
      this.localTicketProcessId = this.ticketProcessId;
    },
    alarmPriority() {
      this.localAlarmPriority = this.alarmPriority;
    },

  },
};
</script>
