import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-dir-viewer' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const DirViewer = NativeModules.DirViewer
  ? NativeModules.DirViewer
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return DirViewer.multiply(a, b);
}
