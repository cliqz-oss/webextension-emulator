import EventSource from '../event-source';

export type Tab = {
  active: boolean
  attention?: boolean
  audible?: boolean
  autoDiscardable?: boolean
  cookieStoreId?: string
  discarded?: boolean
  favIconUrl?: string
  height?: number
  hidden: boolean
  highlighted: boolean
  id?: number
  incognito: boolean
  index: number
  isArticle: boolean
  isInReaderMode: boolean
  lastAccessed: number
  mutedInfo?: any
  openerTabId?: number
  pinned: boolean
  selected: boolean
  sessionId?: string
  status?: string
  title?: string
  url?: string
  width?: number
  windowId: number
}

type TabQuery = {
  active?: boolean
  pinned?: boolean
  audible?: boolean
  muted?: boolean
  highlighted?: boolean
  discarded?: boolean
  autoDiscardable?: boolean
  currentWindow?: boolean
  lastFocusedWindow?: boolean
  status?: string
  title?: string
  url?: string | string[]
  windowId?: number
  windowType?: string
  index?: number
}

export default (probe?: (key: string, value: any) => void) => {
  const tabStore = new Map<number, Tab>()
  const tabs = {
    create(properties, cb) {
      cb && cb({
        active: true,
        id: 1,
      })
    },
    query(q: TabQuery, cb) {
      const matches = []
      const searchKeys = new Set(Object.keys(q));
      // ignore these keys
      ['currentWindow', 'lastFocusedWindow', 'title', 'url'].forEach((k) => searchKeys.delete(k));

      [...tabStore.values()].filter((tab) => {
        if (searchKeys.size !== 0 && ![...searchKeys].every((k) => tab[k] === q[k])) {
          return;
        }
        if (Array.isArray(q.url)) {
          if (q.url.every((url) => tab.url.match(new RegExp(url)) === null)) {
            return;
          }
        } else {
          if (tab.url.match(new RegExp(q.url)) === null) {
            return;
          }
        }
        matches.push(tab);
      });
      // console.log('xxx tab q', q, matches);
      cb(matches);
    },
    get(tabId: number, cb: (tab: Tab) => void) {
      cb(tabStore.get(tabId));
    },
    getCurrent(cb: (tab: Tab) => void) {
      const current = [...tabStore.values()].find((tab) => tab.active);
      cb(current);
    },
    sendMessage(tabId, message) {
      probe && probe('chrome.tabs.message', message.action);
    },
    connect() {
      return {
        postMessage(message) {
          probe && probe('chrome.tabs.postMessage', message.action);
        },
        onMessage: new EventSource('runtime.connect().onMessage'),
      }
    },
    onActivated: new EventSource('tabs.onActivated'),
    onRemoved: new EventSource('tabs.onRemoved'),
    onCreated: new EventSource('tabs.onCreated'),
    onUpdated: new EventSource('tabs.onUpdated'),
    onReplaced: new EventSource('tabs.onReplaced'),
    onHighlighted: new EventSource('tabs.onHighlighted'),
  };

  tabs.onCreated.addListener((tab: Tab) => tabStore.set(tab.id, tab));
  tabs.onRemoved.addListener((tabId: number) => tabStore.delete(tabId));
  tabs.onUpdated.addListener((tabId: number, changeInfo, tab: Tab) => tabStore.set(tabId, tab));
  tabs.onActivated.addListener((activeInfo: { tabId: number }) => {
    tabs.getCurrent((tab) => {
      if (tab) tab.active = false
    });
    tabStore.get(activeInfo.tabId).active = true;
  });;
  tabs.onReplaced.addListener((addedTabId: number, removedTabId: number) => {
    tabStore.set(addedTabId, tabStore.get(removedTabId));
    tabStore.delete(removedTabId);
  });
  return tabs;
}
