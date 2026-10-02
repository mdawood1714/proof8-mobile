# Proof 8 Mobile: authentication skeleton

A React Native (Expo) app that signs in to Proof 8 and demonstrates two further ways in: Google, and company single sign-on (SSO) where a customer brings their own identity provider. It is a skeleton: authentication works end to end, and nothing else does.

- Expo SDK 57, React Native 0.86, `expo-router`
- One codebase for iOS, Android and web
- Talks to the existing Proof 8 backend (`https://dev-api.proofworks.com`); no new backend

## Sign-in methods

| Method | How it works | Result |
|---|---|---|
| **Proof 8 account** | Email and password posted to the Proof 8 backend | A Proof 8 session: the same token the web app uses |
| **Google** | Firebase Authentication with Google | A Firebase session (identity only, see below) |
| **Company single sign-on** | Email domain is matched to an identity provider (demonstrated with Okta) and signs in through a Firebase OIDC provider | A Firebase session (identity only) |

The sign-in screen shows all three on the first screen. For company SSO the user enters a work email and the app routes it to that company's login. If someone types a company email into the main email field, they are routed to SSO as well.

## How it works

### Proof 8 password sign-in

This matches the sign-in request the Proof 8 web app (`dev-app.proofworks.com`) makes.

```http
POST https://dev-api.proofworks.com/accounts-pub/signin
Content-Type: application/json

{ "type": "email", "ident": "<email>", "password": "<password>" }
```

The response body carries `Authorization` (a JWT, 10 hours), `account_id`, `company_id`, `permission` and `company`. Every later request sends:

```http
Authorization: <raw JWT>                       (no "Bearer " prefix)
SW-Scope: {"Company":"<company_id>","AccountId":"<account_id>"}
```

- The API also sets a `metacask-auth` cookie, but the gateway accepts the raw `Authorization` header, so the app does not handle cookies.
- The company is bound into the JWT. Switching company means getting a new token. This skeleton signs in to the user's last company and has no switcher.
- `POST /accounts/refresh` rotates the token; the app stores the new one.
- Tokens are kept in the platform keychain (`expo-secure-store`); the browser build falls back to `localStorage`.
- A `401` clears the session and returns to sign-in.

### Two kinds of session

`lib/storage.ts` stores a discriminated union:

```ts
type Session = Proof8Session | FirebaseSession;   // source: 'proof8' | 'firebase'
```

Proof 8's authentication service verifies Google sign-in tokens against **its own** Firebase project and looks the person up under a Google identity. A token issued by this demo's separate Firebase project is therefore expected to be rejected by the Proof 8 API (this has not been tested against the live API). So Google and SSO sessions here prove identity but do not load Proof 8 data, and the Home screen says so. Calling a Proof 8 endpoint with such a session throws `NotAProof8Session` instead of sending a request that would fail.

