import { extra } from './appConfig';

export const GATEWAY = 'https://dev-api.proofworks.com';

export const GOOGLE_WEB_CLIENT_ID: string = extra.googleWebClientId ?? '';

export const GOOGLE_IOS_CLIENT_ID: string = extra.googleIosClientId ?? '';

export type SsoProvider = {
  id: string;
  label: string;
};

export const SSO_PROVIDERS: Record<string, SsoProvider> = extra.ssoProviders ?? {};

export const ssoProviderForEmail = (email: string): SsoProvider | null => {
  const domain = email.trim().toLowerCase().split('@')[1];
  if (!domain) return null;
  return SSO_PROVIDERS[domain] ?? null;
};
