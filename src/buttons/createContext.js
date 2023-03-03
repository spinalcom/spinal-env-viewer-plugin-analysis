import {
  SpinalContextApp, spinalContextMenuService
} from 'spinal-env-viewer-context-menu-service'

import {
  spinalPanelManagerService
} from 'spinal-env-viewer-panel-manager-service';


export class CreateContextButton extends SpinalContextApp {

  constructor() {
    super('Create Analytic context',
      'This button allows you to create an analytic context', {
        icon: "category",
        icon_type: 'in',
        backgroundColor: "#356BAB",
        fontColor: '#ffffff'
      })
  }


  isShown(option) {
    return Promise.resolve(true);
  }

  action(option) {
    spinalPanelManagerService.openPanel("createAnalyticContextDialog")
  }

}
