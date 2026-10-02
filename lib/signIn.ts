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
  const res = await fetch(`${GATEWAY}/accounts-pub/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.verified) {
    throw new Error(json?.message ?? 'Could not sign in. Check your email and password.');
  }
  return json as SignInResponse;
};

export const signInWithPassword = (email: string, password: string) =>
  post({ type: 'email', ident: email.trim().toLowerCase(), password });

export const signInWithGoogle = (email: string, firebaseIdToken: string) =>
  post({ type: 'google', ident: email.trim().toLowerCase(), token: firebaseIdToken });
