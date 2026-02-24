export type TopicCategory =
    | 'Faith & Belief'
    | 'Worship'
    | 'Character'
    | 'Social'
    | 'Finance'
    | 'Emotions'
    | 'Life Guidance'
    | 'Prohibitions';

export type Topic = {
    id: string;
    name: string;
    icon: string; // lucide icon name or emoji
    category: TopicCategory;
    description: string;
    ayahCount: number;
};

export type Mood = {
    id: string;
    name: string;
    emoji: string;
    mappedEmotions: string[];
    ayahCount: number;
};

export type PassageAyah = {
    ayahNumber: number;
    arabicText: string;
    translation: string;
    isTarget?: boolean;
};

export type Lesson = {
    title: string;
    explanation: string;
    practicalActions: string[];
};

export type AyahResult = {
    id: string;
    topicId?: string;
    moodId?: string;
    surahNumber: number;
    surahName: string;
    surahNameArabic: string;
    targetAyahRange: string;
    passageContext: PassageAyah[];
    lesson: Lesson;
};

export const MOCK_TOPICS: Topic[] = [
    { id: 't1', name: 'Tawheed (Oneness)', icon: '☝️', category: 'Faith & Belief', description: 'Understanding the absolute oneness of Allah', ayahCount: 142 },
    { id: 't2', name: 'Trust in Allah (Tawakkul)', icon: '🌿', category: 'Faith & Belief', description: 'Relying completely on Allah in all affairs', ayahCount: 68 },
    { id: 't3', name: 'Prayer (Salah)', icon: '🕌', category: 'Worship', description: 'The importance and wisdom of establishing prayer', ayahCount: 85 },
    { id: 't4', name: 'Charity (Sadaqah)', icon: '🤲', category: 'Worship', description: 'Giving from what Allah has provided', ayahCount: 110 },
    { id: 't5', name: 'Patience (Sabr)', icon: '⏳', category: 'Character', description: 'Endurance through trials and obedience', ayahCount: 90 },
    { id: 't6', name: 'Gratitude (Shukr)', icon: '✨', category: 'Character', description: 'Acknowledging and being thankful for blessings', ayahCount: 75 },
    { id: 't7', name: 'Family & Marriage', icon: '👨‍👩‍👧‍👦', category: 'Social', description: 'Rights, roles, and harmony in the household', ayahCount: 54 },
    { id: 't8', name: 'Justice', icon: '⚖️', category: 'Social', description: 'Standing firm for justice even against oneself', ayahCount: 42 },
    { id: 't9', name: 'Riba / Interest', icon: '🚫', category: 'Finance', description: 'The prohibition and harm of usurious transactions', ayahCount: 12 },
    { id: 't10', name: 'Wealth & Provision', icon: '💎', category: 'Finance', description: 'Understanding sustenance comes only from Allah', ayahCount: 88 },
    { id: 't11', name: 'Anxiety & Worry', icon: '🌧️', category: 'Emotions', description: 'Finding peace when overwhelmed', ayahCount: 45 },
    { id: 't12', name: 'Grief & Sadness', icon: '💧', category: 'Emotions', description: 'Comfort during moments of deep sorrow', ayahCount: 38 },
    { id: 't13', name: 'Repentance (Tawbah)', icon: '🔄', category: 'Life Guidance', description: 'Returning to Allah after falling short', ayahCount: 115 },
    { id: 't14', name: 'Purpose of Life', icon: '🎯', category: 'Life Guidance', description: 'Why we were created and our ultimate goal', ayahCount: 25 },
];

export const MOCK_MOODS: Mood[] = [
    { id: 'm1', name: 'Anxious / Worried', emoji: '😰', mappedEmotions: ['Fear', 'Concern'], ayahCount: 45 },
    { id: 'm2', name: 'Sad / Grieving', emoji: '😢', mappedEmotions: ['Grief', 'Loss'], ayahCount: 38 },
    { id: 'm3', name: 'Grateful', emoji: '🤲', mappedEmotions: ['Gratitude', 'Joy'], ayahCount: 75 },
    { id: 'm4', name: 'Angry / Frustrated', emoji: '😤', mappedEmotions: ['Anger', 'Injustice'], ayahCount: 22 },
    { id: 'm5', name: 'Hopeful', emoji: '🌅', mappedEmotions: ['Hope', 'Optimism'], ayahCount: 80 },
    { id: 'm6', name: 'Lost / Confused', emoji: '🤔', mappedEmotions: ['Reflection', 'Searching'], ayahCount: 50 },
    { id: 'm7', name: 'Peaceful', emoji: '😌', mappedEmotions: ['Peace', 'Serenity'], ayahCount: 65 },
    { id: 'm8', name: 'Motivated', emoji: '💪', mappedEmotions: ['Determination', 'Strength'], ayahCount: 40 },
    { id: 'm9', name: 'Guilty / Seeking Repentance', emoji: '🙏', mappedEmotions: ['Remorse', 'Regret'], ayahCount: 115 },
    { id: 'm10', name: 'Lonely', emoji: '💔', mappedEmotions: ['Isolation', 'Longing'], ayahCount: 30 },
];

