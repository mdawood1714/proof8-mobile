import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FilledButton } from '../components/FilledButton';
import { Unauthorized } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { colors, fontFamily, radii } from '../lib/theme';

type Profile = {
  name?: string;
  company?: string;
};

export default function Home() {
  const { session, refresh, signOut } = useAuth();
  const [callState, setCallState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [profile, setProfile] = useState<Profile>({});
  const [error, setError] = useState<string | null>(null);

  const isProof8 = session?.source === 'proof8';

  useEffect(() => {
    if (!session) {
      router.replace('/sign-in');
      return;
    }

    if (session.source === 'firebase') {
      setProfile({ name: session.name ?? session.email });
      setCallState('ok');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const result = await refresh();
        if (!cancelled) {
          setProfile({
            name: result?.public_name ?? result?.account_name,
            company: result?.company?.company_name,
          });
          setCallState('ok');
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Unauthorized) {
          router.replace('/sign-in');
          return;
        }
        setError(e instanceof Error ? e.message : 'Request failed.');
        setCallState('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.source]);

  const onSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>SIGNED IN</Text>

      <View style={styles.card}>
        {callState === 'loading' ? (
          <ActivityIndicator color={colors.brandDark} />
        ) : callState === 'error' ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Text style={styles.label}>Signed in as</Text>
            <Text style={styles.value}>{profile.name ?? '—'}</Text>

            <Text style={styles.label}>Signed in with</Text>
            <Text style={styles.value}>
              {session?.source === 'firebase' ? session.provider : 'Proof 8 password'}
            </Text>

            {isProof8 ? (
              <>
                <Text style={styles.label}>Company</Text>
                <Text style={styles.value}>{profile.company ?? '—'}</Text>
              </>
            ) : (
              <>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>
                  {session?.source === 'firebase' ? session.email : '—'}
                </Text>
              </>
            )}
          </>
        )}
      </View>

      {!isProof8 && callState === 'ok' ? (
        <Text style={styles.note}>
          Identity verified against our own provider. Proof 8 data is not loaded here because its API
          only accepts tokens issued by its own Firebase project.
        </Text>
      ) : null}

      <FilledButton label="SIGN OUT" onPress={onSignOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
    paddingTop: 40,
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
    marginBottom: 20,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 12,
  },
  value: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.error,
  },
  note: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: 20,
  },
});
