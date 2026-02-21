import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, BookOpen, Bookmark, Users, ChevronRight, Pencil, Flame } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { EditProfileModal } from './EditProfileModal';

export function ProfilePage() {
  const { user } = useAuthStore();
  const [editModalOpen, setEditModalOpen] = useState(false);

  if (!user) {
    return (
      <Card className="border-dashed bg-card">
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
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Profile Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div className="flex items-center gap-4">
          <Avatar
            fallback={user.name}
            src={user.avatar}
            size="lg"
            className="h-20 w-20 text-2xl border-2 border-border"
          />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{user.name}</h2>
            <p className="text-muted-foreground">@{user.username}</p>
            {user.bio && <p className="text-sm mt-1 text-card-foreground">{user.bio}</p>}
          </div>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setEditModalOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* 4-Column Stat Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-[20px] border border-border p-5 hover:border-primary/30 transition-colors">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Following</p>
          <p className="text-2xl font-bold text-foreground">{user.following?.length ?? 0} <span className="text-sm font-normal text-muted-foreground">users</span></p>
        </div>
        <div className="bg-card rounded-[20px] border border-border p-5 hover:border-primary/30 transition-colors">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-primary flex items-center gap-2">
            14 <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="text-sm font-normal text-muted-foreground hidden sm:inline">days</span>
          </p>
        </div>
        <div className="bg-card rounded-[20px] border border-border p-5 hover:border-primary/30 transition-colors">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Bookmarks</p>
          <p className="text-2xl font-bold text-foreground">{user.saved?.length ?? 0}</p>
        </div>
        <div className="bg-card rounded-[20px] border border-border p-5 hover:border-primary/30 transition-colors">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">Joined</p>
          <p className="text-lg font-bold text-foreground mt-1">{formatDate(user.createdAt).split(',')[0]}</p>
        </div>
      </div>

      {/* Split view logic for Dense Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Learning (Left Col - 2/3) */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Learning</h3>

          <div className="bg-card rounded-[20px] border border-border divide-y divide-border overflow-hidden">
            <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group">
              <div>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">Chapter on Fasting (Sawm)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sahih Muslim</p>
              </div>
              <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">In Progress</span>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group">
              <div>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">Etiquette of Supplication</p>
                <p className="text-xs text-muted-foreground mt-0.5">Riyad as-Salihin</p>
              </div>
              <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium">In Progress</span>
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group">
              <div>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">Significance of Patience</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sahih al-Bukhari</p>
              </div>
              <span className="text-xs text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full font-medium">Completed</span>
            </div>
          </div>
        </div>

        {/* Quick Links (Right Col - 1/3) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            <Link to="/hadith" className="bg-card border border-border rounded-xl p-4 text-left text-sm hover:border-primary/50 hover:bg-muted/30 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium">Daily Hadith</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link to="/saved" className="bg-card border border-border rounded-xl p-4 text-left text-sm hover:border-primary/50 hover:bg-muted/30 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium">Saved Topics</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link to="/explore" className="bg-card border border-border rounded-xl p-4 text-left text-sm hover:border-primary/50 hover:bg-muted/30 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium">Community</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link to="/settings" className="bg-card border border-border rounded-xl p-4 text-left text-sm hover:border-primary/50 hover:bg-muted/30 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium">Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>

      <EditProfileModal open={editModalOpen} onClose={() => setEditModalOpen(false)} />
    </div>
  );
}
