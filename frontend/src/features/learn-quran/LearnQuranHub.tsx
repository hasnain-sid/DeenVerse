import { Link } from 'react-router-dom';
import { BookHeart, GraduationCap, Flame, MessageCircleQuestion, AudioLines, BookOpenText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
    {
        title: 'Read Quran',
        description: 'Browse ayahs, rukus, and juzz with translations, font options, and a beautiful reading experience.',
        icon: BookHeart,
        href: '/quran-reader',
        status: 'Available',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
    },
    {
        title: 'Daily Ayah + Practical Reflection',
        description: 'Relate Quran to your daily life. View a daily ayah and apply it with guided reflections.',
        icon: BookHeart,
        href: '/daily-learning',
        status: 'Available',
        color: 'text-primary',
        bg: 'bg-primary/10',
    },
    {
        title: 'Daily Learning Prototypes',
        description: 'View the 5 different design prototypes for the Daily Learning experience.',
        icon: BookOpenText,
        href: '/daily-learning-prototypes',
        status: 'Available',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        title: 'Quran UI Prototypes',
        description: 'View the 5 different design prototypes for the Quran reading experience.',
        icon: BookOpenText,
        href: '/quran-prototypes',
        status: 'Available',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
    },
    {
        title: 'Consistency Engine',
        description: 'Build streaks, set goals, and follow structured learning paths for consistent progress.',
        icon: Flame,
        href: '#',
        status: 'Coming Soon',
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
    },
    {
        title: 'Word-by-Word Understanding',
        description: 'Quickly understand meanings without deep tafseer. Tap words for direct translations.',
        icon: BookOpenText,
        href: '#',
        status: 'Coming Soon',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        title: 'Ask-the-Quran Assistant',
        description: 'Ask questions and receive contextual, educational guidance centered on Quranic teachings.',
        icon: MessageCircleQuestion,
        href: '#',
        status: 'Coming Soon',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
    },
    {
        title: 'AI Tajweed Coach',
        description: 'Recite verses and receive AI-driven feedback on your pronunciation and recitation.',
        icon: AudioLines,
        href: '#',
        status: 'Coming Soon',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
    },
    {
        title: 'Story Mode Context Cards',
        description: 'Engage with Tafseer and Asbab al-Nuzul in a highly visual, immersive story format.',
        icon: BookOpenText,
        href: '#',
        status: 'Coming Soon',
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
    },
];

export function LearnQuranHub() {
    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto p-4 md:p-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <GraduationCap className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Learn Quran</h1>
            </div>

            <p className="text-muted-foreground text-lg mb-8">
                Explore a new way to connect with the Quran. Build consistency, improve recitation, and reflect on its daily practical wisdom.
            </p>

            {/* Grid of Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, idx) => (
                    feature.status === 'Available' ? (
                        <Link key={idx} to={feature.href} className="block group">
                            <FeatureCard feature={feature} />
                        </Link>
                    ) : (
                        <div key={idx} className="block shrink-0 opacity-80 cursor-not-allowed">
                            <FeatureCard feature={feature} />
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

function FeatureCard({ feature }: { feature: any }) {
    const Icon = feature.icon;
    return (
        <Card className="h-full transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 relative overflow-hidden flex flex-col">
            <CardHeader className="pb-3 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg w-fit ${feature.bg}`}>
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    {feature.status === 'Available' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            New
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                            {feature.status}
                        </span>
                    )}
                </div>
                <CardTitle className="text-xl leading-tight mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-3">
                    {feature.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 mt-auto">
                {feature.status === 'Available' && (
                    <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:underline">
                        Get Started →
                    </span>
                )}
            </CardContent>
        </Card>
    );
}
