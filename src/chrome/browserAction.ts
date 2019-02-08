import EventSource from '../event-source';

export default {
  onClicked: new EventSource('browserAction.onClicked'),
  setPopup() {},
  setIcon() {},
  enable() {},
  disable() {},
};
