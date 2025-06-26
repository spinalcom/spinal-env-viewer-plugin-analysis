<template>
  <md-step
    class="mdStep"
    :id="STEPPERS_DATA.resultConfiguration"
    md-label="Result"
    :md-done.sync="stepper.sixth"
  >
    <md-content class="contents md-scrollbar">
      <p>
        The result is the output of the analytic. It can be something that will
        be created, like a ticket, an alarm, or something that must be modified,
        like a control endpoint.
      </p>
      <md-field class="fixed-size-field">
        <label>Result name</label>
        <md-input
          @change="update('resultName', localResultName)"
          v-model="localResultName"
        ></md-input>
      </md-field>

      <md-field class="fixed-size-field">
        <label>Result type</label>
        <md-select
          @md-selected="update('resultType', localResultType)"
          v-model="localResultType"
        >
          <md-option
            v-for="data of CONST_ANALYTIC_RESULT_TYPE"
            :key="data"
            :value="data"
            >{{ data }}</md-option
          >
        </md-select>
      </md-field>
      <p>
        For ticket/alarm, result name will be used as part of the ticket/alarm
        name. For control endpoints, result name will be used to find the
        control endpoint to update. In some cases result name is not used at
        all.
      </p>

      <div v-if="requireEndpointModifyAttrInstead">
        <md-field class="fixed-size-field">
        <label> Modify attribute instead of current value ? ( Enter attribute name or leave empty for default behavior ) </label>
        <md-input
          @change="update('endpointModifyAttrInstead', localEndpointModifyAttrInstead)"
          v-model="localEndpointModifyAttrInstead"
        ></md-input>
        </md-field>
      </div>

      <div v-if="requireEndpointCreationInformation">
        <md-switch
          @change="
            update(
              'shouldCreateEndpointIfNotExist',
              localShouldCreateEndpointIfNotExist
            )
          "
          v-model="localShouldCreateEndpointIfNotExist"
        >Should create endpoint if not exist : <b>{{ localShouldCreateEndpointIfNotExist ? 'Yes': 'No'}} </b></md-switch>
        <div v-if="shouldCreateEndpointIfNotExist == true">
          <md-field class="fixed-size-field">
            <label>Endpoint unit</label>
              <md-input
                @change="
                  update('endpointCreationUnit', localEndpointCreationUnit)
                "
                v-model="localEndpointCreationUnit"
              ></md-input>
          </md-field>
          <md-field class="fixed-size-field">
            <label>Timeseries storage max days</label>
              <md-input type="number"
                @change="
                  update('endpointCreationMaxDays', localEndpointCreationMaxDays)
                "
                v-model="localEndpointCreationMaxDays"
              ></md-input>
          </md-field>
            </div>
      </div>

      <div v-if="requireTicketLocalization">
        <md-field class="fixed-size-field">
          <label> Ticket/Alarm context </label>
          <md-select
            @md-selected="update('ticketContextId', localTicketContextId)"
            v-model="localTicketContextId"
          >
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
          <md-select
            @md-selected="update('ticketProcessId', localTicketProcessId)"
            v-model="localTicketProcessId"
          >
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
            @change="update('alarmPriority', localAlarmPriority)"
            v-model="localAlarmPriority"
          ></md-input>
        </md-field>
      </div>

      <div v-if="requirePhoneInformation">
        <md-field class="fixed-size-field">
          <label>Phone number</label>
          <md-input
            @change="update('phoneNumber', localPhoneNumber)"
            v-model="localPhoneNumber"
          ></md-input>
        </md-field>
        <md-field class="fixed-size-field">
          <label>Message</label>
          <md-input
            @change="update('phoneMessage', localPhoneMessage)"
            type="text"
            v-model="localPhoneMessage"
          ></md-input>
        </md-field>
      </div>

      <div v-if="requireGChatInformation">
        <md-field class="fixed-size-field">
          <label>Google chat space name</label>
          <md-input
            @change="update('gChatSpaceName', localGChatSpaceName)"
            v-model="localGChatSpaceName"
          ></md-input>
        </md-field>
        <md-field class="fixed-size-field">
          <label>Google chat message</label>
          <md-input
            @change="update('gChatMessage', localGChatMessage)"
            type="text"
            v-model="localGChatMessage"
          ></md-input>
        </md-field>
      </div>
    </md-content>
  </md-step>
