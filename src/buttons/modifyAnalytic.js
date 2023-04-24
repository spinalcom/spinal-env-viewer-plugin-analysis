import { SpinalContextApp } from "spinal-env-viewer-context-menu-service";
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");
import { spinalContextMenuService } from "spinal-env-viewer-context-menu-service";

import { ANALYTIC_TYPE } from "spinal-model-analysis";

const SIDEBAR = "GraphManagerSideBar";

class ModifyAnalytic extends SpinalContextApp {
   constructor() {
      super("Modify Analytic",
        "Modify Analytic", {
          icon: 'settings',
          icon_type: 'in',
          backgroundColor: '#356BAB',
          fontColor: '#FFFFFF'
        })
    }
  
    isShown(option) {  
      const id = option.selectedNode.id.get();
      const isAnalytic = option.selectedNode.type.get() === ANALYTIC_TYPE;
      return Promise.resolve(isAnalytic ? true : -1);
    }
  
    action(option) {
      spinalPanelManagerService.openPanel("modifyAnalyticDialog", option);
    }
}

const modifyAnalytic = new ModifyAnalytic();
spinalContextMenuService.registerApp(SIDEBAR, modifyAnalytic, [3]);
export default modifyAnalytic;