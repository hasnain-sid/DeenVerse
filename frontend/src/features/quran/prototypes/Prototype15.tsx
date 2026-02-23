import React from 'react';
import { Sparkles, Quote, BookOpen, Bookmark, MessageSquarePlus, Share2 } from 'lucide-react';

export default function Prototype15() {
    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen">
            {/* Top Navigation */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="font-serif text-2xl text-zinc-900 dark:text-white font-bold">Deep Dive</h1>
                <div className="flex gap-4 text-zinc-400">
                    <button className="hover:text-emerald-500 transition-colors"><Bookmark className="w-5 h-5" /></button>
                    <button className="hover:text-amber-500 transition-colors"><Share2 className="w-5 h-5" /></button>
                </div>
            </div>

            <article className="bg-[#FAF9F6] dark:bg-zinc-950 rounded-[2rem] border border-[#EBE8E0] dark:border-zinc-800 overflow-hidden shadow-2xl pb-16">

                {/* Cover Graphic */}
                <div className="h-48 bg-gradient-to-br from-emerald-800 to-emerald-950 relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '60px 60px' }} />
                    <h2 className="text-3xl md:text-5xl font-serif text-emerald-50 relative z-10 tracking-widest opacity-90">النور</h2>
                </div>

                {/* Content Body */}
                <div className="px-6 md:px-12 -mt-10 relative z-20">

                    {/* Main Ayah Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-black/5 p-8 border border-zinc-100 dark:border-zinc-800 mb-12">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-6 block text-center">An-Nur 24:35</span>
                        <p dir="rtl" className="text-4xl leading-loose text-center font-serif text-zinc-800 dark:text-zinc-100 mb-8">
                            اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ ۖ
                        </p>
                        <p className="text-lg leading-relaxed text-center font-serif text-zinc-600 dark:text-zinc-400 px-4">
                            "Allah is the Light of the heavens and the earth. The example of His light is like a niche within which is a lamp..."
                        </p>
                    </div>

                    <div className="space-y-12">
                        {/* Section 1: The Tafseer */}
                        <section>
                            <h3 className="flex items-center gap-3 text-xl font-bold text-zinc-900 dark:text-white mb-6">
                                <BookOpen className="w-6 h-6 text-amber-500" />
                                Divine Illumination
                            </h3>
                            <div className="prose prose-zinc dark:prose-invert prose-lg text-zinc-600 dark:text-zinc-400">
                                <p>
                                    Ibn al-Qayyim describes this light as the light of faith and Quran in the heart of the believer. Just as physical light helps the eyes see their way through darkness, the light of Allah guides the heart through the darkness of doubts, desires, and confusion.
                                </p>
                                <p>
                                    When your heart holds this light, everything becomes clear. The niche represents the chest of the believer, and the lamp is the light of faith inside it.
                                </p>
                            </div>
                        </section>

                        {/* divider line */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#EBE8E0] dark:via-zinc-800 to-transparent" />

                        {/* Section 2: Related Hadith */}
                        <section className="bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-900/30">
                            <h3 className="flex items-center gap-3 text-lg font-bold text-emerald-900 dark:text-emerald-400 mb-6">
                                <Quote className="w-5 h-5" />
                                From the Sunnah
                            </h3>
                            <blockquote className="text-zinc-700 dark:text-zinc-300 italic text-lg leading-relaxed mb-4">
                                The Prophet (ﷺ) used to supplicate: "O Allah, place light in my heart, and on my tongue light, and in my ears light and in my sight light, and above me light, and below me light, and to my right light, and to my left light, and before me light and behind me light..."
                            </blockquote>
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-500">— Sahih Muslim 763</span>
                        </section>

                        {/* Section 3: Practical Application */}
                        <section>
                            <h3 className="flex items-center gap-3 text-xl font-bold text-zinc-900 dark:text-white mb-6">
                                <Sparkles className="w-6 h-6 text-indigo-500" />
                                How to Apply This
                            </h3>

                            <ul className="space-y-4">
                                {[
                                    "Read the Prophet's dua for light in your morning adhkar.",
                                    "Refrain from a sin today; sins extinguish the light of the heart.",
                                    "Read one page of the Quran tonight—the Quran itself is described as 'Noor' (Light)."
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm items-start">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm">{i + 1}</span>
                                        <span className="text-zinc-700 dark:text-zinc-300 mt-1">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                </div>
            </article>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12">
                <button className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105">
                    <MessageSquarePlus className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
