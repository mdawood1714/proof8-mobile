import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { FirebaseWebNotConfigured, isFirebaseWebConfigured, webAuth } from './firebaseWeb';
import { FirebaseSession } from './storage';

export class GoogleCancelled extends Error {}

export class GoogleNotConfigured extends FirebaseWebNotConfigured {}

const CANCELLED_CODES = [
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
];

const isCancellation = (e: unknown) =>
  typeof e === 'object' && e !== null && CANCELLED_CODES.includes((e as { code?: string }).code ?? '');

export const isGoogleConfigured = () => isFirebaseWebConfigured();

export const configureGoogleSignIn = () => undefined;

export const signInWithGoogle = async (): Promise<FirebaseSession> => {
  if (!isFirebaseWebConfigured()) throw new GoogleNotConfigured();

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  let user;
  try {
    ({ user } = await signInWithPopup(webAuth(), provider));
  } catch (e) {
    if (isCancellation(e)) throw new GoogleCancelled();
    throw e;
  }

  if (!user.email) throw new Error('That Google account has no email address.');

  return {
    source: 'firebase',
    uid: user.uid,
    email: user.email,
    name: user.displayName ?? undefined,
    provider: 'Google',
  };
};

export const signOutOfGoogle = async () => {
  if (!isFirebaseWebConfigured()) return;
  await signOut(webAuth()).catch(() => undefined);
};
