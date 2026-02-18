import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, BookOpen, Bookmark, Calendar, Users, ChevronRight, Pencil } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { EditProfileModal } from './EditProfileModal';

export function ProfilePage() {
  const { user } = useAuthStore();
  const [editModalOpen, setEditModalOpen] = useState(false);

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
          <Button asChild className="mt-4">
            <Link to="/login">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">
            <Avatar
              fallback={user.name}
              src={user.avatar}
              size="lg"
              className="h-20 w-20 text-2xl"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">@{user.username}</p>

              {user.bio && (
                <p className="mt-2 text-sm">{user.bio}</p>
              )}

              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {formatDate(user.createdAt)}
                </div>
              </div>

              <div className="mt-3 flex gap-4 text-sm">
                <span>
                  <strong>{user.following?.length ?? 0}</strong>{' '}
                  <span className="text-muted-foreground">Following</span>
                </span>
                <span>
                  <strong>{user.followers?.length ?? 0}</strong>{' '}
                  <span className="text-muted-foreground">Followers</span>
                </span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Bookmark className="h-5 w-5 mx-auto mb-1.5 text-primary" />
            <p className="text-2xl font-semibold">{user.saved?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Saved Hadiths</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1.5 text-primary" />
            <p className="text-2xl font-semibold">{user.followers?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-5 w-5 mx-auto mb-1.5 text-primary" />
            <p className="text-2xl font-semibold">{user.following?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        <Link
          to="/saved"
          className="flex items-center justify-between rounded-lg border p-4 hover:bg-secondary/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Bookmark className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Saved Hadiths</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{user.saved?.length ?? 0}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>

        <Link
          to="/explore"
          className="flex items-center justify-between rounded-lg border p-4 hover:bg-secondary/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Explore Topics</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <Link
          to="/settings"
          className="flex items-center justify-between rounded-lg border p-4 hover:bg-secondary/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Settings</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>

      <EditProfileModal open={editModalOpen} onClose={() => setEditModalOpen(false)} />
    </div>
  );
}
