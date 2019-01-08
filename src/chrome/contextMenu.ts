import EventSource from '../event-source';

export default {
  create() {},
  update() {},
  remove() {},
  removeAll() {},
  onClicked: new EventSource('contextMenus.onClicked'),
  onShown: new EventSource('contextMenus.onShown'),
  onHidden: new EventSource('contextMenus.onHidden'),
}