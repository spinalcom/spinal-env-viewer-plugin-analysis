import { SpinalContextApp } from "spinal-env-viewer-context-menu-service";
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");
import { spinalContextMenuService } from "spinal-env-viewer-context-menu-service";

import { ENTITY_TYPE } from "spinal-model-analysis";

const SIDEBAR = "GraphManagerSideBar";

class CreateAnalytic extends SpinalContextApp {
   constructor() {
      super("Create Analytic",
        "Create Analytic", {
          icon: 'dashboard_customize',
          icon_type: 'in',
          backgroundColor: '#356BAB',
          fontColor: '#FFFFFF'
        })
    }
  
    isShown(option) {  
      const id = option.selectedNode.id.get();
      const isAnalyticEntity = option.selectedNode.type.get() === ENTITY_TYPE;
      return Promise.resolve(isAnalyticEntity ? true : -1);
    }
  
    action(option) {
      spinalPanelManagerService.openPanel("createAnalyticDialog", option);
    }
}

const createAnalytic = new CreateAnalytic();
spinalContextMenuService.registerApp(SIDEBAR, createAnalytic, [3]);
export default createAnalytic;