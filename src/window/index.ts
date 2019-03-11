import { URL, URLSearchParams } from 'url';
import * as FileReader from 'filereader';
import * as WebCrypto from 'node-webcrypto-ossl';
import * as btoa from 'btoa';
import * as atob from 'atob';
import * as indexedDB from 'fake-indexeddb';
import * as IDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

import Blob from './blob';
import navigator from './navigator';
import XMLHttpRequestFactory from './xmlhttprequest';
import Worker from './worker';
import createTimers from './timers';
import createDate from './fakeDate';
import createFetch from './fetch';

export interface WindowConfig {
  quiet?: boolean
  fetchBaseDirectory?: string
  timeMultiplier?: number
  initialTime?: number
  probe?: (key: string, value: any) => void
}

function createConsole(quiet: boolean) {
  if (!quiet) {
    return console;
  } else {
    const noop = () => {}
    return {
      log: noop,
      warn: noop,
      error: noop,
      info: noop,
      debug: noop,
      trace: noop,
    }
  }
}

export default (config: WindowConfig) => ({
  // types
  Object,
  URL,
  URLSearchParams,
  Blob,
  FileReader,
  Int8Array,
  Uint8Array,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  ArrayBuffer,
  DataView,
  Math,
  btoa,
  atob,
  // web apis
  crypto: new WebCrypto(),
  ...createFetch(config.fetchBaseDirectory, config.probe),
  Date: createDate(config.initialTime || Date.now(), config.timeMultiplier),
  Worker,
  XMLHttpRequest: XMLHttpRequestFactory(config.fetchBaseDirectory, config.probe),
  indexedDB,
  IDBKeyRange,
  // globals
  console: createConsole(config.quiet),
  navigator,
  // timers
  ...createTimers(config.timeMultiplier),
  // utility
  _unloadHandlers: [],
  addEventListener(on: string, fn) {
    if (on === 'beforeunload') {
      this._unloadHandlers.push(fn)
    }
  },
  unload() {
    this._unloadHandlers.forEach((fn) => fn());
    config.probe && config.probe('timers.timeout.leaked', Math.floor(this._timeouts.size / 2));
    config.probe && config.probe('timers.interval.leaked', this._intervals.size);
    [...this._timeouts].forEach(t => this.clearTimeout(t));
    [...this._intervals].forEach(t => this.clearInterval(t));
  },
});
