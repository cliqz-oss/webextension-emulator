const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
  constructor(...args: any[]) {
    this[TYPE] = '';

    const blobParts = arguments[0];
    const options = arguments[1];

    const buffers = [];

    if (blobParts) {
      const a = blobParts;
      const length = Number(a.length);
      for (let i = 0; i < length; i++) {
        const element = a[i];
        let buffer;
        if (element instanceof Buffer) {
          buffer = element;
        } else if (ArrayBuffer.isView(element)) {
          buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
        } else if (element instanceof ArrayBuffer) {
          buffer = Buffer.from(element);
        } else if (element instanceof Blob) {
          buffer = element[BUFFER];
        } else {
          buffer = Buffer.from(typeof element === 'string' ? element : String(element));
        }
        buffers.push(buffer);
      }
    }

    this[BUFFER] = Buffer.concat(buffers);

    let type = options && options.type !== undefined && String(options.type).toLowerCase();
    if (type && !/[^\u0020-\u007E]/.test(type)) {
      this[TYPE] = type;
    }
  }
  get size() {
    return this[BUFFER].length;
  }
  get type() {
    return this[TYPE];
  }
  slice() {
    const size = this.size;

    const start = arguments[0];
    const end = arguments[1];
    let relativeStart, relativeEnd;
    if (start === undefined) {
      relativeStart = 0;
    } else if (start < 0) {
      relativeStart = Math.max(size + start, 0);
    } else {
      relativeStart = Math.min(start, size);
    }
    if (end === undefined) {
      relativeEnd = size;
    } else if (end < 0) {
      relativeEnd = Math.max(size + end, 0);
    } else {
      relativeEnd = Math.min(end, size);
    }
    const span = Math.max(relativeEnd - relativeStart, 0);

    const buffer = this[BUFFER];
    const slicedBuffer = buffer.slice(
      relativeStart,
      relativeStart + span
    );
    const blob = new Blob([], { type: arguments[2] });
    blob[BUFFER] = slicedBuffer;
    return blob;
  }
}

Object.defineProperties(Blob.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
  value: 'Blob',
  writable: false,
  enumerable: false,
  configurable: true
});


export default Blob;