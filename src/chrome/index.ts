import createRuntime from './runtime';
import createStorage from './storage';
import i18n from './i18n';
import browserAction from './browserAction';
import webNavigation from './webNavigation';
import webRequest from './webRequest';
import contentScripts from './contentScripts';
import tabs from './tabs';
import extension from './extension';
import cookies from './cookies';
import commands from './commands';
import history from './history';
import contextMenus from './contextMenu';
import pageAction from './pageAction';

export default (EXTENSION_DIR: string, STORAGE_DIR: string) => ({
  runtime: createRuntime(EXTENSION_DIR),
  browserAction,
  commands,
  cookies,
  contentScripts,
  contextMenus,
  extension,
  history,
  i18n,
  pageAction,
  tabs,
  storage: createStorage(STORAGE_DIR),
  webNavigation,
  webRequest,
});
