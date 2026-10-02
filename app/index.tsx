import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { colors } from '../lib/theme';

export default function Index() {
  const { session, restoring } = useAuth();

  if (restoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brandDark} />
      </View>
    );
  }

  return <Redirect href={session ? '/home' : '/sign-in'} />;
}
