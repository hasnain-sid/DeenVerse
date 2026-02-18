import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ── Schema ───────────────────────────────────────────

const editProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  bio: z.string().max(200, 'Bio must be at most 200 characters').optional(),
  avatar: z.string().optional(),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

// ── Props ────────────────────────────────────────────

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

// ── Component ────────────────────────────────────────

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { user, setUser } = useAuthStore();
  const [bioCount, setBioCount] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      username: user?.username ?? '',
      bio: user?.bio ?? '',
      avatar: user?.avatar ?? '',
    },
  });

  // Reset form when modal opens with latest user data
  useEffect(() => {
    if (open && user) {
      reset({
        name: user.name,
        username: user.username,
        bio: user.bio ?? '',
        avatar: user.avatar ?? '',
      });
      setBioCount(user.bio?.length ?? 0);
    }
  }, [open, user, reset]);

  // Watch bio for character count
  const bioValue = watch('bio');
  useEffect(() => {
    setBioCount(bioValue?.length ?? 0);
  }, [bioValue]);

  // Watch avatar URL for live preview
  const avatarValue = watch('avatar');

  const onSubmit = async (values: EditProfileValues) => {
    try {
      const { data } = await api.put('/user/profile', values);
      if (data.success && data.user) {
        setUser(data.user);
        toast.success('Profile updated!');
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update profile');
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-xl border bg-card shadow-2xl animate-slide-down"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Edit Profile</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
            {/* Avatar upload */}
            <div>
              <label className="text-sm font-medium mb-2 block text-center">Profile Photo</label>
              <ImageUpload
                value={avatarValue || ''}
                onChange={(url) => setValue('avatar', url as string, { shouldDirty: true })}
                maxFiles={1}
                maxSizeMB={5}
                bucket="avatars"
                variant="circle"
              />
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input
                placeholder="Your full name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Username</label>
              <Input
                placeholder="your_username"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Bio</label>
                <span className="text-xs text-muted-foreground">{bioCount}/200</span>
              </div>
              <textarea
                className="flex h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                placeholder="Tell others about yourself..."
                maxLength={200}
                {...register('bio')}
              />
              {errors.bio && (
                <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
