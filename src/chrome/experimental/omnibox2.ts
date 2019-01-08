import EventSource from '../../event-source';

const events = ['onInput', 'onKeydown', 'onFocus', 'onBlur', 'onDrop', 'onDropmarker']
.reduce((api, listener) => {
  api[listener] = new EventSource(`omnibox2.${listener}`)
  return api;
}, {});

export default {
  override() {
  },
  setPlaceholder() {},
  urlbarAction: {
    onClicked: new EventSource('omnibox2.urlbarAction.onClicked'),
  },
  onMessage: new EventSource('omnibox2.onMessage'),
  ...events,
}