import EventSource from '../event-source';

function promiseOrCallback(result, callback) {
  if (callback) {
    callback(result);
  } else {
    return Promise.resolve(result);
  }
}

export default {
  get(details, callback) {
    return promiseOrCallback(null, callback);
  },
  getAll(details, callback) {
    return promiseOrCallback([], callback);
  },
  set(details, callback) {
    return promiseOrCallback(details, callback);
  },
  remove(details, callback) {
    return promiseOrCallback(null, callback);
  },
  getAllCookieStores(callback) {
    return promiseOrCallback(['default'], callback);
  },
  onChanged: new EventSource('cookie.onChanged'),
}