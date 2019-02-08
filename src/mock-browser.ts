import { Tab } from './chrome/tabs';

export default class MockBrowser {

  window: any
  chrome: any

  constructor(window: any, chrome: any) {
    this.window = window;
    this.chrome = chrome;
  }

  createTab(tabInfo: Partial<Tab>) {
    const tab: Tab = Object.assign({}, tabInfo, {
      id: 1,
      active: true,
      hidden: false,
      highlighted: true,
      incognito: false,
      index: 1,
      isArticle: false,
      isInReaderMode: false,
      lastAccessed: this.window.Date.now(),
      pinned: false,
      selected: true,
      windowId: 1,
    });
    this.chrome.tabs.onCreated.trigger(tab);
  }
}