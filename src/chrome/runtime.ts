import { join } from 'path';
import { readFileSync } from 'fs';
import EventSource from '../event-source';

function loadManifest(EXTENSION_DIR) {
  return JSON.parse(readFileSync(join(EXTENSION_DIR, 'manifest.json'), {
    encoding: 'utf8',
  }));
}

export default (EXTENSION_DIR: string, probe?: (key: string, value: any) => void) => ({
  manifest: loadManifest(EXTENSION_DIR),
  connect() {
    return {
      postMessage(message) {
        probe && probe('chrome.runtime.postMessage', message.action);
      },
      onMessage: new EventSource('runtime.connect().onMessage'),
    }
  },
  getManifest() {
    return this.manifest;
  },
  getURL(file) {
    return join(EXTENSION_DIR, file);
  },
  sendMessage(extensionOrMessage) {
    if (typeof extensionOrMessage === 'string') {
      probe && probe('chrome.runtime.sendMessage', extensionOrMessage);
    } else {
      probe && probe('chrome.runtime.sendMessage', extensionOrMessage.action);
    }
  },
  setUninstallURL() {},
  onMessage: new EventSource('runtime.onMessage'),
  onConnect: new EventSource('runtime.onConnect'),
  onInstalled: new EventSource('runtime.onInstalled'),
  onMessageExternal: new EventSource('runtime.onMessageExternal'),
});
