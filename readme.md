# WebExtension Emulator

This library emulates the environment of a [WebExtension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
inside a [NodeJS VM](https://nodejs.org/dist/latest-v10.x/docs/api/vm.html). This enables:
 * Profiling and testing of the extension separately from a browser, and without the overheads
 of browser instrumentation.
 * Use node profiling tools to analyse extension performance
 * Generate synthetic extension benchmarks which run quickly.

This project is in the early stages, and most extension APIs only contain the minimum to allow an
extension to run. We will be building out support for benchmarks of common patterns for testing our
own extensions.

## Usage

The following code loads a webextension inside the emulator and runs it for 10s. After this time
we print a basic report of the extension run, including:
 * Resources loaded (both internal fetch and external webrequest), plus their sizes.
 * Amount of data saved in `chrome.storage` and how often it was written to.
 * The number of timers still registered after unloading the extension.

```javascript
import Emulator from '@cliqz/webextension-emulator'
const sandbox = new Emulator('/path/to/webextension', {
  injectWebextensionPolyfill: true, // creates `browser` global with promisified APIs
  chromeStoragePath: './storage', // where to save chrome.storage data
  indexedDBPath: './idb', // where to save indexedDB data
  timeMultiplier: 1, // if virtual time should be modified
})
sandbox.createSandbox();
sandbox.startExtension();

setTimeout(() => {
  sandbox.stopExtension();
  sandbox.probeStorage();
  console.log(sandbox.probes);
}, 10000);
```

## License

MIT.
