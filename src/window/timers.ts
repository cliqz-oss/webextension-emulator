
export default (multiplier = 1.0) => {
  const self = {
    _timeouts: new Set(),
    _intervals: new Set(),
    setTimeout(func, delay: number, ...args) {
      const adjustedDelay = Math.floor((delay || 0) / multiplier);
      const id = setTimeout(func, adjustedDelay, ...args);
      self._timeouts.add(id);
      const trkid = setTimeout(() => {
        self._timeouts.delete(id);
        self._timeouts.delete(trkid);
      }, adjustedDelay);
      self._timeouts.add(trkid);
      return id;
    },
    setInterval(func, delay, ...args) {
      const id = setInterval(func, Math.floor((delay || 0) / multiplier), ...args);
      self._intervals.add(id);
      return id;
    },
    clearTimeout: (id) => {
      self._timeouts.delete(id);
      clearTimeout(id);
    },
    clearInterval: (id) => {
      self._intervals.delete(id);
      clearInterval(id);
    },
  };
  return self;
};
