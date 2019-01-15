import EventSource from '../event-source';

type Window = {
  alwaysOnTop: boolean
  focused: boolean
  height?: number
  id?: number
  incognito: boolean
  left?: number
  sessionId?: string
  state?: any
  tabs?: any[]
  title?: string
  top?: number
  type?: any
  width?: number
}

const windowStore = new Map<number, Window>();

const windows = {
  getAll(getInfo, cb) {
    if (!cb) {
      cb = getInfo;
    }
    cb([...windowStore.values()]);
  },
  onCreated: new EventSource('windows.onCreated'),
  onRemoved: new EventSource('windows.onCreated'),
  onFocusChanged: new EventSource('windows.onCreated'),
};

windows.onCreated.addListener((window: Window) => {
  windowStore.set(window.id, window);
  window.tabs = window.tabs || [];
});
windows.onRemoved.addListener((windowId: number) => windowStore.delete(windowId));

export default windows;