To connect them to the real backend, the backend would need to accept tokens from the additional Firebase project (or the customer's provider), and map the identity to a Proof 8 person.

### Company SSO

```
email -> domain -> provider id (oidc.<name>) -> Firebase OIDC sign-in -> customer's identity provider
```

- The domain-to-provider mapping lives in `app.json` under `extra.ssoProviders`:

  ```json
  "ssoProviders": {
    "acme-distillery.com": { "id": "oidc.okta-demo", "label": "Okta" }
  }
  ```

- Onboarding a customer is one Firebase OIDC provider plus one mapping line. No app logic changes.
- Firebase supports OIDC and SAML providers through Identity Platform. Okta was used for the demo; Microsoft Entra, Auth0 and other OIDC providers use the same mechanism.
- **In a real product this mapping should come from the backend** (per-tenant configuration), not be compiled into the app. Here it is static so the demo needs no server work.
- Where a domain is mapped, the personal Google option is hidden on that step, because the company has chosen how its people sign in.

## Status

Verified:

- Proof 8 password sign-in on a physical Android device (EAS build) and in the browser, including session restore and sign-out
- Google sign-in and Okta SSO in the browser
- Typecheck is clean (`npx tsc --noEmit`)

Not yet verified:

- Google sign-in and SSO in the **native** apps. The code is in place (`@react-native-firebase/auth`, `@react-native-google-signin/google-signin`), but it has not been run on a device. The native SSO path (`signInWithRedirect`) is the least certain part.
- **iOS** has not been built. Everything is configured for it (bundle ID, Firebase plist, Google client ID). In Expo Go only password sign-in can work, because Expo Go cannot load the native Firebase modules. The app is written to show a message instead of crashing there (native modules are loaded lazily), but that has not been run in Expo Go on a device; only the iOS bundle compiling was checked.
- No automated tests.

Not implemented:

- Sign in with Apple (the App Store requires it when third-party sign-in is offered, and the Proof 8 backend does not support that identity type yet)
- Passkeys
- Company switcher
- Linking Google/SSO identities to Proof 8 users (see above)

## Running it

```bash
npm install
```

| Goal | Command | Notes |
|---|---|---|
| Browser (fastest to iterate) | `npx expo start --web` | All three methods work |
| Expo Go | `npx expo start` | Password sign-in only |
| Installed Android build | `npx eas-cli build --profile preview --platform android` | Standalone APK, opens directly |

Do not use the `development` profile for hand-off builds: it produces a dev client that waits for a Metro server.

## Configuration

Static settings are in `app.json`; sensitive native files are not committed.

| Setting | Where | Purpose |
|---|---|---|
| API gateway | `lib/config.ts` (`GATEWAY`) | Proof 8 backend |
| `extra.googleWebClientId`, `extra.googleIosClientId` | `app.json` | Native Google Sign-In |
| `extra.firebaseWebConfig` | `app.json` | Firebase for the browser build |
| `extra.ssoProviders` | `app.json` | Email domain to SSO provider |
| `google-services.json`, `GoogleService-Info.plist` | `firebase/` (git-ignored) | Native Firebase config |

`lib/appConfig.ts` reads `extra` straight from `app.json`. On web, Expo strips custom keys out of the runtime manifest, so `expo-constants` cannot be used for these.

`app.config.js` reads the two Firebase files from `GOOGLE_SERVICES_JSON` and `GOOGLE_SERVICES_INFO_PLIST` when they are set, and falls back to `firebase/` locally. EAS only uploads files tracked by git, so the files are provided as EAS file variables:

```bash
npx eas-cli env:set --name GOOGLE_SERVICES_JSON --type file \
  --value ./firebase/google-services.json --visibility secret \
  --scope project --environment development --environment preview --environment production
# repeat for GOOGLE_SERVICES_INFO_PLIST with ./firebase/GoogleService-Info.plist
```

Everything in `extra` ships inside the app, so it must not contain secrets. The identity provider's client secret lives only in the Firebase console.

## Setting up your own Firebase and identity provider

1. **Firebase project**: add an Android app (`com.proof8.mobile`) and an iOS app (same bundle ID), enable the Google sign-in provider, and download both config files into `firebase/`.
2. **Android SHA-1**: get it with `npx eas-cli credentials -p android` (Keystore), add it to the Firebase Android app, then re-download `google-services.json`. Without it Google sign-in fails with `DEVELOPER_ERROR`. Do not generate a new keystore, or the SHA-1 changes.
3. **Web app**: add a Web app in Firebase and put its config in `extra.firebaseWebConfig`.
4. **OIDC providers need Identity Platform**: upgrade Authentication to "Firebase Authentication with Identity Platform". On the free Spark plan OIDC and SAML are limited to **2 daily active users**; Blaze removes that limit.
5. **Identity provider** (Okta shown): create an OIDC *Web Application*, authorization code grant, with the sign-in redirect URI `https://<firebase-project-id>.firebaseapp.com/__/auth/handler`.
6. **Firebase**: Authentication, Sign-in method, add an OpenID Connect provider (code flow) with the client ID, client secret and issuer. The provider ID becomes `oidc.<name>`.
7. **Map the domain** in `extra.ssoProviders`, then rebuild (the mapping is compiled in).

### Gotchas encountered with Okta

- `access_denied` with *"policy requirements could not be satisfied by the user's available authenticator enrollments"*: the application's authentication policy demanded an authenticator the user lacks (the catch-all rule required a phishing-resistant factor). Give the app a policy that allows a password.
- `Policy evaluation failed for this request`: the **authorization server** (`/oauth2/default`) had no access policy. Add a policy covering the client with a rule allowing the authorization code grant and the `openid`, `email` and `profile` scopes.
- The Okta System Log (filtered by the app's name) states the exact reason for a denial.

## Project structure

```
app/                  Screens (expo-router): index (session gate), sign-in, home
components/           FilledButton, OutlinedButton, TextField, Logo, EnvBadge, GoogleIcon
lib/
  AuthContext.tsx     Session state and the three sign-in actions
  signIn.ts           Proof 8 sign-in requests
  api.ts              Authenticated fetch (headers, 401 handling)
  storage.ts          Session types and secure storage
  googleSignIn.ts     Google via Firebase (native); .web.ts is the browser version
  ssoSignIn.ts        Company SSO via Firebase OIDC (native); .web.ts is the browser version
  firebaseWeb.ts      Firebase JS SDK setup for the browser
  runtime.ts          Expo Go detection
  config.ts           Gateway URL, Google client IDs, SSO domain lookup
  appConfig.ts        Reads extra from app.json
  theme.ts            Colours, radii, fonts
app.config.js         Resolves Firebase file paths from EAS file variables
eas.json              Build profiles
firebase/             Local Firebase config (git-ignored)
```

Native and browser implementations share names; Metro picks `.web.ts` in the browser and the plain file on devices. Native Firebase modules are loaded lazily so the app still starts in Expo Go.

## Known limitations

- The SSO domain mapping is compiled into the app (see above)
- Google and SSO sessions carry identity only (see above)
- The Okta demo organisation and the Firebase Spark plan cap how many people can test SSO per day
- The Firebase project and Okta organisation used here are demo resources, not Proof 8's
