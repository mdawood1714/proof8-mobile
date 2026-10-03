import { GATEWAY } from './config';

export type SignInResponse = {
  verified: boolean;
  Authorization: string;
  account_id: string;
  company_id?: string;
  permission?: string;
  company?: unknown;
  message?: string;
};

const post = async (body: Record<string, unknown>): Promise<SignInResponse> => {
  let res: Response;
  try {
    res = await fetch(`${GATEWAY}/accounts-pub/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach Proof 8. Check your connection and try again.');
  }

  const json = await res.json().catch(() => ({}));
  if (res.ok && json?.verified) return json as SignInResponse;

  if (res.status === 401 || res.status === 403) {
    throw new Error('Incorrect email or password.');
  }
  if (res.status >= 500) {
    throw new Error('Proof 8 is not responding right now. Please try again in a moment.');
  }
  throw new Error('Could not sign in. Please try again.');
};

export const signInWithPassword = (email: string, password: string) =>
  post({ type: 'email', ident: email.trim().toLowerCase(), password });

export const signInWithGoogle = (email: string, firebaseIdToken: string) =>
  post({ type: 'google', ident: email.trim().toLowerCase(), token: firebaseIdToken });
