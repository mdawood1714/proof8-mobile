import { GATEWAY } from './config';
import { loadSession, clearSession } from './storage';

export class Unauthorized extends Error {}

export class NotAProof8Session extends Error {
  constructor() {
    super('This screen needs a Proof 8 session. Google and Okta sign-in are demonstrated against our own identity provider, so they do not carry a Proof 8 token.');
  }
}

export const api = async (path: string, init: RequestInit = {}) => {
  const session = await loadSession();
  if (!session) throw new Unauthorized('No session');
  if (session.source !== 'proof8') throw new NotAProof8Session();

  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: session.token,
      'SW-Scope': JSON.stringify({
        Company: session.companyId ?? '',
        AccountId: session.accountId,
      }),
      ...(init.headers ?? {}),
    },
  });

  if (res.status === 401) {
    await clearSession();
    throw new Unauthorized('Session expired');
  }
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
};
