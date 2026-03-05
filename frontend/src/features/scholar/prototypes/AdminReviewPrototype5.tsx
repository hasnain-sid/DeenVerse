import { useState } from 'react';
import { mockApplications } from './mockApplications';
import { Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminReviewPrototype5() {
    const [applications, setApplications] = useState(mockApplications);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    const handleApprove = (id: string) => {
        setApplications(prev => prev.filter(a => a.id !== id));
    };

    const handleReject = (id: string) => {
        setApplications(prev => prev.filter(a => a.id !== id));
        setRejectingId(null);
        setRejectionReason('');
    };

    const sorted = [...applications].sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());

    return (
        <div className="max-w-3xl mx-auto p-6 min-h-screen pb-32">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Application Timeline</h1>
                <p className="text-muted-foreground mt-1">{applications.length} pending applications sorted by date</p>
            </div>

            <div className="relative space-y-0">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

                {sorted.map(app => (
                    <div key={app.id} className="relative pl-20 pb-8">
                        {/* Timeline dot */}
                        <div className="absolute left-[26px] w-5 h-5 rounded-full border-2 border-primary bg-background flex items-center justify-center z-10">
                            <Clock className="h-3 w-3 text-primary" />
                        </div>

                        {/* Date label */}
                        <div className="absolute left-0 top-0 text-[10px] text-muted-foreground font-mono w-16 text-right pr-6 pt-1">
                            {new Date(app.applicationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>

                        {/* Card */}
                        <div className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{app.avatar}</div>
                                    <div>
                                        <h3 className="font-semibold">{app.name}</h3>
                                        <div className="flex gap-1 mt-1">
                                            {app.specialties.map(s => (
                                                <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-foreground/70 line-clamp-2">{app.bio}</p>

                            <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Credentials:</span> {app.credentials.join(' • ')}
                            </div>

                            {rejectingId === app.id ? (
                                <div className="space-y-2 border-t pt-3">
                                    <textarea
                                        className="w-full border rounded-lg p-2 text-sm bg-background min-h-[60px] focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="Reason for rejection..."
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)} disabled={!rejectionReason.trim()}>Confirm</Button>
                                        <Button size="sm" variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2 pt-2 border-t">
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(app.id)}>
                                        <Check className="mr-1 h-3 w-3" /> Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => setRejectingId(app.id)}>
                                        <X className="mr-1 h-3 w-3" /> Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
