import EventSource from '../event-source';

export default {
  show() {},
  hide() {},
  setTitle() {},
  getTitle() {},
  setIcon() {},
  setPopup() {},
  getPopup() {},
  onClicked: new EventSource('pageAction.onClicked'),
}