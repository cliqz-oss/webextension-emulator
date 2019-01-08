import * as fetch from 'node-fetch';
import { join } from 'path';
import { readFile } from 'fs';
import Blob from './blob';

export default (basepath: string, probe?: (key: string, value: any) => void) => {

  return {
    fetch: (request, opts) => {
      const url = typeof request === 'string' ? request : request.url;

      if (url.indexOf('://') === -1 && basepath) {
        probe && probe('fetch.local.url', url);
        return new Promise((resolve, reject) => {
          const filePath = join(basepath, url)
          readFile(filePath, (err, data) => {
            if (err) {
              return reject(err);
            }
            probe && probe('fetch.local.size', data.length);
            resolve({
              ok: true,
              status: 200,
              url,
              arrayBuffer: () => Promise.resolve(data.buffer),
              blob: () => Promise.resolve(new Blob([data])),
              json: () => Promise.resolve(JSON.parse(data.toString())),
              text: () => Promise.resolve(data.toString()),
            })
          });
        });
      }
      probe && probe('fetch.remote.url', url);
      const innerFetch = fetch(request, opts);
      return innerFetch.then(resp => {
        const responseProxy = new Proxy(resp, {
          get: (target, prop) => {
            if (prop === 'arrayBuffer') {
              return async () => {
                const data: ArrayBuffer = await resp.arrayBuffer();
                probe('fetch.remote', data.byteLength);
                return data;
              }
            } else if (prop === 'json') {
              return async () => {
                const data: string = await resp.text();
                probe('fetch.remote', data.length);
                return JSON.parse(data);
              }
            } else if (prop === 'text') {
              return async () => {
                const data: string = await resp.text();
                probe('fetch.remote', data.length);
                return data;
              }
            }
            return target[prop];
          }
        });
        return responseProxy;
      });
    },
    Headers: fetch.Headers,
    Request: fetch.Request,
    Response: fetch.Response,
  }
}