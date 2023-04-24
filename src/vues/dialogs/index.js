import vue from "vue";
const { SpinalMountExtention  } = require("spinal-env-viewer-panel-manager-service");
import CreateAnalyticContextDialog from "./createContextDialog.vue";
import createEntityDialog from "./createEntityDialog.vue";
import createAnalyticDialog from "./createAnalyticDialog.vue"
import modifyAnalyticDialog from "./modifyAnalyticDialog.vue"


const dialogs = [
   {
      name: "createEntityDialog",
      vueMountComponent: vue.extend(createEntityDialog),
      parentContainer: document.body
   },
   {
      name: "createAnalyticContextDialog",
      vueMountComponent: vue.extend(CreateAnalyticContextDialog),
      parentContainer: document.body
    },
    {
      name: "createAnalyticDialog",
      vueMountComponent: vue.extend(createAnalyticDialog),
      parentContainer: document.body
    },
    {
      name: "modifyAnalyticDialog",
      vueMountComponent: vue.extend(modifyAnalyticDialog),
      parentContainer: document.body
    }

];

for (let index = 0; index < dialogs.length; index++) {
 SpinalMountExtention.mount(dialogs[index]);
}