</template>

<script>
import { CONSTANTS } from 'spinal-model-analysis';

import { spinalServiceTicket } from 'spinal-service-ticket';

export default {
  props: [
    'STEPPERS_DATA',
    'stepper',
    'resultName',
    'resultType',
    'shouldCreateEndpointIfNotExist',
    'endpointCreationUnit',
    'endpointCreationMaxDays',
    'endpointModifyAttrInstead',
    'ticketContextId',
    'ticketProcessId',
    'alarmPriority',
    'phoneNumber',
    'phoneMessage',
    'gChatMessage',
    'gChatSpaceName',
  ],
  components: {},
  data() {
    return {
      localResultName: this.resultName,
      localResultType: this.resultType,
      localShouldCreateEndpointIfNotExist: this.shouldCreateEndpointIfNotExist,
      localEndpointCreationUnit: this.endpointCreationUnit,
      localEndpointCreationMaxDays: this.endpointCreationMaxDays,
      localTicketContextId: this.ticketContextId,
      localTicketProcessId: this.ticketProcessId,
      localAlarmPriority: this.alarmPriority,
      localPhoneNumber: this.phoneNumber,
      localPhoneMessage: this.phoneMessage,
      localGChatMessage: this.gChatMessage,
      localGChatSpaceName: this.gChatSpaceName,
      localEndpointModifyAttrInstead: this.endpointModifyAttrInstead, 
      ticketProcesses: [],
    };
  },
  created() {
    this.CONST_ANALYTIC_RESULT_TYPE = CONSTANTS.ANALYTIC_RESULT_TYPE;
    this.alarmContexts = spinalServiceTicket.getContexts();
  },
  methods: {
    update(key, value) {
      console.log('update ', key, value);
      this.$emit(`update:${key}`, value);
    },

    async refreshContextProcesses() {
      const processes = await spinalServiceTicket.getAllProcess(
        this.localTicketContextId
      );
      for (const process of processes) {
        this.ticketProcesses.push({
          name: process.name.get(),
          id: process.id.get(),
        });
      }
    },
  },
  computed: {
    requireTicketLocalization() {
      return [
        this.CONST_ANALYTIC_RESULT_TYPE.TICKET,
        this.CONST_ANALYTIC_RESULT_TYPE.ALARM,
      ].includes(this.localResultType);
    },

    requireAlarmPriority() {
      return this.localResultType == this.CONST_ANALYTIC_RESULT_TYPE.ALARM;
    },

    requirePhoneInformation() {
      return this.localResultType == this.CONST_ANALYTIC_RESULT_TYPE.SMS;
    },

    requireGChatInformation() {
      return [
        this.CONST_ANALYTIC_RESULT_TYPE.GCHAT_MESSAGE,
        this.CONST_ANALYTIC_RESULT_TYPE.GCHAT_ORGAN_CARD,
      ].includes(this.localResultType);
    },

    requireEndpointCreationInformation() {
      return this.localResultType == this.CONST_ANALYTIC_RESULT_TYPE.ENDPOINT;
    },

    requireEndpointModifyAttrInstead() {
      return [this.CONST_ANALYTIC_RESULT_TYPE.ENDPOINT, this.CONST_ANALYTIC_RESULT_TYPE.CONTROL_ENDPOINT].includes(this.localResultType);
    },
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
    gChatMessage() {
      this.localGChatMessage = this.gChatMessage;
    },
    gChatSpaceName() {
      this.localGChatSpaceName = this.gChatSpaceName;
    },
    phoneNumber() {
      this.localPhoneNumber = this.phoneNumber;
    },
    phoneMessage() {
      this.localPhoneMessage = this.phoneMessage;
    },
    alarmPriority() {
      this.localAlarmPriority = this.alarmPriority;
    },
    shouldCreateEndpointIfNotExist() {
      this.localShouldCreateEndpointIfNotExist = this.shouldCreateEndpointIfNotExist;
    },
    endpointCreationUnit() {
      this.localEndpointCreationUnit = this.endpointCreationUnit;
    },
    endpointCreationMaxDays() {
      this.localEndpointCreationMaxDays = this.endpointCreationMaxDays;
    },
    endpointModifyAttrInstead() {
      this.localEndpointModifyAttrInstead = this.endpointModifyAttrInstead;
    },
  },
};
</script>
