import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, fontFamily, radii } from '../lib/theme';

type Props = {
  label: string;
  subtitle?: string;
  onPress: () => void;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
};

export const OutlinedButton = ({ label, subtitle, onPress, icon, loading, disabled }: Props) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || loading}
    accessibilityRole="button"
    accessibilityLabel={subtitle ? `${label}. ${subtitle}` : label}
    style={({ pressed }) => [
      styles.button,
      subtitle ? styles.row : styles.centered,
      (disabled || loading) && styles.disabled,
      pressed && !disabled && !loading && styles.pressed,
    ]}
  >
    {subtitle ? (
      <>
        <View style={styles.iconBox}>{icon}</View>
        <View style={styles.text}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <ChevronRight size={18} color={colors.textMuted} />
        )}
      </>
    ) : loading ? (
      <ActivityIndicator color={colors.text} />
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: radii.button,
  },
  centered: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  pressed: {
    backgroundColor: colors.passkeyBg,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
});
