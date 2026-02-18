import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  User,
  Palette,
  Lock,
  BookOpen,
  Bell,
  Sun,
  Moon,
  Monitor,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { Link } from 'react-router-dom';

// ── Schemas ──────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  bio: z.string().max(160, 'Bio must be 160 characters or less'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ── Section types ────────────────────────────────────

type Section = 'profile' | 'appearance' | 'notifications' | 'reading' | 'password';

const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'password', label: 'Password', icon: Lock },
];

// ── Field Error ──────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ── Main Component ───────────────────────────────────

export function SettingsPage() {
  const [active, setActive] = useState<Section>('profile');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 md:hidden">
          <Link to="/profile">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:w-48 shrink-0">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                active === s.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {active === 'profile' && <ProfileSection />}
          {active === 'appearance' && <AppearanceSection />}
          {active === 'notifications' && <NotificationsSection />}
          {active === 'reading' && <ReadingSection />}
          {active === 'password' && <PasswordSection />}
        </div>
      </div>
    </div>
  );
}

// ── Profile Section ──────────────────────────────────

function ProfileSection() {
  const { user, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      username: user?.username ?? '',
      bio: user?.bio ?? '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const res = await api.put('/user/profile', data);
      setUser(res.data.user);
      reset(data); // reset form dirty state with new values
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Please <Link to="/login" className="text-primary underline">sign in</Link> to edit your profile.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-sm font-medium mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <Input {...register('name')} className="mt-1" />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Username</label>
            <Input {...register('username')} className="mt-1" />
            <FieldError message={errors.username?.message} />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="Tell others about yourself..."
            />
            <FieldError message={errors.bio?.message} />
          </div>

          <Button type="submit" disabled={!isDirty || saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Appearance Section ───────────────────────────────

const themes: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

function AppearanceSection() {
  const { theme, setTheme, fontSize, setFontSize, fontFamily, setFontFamily } = useThemeStore();

  return (
    <div className="space-y-6">
      {/* Theme */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium mb-4">Theme</h2>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors',
                  theme === t.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-foreground/20'
                )}
              >
                <t.icon className="h-5 w-5" />
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font size */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium mb-4">Font Size</h2>
          <div className="flex items-center gap-4 max-w-xs">
            <span className="text-xs text-muted-foreground w-6">A</span>
            <input
              type="range"
              min={12}
              max={22}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-lg text-muted-foreground w-6">A</span>
            <span className="text-xs text-muted-foreground tabular-nums w-8">{fontSize}px</span>
          </div>
        </CardContent>
      </Card>

      {/* Font family */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium mb-4">Font Family</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md">
            {['Inter', 'Georgia', 'Merriweather', 'Lora', 'System'].map((font) => (
              <button
                key={font}
                onClick={() => setFontFamily(font)}
                className={cn(
                  'rounded-lg border px-4 py-3 text-sm transition-colors',
                  fontFamily === font
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-foreground/20'
                )}
                style={{ fontFamily: font === 'System' ? 'system-ui' : font }}
              >
                {font}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Notifications Section ────────────────────────────

function NotificationsSection() {
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe } = usePushNotifications();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium mb-4">Push Notifications</h2>

          {!isSupported ? (
            <p className="text-sm text-muted-foreground">
              Push notifications are not supported in your browser.
            </p>
          ) : permission === 'denied' ? (
            <p className="text-sm text-muted-foreground">
              Push notifications are blocked. Please enable them in your browser settings.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get notified about new likes, replies, followers, and live streams — even when DeenVerse is closed.
              </p>
              <div className="flex items-center gap-3">
                {isSubscribed ? (
                  <>
                    <span className="flex items-center gap-1.5 text-sm text-green-600">
                      <Bell className="h-4 w-4" />
                      Push notifications enabled
                    </span>
                    <Button variant="ghost" size="sm" onClick={unsubscribe}>
                      Disable
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={subscribe} className="gap-1.5">
                    <Bell className="h-4 w-4" />
                    Enable Push Notifications
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Reading Section ──────────────────────────────────

function ReadingSection() {
  const { arabicFont, setArabicFont, hadithLanguage, setHadithLanguage } = useThemeStore();

  return (
    <div className="space-y-6">
      {/* Language preference */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium mb-4">Hadith Language</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md">
            {[
              { value: 'en', label: 'English' },
              { value: 'ar', label: 'العربية' },
              { value: 'ur', label: 'اردو' },
              { value: 'fr', label: 'Français' },
              { value: 'tr', label: 'Türkçe' },
              { value: 'hi', label: 'हिन्दी' },
            ].map((lang) => (
              <button
                key={lang.value}
                onClick={() => setHadithLanguage(lang.value)}
                className={cn(
                  'rounded-lg border px-4 py-3 text-sm transition-colors',
                  hadithLanguage === lang.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-foreground/20'
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Arabic font */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-sm font-medium mb-4">Arabic Font</h2>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {['Amiri', 'Scheherazade New', 'Noto Naskh Arabic', 'Traditional Arabic'].map(
              (font) => (
                <button
                  key={font}
                  onClick={() => setArabicFont(font)}
                  className={cn(
                    'rounded-lg border px-4 py-3 text-sm transition-colors',
                    arabicFont === font
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-foreground/20'
                  )}
                >
                  <span style={{ fontFamily: font }} className="block text-base mb-1" dir="rtl">
                    بِسْمِ اللَّهِ
                  </span>
                  <span className="text-xs">{font}</span>
                </button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Password Section ─────────────────────────────────

function PasswordSection() {
  const { isAuthenticated } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordForm) => {
    setSaving(true);
    try {
      await api.put('/user/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Please <Link to="/login" className="text-primary underline">sign in</Link> to change your password.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-sm font-medium mb-4">Change Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Current Password</label>
            <Input type="password" {...register('currentPassword')} className="mt-1" />
            <FieldError message={errors.currentPassword?.message} />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">New Password</label>
            <Input type="password" {...register('newPassword')} className="mt-1" />
            <FieldError message={errors.newPassword?.message} />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
            <Input type="password" {...register('confirmPassword')} className="mt-1" />
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          <Button type="submit" disabled={saving} size="sm">
            <Lock className="h-4 w-4 mr-2" />
            {saving ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
