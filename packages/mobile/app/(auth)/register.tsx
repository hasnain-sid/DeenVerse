import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRegister } from '../../src/hooks/useAuth';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { spacing, fontSize } from '../../src/theme';

export default function RegisterScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const registerMutation = useRegister();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      e.username = 'Only letters, numbers, underscores';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    registerMutation.mutate(
      {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Account created! Please sign in.', [
            { text: 'OK', onPress: () => router.replace('/(auth)/login') },
          ]);
        },
        onError: (err: any) => {
          Alert.alert(
            'Registration Failed',
            err.response?.data?.message ?? 'Please try again',
          );
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: c.foreground }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
          Join the Islamic community
        </Text>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Abu Bakr"
            value={form.name}
            onChangeText={(v) => update('name', v)}
            error={errors.name}
            autoCapitalize="words"
          />
          <Input
            label="Username"
            placeholder="abu_bakr"
            value={form.username}
            onChangeText={(v) => update('username', v)}
            error={errors.username}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Email"
            placeholder="your@email.com"
            value={form.email}
            onChangeText={(v) => update('email', v)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChangeText={(v) => update('password', v)}
            error={errors.password}
            secureTextEntry
          />
          <Input
            label="Confirm Password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChangeText={(v) => update('confirmPassword', v)}
            error={errors.confirmPassword}
            secureTextEntry
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={registerMutation.isPending}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <View style={styles.loginRow}>
          <Text style={{ color: c.mutedForeground }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: c.primary, fontWeight: '600' }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: 80,
    paddingBottom: spacing['4xl'],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing['3xl'],
  },
  form: {
    marginBottom: spacing.xl,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
