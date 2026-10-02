import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { extra } from './appConfig';

const config = extra.firebaseWebConfig ?? {};

export class FirebaseWebNotConfigured extends Error {
  constructor() {
    super('Firebase is not configured for the browser. Add a Web app in the Firebase console and put its config into app.json under extra.firebaseWebConfig.');
  }
}

export const isFirebaseWebConfigured = () => Boolean(config.apiKey && config.authDomain);

export const webAuth = (): Auth => {
  if (!isFirebaseWebConfigured()) throw new FirebaseWebNotConfigured();
  const app = getApps().length ? getApp() : initializeApp(config);
  return getAuth(app);
};
