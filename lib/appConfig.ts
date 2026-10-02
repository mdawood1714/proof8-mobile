import appJson from '../app.json';

export const extra = (appJson.expo.extra ?? {}) as {
  googleWebClientId?: string;
  googleIosClientId?: string;
  ssoProviders?: Record<string, { id: string; label: string }>;
  firebaseWebConfig?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    appId?: string;
    messagingSenderId?: string;
  };
};
