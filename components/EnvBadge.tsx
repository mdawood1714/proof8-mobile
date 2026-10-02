import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../lib/theme';

export const EnvBadge = ({ label = 'DEVELOPMENT ENVIRONMENT' }: { label?: string }) => (
  <View style={styles.pill}>
    <Text style={styles.text}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderColor: colors.envBadgeBorder,
    backgroundColor: colors.envBadgeBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.4,
    color: colors.envBadgeText,
  },
});
