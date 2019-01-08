import EventSource from '../event-source';

export default {
  create(properties, cb) {
    cb && cb({
      active: true,
      id: 1,
    })
  },
  query(q, cb) {
    cb([]);
  },
  onActivated: new EventSource('tabs.onActivated'),
  onRemoved: new EventSource('tabs.onRemoved'),
  onCreated: new EventSource('tabs.onCreated'),
  onUpdated: new EventSource('tabs.onUpdated'),
  onReplaced: new EventSource('tabs.onReplaced'),
};
