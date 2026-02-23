import { useState } from 'react';
import { Target, CheckCircle2, Circle, Award } from 'lucide-react';

export default function Prototype14() {
    const [completedActions, setCompletedActions] = useState<number[]>([]);

    const toggleAction = (id: number) => {
        if (completedActions.includes(id)) {
            setCompletedActions(completedActions.filter(a => a !== id));
        } else {
            setCompletedActions([...completedActions, id]);
        }
    };

    const actions = [
        {
            id: 1,
            title: "Say \"Alhamdulillah\" 33 times after the next prayer.",
            type: "Dhikr",
            color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
        },
        {
            id: 2,
            title: "Send a message of gratitude to one family member.",
            type: "Social",
            color: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30",
        },
        {
            id: 3,
            title: "Find one hidden blessing in a current hardship.",
            type: "Reflection",
            color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
        }
    ];

    const progress = Math.round((completedActions.length / actions.length) * 100);

    return (
        <div className="max-w-md mx-auto p-4 md:p-8 min-h-[700px] flex items-center justify-center">
            <div className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 p-8">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                        <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Active Faith</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">Translate today's Ayah into action.</p>
                </div>

                {/* The Ayah */}
                <div className="bg-zinc-50 dark:bg-zinc-950 rounded-3xl p-6 mb-8 border border-zinc-100 dark:border-zinc-800/60">
                    <p dir="rtl" className="text-2xl leading-relaxed text-center font-serif text-emerald-800 dark:text-emerald-400 mb-4">
                        لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ
                    </p>
                    <p className="text-center text-zinc-600 dark:text-zinc-400 italic text-sm font-serif">
                        "If you are grateful, I will surely increase you [in favor]." (14:7)
                    </p>
                </div>

                {/* Action List */}
                <div className="space-y-4 relative">
                    {actions.map((action) => {
                        const isCompleted = completedActions.includes(action.id);
                        return (
                            <div
                                key={action.id}
                                onClick={() => toggleAction(action.id)}
                                className={`group flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 ${isCompleted
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 shadow-sm border border-emerald-100 dark:border-emerald-800/30'
                                        : 'bg-white dark:bg-zinc-900 shadow-sm shadow-zinc-200/50 dark:shadow-none hover:shadow-md border border-zinc-100 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-800/50'
                                    }`}
                            >
                                <div className="mt-1 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${action.color}`}>
                                            {action.type}
                                        </span>
                                    </div>
                                    <p className={`text-sm font-medium transition-colors duration-300 ${isCompleted ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-800 dark:text-zinc-200'
                                        }`}>
                                        {action.title}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {/* Progress Indicator Overlays */}
                    {completedActions.length === actions.length && (
                        <div className="absolute inset-x-0 -bottom-6 flex justify-center animate-in fade-in slide-in-from-bottom-5">
                            <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2">
                                <Award className="w-4 h-4" /> All Actions Complete!
                            </span>
                        </div>
                    )}
                </div>

                {/* Static Progress Bar */}
                <div className="mt-10">
                    <div className="flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
                        <span>Daily Progress</span>
                        <span className="text-emerald-600 dark:text-emerald-500">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
