import EventSource from '../event-source';

const listeners = [
  'onBeforeRequest', 'onHeadersReceived',
  'onBeforeSendHeaders', 'onBeforeRedirect', 'onCompleted', 'onErrorOccurred'
].reduce((api, listener) => {
  api[listener] = new EventSource(`webRequest.${listener}`)
  return api;
}, {});

export default {
  ...listeners,
  handlerBehaviorChanged: () => {}
};