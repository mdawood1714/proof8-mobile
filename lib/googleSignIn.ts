import { Platform } from 'react-native';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from './config';
import { isExpoGo, NeedsInstalledBuild } from './runtime';
import { FirebaseSession } from './storage';

type FirebaseAuthModule = typeof import('@react-native-firebase/auth');
type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

const firebaseAuth = (): FirebaseAuthModule => require('@react-native-firebase/auth');
const googleSignInModule = (): GoogleSignInModule => require('@react-native-google-signin/google-signin');

export class GoogleCancelled extends Error {}

export class GoogleNotConfigured extends Error {
  constructor() {
    super('Google sign-in is not configured in this build. Add the Firebase config files and client IDs, then rebuild.');
  }
}

export const isGoogleConfigured = () => Boolean(GOOGLE_WEB_CLIENT_ID);

export const configureGoogleSignIn = () => {
  if (isExpoGo || !isGoogleConfigured()) return;
  googleSignInModule().GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
  });
};

export const signInWithGoogle = async (): Promise<FirebaseSession> => {
  if (isExpoGo) throw new NeedsInstalledBuild('Google sign-in');
  if (!isGoogleConfigured()) throw new GoogleNotConfigured();

  const { GoogleSignin, isErrorWithCode, statusCodes } = googleSignInModule();
  const { GoogleAuthProvider, getAuth, signInWithCredential } = firebaseAuth();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  let googleIdToken: string | null | undefined;
  try {
    const result = await GoogleSignin.signIn();
    googleIdToken = result.data?.idToken;
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new GoogleCancelled();
    }
    throw e;
  }

  if (!googleIdToken) throw new Error('Google did not return an identity token.');

  const credential = GoogleAuthProvider.credential(googleIdToken);
  const { user } = await signInWithCredential(getAuth(), credential);

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
  if (isExpoGo || !isGoogleConfigured()) return;
  const { GoogleSignin } = googleSignInModule();
  const { getAuth, signOut } = firebaseAuth();
  await GoogleSignin.signOut().catch(() => undefined);
  await signOut(getAuth()).catch(() => undefined);
};
