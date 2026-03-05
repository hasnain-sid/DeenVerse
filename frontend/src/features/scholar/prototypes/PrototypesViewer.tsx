import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminReviewPrototype1 from './AdminReviewPrototype1';
import AdminReviewPrototype2 from './AdminReviewPrototype2';
import AdminReviewPrototype3 from './AdminReviewPrototype3';
import AdminReviewPrototype4 from './AdminReviewPrototype4';
import AdminReviewPrototype5 from './AdminReviewPrototype5';
import BadgePrototype1 from './BadgePrototype1';
import BadgePrototype2 from './BadgePrototype2';
import BadgePrototype3 from './BadgePrototype3';
import BadgePrototype4 from './BadgePrototype4';
import BadgePrototype5 from './BadgePrototype5';

export default function PrototypesViewer() {
    const location = useLocation();
    const isBadgeMode = location.pathname.includes('scholar-badge');
    const [activeVariant, setActiveVariant] = useState(1);
    const totalVariants = 5;

    const renderPrototype = () => {
        if (isBadgeMode) {
            switch (activeVariant) {
                case 1: return <BadgePrototype1 />;
                case 2: return <BadgePrototype2 />;
                case 3: return <BadgePrototype3 />;
                case 4: return <BadgePrototype4 />;
                case 5: return <BadgePrototype5 />;
                default: return <BadgePrototype1 />;
            }
        } else {
            switch (activeVariant) {
                case 1: return <AdminReviewPrototype1 />;
                case 2: return <AdminReviewPrototype2 />;
                case 3: return <AdminReviewPrototype3 />;
                case 4: return <AdminReviewPrototype4 />;
                case 5: return <AdminReviewPrototype5 />;
                default: return <AdminReviewPrototype1 />;
            }
        }
    };

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <div className="min-h-screen pb-20">{renderPrototype()}</div>

            {/* Toolbar */}
            <div className="fixed bottom-6 left-1/2 z-50 flex h-14 -translate-x-1/2 items-center gap-4 rounded-full border border-border/50 bg-background/80 px-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 pr-4 border-r border-border/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Layers className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium leading-none">
                            {isBadgeMode ? 'Scholar Badge' : 'Scholar Review'}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-1">
                            Variant {activeVariant} of {totalVariants}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveVariant((prev) => Math.max(1, prev - 1))}
                        disabled={activeVariant === 1}
                        className="h-8 w-8 rounded-full"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-1">
                        {Array.from({ length: totalVariants }).map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setActiveVariant(i + 1)}
                                className={`h-2 rounded-full transition-all ${activeVariant === i + 1
                                    ? 'w-6 bg-primary'
                                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                    }`}
                                aria-label={`View variant ${i + 1}`}
                            />
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveVariant((prev) => Math.min(totalVariants, prev + 1))}
                        disabled={activeVariant === totalVariants}
                        className="h-8 w-8 rounded-full"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
