import createRuntime from './runtime';
import createStorage from './storage';
import i18n from './i18n';
import browserAction from './browserAction';
import webNavigation from './webNavigation';
import webRequest from './webRequest';
import contentScripts from './contentScripts';
import createTabs from './tabs';
import extension from './extension';
import cookies from './cookies';
import commands from './commands';
import history from './history';
import contextMenus from './contextMenu';
import pageAction from './pageAction';
import topSites from './topSites';
import management from './management';
import windows from './windows';
import createPermissions from './permissions';

export interface ChromeConfig {
  extensionDir: string
  storageDir: string
  probe?: (key: string, value: any) => void
}

export default (config: ChromeConfig) => {
  const runtime = createRuntime(config.extensionDir, config.probe);
  return {
    runtime,
    browserAction,
    commands,
    cookies,
    contentScripts,
    contextMenus,
    extension,
    history,
    i18n,
    management,
    pageAction,
    permissions: createPermissions(runtime),
    tabs: createTabs(config.probe),
    topSites,
    storage: createStorage(config.storageDir),
    webNavigation,
    webRequest,
    windows,
  }
};