export const MOCK_RESULTS: Record<string, AyahResult[]> = {
    // Topic: Riba
    't9': [
        {
            id: 'res_riba_1',
            topicId: 't9',
            surahNumber: 2,
            surahName: 'Al-Baqarah',
            surahNameArabic: 'البقرة',
            targetAyahRange: '275-276',
            passageContext: [
                {
                    ayahNumber: 274,
                    arabicText: 'الَّذِينَ يُنفِقُونَ أَمْوَالَهُم بِاللَّيْلِ وَالنَّهَارِ سِرًّا وَعَلَانِيَةً فَلَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ',
                    translation: 'Those who spend their wealth [in Allah\'s way] by night and by day, secretly and publicly - they will have their reward with their Lord. And no fear will there be concerning them, nor will they grieve.',
                    isTarget: false
                },
                {
                    ayahNumber: 275,
                    arabicText: 'الَّذِينَ يَأْكُلُونَ الرِّبَا لَا يَقُومُونَ إِلَّا كَمَا يَقُومُ الَّذِي يَتَخَبَّطُهُ الشَّيْطَانُ مِنَ الْمَسِّ ۚ ذَٰلِكَ بِأَنَّهُمْ قَالُوا إِنَّمَا الْبَيْعُ مِثْلُ الرِّبَا ۗ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ۚ...',
                    translation: 'Those who consume interest cannot stand [on the Day of Resurrection] except as one stands who is being beaten by Satan into insanity. That is because they say, "Trade is [just] like interest." But Allah has permitted trade and has forbidden interest...',
                    isTarget: true
                },
                {
                    ayahNumber: 276,
                    arabicText: 'يَمْحَقُ اللَّهُ الرِّبَا وَيُرْبِي الصَّدَقَاتِ ۗ وَاللَّهُ لَا يُحِبُّ كُلَّ كَفَّارٍ أَثِيمٍ',
                    translation: 'Allah destroys interest and gives increase for charities. And Allah does not like every sinning disbeliever.',
                    isTarget: true
                }
            ],
            lesson: {
                title: 'Understanding the Prohibition of Riba',
                explanation: 'These verses were revealed in Madinah to establish a just financial system. The passage directly contrasts giving charity (which Allah multiplies) with consuming interest (which Allah destroys). It highlights that exploiting others\' needs for guaranteed profit is fundamentally unjust and harms society.',
                practicalActions: [
                    'Review your bank accounts — are any earning or paying interest?',
                    'Explore Islamic banking alternatives or credit unions that avoid usury.',
                    'Replace any interest income by giving it away to charity without expecting a reward for it.'
                ]
            }
        }
    ],
    // Mood: Anxious
    'm1': [
        {
            id: 'res_anxious_1',
            moodId: 'm1',
            surahNumber: 94,
            surahName: 'Ash-Sharh',
            surahNameArabic: 'الشرح',
            targetAyahRange: '5-6',
            passageContext: [
                {
                    ayahNumber: 1,
                    arabicText: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ',
                    translation: 'Did We not expand for you, [O Muhammad], your breast?'
                },
                {
                    ayahNumber: 5,
                    arabicText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
                    translation: 'For indeed, with hardship [will be] ease.',
                    isTarget: true
                },
                {
                    ayahNumber: 6,
                    arabicText: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
                    translation: 'Indeed, with hardship [will be] ease.',
                    isTarget: true
                },
                {
                    ayahNumber: 8,
                    arabicText: 'وَإِلَىٰ رَبِّكَ فَارْغَب',
                    translation: 'And to your Lord direct [your] longing.'
                }
            ],
            lesson: {
                title: 'Finding Relief in Difficulty',
                explanation: 'This Surah was revealed to reassure Prophet Muhammad (ﷺ) during a period of immense difficulty and anxiety in Makkah. Allah emphasizes twice that ease doesn\'t just follow hardship, it accompanies it. The linguistic structure implies one hardship is accompanied by multiple forms of ease.',
                practicalActions: [
                    'List three small blessings or moments of ease you can find right now in your current struggle.',
                    'Take a deep breath and remind yourself: "This situation is temporary, and Allah\'s relief is near."',
                    'Redirect your focus from the problem to making dua, as suggested in the final verse.'
                ]
            }
        }
    ]
};
