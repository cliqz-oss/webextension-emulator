
export default (initialTime: number = Date.now(), timeMultiplier: number = 1.0) => {
  const actualTime = Date.now();
  return class FakeDate extends Date {
    constructor(year?, monthIndex?, day?, hour?, minutes?, seconds? , milliseconds?) {
      if (arguments.length === 0) {
        super(((Date.now() - actualTime) * timeMultiplier) + initialTime);
      } else if(arguments.length === 1 ) {
        super(year);
      } else {
        super(year, monthIndex, day, hour, minutes, seconds, milliseconds);
      }
    }
    static now(): number {
      return ((Date.now() - actualTime) * timeMultiplier) + initialTime;
    }
  }
};
