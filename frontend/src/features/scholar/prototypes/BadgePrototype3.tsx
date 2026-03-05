import { ShieldCheck, Star, BookOpen, MessageSquare, Send, Heart, Users, GraduationCap, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Badge Component: Green shield checkmark (Discord Nitro style)
const ScholarBadge = () => (
    <span className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
        <ShieldCheck className="w-3.5 h-3.5" />
    </span>
);

const mockScholar = {
    name: 'Ustadh Yusuf Ibrahim',
    specialties: ['Hadith', 'Sunnah Studies'],
    bio: 'Graduate of the Islamic University of Madinah with specialization in Hadith sciences. Has memorized and studied the six major hadith collections.',
    stats: { students: 3200, courses: 12, rating: 4.95 },
    credentials: ['Graduated from Madinah University', 'Memorized 6 major hadith collections', 'Chain of narrators certified'],
    courses: [
        { title: 'Hadith Sciences 101', students: 820, rating: 5.0 },
        { title: 'Sahih Bukhari Study', students: 640, rating: 4.9 },
        { title: 'Mustalah al-Hadith', students: 410, rating: 4.9 },
    ],
};

export default function BadgePrototype3() {
    return (
        <div className="max-w-5xl mx-auto p-6 space-y-12 pb-32">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Badge Design: Shield Checkmark</h1>
                <p className="text-muted-foreground">Discord Nitro-style verification badge</p>
            </div>

            {/* Badge in Context */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center font-bold text-sm">YI</div>
                            <div>
                                <div className="flex items-center">
                                    <span className="font-semibold text-sm">Ustadh Yusuf</span>
                                    <ScholarBadge />
                                </div>
                                <span className="text-xs text-muted-foreground">1h ago</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-3">"Seeking knowledge is an obligation upon every Muslim." - Prophet Muhammad ﷺ (Ibn Majah)</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> 156</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 34</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-3">Comment on "Hadith Authentication"</p>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0">YI</div>
                            <div>
                                <div className="flex items-center mb-1">
                                    <span className="font-medium text-sm">Ustadh Yusuf</span>
                                    <ScholarBadge />
                                </div>
                                <p className="text-sm text-foreground/80">This hadith has a strong chain through multiple reliable narrators.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-3">Chat message</p>
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center font-bold text-[10px]">YI</div>
                                <span className="font-medium text-xs">Ustadh Yusuf</span>
                                <ScholarBadge />
                            </div>
                            <p className="text-sm">We'll cover 40 Nawawi hadiths next semester insha'Allah.</p>
                            <div className="flex items-center gap-2">
                                <input className="flex-1 text-xs bg-background border rounded px-2 py-1" placeholder="Reply..." />
                                <Send className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Full Profile */}
            <div className="border-t pt-12 space-y-8">
                <h2 className="text-xl font-bold">Scholar Public Profile</h2>

                <div className="bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-950/20 dark:to-emerald-950/20 rounded-xl p-8">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="w-24 h-24 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center text-3xl font-bold shrink-0 ring-4 ring-background shadow-lg">YI</div>
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-2xl font-bold">{mockScholar.name}</h2>
                                <ScholarBadge />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {mockScholar.specialties.map(s => <Badge key={s}>{s}</Badge>)}
                            </div>
                            <p className="text-sm text-foreground/80 max-w-xl leading-relaxed">{mockScholar.bio}</p>
                            <Button size="sm" className="mt-2">Follow Scholar</Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-md">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-2xl font-bold">{mockScholar.stats.students.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <BookOpen className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-2xl font-bold">{mockScholar.stats.courses}</div>
                        <div className="text-xs text-muted-foreground">Courses</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <div className="text-2xl font-bold">{mockScholar.stats.rating}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> Credentials</h3>
                    <ul className="space-y-2">
                        {mockScholar.credentials.map(c => (
                            <li key={c} className="flex items-center gap-2 text-sm"><ShieldCheck className="w-4 h-4 text-emerald-500" /> {c}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Courses</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {mockScholar.courses.map(course => (
                            <Card key={course.title} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 space-y-2">
                                    <h4 className="font-medium text-sm">{course.title}</h4>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{course.students} students</span>
                                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> {course.rating}</span>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full text-xs mt-2">View Course</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
