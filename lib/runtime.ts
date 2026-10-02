import Constants, { ExecutionEnvironment } from 'expo-constants';

export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export class NeedsInstalledBuild extends Error {
  constructor(feature: string) {
    super(`${feature} needs the installed app. Expo Go cannot load the native Firebase and Google sign-in modules, so only Proof 8 password sign-in works here.`);
  }
}
