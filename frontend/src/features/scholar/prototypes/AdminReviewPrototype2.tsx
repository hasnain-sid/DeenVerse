import { useState } from 'react';
import { mockApplications, ScholarApplication } from './mockApplications';
import { Check, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Column = 'pending' | 'approved' | 'rejected';

export default function AdminReviewPrototype2() {
    const [columns, setColumns] = useState<Record<Column, ScholarApplication[]>>({
        pending: [...mockApplications],
        approved: [],
        rejected: [],
    });
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectingApp, setRejectingApp] = useState<string | null>(null);

    const moveApp = (appId: string, from: Column, to: Column) => {
        const app = columns[from].find(a => a.id === appId);
        if (!app) return;
        setColumns(prev => ({
            ...prev,
            [from]: prev[from].filter(a => a.id !== appId),
            [to]: [...prev[to], app],
        }));
        setRejectingApp(null);
        setRejectionReason('');
    };

    const columnConfig: { key: Column; label: string; color: string }[] = [
        { key: 'pending', label: 'Pending Review', color: 'border-amber-500/30' },
        { key: 'approved', label: 'Approved', color: 'border-emerald-500/30' },
        { key: 'rejected', label: 'Rejected', color: 'border-red-500/30' },
    ];

    return (
        <div className="max-w-7xl mx-auto p-6 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Scholar Review Board</h1>
                <p className="text-muted-foreground mt-1">Drag applications between columns to approve or reject</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {columnConfig.map(col => (
                    <div key={col.key} className={`border-t-4 ${col.color} bg-muted/20 rounded-lg p-4 min-h-[400px]`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{col.label}</h2>
                            <Badge variant="secondary" className="text-xs">{columns[col.key].length}</Badge>
                        </div>

                        <div className="space-y-3">
                            {columns[col.key].map(app => (
                                <div key={app.id} className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3">
                                        <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-1 cursor-grab" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{app.avatar}</div>
                                                <h3 className="font-medium text-sm truncate">{app.name}</h3>
                                            </div>
                                            <div className="flex gap-1 flex-wrap mt-2">
                                                {app.specialties.map(s => (
                                                    <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>
                                                ))}
                                            </div>

                                            {col.key === 'pending' && (
                                                <div className="flex gap-2 mt-3">
                                                    {rejectingApp === app.id ? (
                                                        <div className="w-full space-y-2">
                                                            <textarea
                                                                className="w-full border rounded p-2 text-xs bg-background min-h-[60px] focus:ring-1 focus:ring-primary focus:outline-none"
                                                                placeholder="Reason for rejection..."
                                                                value={rejectionReason}
                                                                onChange={e => setRejectionReason(e.target.value)}
                                                            />
                                                            <div className="flex gap-1">
                                                                <Button size="sm" variant="destructive" className="text-xs h-7 flex-1" onClick={() => moveApp(app.id, 'pending', 'rejected')} disabled={!rejectionReason.trim()}>Confirm</Button>
                                                                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setRejectingApp(null)}>Cancel</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Button size="sm" className="text-xs h-7 flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => moveApp(app.id, 'pending', 'approved')}>
                                                                <Check className="h-3 w-3 mr-1" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="destructive" className="text-xs h-7 flex-1" onClick={() => setRejectingApp(app.id)}>
                                                                <X className="h-3 w-3 mr-1" /> Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
