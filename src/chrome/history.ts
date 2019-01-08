import EventSource from '../event-source';

export default {
  search(query, callback) {
    callback([]);
  },
  getVisits(details, callback) {
    callback([]);
  },
  addUrl(details, callback) {
    callback && callback();
  },
  deleteUrl(details, callback) {
    callback && callback();
  },
  deleteRange(range, callback) {
    callback && callback();
  },
  deleteAll(callback) {
    callback && callback();
  },
  onVisited: new EventSource('history.onVisited'),
  onVisitRemoved: new EventSource('history.onVisitRemoved'),
}