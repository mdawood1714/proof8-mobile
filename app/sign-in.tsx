import { useState } from 'react';
import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, Building2, CircleUserRound, Eye, EyeOff, UserKey } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EnvBadge } from '../components/EnvBadge';
import { FilledButton } from '../components/FilledButton';
import { GoogleIcon } from '../components/GoogleIcon';
import { Logo } from '../components/Logo';
import { OutlinedButton } from '../components/OutlinedButton';
import { TextField } from '../components/TextField';
import { useAuth } from '../lib/AuthContext';
import { ssoProviderForEmail } from '../lib/config';
import { GoogleCancelled } from '../lib/googleSignIn';
import { SsoCancelled } from '../lib/ssoSignIn';
import { colors, fontFamily, radii } from '../lib/theme';

type Step = 'email' | 'password' | 'sso' | 'sso-lookup';

export default function SignIn() {
  const { signIn, signInWithGoogle, signInWithSso } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [step, setStep] = useState<Step>('email');

  const provider = ssoProviderForEmail(email);
  const domain = email.trim().toLowerCase().split('@')[1] ?? '';
  const busy = loading || googleLoading || ssoLoading;

  const onContinue = () => {
    setError(null);
    if (!email.trim()) {
      setError('Enter your email to continue.');
      return;
    }
    setStep(provider ? 'sso' : 'password');
  };

  const onOpenSso = () => {
    setError(null);
    setStep(provider ? 'sso' : 'sso-lookup');
  };

  const onFindCompany = () => {
    setError(null);
    if (!email.trim() || !domain) {
      setError('Enter your work email to continue.');
      return;
    }
    if (!provider) {
      setError(`Single sign-on is not set up for ${domain}. Sign in with your Proof 8 account instead.`);
      return;
    }
    setStep('sso');
  };

  const onBackToOptions = () => {
    setError(null);
    setPassword('');
    setStep('email');
  };

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/home');
    } catch (e) {
      if (e instanceof GoogleCancelled) return;
      setError(e instanceof Error ? e.message : 'Could not sign in with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSso = async () => {
    if (!provider) return;
    setError(null);
    setSsoLoading(true);
    try {
      await signInWithSso(provider);
      router.replace('/home');
    } catch (e) {
      if (e instanceof SsoCancelled) {
        setStep('email');
        return;
      }
      setError(e instanceof Error ? e.message : `Could not sign in with ${provider.label}.`);
    } finally {
      setSsoLoading(false);
    }
  };

  const emailField = (label: string, onSubmitEditing: () => void, editable: boolean) => (
    <TextField
      label={label}
      required
      value={email}
      onChangeText={setEmail}
      editable={editable}
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType="email-address"
      textContentType="emailAddress"
      returnKeyType="next"
      onSubmitEditing={onSubmitEditing}
      icon={<UserKey size={18} color={colors.textMuted} />}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={26} />
          <EnvBadge />
        </View>

        <Text style={styles.title}>SIGN IN</Text>

        <View style={styles.card}>
          {step === 'email' ? (
            <>
              <Text style={styles.sectionLabel}>PROOF 8 ACCOUNT</Text>
              {emailField('Email', onContinue, true)}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <FilledButton label="CONTINUE" onPress={onContinue} disabled={busy} />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign in with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.alternatives}>
                <OutlinedButton
                  label="Google"
                  subtitle="Your personal Google account"
                  icon={<GoogleIcon size={18} />}
                  onPress={onGoogle}
                  loading={googleLoading}
                  disabled={busy && !googleLoading}
                />
                <OutlinedButton
                  label="Company single sign-on"
                  subtitle="Okta, Microsoft or your organisation's login"
                  icon={<Building2 size={18} color={colors.envBadgeText} />}
                  onPress={onOpenSso}
                  disabled={busy}
                />
              </View>
            </>
          ) : null}

          {step === 'password' ? (
            <>
              <Text style={styles.sectionLabel}>PROOF 8 ACCOUNT</Text>
              {emailField('Email', onContinue, false)}
              <TextField
                label="Password"
                required
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={onSubmit}
                autoFocus
                icon={
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textMuted} />
                    ) : (
                      <Eye size={18} color={colors.textMuted} />
                    )}
                  </Pressable>
                }
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Text style={styles.muted}>
                Click <Text style={styles.underline}>here</Text> if you have forgotten your password.
              </Text>
              <FilledButton
                label="SIGN IN"
                icon={<CircleUserRound size={18} color={colors.onBrand} />}
                onPress={onSubmit}
                loading={loading}
              />
              <BackLink label="Use a different email or sign-in method" onPress={onBackToOptions} />
            </>
          ) : null}

          {step === 'sso-lookup' ? (
            <>
              <SsoHeader body="Enter your work email and we will send you to your company's sign-in page." />
              {emailField('Work email', onFindCompany, true)}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <FilledButton label="FIND MY COMPANY" onPress={onFindCompany} />
              <BackLink label="Back to all sign-in options" onPress={onBackToOptions} />
            </>
          ) : null}

          {step === 'sso' && provider ? (
            <>
              <SsoHeader
                body={`${domain} signs in through ${provider.label}. Your company manages this login, so there is no Proof 8 password to enter.`}
              />
              {emailField('Work email', onSso, false)}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <FilledButton
                label={`CONTINUE WITH ${provider.label.toUpperCase()}`}
                onPress={onSso}
                loading={ssoLoading}
              />
              <BackLink label="Use a different email or sign-in method" onPress={onBackToOptions} />
            </>
          ) : null}

          <Text style={styles.terms}>
            By continuing, you are indicating that you accept our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const SsoHeader = ({ body }: { body: string }) => (
  <View style={styles.ssoPanel}>
    <View style={styles.ssoHeader}>
      <Building2 size={18} color={colors.envBadgeText} />
      <Text style={styles.ssoTitle}>Company single sign-on</Text>
    </View>
    <Text style={styles.ssoBody}>{body}</Text>
  </View>
);

const BackLink = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" style={styles.backLink}>
    <ArrowLeft size={14} color={colors.textMuted} />
    <Text style={styles.backText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    letterSpacing: 1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: 12,
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.error,
    marginTop: -6,
    marginBottom: 14,
  },
  muted: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 20,
  },
  underline: {
    textDecorationLine: 'underline',
    color: colors.text,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  alternatives: {
    gap: 10,
  },
  ssoPanel: {
    backgroundColor: colors.ssoBg,
    borderWidth: 1,
    borderColor: colors.ssoBorder,
    borderRadius: radii.card,
    padding: 14,
    marginBottom: 18,
    gap: 6,
  },
  ssoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ssoTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.envBadgeText,
  },
  ssoBody: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 16,
  },
  backText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  terms: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 20,
  },
});
