import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockApplications } from './mockApplications';
import { Check, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminReviewPrototype4() {
    const [applications, setApplications] = useState(mockApplications);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [direction, setDirection] = useState(0);

    const currentApp = applications[currentIndex];

    const handleApprove = () => {
        setDirection(1);
        setTimeout(() => {
            setApplications(prev => prev.filter((_, i) => i !== currentIndex));
            if (currentIndex >= applications.length - 1) setCurrentIndex(Math.max(0, currentIndex - 1));
            setDirection(0);
        }, 300);
    };

    const handleReject = () => {
        setDirection(-1);
        setTimeout(() => {
            setApplications(prev => prev.filter((_, i) => i !== currentIndex));
            if (currentIndex >= applications.length - 1) setCurrentIndex(Math.max(0, currentIndex - 1));
            setDirection(0);
            setShowRejectForm(false);
            setRejectionReason('');
        }, 300);
    };

    if (!currentApp) {
        return (
            <div className="max-w-lg mx-auto p-6 min-h-screen flex items-center justify-center text-center">
                <div className="space-y-4">
                    <div className="text-6xl">🎉</div>
                    <h1 className="text-2xl font-bold">All caught up!</h1>
                    <p className="text-muted-foreground">No more applications to review.</p>
                    <Button onClick={() => { setApplications(mockApplications); setCurrentIndex(0); }}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset Demo
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto p-6 min-h-screen flex flex-col items-center justify-center pb-32">
            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold">Review Applications</h1>
                <p className="text-sm text-muted-foreground">{applications.length} remaining</p>
            </div>

            <div className="relative w-full max-w-md h-[480px]">
                {/* Stack effect behind */}
                {applications.length > 1 && (
                    <div className="absolute inset-0 top-3 mx-3 bg-muted/50 rounded-2xl border" />
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentApp.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * 300 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-card border rounded-2xl shadow-lg overflow-hidden flex flex-col"
                    >
                        <div className="p-6 flex-1 overflow-y-auto space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">{currentApp.avatar}</div>
                                <div>
                                    <h2 className="text-xl font-bold">{currentApp.name}</h2>
                                    <p className="text-xs text-muted-foreground">Applied {new Date(currentApp.applicationDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {currentApp.specialties.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Credentials</h3>
                                <ul className="space-y-1">
                                    {currentApp.credentials.map(c => (
                                        <li key={c} className="text-sm flex items-center gap-2">
                                            <Check className="h-3 w-3 text-emerald-500" /> {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bio</h3>
                                <p className="text-sm leading-relaxed text-foreground/80">{currentApp.bio}</p>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-muted/20">
                            {!showRejectForm ? (
                                <div className="flex gap-3 justify-center">
                                    <Button size="lg" variant="destructive" className="rounded-full h-14 w-14" onClick={() => setShowRejectForm(true)}>
                                        <X className="h-6 w-6" />
                                    </Button>
                                    <Button size="lg" className="rounded-full h-14 w-14 bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove}>
                                        <Check className="h-6 w-6" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full border rounded-lg p-2 text-sm bg-background min-h-[60px] focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="Rejection reason..."
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <Button variant="destructive" className="flex-1" onClick={handleReject} disabled={!rejectionReason.trim()}>Reject</Button>
                                        <Button variant="outline" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
