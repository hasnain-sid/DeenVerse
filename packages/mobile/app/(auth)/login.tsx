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
import { useLogin } from '../../src/hooks/useAuth';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { spacing, fontSize } from '../../src/theme';

export default function LoginScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          router.replace('/(tabs)');
        },
        onError: (err: any) => {
          Alert.alert(
            'Login Failed',
            err.response?.data?.message ?? 'Invalid credentials',
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
        {/* Logo */}
        <View style={styles.logoSection}>
          <Text style={[styles.logo, { color: c.primary }]}>☪</Text>
          <Text style={[styles.appName, { color: c.foreground }]}>DeenVerse</Text>
          <Text style={[styles.tagline, { color: c.mutedForeground }]}>
            Islamic Knowledge & Community
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotLink}
          >
            <Text style={{ color: c.primary, fontSize: fontSize.sm }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loginMutation.isPending}
            style={{ marginTop: spacing.md }}
          />
        </View>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={{ color: c.mutedForeground }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={{ color: c.primary, fontWeight: '600' }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  logo: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: fontSize['3xl'],
    fontWeight: '900',
  },
  tagline: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  form: {
    marginBottom: spacing.xl,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
