import EventSource from '../event-source';

const listeners = [
  'onBeforeRequest',
  'onBeforeSendHeaders',
  'onSendHeaders',
  'onHeadersReceived',
  'onBeforeRedirect',
  'onAuthRequired',
  'onResponseStarted',
  'onCompleted',
  'onErrorOccurred',
].reduce((api, listener) => {
  api[listener] = new EventSource(`webRequest.${listener}`)
  return api;
}, {});

export default {
  ...listeners,
  handlerBehaviorChanged: () => {}
};