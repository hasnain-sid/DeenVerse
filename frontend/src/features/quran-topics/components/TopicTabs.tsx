import { BookOpen, MessageCircle } from 'lucide-react';

interface TopicTabsProps {
    activeTab: 'reading' | 'reflections';
    onTabChange: (tab: 'reading' | 'reflections') => void;
    reflectionCount?: number;
}

export function TopicTabs({ activeTab, onTabChange, reflectionCount = 0 }: TopicTabsProps) {
    return (
        <div className="flex p-1 bg-muted/50 rounded-full mb-8 relative animate-fade-in">
            <div
                className="absolute inset-y-1 bg-background rounded-full shadow-sm border border-border/50 transition-all duration-300 ease-spring"
                style={{
                    width: 'calc(50% - 4px)',
                    left: activeTab === 'reading' ? '4px' : 'calc(50%)'
                }}
            />
            <button
                onClick={() => onTabChange('reading')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium z-10 transition-colors ${activeTab === 'reading' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
                <BookOpen className="h-4 w-4" />
                Reading & Tafsir
            </button>
            <button
                onClick={() => onTabChange('reflections')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium z-10 transition-colors ${activeTab === 'reflections' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
                <MessageCircle className="h-4 w-4" />
                Community ({reflectionCount})
            </button>
        </div>
    );
}
