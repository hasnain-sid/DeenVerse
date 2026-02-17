import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin, useRegister } from './useAuth';
import toast from 'react-hot-toast';

// ── Validation Schemas ───────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be under 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be under 128 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// ── Password Strength Indicator ──────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase', met: /[A-Z]/.test(password) },
    { label: 'Contains special char', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  const strength = checks.filter((c) => c.met).length;
  const colors = ['bg-destructive', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength - 1] : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength: <span className="font-medium">{labels[strength - 1] || 'Too short'}</span>
      </p>

      {/* Requirements list */}
      <div className="space-y-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5 text-xs">
            {check.met ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground/50" />
            )}
            <span className={check.met ? 'text-foreground' : 'text-muted-foreground'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Field Error Message ──────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ── Main Component ───────────────────────────────────────────────────

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // ── Login Form ─────────────────────────────
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // ── Register Form ──────────────────────────
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', username: '', email: '', password: '', confirmPassword: '' },
    mode: 'onChange', // Real-time validation feedback
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created! Please sign in.');
      setIsLogin(true);
      loginForm.setValue('email', data.email);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
    setShowConfirm(false);
  };

  const isPending = isLogin ? loginMutation.isPending : registerMutation.isPending;

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold">
              D
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Sign in to your DeenVerse account'
              : 'Join the community of knowledge seekers'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLogin ? (
            /* ── Login Form ──────────────────────────── */
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="login-email">
                  Email
                </label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  {...loginForm.register('email')}
                  aria-invalid={!!loginForm.formState.errors.email}
                />
                <FieldError message={loginForm.formState.errors.email?.message} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                    aria-invalid={!!loginForm.formState.errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={loginForm.formState.errors.password?.message} />
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* ── Register Form ───────────────────────── */
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reg-name">
                  Full Name
                </label>
                <Input
                  id="reg-name"
                  placeholder="Your full name"
                  {...registerForm.register('name')}
                  aria-invalid={!!registerForm.formState.errors.name}
                />
                <FieldError message={registerForm.formState.errors.name?.message} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reg-username">
                  Username
                </label>
                <Input
                  id="reg-username"
                  placeholder="Choose a username"
                  {...registerForm.register('username')}
                  aria-invalid={!!registerForm.formState.errors.username}
                />
                <FieldError message={registerForm.formState.errors.username?.message} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reg-email">
                  Email
                </label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  {...registerForm.register('email')}
                  aria-invalid={!!registerForm.formState.errors.email}
                />
                <FieldError message={registerForm.formState.errors.email?.message} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reg-password">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerForm.register('password')}
                    aria-invalid={!!registerForm.formState.errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={registerForm.formState.errors.password?.message} />
                <PasswordStrength password={registerForm.watch('password')} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reg-confirm">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerForm.register('confirmPassword')}
                    aria-invalid={!!registerForm.formState.errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={registerForm.formState.errors.confirmPassword?.message} />
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
