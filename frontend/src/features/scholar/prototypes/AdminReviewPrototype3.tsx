import { useState } from 'react';
import { mockApplications, ScholarApplication } from './mockApplications';
import { Check, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminReviewPrototype3() {
    const [applications, setApplications] = useState(mockApplications);
    const [selectedApp, setSelectedApp] = useState<ScholarApplication | null>(mockApplications[0] || null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    const handleApprove = (id: string) => {
        setApplications(prev => prev.filter(a => a.id !== id));
        setSelectedApp(applications.find(a => a.id !== id) || null);
    };

    const handleReject = (id: string) => {
        setApplications(prev => prev.filter(a => a.id !== id));
        setSelectedApp(applications.find(a => a.id !== id) || null);
        setShowRejectForm(false);
        setRejectionReason('');
    };

    return (
        <div className="max-w-7xl mx-auto flex min-h-screen border-x">
            {/* Inbox List */}
            <div className="w-[360px] border-r flex flex-col bg-card">
                <div className="p-4 border-b">
                    <h1 className="text-lg font-bold flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" /> Applications
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">{applications.length} pending</p>
                </div>
                <div className="flex-1 overflow-y-auto divide-y">
                    {applications.map(app => (
                        <button
                            key={app.id}
                            onClick={() => { setSelectedApp(app); setShowRejectForm(false); }}
                            className={`w-full text-left p-4 hover:bg-muted/30 transition-colors ${selectedApp?.id === app.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{app.avatar}</div>
                                <div className="min-w-0">
                                    <h3 className="font-medium text-sm truncate">{app.name}</h3>
                                    <p className="text-xs text-muted-foreground truncate">{app.specialties.join(', ')}</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 pl-11">{app.bio}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Detail View */}
            {selectedApp ? (
                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">{selectedApp.avatar}</div>
                            <div>
                                <h2 className="text-2xl font-bold">{selectedApp.name}</h2>
                                <p className="text-sm text-muted-foreground">Applied {new Date(selectedApp.applicationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Specialties</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {selectedApp.specialties.map(s => <Badge key={s}>{s}</Badge>)}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Credentials</h3>
                                <ul className="space-y-2">
                                    {selectedApp.credentials.map(c => (
                                        <li key={c} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-emerald-500" /> {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bio</h3>
                            <p className="text-sm leading-relaxed text-foreground/80">{selectedApp.bio}</p>
                        </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                        {!showRejectForm ? (
                            <div className="flex gap-3">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8" onClick={() => handleApprove(selectedApp.id)}>
                                    <Check className="mr-2 h-4 w-4" /> Approve Scholar
                                </Button>
                                <Button variant="destructive" className="px-8" onClick={() => setShowRejectForm(true)}>
                                    <X className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3 max-w-lg">
                                <h3 className="font-semibold">Provide Rejection Reason</h3>
                                <textarea
                                    className="w-full border rounded-lg p-3 text-sm bg-background min-h-[100px] focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="Explain why this application is being rejected..."
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button variant="destructive" onClick={() => handleReject(selectedApp.id)} disabled={!rejectionReason.trim()}>Confirm Rejection</Button>
                                    <Button variant="outline" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p>Select an application to review</p>
                </div>
            )}
        </div>
    );
}
