import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Pause, Play, BookOpen, Check, Heart } from 'lucide-react';

export default function Prototype12() {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const totalSlides = 4;

    const slides = [
        {
            title: "The Arabic",
            content: <p dir="rtl" className="text-4xl leading-loose font-serif text-white px-6">إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا</p>,
            subtitle: "Ash-Sharh 94:6"
        },
        {
            title: "The Meaning",
            content: <p className="text-2xl leading-relaxed font-serif text-white px-8 text-center">Indeed, with hardship [will be] ease.</p>,
            subtitle: "Translation"
        },
        {
            title: "Reflection",
            content: <p className="text-lg leading-relaxed text-zinc-200 px-8 text-center">The 'ease' is mentioned as being 'with' the hardship, not after it. His mercy is present even in the midst of your struggle.</p>,
            subtitle: "Tafseer Insight"
        },
        {
            title: "Your Action",
            content: (
                <div className="px-8 w-full max-w-sm">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-rose-400" /> Apply It</h3>
                        <p className="text-white/80 text-sm mb-6">Write down one hidden blessing you can find in a difficulty you are currently facing.</p>
                        <button className="w-full bg-white text-zinc-900 font-bold py-3 rounded-xl hover:bg-zinc-100 transition-colors">
                            Got It
                        </button>
                    </div>
                </div>
            ),
            subtitle: "Practical Step"
        }
    ];

    // Auto-advance logic could go here, simulating Instagram stories
    // Omitted for simplicity in prototype, using manual tap instead

    const nextSlide = () => {
        if (activeSlide < totalSlides - 1) setActiveSlide(prev => prev + 1);
    };

    const prevSlide = () => {
        if (activeSlide > 0) setActiveSlide(prev => prev - 1);
    };

    return (
        <div className="flex items-center justify-center min-h-[700px] p-4">
            {/* Mobile Frame Container */}
            <div className="relative w-full max-w-[380px] h-[750px] bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-zinc-800">

                {/* Dynamic Background generated based on slide */}
                <div className={`absolute inset-0 transition-colors duration-700 ${activeSlide === 0 ? 'bg-emerald-900' :
                        activeSlide === 1 ? 'bg-indigo-900' :
                            activeSlide === 2 ? 'bg-violet-900' :
                                'bg-rose-900'
                    }`}>
                    {/* Subtle overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />
                </div>

                {/* Story Progress Bars */}
                <div className="absolute top-6 left-4 right-4 flex gap-1.5 z-20">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-300"
                                style={{
                                    width: idx < activeSlide ? '100%' : idx === activeSlide ? '50%' : '0%' // 50% mock progress on active
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Top Header */}
                <div className="absolute top-10 left-4 right-4 flex justify-between items-center z-20">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold text-sm shadow-sm">Daily Ayah</span>
                    </div>
                    <button onClick={() => setIsPaused(!isPaused)} className="p-2 text-white/80 hover:text-white transition-colors">
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </button>
                </div>

                {/* Slide Content */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">

                    <div className="mb-8">
                        <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium tracking-wide uppercase shadow-sm">
                            {slides[activeSlide].title}
                        </span>
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                        {slides[activeSlide].content}
                    </div>

                    <div className="h-32 flex items-center justify-center">
                        <span className="text-white/60 text-sm font-medium">{slides[activeSlide].subtitle}</span>
                    </div>
                </div>

                {/* Tap areas for navigation */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-20" onClick={prevSlide} />
                <div className="absolute inset-y-0 right-0 w-2/3 z-20" onClick={nextSlide} />
            </div>
        </div>
    );
}
