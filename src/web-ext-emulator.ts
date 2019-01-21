import { existsSync, mkdirSync, readFileSync, createReadStream } from 'fs';
import { createContext, runInContext } from 'vm';
import { join } from 'path';
import { createInterface } from 'readline';
import * as setGlobalVars from 'indexeddbshim';
import createChrome from './chrome';
import createWindow, { WindowConfig } from './window'

export interface EmulatorConfig extends WindowConfig {
  injectWebextenionPolyfill?: boolean
  chromeStoragePath?: string
  indexedDBPath?: string
}

const DEFAULT_CONFIG: EmulatorConfig = {
  quiet: false,
  injectWebextenionPolyfill: false,
  chromeStoragePath: './storage',
  indexedDBPath: './idb',
}

interface Global {
  [key: string]: any
}

export default class WebExtensionEmulator {

  extensionBaseDir: string
  options: EmulatorConfig
  probes: {
    [key: string]: any[]
  }
  chrome: Global
  window: Global
  sandbox: Global

  constructor(extensionBaseDir: string, options: EmulatorConfig) {
    this.extensionBaseDir = extensionBaseDir;
    this.options = Object.assign({}, DEFAULT_CONFIG, options);
    this.probes = {};
    const probeFn = this.options.probe || this._probe.bind(this);

    this.chrome = createChrome({
      extensionDir: this.extensionBaseDir,
      storageDir: this.options.chromeStoragePath,
      probe: probeFn,
    });
    this.window = createWindow({
      fetchBaseDirectory: this.extensionBaseDir,
      probe: probeFn,
      ...options,
    });
    this.window.chrome = this.chrome;
    this.window.browser = this.chrome;
  }

  addChromeApi(name, value) {
    this.chrome[name] = value;
  }

  createSandbox() {
    const sandbox = {
      get window() {
        return sandbox
      },
      get self() {
        return sandbox
      },
      get global() {
        return sandbox
      },
      ...this.window
    };
    // create mock Indexeddb
    if (!existsSync(this.options.indexedDBPath)) {
      mkdirSync(this.options.indexedDBPath);
    }
    setGlobalVars(sandbox, {
      checkOrigin: false,
      databaseBasePath: this.options.indexedDBPath,
      replaceNonIDBGlobals: true,
    });
    createContext(sandbox);
    this.sandbox = sandbox;

    if (this.options.injectWebextenionPolyfill) {
      const polyfill = require.resolve('webextension-polyfill');
      this._runScriptInSandbox(polyfill);
    }
    return this.sandbox;
  }

  _runScriptInSandbox(scriptPath: string) {
    const code = readFileSync(scriptPath, { encoding: 'utf8' });
    this._runCodeInSandbox(scriptPath, code)
  }

  _runCodeInSandbox(scriptPath: string, code: string) {
    runInContext(code, this.sandbox, {
      filename: scriptPath,
      displayErrors: true,
    });
  }

  _probe(key: string, value: any) {
    if (!this.probes[key]) {
      this.probes[key] = []
    }
    this.probes[key].push(value);
  }

  startExtension() {
    this.chrome.runtime.getManifest().background.scripts.forEach(script => {
      this._runScriptInSandbox(join(this.extensionBaseDir, script));
    });
  }

  stopExtension() {
    this.window.unload();
  }

  probeStorage() {
    this._probe('storage.local.size', this.chrome.storage.local.size());
    this._probe('storage.local.writes', this.chrome.storage.local.writes);
    this._probe('storage.sync.size', this.chrome.storage.sync.size());
  }

  emulateSession(sessionFile: string, filterApis?: Set<string>): Promise<void> {
    return new Promise((resolve) => {
      const start = Date.now();
      let firstTs = null;
      const lineReader = createInterface({
        input: createReadStream(sessionFile),
      });
      let tick: Promise<{}> = Promise.resolve({});
      lineReader.on('line', (line) => {
        const { api, event, args, ts } = JSON.parse(line);
        if (!firstTs) {
          firstTs = ts;
        }
        // console.log(api, event, args);
        if (!this.chrome[api]) {
          console.error('api missing', api)
          return;
        }
        if (!this.chrome[api][event]) {
          console.error('event missing', api, event);
          return
        }
        if (filterApis && filterApis.has(api)) {
          return;
        } else if (api === 'runtime') {
          if (event === 'onConnect') {
            const port = Object.assign(args[0], this.chrome.runtime.connect());
            args[0] = port;
          } else if (event === 'onMessage') {
            // add respond function
            args[2] = () => {
              this._probe('chrome.runtime.onMessage', `${args[0].module}.${args[0].action}`);
            };
          }
        }
        tick = tick.then(() => {
          const virtualElapsed = ts - firstTs;
          const actualElapsed = Date.now() - start;
          const runEventAt = virtualElapsed / this.options.timeMultiplier;
          const nextEventIn = runEventAt - actualElapsed;
          if (nextEventIn < 1) {
            this.chrome[api][event].trigger(...args);
          } else {
            return new Promise((resolve) => {
              setTimeout(() => {
                try {
                  this.chrome[api][event].trigger(...args);
                } catch (e) {
                  console.error(e);
                }
                resolve();
              }, nextEventIn);
            });
          }
        });
      });
      lineReader.on('close', () => {
        tick.then(() => {
          resolve();
        });
      });
    });
  }

}