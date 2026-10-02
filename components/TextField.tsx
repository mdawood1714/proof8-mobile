import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fontFamily, radii } from '../lib/theme';

type Props = TextInputProps & {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
};

export const TextField = ({ label, required, icon, style, onFocus, onBlur, editable, ...inputProps }: Props) => {
  const [focused, setFocused] = useState(false);
  const locked = editable === false;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <View style={[styles.field, focused && styles.fieldFocused, locked && styles.fieldLocked]}>
        <TextInput
          style={[styles.input, Platform.OS === 'web' && styles.noWebOutline, locked && styles.inputLocked, style]}
          placeholderTextColor={colors.textDisabled}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {icon}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  required: {
    color: colors.error,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: radii.input,
    paddingHorizontal: 14,
  },
  fieldFocused: {
    borderColor: colors.brandDark,
    shadowColor: colors.brandDark,
    shadowOpacity: 0.25,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  fieldLocked: {
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text,
  },
  inputLocked: {
    color: colors.textMuted,
  },
  noWebOutline: {
    outlineStyle: 'none',
  } as object,
});
