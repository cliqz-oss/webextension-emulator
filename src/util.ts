import { spawnSync } from 'child_process';
import WebExtensionEmulator from ".";

export function measureIdbSize(emulator: WebExtensionEmulator): number {
  const process = spawnSync('du', ['-sk', emulator.options.indexedDBPath]);
  return parseInt(process.stdout.toString().split('\t')[0]) * 1024
}
