import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ExplorePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search hadiths, topics, scholars..."
          className="pl-10 h-10"
        />
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Browse by Topic
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Prayer', 'Fasting', 'Charity', 'Pilgrimage',
            'Character', 'Family', 'Knowledge', 'Daily Life',
            'Worship',
          ].map((topic) => (
            <Card
              key={topic}
              className="cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium">{topic}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending (placeholder) */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Trending
        </h3>
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Trending posts and hadiths will appear here soon.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
