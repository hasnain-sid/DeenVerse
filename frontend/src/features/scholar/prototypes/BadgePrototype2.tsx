import { useState } from 'react';
import { Star, BookOpen, MessageSquare, Send, Heart, Users, GraduationCap, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';

// Badge Component: Green filled star with "Verified" tooltip
const ScholarBadge = () => (
    <Tooltip content="Verified Scholar" side="top">
        <span className="inline-flex items-center ml-1 cursor-pointer">
            <span className="text-emerald-500 text-base">★</span>
        </span>
    </Tooltip>
);

const mockScholar = {
    name: 'Dr. Fatima Al-Rashid',
    specialties: ['Fiqh', 'Islamic Jurisprudence'],
    bio: 'Academic researcher and author specializing in comparative fiqh. Published multiple papers on contemporary issues in Islamic jurisprudence.',
    stats: { students: 1850, courses: 6, rating: 4.8 },
    credentials: ['PhD in Islamic Studies', 'Published Author', 'Assistant Professor'],
    courses: [
        { title: 'Introduction to Fiqh', students: 560, rating: 4.9 },
        { title: 'Contemporary Issues in Fiqh', students: 280, rating: 4.8 },
        { title: 'Fiqh of Transactions', students: 190, rating: 4.7 },
    ],
};

export default function BadgePrototype2() {
    const [activeTab, setActiveTab] = useState<'courses' | 'reviews'>('courses');

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-12 pb-32">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Badge Design: Green Star with Tooltip</h1>
                <p className="text-muted-foreground">Hover over the star to see verification tooltip</p>
            </div>

            {/* Badge in Context */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center font-bold text-sm">FR</div>
                            <div>
                                <div className="flex items-center">
                                    <span className="font-semibold text-sm">Dr. Fatima</span>
                                    <ScholarBadge />
                                </div>
                                <span className="text-xs text-muted-foreground">5h ago</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-3">New article published: "Navigating Modern Financial Instruments through the Lens of Classical Fiqh"</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> 78</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 23</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-3">Comment on "Halal Investment Guide"</p>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">FR</div>
                            <div>
                                <div className="flex items-center mb-1">
                                    <span className="font-medium text-sm">Dr. Fatima</span>
                                    <ScholarBadge />
                                </div>
                                <p className="text-sm text-foreground/80">This analysis needs to consider the maqasid al-shariah perspective as well.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-3">Chat message</p>
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center font-bold text-[10px]">FR</div>
                                <span className="font-medium text-xs">Dr. Fatima</span>
                                <ScholarBadge />
                            </div>
                            <p className="text-sm">The next study circle will focus on chapter 3 of Al-Muwatta.</p>
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
                    <div className="w-24 h-24 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center text-3xl font-bold shrink-0">FR</div>
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

                {/* Tabs */}
                <div>
                    <div className="flex border-b mb-4">
                        <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'courses' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            <Calendar className="w-4 h-4 inline mr-1" /> Courses
                        </button>
                        <button onClick={() => setActiveTab('reviews')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            <MessageSquare className="w-4 h-4 inline mr-1" /> Reviews
                        </button>
                    </div>

                    {activeTab === 'courses' && (
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
                    )}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {['Amazing teacher, mashallah!', 'Very knowledgeable in fiqh.', 'Clear explanations.'].map((review, i) => (
                                <div key={i} className="bg-muted/20 rounded-lg p-4">
                                    <div className="flex items-center gap-1 mb-2">
                                        {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                                    </div>
                                    <p className="text-sm">{review}</p>
                                    <p className="text-xs text-muted-foreground mt-2">Student {i + 1} • 2 weeks ago</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
