import createEntity from "./createEntity";
import createAnalytic from "./createAnalytic";
import modifyAnalytic from "./modifyAnalytic";

import {
   CreateContextButton
 } from "./createContext";

 import {
   spinalContextMenuService
 } from "spinal-env-viewer-context-menu-service";
 
 /* Constants */
const HEADER_HOOK_NAME = "GraphManagerTopBar";
const SIDEBAR_HOOK_NAME = "GraphManagerSideBar";
const CIRCULAR_MENU_HOOK = "circularMenu";

/* Headerbar Buttons*/
spinalContextMenuService.registerApp(
   HEADER_HOOK_NAME,
   new CreateContextButton(),
   [3]
 );

export {
  createEntity,
  createAnalytic,
  modifyAnalytic
}