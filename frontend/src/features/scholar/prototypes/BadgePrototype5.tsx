import { Award, Star, BookOpen, MessageSquare, Send, Heart, Users, GraduationCap, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Badge Component: Gold laurel icon + specialty tag
const ScholarBadge = ({ specialty = 'Hadith Scholar' }: { specialty?: string }) => (
    <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800/50">
        <Award className="w-3 h-3" /> {specialty}
    </span>
);

const mockScholar = {
    name: 'Imam Khalid Mahmoud',
    specialties: ['Aqeedah', 'Islamic Theology'],
    bio: 'Serving imam with a decade of community leadership experience. Al-Azhar graduate specializing in Islamic creed and theology.',
    stats: { students: 2670, courses: 9, rating: 4.92 },
    credentials: ['10+ years as Imam', 'Graduate of Al-Azhar', 'Published theologian'],
    courses: [
        { title: 'Foundations of Aqeedah', students: 720, rating: 4.9 },
        { title: 'Names of Allah Study', students: 550, rating: 5.0 },
        { title: 'Refuting Doubts', students: 380, rating: 4.8 },
    ],
};

export default function BadgePrototype5() {
    return (
        <div className="max-w-5xl mx-auto p-6 space-y-12 pb-32">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Badge Design: Gold Laurel + Specialty</h1>
                <p className="text-muted-foreground">Shows a gold laurel icon with the scholar's specialty area</p>
            </div>

            {/* Badge in Context */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 flex items-center justify-center font-bold text-sm">KM</div>
                            <div>
                                <div className="flex items-center flex-wrap">
                                    <span className="font-semibold text-sm">Imam Khalid</span>
                                    <ScholarBadge specialty="Aqeedah" />
                                </div>
                                <span className="text-xs text-muted-foreground">6h ago</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-3">Understanding Tawheed is the foundation of our entire deen. Without it, nothing else makes sense.</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> 124</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 45</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-3">Comment on "Understanding Qadr"</p>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">KM</div>
                            <div>
                                <div className="flex items-center flex-wrap mb-1">
                                    <span className="font-medium text-sm">Imam Khalid</span>
                                    <ScholarBadge specialty="Theology" />
                                </div>
                                <p className="text-sm text-foreground/80">Excellent question. The belief in Qadr has four pillars that we must understand distinctly.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-3">Chat message</p>
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 flex items-center justify-center font-bold text-[10px]">KM</div>
                                <span className="font-medium text-xs">Imam Khalid</span>
                                <ScholarBadge specialty="Aqeedah" />
                            </div>
                            <p className="text-sm">Jumu'ah topic this week: The 99 Names of Allah - practical application.</p>
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

                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 flex items-center justify-center text-3xl font-bold shrink-0">KM</div>
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1.5">
                            <Award className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-2xl font-bold">{mockScholar.name}</h2>
                            <ScholarBadge specialty="Aqeedah Scholar" />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {mockScholar.specialties.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                        </div>
                        <p className="text-sm text-foreground/80 max-w-xl leading-relaxed">{mockScholar.bio}</p>
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
                            <li key={c} className="flex items-center gap-2 text-sm"><Award className="w-4 h-4 text-amber-500" /> {c}</li>
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
