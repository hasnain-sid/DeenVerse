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
import { useForgotPassword } from '../../src/hooks/useAuth';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { spacing, fontSize } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const mutation = useForgotPassword();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    mutation.mutate(email.trim(), {
      onSuccess: () => setSent(true),
      onError: () =>
        Alert.alert('Error', 'Could not send reset email. Try again.'),
    });
  };

  if (sent) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: c.background }]}>
        <Ionicons name="mail-outline" size={64} color={c.primary} />
        <Text style={[styles.sentTitle, { color: c.foreground }]}>Check your email</Text>
        <Text style={[styles.sentSubtitle, { color: c.mutedForeground }]}>
          We sent a password reset link to {email}
        </Text>
        <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={c.foreground} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: c.foreground }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
          Enter your email and we'll send you a reset link
        </Text>

        <Input
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          error={error}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button
          title="Send Reset Link"
          onPress={handleSubmit}
          loading={mutation.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: 60,
  },
  backBtn: {
    marginBottom: spacing['3xl'],
    padding: spacing.xs,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing['3xl'],
    lineHeight: 20,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
    gap: spacing.lg,
  },
  sentTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  sentSubtitle: {
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
});
