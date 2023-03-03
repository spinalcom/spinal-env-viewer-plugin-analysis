import vue from "vue";

const { SpinalForgeExtention } = require("spinal-env-viewer-panel-manager-service_spinalforgeextention");


import LinkGroupToAnalytics from "./linkGroupToAnalytics.vue";

let panels = [
   {
      name: "linkGroupToAnalyticsPanel",
      vueMountComponent: vue.extend(LinkGroupToAnalytics),
      panel: {
      title: "Link Group to Analytic Panel",
      closeBehaviour: "hide",
      },
      style: {
         height: "475px",
         left: "400px",
      },
   }
];

for (let index = 0; index < panels.length; index++) {
 const element = panels[index];
 const panelExtension = SpinalForgeExtention.createExtention(element);
 SpinalForgeExtention.registerExtention(element.name, panelExtension);
}