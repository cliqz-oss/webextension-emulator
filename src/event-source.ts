
export default class EventSource {
  name: string
  listeners: Set<(...args: any[]) => any>

  constructor(name) {
    this.name = name;
    this.listeners = new Set();
  }
  trigger(...args: any[]) {
    this.listeners.forEach((l) => l(...args));
  }
  addListener(l) {
    this.listeners.add(l);
  }
  removeListener(l) {
    this.listeners.delete(l)
  }
  hasListener(l) {
    return this.listeners.has(l);
  }
}
