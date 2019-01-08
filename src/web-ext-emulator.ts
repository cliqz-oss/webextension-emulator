import { existsSync, mkdirSync, readFileSync } from 'fs';
import { createContext, runInContext } from 'vm';
import { join } from 'path';
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

    this.chrome = createChrome(this.extensionBaseDir, this.options.chromeStoragePath);
    this.window = createWindow({
      fetchBaseDirectory: this.extensionBaseDir,
      probe: this.options.probe || this._probe.bind(this),
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

}