import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { signInWithPassword } from './signIn';
import {
  configureGoogleSignIn,
  signInWithGoogle as googleFlow,
  signOutOfGoogle,
} from './googleSignIn';
import { signInWithSso as ssoFlow } from './ssoSignIn';
import { SsoProvider } from './config';
import { saveSession, loadSession, clearSession, Proof8Session, Session } from './storage';

type AuthContextValue = {
  session: Session | null;
  restoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithSso: (provider: SsoProvider) => Promise<void>;
  refresh: () => Promise<any>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    configureGoogleSignIn();
    loadSession().then((s) => {
      setSession(s);
      setRestoring(false);
    });
  }, []);

  const apply = async (s: Session) => {
    await saveSession(s);
    setSession(s);
  };

  const applyProof8 = (r: { Authorization: string; account_id: string; company_id?: string }) =>
    apply({
      source: 'proof8',
      token: r.Authorization,
      accountId: r.account_id,
      companyId: r.company_id,
    } satisfies Proof8Session);

  const signIn = async (email: string, password: string) => {
    const r = await signInWithPassword(email, password);
    await applyProof8(r);
  };

  const signInWithGoogle = async () => {
    const s = await googleFlow();
    await apply(s);
  };

  const signInWithSso = async (provider: SsoProvider) => {
    const s = await ssoFlow(provider);
    await apply(s);
  };

  const refresh = async () => {
    const r = await api('/accounts/refresh', { method: 'POST' });
    await applyProof8(r);
    return r;
  };

  const signOut = async () => {
    await signOutOfGoogle();
    await clearSession();
    setSession(null);
  };

  return (
    <Ctx.Provider
      value={{ session, restoring, signIn, signInWithGoogle, signInWithSso, refresh, signOut }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
