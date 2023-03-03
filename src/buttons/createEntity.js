import { SpinalContextApp } from "spinal-env-viewer-context-menu-service";
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");
import { spinalContextMenuService } from "spinal-env-viewer-context-menu-service";

import { CONTEXT_TYPE } from "spinal-model-analysis";

const SIDEBAR = "GraphManagerSideBar";

class CreateEntity extends SpinalContextApp {
   constructor() {
      super("Create Entity",
        "Create Entity", {
          icon: 'dashboard_customize',
          icon_type: 'in',
          backgroundColor: '#356BAB',
          fontColor: '#FFFFFF'
        })
    }
  
    isShown(option) {  
      const id = option.selectedNode.id.get();
      const isAnalyticContext = option.selectedNode.type.get() === CONTEXT_TYPE;
      return Promise.resolve(isAnalyticContext ? true : -1);
    }
  
    action(option) {
      spinalPanelManagerService.openPanel("createEntityDialog", option);
    }
}

const createEntity = new CreateEntity();
spinalContextMenuService.registerApp(SIDEBAR, createEntity, [3]);
export default createEntity;