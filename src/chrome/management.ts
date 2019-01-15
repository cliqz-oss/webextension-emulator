import EventSource from '../event-source';

export default {
  get(id: string, cb) {
    const result = {
      enabled: true,
    }
    if (cb) {
      cb(result)
    }
    return Promise.resolve(result);
  },
  onInstalled: new EventSource('management.onInstalled'),
}