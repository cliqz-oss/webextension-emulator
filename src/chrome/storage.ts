import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import EventSource from '../event-source';

const onChanged = new EventSource('storage.onChanged');

class StorageChange {
  oldValue: any
  newValue: any

  constructor(oldValue, newValue) {
    this.oldValue = oldValue;
    this.newValue = newValue;
  }
}

class StorageArea {

  areaName: string
  fileName: string
  storage: {
    [key: string]: any
  }
  writes: number

  constructor(name: string, dir: string) {
    this.areaName = name;
    this.fileName = join(dir, `./storage_${name}.json`);
    if (existsSync(this.fileName)) {
      this.storage = JSON.parse(readFileSync(this.fileName, { encoding: 'utf8' }));
    } else {
      this.storage = {};
    }
    this.writes = 0;
  }
  _keyReducer(acc, key) {
    if (this.storage[key] !== undefined) {
      acc[key] = this.storage[key];
    }
    return acc;
  }
  get(keys: string | string[] | object, cb) {
    // console.log('xxx get', keys);
    if (!keys) {
      cb(Object.assign({}, this.storage));
    } else if (typeof keys === 'string') {
      cb(this._keyReducer({}, keys));
    } else if (Array.isArray(keys)) {
      const result = keys.reduce(this._keyReducer.bind(this), {});
      cb(result);
    } else {
      cb(Object.assign({}, keys, Object.keys(keys).reduce(this._keyReducer.bind(this), {})));
    }
  }
  set(keys: object, cb) {
    this.writes += 1;
    Object.keys(keys).forEach((k) => {
      this.storage[k] = keys[k];
      onChanged.trigger(new StorageChange(this.storage[k], keys[k]), this.areaName);
    });
    cb && cb();
    writeFileSync(this.fileName, JSON.stringify(this.storage));
  }
  remove(keys: string | string[], cb) {
    this.writes += 1;
    if (typeof keys === 'string') {
      delete this.storage[keys];
    } else {
      keys.forEach((k) => delete this.storage[k]);
    }
    cb && cb();
  }
  clear(cb) {
    this.storage = {};
    cb && cb();
  }
  size() {
    return JSON.stringify(this.storage).length;
  }
}

export default (STORAGE_DIR: string) => {
  if (!existsSync(STORAGE_DIR)) {
    mkdirSync(STORAGE_DIR);
  }
  return {
    local: new StorageArea('local', STORAGE_DIR),
    sync: new StorageArea('sync', STORAGE_DIR),
    onChanged,
  }
};
