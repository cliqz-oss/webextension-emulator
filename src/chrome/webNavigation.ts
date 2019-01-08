import EventSource from '../event-source';

export default {
  onBeforeNavigate: new EventSource('webNavigation.onBeforeNavigate'),
  onCommitted: new EventSource('webNavigation.onCommited'),
  onDOMContentLoaded: new EventSource('webNavigation.onDOMContentLoaded'),
  onCompleted: new EventSource('webNavigation.onCompleted'),
  onHistoryStateUpdated: new EventSource('webNavigation.onHistoryStateUpdated'),
  onErrorOccurred: new EventSource('webNavigation.onErrorOccurred'),
};