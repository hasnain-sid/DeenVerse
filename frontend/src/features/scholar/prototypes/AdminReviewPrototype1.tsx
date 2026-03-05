import { useState } from 'react';
import { mockApplications, ScholarApplication } from './mockApplications';
import { Check, X, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminReviewPrototype1() {
    const [applications, setApplications] = useState(mockApplications);
    const [selectedApp, setSelectedApp] = useState<ScholarApplication | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const handleApprove = (id: string) => {
        setApplications(prev => prev.filter(a => a.id !== id));
        setSelectedApp(null);
    };

    const handleReject = (id: string) => {
        setApplications(prev => prev.filter(a => a.id !== id));
        setSelectedApp(null);
        setShowRejectModal(false);
        setRejectionReason('');
    };

    return (
        <div className="max-w-7xl mx-auto p-6 flex gap-6 min-h-screen">
            {/* Table List */}
            <div className={`${selectedApp ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Scholar Applications</h1>
                    <p className="text-muted-foreground mt-1">{applications.length} pending review</p>
                </div>

                <div className="border rounded-lg overflow-hidden bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Applicant</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Specialties</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {applications.map(app => (
                                <tr
                                    key={app.id}
                                    className={`hover:bg-muted/20 cursor-pointer transition-colors ${selectedApp?.id === app.id ? 'bg-primary/5' : ''}`}
                                    onClick={() => setSelectedApp(app)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{app.avatar}</div>
                                            <span className="font-medium">{app.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {app.specialties.map(s => (
                                                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {new Date(app.applicationDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-over Detail Panel */}
            {selectedApp && (
                <div className="w-1/2 bg-card border rounded-lg p-6 animate-in slide-in-from-right-5 duration-300 space-y-6 sticky top-6 self-start">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">{selectedApp.avatar}</div>
                            <div>
                                <h2 className="text-xl font-bold">{selectedApp.name}</h2>
                                <p className="text-sm text-muted-foreground">Applied {new Date(selectedApp.applicationDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedApp(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Specialties</h3>
                            <div className="flex gap-2 flex-wrap">
                                {selectedApp.specialties.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Credentials</h3>
                            <ul className="space-y-1">
                                {selectedApp.credentials.map(c => (
                                    <li key={c} className="flex items-center gap-2 text-sm">
                                        <ChevronRight className="h-3 w-3 text-primary" /> {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bio</h3>
                            <p className="text-sm leading-relaxed text-foreground/80">{selectedApp.bio}</p>
                        </div>
                    </div>

                    {!showRejectModal ? (
                        <div className="flex gap-3 pt-4 border-t">
                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(selectedApp.id)}>
                                <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button variant="destructive" className="flex-1" onClick={() => setShowRejectModal(true)}>
                                <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="font-semibold text-sm">Rejection Reason</h3>
                            <textarea
                                className="w-full border rounded-lg p-3 text-sm bg-background min-h-[100px] focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="Provide a reason for rejection..."
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedApp.id)} disabled={!rejectionReason.trim()}>
                                    Confirm Rejection
                                </Button>
                                <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
