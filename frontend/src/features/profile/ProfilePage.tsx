import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, BookOpen, Bookmark, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { user } = useAuthStore();

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
                <div className="flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5" />
                  {user.saved.length} saved
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

            <Button variant="outline" size="sm" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Section (placeholder) */}
      <Card>
        <CardContent className="py-8 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Your activity will appear here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
