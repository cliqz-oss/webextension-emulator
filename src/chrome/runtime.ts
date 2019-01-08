import { join } from 'path';
import { readFileSync } from 'fs';
import EventSource from '../event-source';

function loadManifest(EXTENSION_DIR) {
  return JSON.parse(readFileSync(join(EXTENSION_DIR, 'manifest.json'), {
    encoding: 'utf8',
  }));
}

export default (EXTENSION_DIR: string) => ({
  manifest: loadManifest(EXTENSION_DIR),
  connect() {
    return {
      onMessage: new EventSource('runtime.connect().onMessage'),
    }
  },
  getManifest() {
    return this.manifest;
  },
  getURL(file) {
    return join(EXTENSION_DIR, file);
  },
  onMessage: new EventSource('runtime.onMessage'),
  onConnect: new EventSource('runtime.onConnect'),
  onMessageExternal: new EventSource('runtime.onMessageExternal'),
});
