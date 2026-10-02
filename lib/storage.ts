import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION = 'p8.session';

export type Proof8Session = {
  source: 'proof8';
  token: string;
  accountId: string;
  companyId?: string;
};

export type FirebaseSession = {
  source: 'firebase';
  uid: string;
  email: string;
  name?: string;
  provider: string;
};

export type Session = Proof8Session | FirebaseSession;

const store =
  Platform.OS === 'web'
    ? {
        get: async (k: string) => localStorage.getItem(k),
        set: async (k: string, v: string) => localStorage.setItem(k, v),
        remove: async (k: string) => localStorage.removeItem(k),
      }
    : {
        get: (k: string) => SecureStore.getItemAsync(k),
        set: (k: string, v: string) => SecureStore.setItemAsync(k, v),
        remove: (k: string) => SecureStore.deleteItemAsync(k),
      };

export const saveSession = async (s: Session) => {
  await store.set(SESSION, JSON.stringify(s));
};

export const loadSession = async (): Promise<Session | null> => {
  const raw = await store.get(SESSION);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    return parsed?.source ? parsed : null;
  } catch {
    await store.remove(SESSION);
    return null;
  }
};

export const clearSession = async () => {
  await store.remove(SESSION);
};
