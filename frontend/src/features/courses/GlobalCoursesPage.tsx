import { useState } from 'react';
import { BookOpen, Search, MapPin, Clock, Award, DollarSign, Filter, ChevronDown } from 'lucide-react';
import coursesData from '@/data/global_islamic_courses_database.json';

interface Course {
    country: string;
    institutionName: string;
    courseDegreeName: string;
    mode: string;
    typicalDuration: string;
    eligibilityCriteria: string;
    approximateTotalFees: string;
    mainJobRoles: string;
    certifyingAuthority: string;
    relativeValueLevel: string;
    processToCreateLaunch: string;
    sourceLinks: string;
}

export function GlobalCoursesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<string>('All');
    const [selectedModality, setSelectedModality] = useState<string>('All');

    const courses = coursesData as Course[];

    const countries = ['All', ...Array.from(new Set(courses.map(c => c.country)))].sort();
    const modalities = ['All', ...Array.from(new Set(courses.map(c => c.mode.split(' / ')[0])))].sort();

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.courseDegreeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.mainJobRoles.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCountry = selectedCountry === 'All' || course.country === selectedCountry;
        const matchesMode = selectedModality === 'All' || course.mode.includes(selectedModality);

        return matchesSearch && matchesCountry && matchesMode;
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-primary" />
                        Global Islamic Courses
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        A comprehensive, verified directory of accredited Islamic degree programs and traditional courses worldwide.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search universities, degrees, or roles..."
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1 min-w-[140px]">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select
                            className="w-full pl-9 pr-8 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                        >
                            {countries.map(c => (
                                <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>

                    <div className="relative flex-1 min-w-[140px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select
                            className="w-full pl-9 pr-8 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none"
                            value={selectedModality}
                            onChange={(e) => setSelectedModality(e.target.value)}
                        >
                            {modalities.map(m => (
                                <option key={m} value={m}>{m === 'All' ? 'All Modes' : m}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Course Grid */}
            {filteredCourses.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-border">
                    <p className="text-muted-foreground">No courses found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCourses.map((course, idx) => (
                        <div key={idx} className="bg-card border border-border hover:border-primary/30 transition-colors duration-300 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
                            {/* Card Header */}
                            <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent relative">
                                <span className="absolute top-4 right-4 text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    {course.relativeValueLevel} Value
                                </span>
                                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {course.country}
                                </p>
                                <h3 className="text-lg font-bold leading-tight mb-1 pr-16">{course.courseDegreeName}</h3>
                                <p className="text-sm text-foreground/80 font-medium">{course.institutionName}</p>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 space-y-4 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Duration & Mode</p>
                                            <p className="text-sm">{course.typicalDuration}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{course.mode}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Cost</p>
                                            <p className="text-sm font-medium">{course.approximateTotalFees.split('(')[0].trim()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-border/40">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Eligibility</p>
                                    <p className="text-sm bg-muted/50 p-2 rounded-lg border border-border/50">{course.eligibilityCriteria}</p>
                                </div>

                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Career Paths</p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {course.mainJobRoles.split(',').map((role, i) => (
                                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                                                {role.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="p-4 bg-muted/20 border-t border-border mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                    <Award className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <p className="text-xs text-muted-foreground truncate" title={course.certifyingAuthority}>
                                        {course.certifyingAuthority}
                                    </p>
                                </div>
                                <a
                                    href={course.sourceLinks.split(' ')[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-semibold text-primary hover:underline whitespace-nowrap ml-2 bg-primary/5 px-3 py-1.5 rounded-lg transition-colors hover:bg-primary/10"
                                >
                                    Visit Source →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
