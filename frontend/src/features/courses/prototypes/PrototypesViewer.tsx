import { Link } from 'react-router-dom';

export default function PrototypesViewer() {
    return (
        <div className="flex flex-col min-h-screen bg-background items-center justify-center p-8 text-center gap-6">
            <div className="max-w-md">
                <h1 className="text-2xl font-bold text-foreground mb-2">Prototypes Promoted</h1>
                <p className="text-muted-foreground mb-8">
                    All course prototypes (Builder, Discovery, Player, Quiz) have been integrated into
                    production pages. The prototype viewer is no longer active.
                </p>
                <div className="flex flex-col gap-3">
                    <Link to="/courses" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                        Browse Courses →
                    </Link>
                    <Link to="/scholar/courses/new" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
                        Course Builder →
                    </Link>
                </div>
            </div>
        </div>
    );
}


