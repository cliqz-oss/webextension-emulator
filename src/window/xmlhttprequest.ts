import * as fetch from 'node-fetch';
import { join } from 'path';
import { readFile } from 'fs';

export default (basepath: string, probe?: (key: string, value: any) => void) => {
  return class XMLHttpRequest {
    withCredentials: boolean
    method: string
    url: string
    status: number
    statusText: string
    responseType: string
    response: ArrayBuffer | string
    responseText: string
    responseUrl: string
    readyState: number

    onerror?: () => any
    onload?: () => any
    onabort?: () => any
    onreadystatechange?: () => any

    constructor() {
      this.withCredentials = true;
      this.responseType = "";
    }

    open(method, url) {
      this.method = method;
      this.url = url;
    }

    setRequestHeader(key, value) {
    }

    getAllResponseHeaders() {
      return '';
    }

    send(body) {
      if (this.url.indexOf('://') === -1 && basepath) {
        const filePath = join(basepath, this.url)
        readFile(filePath, (err, data) => {
          if (err) {
            this.status = 404;
            return this.onerror && this.onerror();
          }
          this.responseText = data.toString();
          this.response = data.toString();
          this.status = 0;
          this.onload();
          probe && probe('xmlhttprequest.local.size', this.responseText.length);
        });
        probe && probe('xmlhttprequest.local.url', this.url);
      } else {
        fetch(this.url, {
          method: this.method,
          credentials: this.withCredentials ? 'include' : 'omit',
          body,
        }).then((resp: Response) => {
          this.status = resp.status;
          this.statusText = resp.statusText;
          this.responseUrl = resp.url;
          this.readyState = 4;
          this.onreadystatechange && this.onreadystatechange();
          if (!resp.ok) {
            return this.onerror && this.onerror();
          }
          resp.arrayBuffer().then((buff: ArrayBuffer) => {
            this.responseText = Buffer.from(buff).toString();
            if (this.responseType === 'arrayBuffer') {
              this.response = buff;
            } else if (this.responseType === 'json') {
              this.response = JSON.parse(this.responseText);
            } else if (!resp.headers.has('Content-Type') ||
                !resp.headers.get('Content-Type').startsWith('application/json')) {
              this.response = buff;
            } else {
              this.response = this.responseText;
            }
            this.onload && this.onload();
            probe && probe('xmlhttprequest.remote.size', buff.byteLength);
          });
        })
        probe && probe('xmlhttprequest.remote.url', this.url);
      }
    }

    abort() {
      // noop
    }
  }
}
