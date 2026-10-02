import { OAuthProvider, signInWithPopup } from 'firebase/auth';
import { SsoProvider } from './config';
import { FirebaseWebNotConfigured, isFirebaseWebConfigured, webAuth } from './firebaseWeb';
import { FirebaseSession } from './storage';

export class SsoCancelled extends Error {}

const isCancellation = (e: unknown) => {
  const code = typeof e === 'object' && e !== null ? String((e as { code?: string }).code ?? '') : '';
  return /cancel|popup-closed/i.test(code);
};

export const signInWithSso = async (provider: SsoProvider): Promise<FirebaseSession> => {
  if (!isFirebaseWebConfigured()) throw new FirebaseWebNotConfigured();

  const oauth = new OAuthProvider(provider.id);
  oauth.addScope('openid');
  oauth.addScope('email');
  oauth.addScope('profile');

  let user;
  try {
    ({ user } = await signInWithPopup(webAuth(), oauth));
  } catch (e) {
    if (isCancellation(e)) throw new SsoCancelled();
    throw e;
  }

  if (!user.email) throw new Error(`${provider.label} did not return an email address.`);

  return {
    source: 'firebase',
    uid: user.uid,
    email: user.email,
    name: user.displayName ?? undefined,
    provider: provider.label,
  };
};
