# Proof 8 Mobile

A React Native (Expo) app with three ways to sign in to Proof 8. One codebase for iOS, Android and web, built on `expo-router`. It uses the existing Proof 8 backend (`https://dev-api.proofworks.com`); there is no backend in this repo.

## Sign-in methods

| Method | How it works |
|---|---|
| **Proof 8 account** | Email and password sent to the Proof 8 backend |
| **Google** | Firebase Authentication |
| **Company single sign-on** | The email domain selects the company's identity provider (Okta in the demo), through a Firebase OIDC provider |

## How it works

**Proof 8 sign-in** matches the web app's request:

```http
POST /accounts-pub/signin
{ "type": "email", "ident": "<email>", "password": "<password>" }
```

The response carries a JWT (`Authorization`), `account_id` and `company_id`. Later requests send `Authorization: <jwt>` (no `Bearer` prefix) and `SW-Scope: {"Company":…,"AccountId":…}`. The token is kept in the device keychain (`expo-secure-store`), and a `401` returns the user to sign-in.

**Company SSO** maps the email domain to an OIDC provider in `app.json`:

```json
"ssoProviders": { "acme-distillery.com": { "id": "oidc.okta-demo", "label": "Okta" } }
```

Adding a customer is one Firebase OIDC provider plus one line here. In production this mapping should come from the backend.

**Sessions** are either `proof8` or `firebase`. The Proof 8 API accepts tokens from its own Firebase project, so Google and SSO sessions here carry identity only and do not load Proof 8 data.

## Run

```bash
npm install
npx expo start --web                                          # browser
npx eas-cli build --profile preview --platform android       # installable Android build
npx expo export -p web && npx firebase-tools deploy --only hosting   # web build on Firebase Hosting
```

Expo Go (`npx expo start --go`) supports Proof 8 password sign-in only, because it cannot load the native Firebase modules.

## Configuration

- `app.json` → `extra`: `googleWebClientId`, `googleIosClientId`, `firebaseWebConfig`, `ssoProviders`. These ship inside the app, so keep secrets out.
- `firebase/google-services.json` and `firebase/GoogleService-Info.plist` are git-ignored. For EAS builds they are supplied as file variables (`GOOGLE_SERVICES_JSON`, `GOOGLE_SERVICES_INFO_PLIST`), which `app.config.js` picks up.
- OIDC providers need Firebase Authentication with Identity Platform. The identity provider's client secret lives only in the Firebase console.
- Android Google sign-in needs the build's SHA-1 (`npx eas-cli credentials -p android`) registered in Firebase.

## Structure

```
app/          screens: index (session gate), sign-in, home
components/   buttons, text field, logo
lib/          AuthContext, signIn, api, storage, googleSignIn, ssoSignIn,
              config, appConfig, theme   (.web.ts files are the browser versions)
app.config.js resolves the Firebase file paths
```

## Not included

Sign in with Apple, passkeys, a company switcher, and linking Google/SSO identities to Proof 8 users.
