import EventSource from '../event-source';

export default {
  getAll(cb) {
    cb([]);
  },
  reset() {
  },
  update() {
  },
  onCommand: new EventSource('commands.onCommand'),
}