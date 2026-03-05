import { Star, BookOpen, MessageSquare, Send, Heart, Users, GraduationCap, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Badge Component: Arabic calligraphy "ع" in circular badge
const ScholarBadge = () => (
    <span className="inline-flex items-center justify-center ml-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold leading-none">
        ع
    </span>
);

const mockScholar = {
    name: 'Shaykha Maryam Noor',
    specialties: ['Arabic Language', 'Tafsir'],
    bio: 'Passionate Arabic linguist and Quran exegete. Holds a master\'s degree in Arabic linguistics and is certified in Quranic tafsir.',
    stats: { students: 1420, courses: 5, rating: 4.85 },
    credentials: ['MA in Arabic Linguistics', 'Certified Mufassirah', 'Author of 3 Arabic textbooks'],
    courses: [
        { title: 'Classical Arabic Grammar', students: 380, rating: 4.9 },
        { title: 'Tafsir al-Jalalayn Study', students: 290, rating: 4.8 },
        { title: 'Balagha & Rhetoric', students: 210, rating: 4.9 },
    ],
};

export default function BadgePrototype4() {
    return (
        <div className="max-w-5xl mx-auto p-6 space-y-12 pb-32">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Badge Design: Arabic ع Circular</h1>
                <p className="text-muted-foreground">Aalim/scholar indicator in Arabic calligraphy</p>
            </div>

            {/* Badge in Context */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-sm">MN</div>
                            <div>
                                <div className="flex items-center">
                                    <span className="font-semibold text-sm">Shaykha Maryam</span>
                                    <ScholarBadge />
                                </div>
                                <span className="text-xs text-muted-foreground">3h ago</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-3">Today's word: "تقوى" (Taqwa) - Often translated as "God-consciousness" but carries much deeper meanings in Arabic.</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> 93</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 28</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-3">Comment on "Arabic Learning Tips"</p>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">MN</div>
                            <div>
                                <div className="flex items-center mb-1">
                                    <span className="font-medium text-sm">Shaykha Maryam</span>
                                    <ScholarBadge />
                                </div>
                                <p className="text-sm text-foreground/80">Focus on the sarf (morphology) patterns first. It unlocks the entire language structure.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-3">Chat message</p>
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-[10px]">MN</div>
                                <span className="font-medium text-xs">Shaykha Maryam</span>
                                <ScholarBadge />
                            </div>
                            <p className="text-sm">The balagha class this Thursday will be on Surah Yusuf's literary devices.</p>
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
                    <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-3xl font-bold shrink-0">MN</div>
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-2xl font-bold">{mockScholar.name}</h2>
                            <ScholarBadge />
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
                            <li key={c} className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {c}</li>
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
