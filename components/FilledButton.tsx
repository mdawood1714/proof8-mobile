import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radii } from '../lib/theme';

type Props = {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
};

export const FilledButton = ({ label, onPress, icon, loading, disabled }: Props) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || loading}
    style={({ pressed }) => [
      styles.button,
      (disabled || loading) && styles.disabled,
      pressed && !disabled && !loading && styles.pressed,
    ]}
  >
    {loading ? (
      <ActivityIndicator color={colors.onBrand} />
    ) : (
      <View style={styles.content}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.brand,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.brandDark,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    letterSpacing: 0.3,
    color: colors.onBrand,
  },
});
