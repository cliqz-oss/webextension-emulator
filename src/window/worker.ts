
export default class Worker {
  constructor(path) {
    console.log('ignoring webworker creation', path);
  }
  postMessage() {}
}