import type { AuthProvider } from '@react-native-firebase/auth';
import { SsoProvider } from './config';
import { isExpoGo, NeedsInstalledBuild } from './runtime';
import { FirebaseSession } from './storage';

type FirebaseAuthModule = typeof import('@react-native-firebase/auth');

const firebaseAuth = (): FirebaseAuthModule => require('@react-native-firebase/auth');

export class SsoCancelled extends Error {}

const CANCELLED_CODES = [
  'auth/user-cancelled',
  'auth/cancelled-popup-request',
  'auth/popup-closed-by-user',
  'auth/web-context-cancelled',
];

const isCancellation = (e: unknown) =>
  typeof e === 'object' && e !== null && CANCELLED_CODES.includes((e as { code?: string }).code ?? '');

export const signInWithSso = async (provider: SsoProvider): Promise<FirebaseSession> => {
  if (isExpoGo) throw new NeedsInstalledBuild('Company single sign-on');

  const { OAuthProvider, getAuth, signInWithRedirect } = firebaseAuth();

  const oauth = new OAuthProvider(provider.id);
  oauth.addScope('openid');
  oauth.addScope('email');
  oauth.addScope('profile');

  let credential;
  try {
    credential = await signInWithRedirect(getAuth(), oauth as unknown as AuthProvider);
  } catch (e) {
    if (isCancellation(e)) throw new SsoCancelled();
    throw e;
  }

  const { user } = credential;
  if (!user.email) throw new Error(`${provider.label} did not return an email address.`);

  return {
    source: 'firebase',
    uid: user.uid,
    email: user.email,
    name: user.displayName ?? undefined,
    provider: provider.label,
  };
};
