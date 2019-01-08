import WebExtensionEmulator from "./web-ext-emulator";
import browserAction2 from "./chrome/experimental/browserAction2";
import omnibox2 from "./chrome/experimental/omnibox2";
import demographics from "./chrome/experimental/demographics";

export default WebExtensionEmulator;

export const experimentalAPIs = {
  browserAction2: browserAction2,
  omnibox2: omnibox2,
  demographics: demographics,
};
