import { useFonts } from 'expo-font';
import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_400Regular_Italic,
  AtkinsonHyperlegible_700Bold,
  AtkinsonHyperlegible_700Bold_Italic,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider } from '../lib/AuthContext';
import { colors } from '../lib/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_400Regular_Italic,
    AtkinsonHyperlegible_700Bold,
    AtkinsonHyperlegible_700Bold_Italic,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brandDark} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
