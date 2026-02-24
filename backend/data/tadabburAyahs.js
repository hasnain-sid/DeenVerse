/**
 * Curated Tadabbur Ayahs — static data for the Ruhani Hub Tadabbur practice.
 *
 * Each ayah includes:
 *  - verseKey: Quran reference (surah:ayah or surah:ayah-ayah)
 *  - arabicText: Arabic text snippet (the key portion of the ayah)
 *  - translation: English translation
 *  - context: A short paragraph framing the verse for contemplation
 *  - guidedQuestions: 3 questions following the Tadabbur methodology:
 *      1. Comprehension — what is Allah telling us?
 *      2. Personal application — how does this relate to my life?
 *      3. Action — what will I change?
 *  - linkedTraitSlug: Tazkia trait this verse naturally connects to
 *  - linkedTafakkurSlugs: Tafakkur topics that link to this ayah
 *  - theme: Thematic grouping for future filtering
 */
export const tadabburAyahs = [
    // ── Linked to Tafakkur topics (primary cross-link ayahs) ────────
    {
        slug: "7-57",
        verseKey: "7:57",
        arabicText: "وَهُوَ الَّذِي يُرْسِلُ الرِّيَاحَ بُشْرًا بَيْنَ يَدَيْ رَحْمَتِهِ",
        translation: "And it is He who sends the winds as good tidings before His mercy until, when they have carried heavy rainclouds, We drive them to a dead land and We send down rain therein and We bring forth thereby fruits of every kind.",
        context: "Notice how Allah sends the winds before the rain — the mercy arrives in stages, preparing the earth before it receives. Nothing in His plan is abrupt or careless.",
        guidedQuestions: [
            "What is Allah telling us about how His mercy operates in this verse?",
            "What 'winds' (early signs of relief) are currently blowing in your life that you might be overlooking?",
            "How can this verse improve your reliance (Tawakkul) on Allah's timing?"
        ],
        linkedTraitSlug: "tawakkul",
        linkedTafakkurSlugs: ["rain-and-water", "clouds"],
        theme: "mercy-and-provision"
    },
    {
        slug: "36-38",
        verseKey: "36:38",
        arabicText: "وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا ذَٰلِكَ تَقْدِيرُ الْعَزِيزِ الْعَلِيمِ",
        translation: "And the sun runs on its fixed course for a term appointed. That is the decree of the All-Mighty, the All-Knowing.",
        context: "The sun follows a precise orbit — never deviating, never late. This verse reveals a universe governed by exact divine decree, not randomness.",
        guidedQuestions: [
            "What does the precision of the sun's course tell you about Allah's control over the universe?",
            "If the sun obeys without fail, where in your life are you resisting the course Allah has set for you?",
            "What is one area where you need to trust Allah's 'decree' (taqdeer) more?"
        ],
        linkedTraitSlug: "tawakkul",
        linkedTafakkurSlugs: ["the-sun"],
        theme: "power-and-order"
    },
    {
        slug: "36-39",
        verseKey: "36:39",
        arabicText: "وَالْقَمَرَ قَدَّرْنَاهُ مَنَازِلَ حَتَّىٰ عَادَ كَالْعُرْجُونِ الْقَدِيمِ",
        translation: "And the moon — We have determined for it phases, until it returns like the old dried curved date stalk.",
        context: "The moon goes through phases — growing full, then shrinking away, then renewing itself. A perfect metaphor for the cycles of faith, energy, and spiritual growth in every believer's life.",
        guidedQuestions: [
            "Which phase of the moon best describes your current spiritual state — growing, full, waning, or hidden?",
            "How does knowing that phases are divinely ordained change your view of spiritual 'low points'?",
            "What renewing practice can you commit to during your spiritual 'new moon' periods?"
        ],
        linkedTraitSlug: "sabr",
        linkedTafakkurSlugs: ["the-moon"],
        theme: "time-and-order"
    },
    {
        slug: "3-190",
        verseKey: "3:190",
        arabicText: "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ",
        translation: "Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding.",
        context: "This verse is the foundation of Tafakkur itself. It tells us that the entire cosmos is a book of signs — but only those with 'understanding' read it. Mere looking is not enough; pondering is required.",
        guidedQuestions: [
            "What does it mean to be from 'those of understanding' (ulul albab)? What distinguishes them?",
            "When did you last truly stop and ponder a natural phenomenon, not just glance at it?",
            "What is one sign in creation you can commit to contemplating this week with real attention?"
        ],
        linkedTraitSlug: "muraqaba",
        linkedTafakkurSlugs: ["day-and-night", "the-sky"],
        theme: "contemplation-and-awareness"
    },
    {
        slug: "28-73",
        verseKey: "28:73",
        arabicText: "وَمِن رَّحْمَتِهِ جَعَلَ لَكُمُ اللَّيْلَ وَالنَّهَارَ لِتَسْكُنُوا فِيهِ وَلِتَبْتَغُوا مِن فَضْلِهِ",
        translation: "And out of His mercy He made for you the night and the day that you may rest therein and [by day] seek from His bounty and [that] perhaps you will be grateful.",
        context: "The alternation of day and night is not just an astronomical fact — it is a deliberate act of mercy designed for our physical and spiritual needs. Rest is a gift, not a weakness.",
        guidedQuestions: [
            "How does this verse reframe your view of rest and sleep as acts of mercy, not laziness?",
            "Are you struggling against Allah's design by working when you should rest, or resting when you should seek His bounty?",
            "What is one practical change you can make to honor this daily mercy cycle?"
        ],
        linkedTraitSlug: "shukr",
        linkedTafakkurSlugs: ["day-and-night", "sleep-the-minor-death"],
        theme: "mercy-and-provision"
    },
    {
        slug: "50-6",
        verseKey: "50:6",
        arabicText: "أَفَلَمْ يَنظُرُوا إِلَى السَّمَاءِ فَوْقَهُمْ كَيْفَ بَنَيْنَاهَا وَزَيَّنَّاهَا وَمَا لَهَا مِن فُرُوجٍ",
        translation: "Do they not look at the sky above them — how We have built it and adorned it, and it has no rifts?",
        context: "Allah challenges us to look up. The sky is a flawless structure — no cracks, no imperfections. A canopy of protection built without pillars. This should humble us.",
        guidedQuestions: [
            "When was the last time you truly looked at the sky with wonder, not just as a backdrop?",
            "The sky has no imperfections. How does this perfection reflect on its Creator?",
            "What 'skylike protection' has Allah placed in your life that you've been blind to?"
        ],
        linkedTraitSlug: "tawadu",
        linkedTafakkurSlugs: ["the-sky"],
        theme: "creation-and-wonder"
    },
    {
        slug: "20-53",
        verseKey: "20:53",
        arabicText: "الَّذِي جَعَلَ لَكُمُ الْأَرْضَ مَهْدًا وَسَلَكَ لَكُمْ فِيهَا سُبُلًا وَأَنزَلَ مِنَ السَّمَاءِ مَاءً",
        translation: "He who made for you the earth as a bed and traced for you therein pathways and sent down from the sky water.",
        context: "The earth is described as a 'mahd' — a cradle, a bed. It is firm enough to build on yet soft enough to dig into. A planet perfectly calibrated for human habitation.",
        guidedQuestions: [
            "What does it mean that Allah prepared the earth specifically as a 'cradle' for you?",
            "The earth produces food, absorbs waste, and sustains life. How does this provision affect your gratitude?",
            "What 'pathways' has Allah traced in your life that you only see when you look back?"
        ],
        linkedTraitSlug: "shukr",
        linkedTafakkurSlugs: ["the-earth"],
        theme: "provision-and-habitation"
    },
    {
        slug: "59-21",
        verseKey: "59:21",
        arabicText: "لَوْ أَنزَلْنَا هَٰذَا الْقُرْآنَ عَلَىٰ جَبَلٍ لَّرَأَيْتَهُ خَاشِعًا مُّتَصَدِّعًا مِّنْ خَشْيَةِ اللَّهِ",
        translation: "If We had sent down this Quran upon a mountain, you would have seen it humbled and splitting apart from fear of Allah.",
        context: "Mountains — the most massive, solid structures on earth — would crumble under the weight of the Quran. Yet we carry it in our hearts. This verse is both a warning and a call to humility.",
        guidedQuestions: [
            "A mountain would split from the weight of the Quran, yet your heart receives it. What responsibility does this carry?",
            "Has your heart become harder than a mountain towards certain verses? Which ones?",
            "What is one verse that, if you truly internalized it, would transform your daily behavior?"
        ],
        linkedTraitSlug: "khushoo",
        linkedTafakkurSlugs: ["mountains"],
        theme: "awe-and-humility"
    },
    {
        slug: "55-19-20",
        verseKey: "55:19-20",
        arabicText: "مَرَجَ الْبَحْرَيْنِ يَلْتَقِيَانِ ﴿١٩﴾ بَيْنَهُمَا بَرْزَخٌ لَّا يَبْغِيَانِ",
        translation: "He released the two seas, meeting side by side. Between them is a barrier so neither of them transgresses.",
        context: "Fresh and salt water meet but do not mix — held apart by an invisible barrier. A physical miracle visible to marine scientists today, revealed 1400 years ago.",
        guidedQuestions: [
            "Two seas meet but do not cross their boundary. What boundaries in your life has Allah set that you struggle to respect?",
            "This verse reveals a hidden order in nature. What hidden order might exist in a situation you find chaotic?",
            "How does this miracle increase your conviction that the Quran is from Allah?"
        ],
        linkedTraitSlug: "tawadu",
        linkedTafakkurSlugs: ["seas-and-oceans"],
        theme: "miracles-and-boundaries"
    },
    {
        slug: "16-68",
        verseKey: "16:68-69",
        arabicText: "وَأَوْحَىٰ رَبُّكَ إِلَى النَّحْلِ أَنِ اتَّخِذِي مِنَ الْجِبَالِ بُيُوتًا وَمِنَ الشَّجَرِ وَمِمَّا يَعْرِشُونَ",
        translation: "And your Lord inspired to the bee: 'Take for yourself among the mountains, houses, and among the trees and in that which they construct.'",
        context: "Allah uses the word 'awha' (inspired/revealed) for the bee — the same root used for divine revelation to prophets. A tiny creature receiving divine instruction to build, produce, and serve.",
        guidedQuestions: [
            "If Allah guides a bee so precisely, how much more has He planned your path?",
            "The bee produces honey — healing for people — from its body. What beneficial 'honey' can you produce from your experiences?",
            "Bees serve without seeking recognition. How does this challenge your motivation for good deeds?"
        ],
        linkedTraitSlug: "ikhlas",
        linkedTafakkurSlugs: ["bees"],
        theme: "purpose-and-service"
    },
    {
        slug: "6-95",
        verseKey: "6:95",
        arabicText: "إِنَّ اللَّهَ فَالِقُ الْحَبِّ وَالنَّوَىٰ يُخْرِجُ الْحَيَّ مِنَ الْمَيِّتِ وَمُخْرِجُ الْمَيِّتِ مِنَ الْحَيِّ",
        translation: "Indeed, Allah is the splitter of the seed and the date pit. He brings forth the living from the dead and the dead from the living.",
        context: "A dry, lifeless seed cracks open in dark soil and produces a living plant. Life from death, growth from stillness. This is not biology alone — this is divine will in action.",
        guidedQuestions: [
            "What 'dead' area of your life is Allah trying to bring forth life from right now?",
            "Seeds must break open to grow. What comfortable form do you need to break out of?",
            "If Allah can bring life from a dead seed, what hopeless situation can He not reverse?"
        ],
        linkedTraitSlug: "husn-al-dhann",
        linkedTafakkurSlugs: ["seeds-and-growth"],
        theme: "transformation-and-hope"
    },
    {
        slug: "14-24-25",
        verseKey: "14:24-25",
        arabicText: "أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ",
        translation: "Have you not considered how Allah presents an example — a good word like a good tree, whose root is firmly fixed and its branches reach into the sky?",
        context: "The Quran compares a good word (kalima tayyiba) to a tree with deep roots and high branches. Scholarship identifies this as the shahada — the declaration of faith that roots into the heart and its fruits reach the heavens.",
        guidedQuestions: [
            "What are the 'roots' of your faith? Are they deep enough to withstand storms?",
            "A good word produces fruit constantly. What fruits is your faith producing in your daily life?",
            "What words do you plant in the hearts of your family and community?"
        ],
        linkedTraitSlug: "sidq",
        linkedTafakkurSlugs: ["trees-and-seasons"],
        theme: "faith-and-growth"
    },
    {
        slug: "3-185",
        verseKey: "3:185",
        arabicText: "كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ الْقِيَامَةِ",
        translation: "Every soul will taste death, and you will only be given your full compensation on the Day of Resurrection.",
        context: "Death is described as something every soul will 'taste' — not simply experience, but taste, as one tastes food. It is intimate and unavoidable. Yet full compensation comes after. This life is not the final accounting.",
        guidedQuestions: [
            "If death is certain, what are you postponing that you should do today?",
            "The verse says compensation is 'on the Day of Resurrection' — not in this life. How does this change your expectations?",
            "What would you regret most if you knew this was your last week?"
        ],
        linkedTraitSlug: "zuhd",
        linkedTafakkurSlugs: ["death"],
        theme: "mortality-and-urgency"
    },
    {
        slug: "39-42",
        verseKey: "39:42",
        arabicText: "اللَّهُ يَتَوَفَّى الْأَنفُسَ حِينَ مَوْتِهَا وَالَّتِي لَمْ تَمُتْ فِي مَنَامِهَا",
        translation: "Allah takes the souls at the time of their death, and those that do not die during their sleep. He keeps those for which He has decreed death and releases the others for a specified term.",
        context: "Every night when you sleep, your soul is taken. Every morning it is returned. Sleep is genuinely a 'minor death' — you are completely vulnerable, held only by Allah's will.",
        guidedQuestions: [
            "If your soul is taken every night in sleep, what does it mean that you woke up today?",
            "How does viewing sleep as a minor death change the weight of your morning du'a?",
            "What would you want your last conscious thought to be each night, knowing your soul is leaving?"
        ],
        linkedTraitSlug: "tawakkul",
        linkedTafakkurSlugs: ["sleep-the-minor-death"],
        theme: "vulnerability-and-trust"
    },
    {
        slug: "95-4",
        verseKey: "95:4",
        arabicText: "لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ",
        translation: "We have certainly created man in the best of form.",
        context: "Allah declares that the human being is created in the best form — not just physically, but in potential, in dignity, in purpose. This is both an honor and a responsibility.",
        guidedQuestions: [
            "If you are created in 'the best of form,' what does that say about your inherent worth and dignity?",
            "How are you honoring the body and mind Allah gave you — or are you neglecting them?",
            "The next verse says humans can be reduced to 'the lowest of the low.' What brings about that fall?"
        ],
        linkedTraitSlug: "shukr",
        linkedTafakkurSlugs: ["the-human-body"],
        theme: "dignity-and-purpose"
    },
    {
        slug: "23-12-14",
        verseKey: "23:12-14",
        arabicText: "وَلَقَدْ خَلَقْنَا الْإِنسَانَ مِن سُلَالَةٍ مِّن طِينٍ",
        translation: "And certainly We created man from an extract of clay. Then We placed him as a sperm-drop in a firm lodging. Then We made the sperm-drop into a clinging clot, and We made the clot into a lump, and We made from the lump, bones, and We covered the bones with flesh; then We developed him into another creation.",
        context: "This passage describes the stages of human creation with remarkable precision — from clay to sperm, to clot, to bones, to flesh. Each stage is a separate act of divine craftsmanship.",
        guidedQuestions: [
            "You were once a mere drop. How does remembering your origin affect your humility towards others?",
            "Each creation stage required Allah's direct will. What does this say about 'chance' or 'accident' in your existence?",
            "The verse ends with 'another creation' — a soul-bearing being. What makes you more than your biology?"
        ],
        linkedTraitSlug: "tawadu",
        linkedTafakkurSlugs: ["conception-and-birth"],
        theme: "creation-and-miracle"
    },
    {
        slug: "103-1-3",
        verseKey: "103:1-3",
        arabicText: "وَالْعَصْرِ ﴿١﴾ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ﴿٢﴾ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
        translation: "By time. Indeed, mankind is in loss — except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
        context: "Imam Ash-Shafi'i said if only this surah was revealed, it would be sufficient for humanity. In three verses, it gives the complete formula for a successful life: faith, action, truth, and patience.",
        guidedQuestions: [
            "This surah lists four conditions to escape loss. Which one are you strongest in, and which needs the most work?",
            "How are you advising others towards truth and patience — or are you only focused on yourself?",
            "If you audited today by this surah's criteria, would you be among those 'in loss' or 'excepted'?"
        ],
        linkedTraitSlug: "mujahadah",
        linkedTafakkurSlugs: ["time"],
        theme: "time-and-accountability"
    },
    {
        slug: "20-115",
        verseKey: "20:115",
        arabicText: "وَلَقَدْ عَهِدْنَا إِلَىٰ آدَمَ مِن قَبْلُ فَنَسِيَ وَلَمْ نَجِدْ لَهُ عَزْمًا",
        translation: "And We had already taken a promise from Adam before, but he forgot; and We found not in him determination.",
        context: "Even Adam — the father of humanity, who spoke directly with Allah — forgot his covenant. Forgetting is part of the human condition, not an excuse but a reality that demands continual renewal of commitment.",
        guidedQuestions: [
            "What promise to Allah have you made and forgotten? Can you renew it today?",
            "If Adam (peace be upon him) forgot, how does this comfort you when you repeat mistakes?",
            "What system can you put in place to remind yourself of your commitments to Allah?"
        ],
        linkedTraitSlug: "sabr",
        linkedTafakkurSlugs: ["forgetting"],
        theme: "human-nature-and-mercy"
    },
    {
        slug: "14-7",
        verseKey: "14:7",
        arabicText: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
        translation: "If you are grateful, I will surely increase you [in favor]; but if you deny, indeed, My punishment is severe.",
        context: "This is a divine promise — a contract from Allah Himself. Gratitude leads to increase, and ingratitude leads to loss. The formula is simple, but practicing it is the challenge of a lifetime.",
        guidedQuestions: [
            "What specific blessing has Allah increased for you because you were grateful?",
            "Where in your life are you being ungrateful without realizing it?",
            "How can you turn your gratitude from a feeling into a daily practice?"
        ],
        linkedTraitSlug: "shukr",
        linkedTafakkurSlugs: ["gratitude-moments"],
        theme: "gratitude-and-abundance"
    },
    {
        slug: "2-155-156",
        verseKey: "2:155-156",
        arabicText: "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ وَبَشِّرِ الصَّابِرِينَ",
        translation: "And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient.",
        context: "Allah does not say 'you might be tested' — He says 'We WILL test you.' But notice: the test comes with 'something of' (bi-shay'in min) — never the full measure. And the reward is for those who are patient.",
        guidedQuestions: [
            "Which of these tests — fear, hunger, loss of wealth, loss of lives — are you currently experiencing?",
            "The verse says 'something of' — meaning the test is measured. How does knowing it's limited change your perspective?",
            "What does it mean to you that the 'good tidings' are specifically for the patient (as-sabireen)?"
        ],
        linkedTraitSlug: "sabr",
        linkedTafakkurSlugs: ["pain", "hunger"],
        theme: "trials-and-patience"
    },
    {
        slug: "94-5-6",
        verseKey: "94:5-6",
        arabicText: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ﴿٥﴾ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
        translation: "For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.",
        context: "Repeated twice for emphasis. And the Arabic is precise: it says 'WITH' (ma'a) hardship, not 'after.' The ease is already present within the difficulty — you just need to find it.",
        guidedQuestions: [
            "'With hardship comes ease' — not after. Where can you see ease already existing inside your current difficulty?",
            "Why does Allah repeat this promise twice? What does that repetition mean to your heart right now?",
            "What hardship in your past eventually revealed an ease you couldn't have planned?"
        ],
        linkedTraitSlug: "sabr",
        linkedTafakkurSlugs: ["pain"],
        theme: "hope-and-resilience"
    },
    {
        slug: "2-186",
        verseKey: "2:186",
        arabicText: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
        translation: "And when My servants ask you concerning Me — indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
        context: "Notice that Allah did not say 'Tell them I am near.' He said 'I am near' — directly, without an intermediary. This is the only question in the Quran where Allah answers directly without saying 'Qul' (Say).",
        guidedQuestions: [
            "Allah says 'I am near' without an intermediary. How does this intimacy change the way you make du'a?",
            "If Allah responds to every du'a, how do you explain the ones that seem unanswered?",
            "When was the last time you made du'a not asking for something, but simply talking to Allah?"
        ],
        linkedTraitSlug: "husn-al-dhann",
        linkedTafakkurSlugs: ["unanswered-dua"],
        theme: "prayer-and-closeness"
    },
    {
        slug: "65-2-3",
        verseKey: "65:2-3",
        arabicText: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ﴿٢﴾ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
        translation: "And whoever fears Allah — He will make for him a way out. And will provide for him from where he does not expect.",
        context: "Two promises tied to one condition: taqwa (God-consciousness). The way out comes first, then provision from unexpected sources. Both are for those who maintain their relationship with Allah.",
        guidedQuestions: [
            "What 'way out' has Allah made for you in a situation that seemed impossible?",
            "Provision 'from where you do not expect' — what unexpected source has Allah used to provide for you?",
            "If taqwa is the key, what specific act of taqwa can you increase this week?"
        ],
        linkedTraitSlug: "tawakkul",
        linkedTafakkurSlugs: ["unexpected-mercies"],
        theme: "provision-and-trust"
    },
    {
        slug: "16-16",
        verseKey: "16:16",
        arabicText: "وَعَلَامَاتٍ وَبِالنَّجْمِ هُمْ يَهْتَدُونَ",
        translation: "And landmarks. And by the stars they are guided.",
        context: "Stars served as navigation for ancient sailors and travelers. Today, they still guide — not just physically, but spiritually. The same Creator who placed stars to guide travelers placed the Quran to guide hearts.",
        guidedQuestions: [
            "Stars guided travelers in darkness. What guiding 'star' has Allah placed in your life during dark times?",
            "If stars are for guidance, what in your life functions as a false star — guiding you in the wrong direction?",
            "How does the Quran serve as your north star in daily decisions?"
        ],
        linkedTraitSlug: "muraqaba",
        linkedTafakkurSlugs: ["the-stars"],
        theme: "guidance-and-purpose"
    },
    {
        slug: "24-43",
        verseKey: "24:43",
        arabicText: "أَلَمْ تَرَ أَنَّ اللَّهَ يُزْجِي سَحَابًا ثُمَّ يُؤَلِّفُ بَيْنَهُ ثُمَّ يَجْعَلُهُ رُكَامًا",
        translation: "Do you not see that Allah drives clouds? Then He brings them together, then He makes them into a mass, and you see the rain emerge from within it.",
        context: "This verse describes the water cycle with scientific precision. Clouds are driven, merged, stacked, and then release rain. A process described 1400 years before modern meteorology.",
        guidedQuestions: [
            "Allah 'drives' clouds — they have no will of their own. In what areas of your life do you resist being driven by divine guidance?",
            "Clouds gather before they can release rain. What skills, experiences, or relationships is Allah gathering in your life right now?",
            "Heavy clouds eventually release their burden. What burden are you carrying that might become a source of growth for others?"
        ],
        linkedTraitSlug: "tawakkul",
        linkedTafakkurSlugs: ["clouds"],
        theme: "divine-engineering"
    },
    {
        slug: "6-38",
        verseKey: "6:38",
        arabicText: "وَمَا مِن دَابَّةٍ فِي الْأَرْضِ وَلَا طَائِرٍ يَطِيرُ بِجَنَاحَيْهِ إِلَّا أُمَمٌ أَمْثَالُكُم",
        translation: "And there is no creature on earth or bird that flies with its wings except that they are communities like you.",
        context: "Animals are not random beings — they are organized communities (umam) like human nations. They have social structures, communication, and purpose. This verse demands respect for all creation.",
        guidedQuestions: [
            "If animals are 'communities like you,' how should this change the way you view and treat them?",
            "What can you learn from the community structures of ants, bees, or birds about your own community?",
            "Animals fulfill their purpose without rebellion. What part of your fitrah (natural purpose) are you neglecting?"
        ],
        linkedTraitSlug: "tawadu",
        linkedTafakkurSlugs: ["animals-and-instinct"],
        theme: "creation-and-community"
    },
    {
        slug: "3-137",
        verseKey: "3:137",
        arabicText: "قَدْ خَلَتْ مِن قَبْلِكُمْ سُنَنٌ فَسِيرُوا فِي الْأَرْضِ فَانظُرُوا كَيْفَ كَانَ عَاقِبَةُ الْمُكَذِّبِينَ",
        translation: "Similar situations have passed before you, so travel through the earth and see what was the end of those who denied.",
        context: "Allah commands us to travel, study history, and learn from the ruins of those who came before. History is not entertainment — it is a teacher, and its lessons are divine warnings.",
        guidedQuestions: [
            "What historical example of a fallen power or person has most impacted your understanding of accountability?",
            "If civilizations with immense power were destroyed for their arrogance, what personal arrogance should you address?",
            "How can you 'travel the earth' (even through books and knowledge) to learn from the past this month?"
        ],
        linkedTraitSlug: "tawadu",
        linkedTafakkurSlugs: ["rise-and-fall-of-nations"],
        theme: "history-and-accountability"
    },
    {
        slug: "30-22",
        verseKey: "30:22",
        arabicText: "وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ وَأَلْوَانِكُمْ",
        translation: "And of His signs is the creation of the heavens and the earth and the diversity of your languages and your colors.",
        context: "Diversity — of language, skin color, and culture — is listed as one of Allah's signs, alongside the heavens and earth. It is not a problem to solve but a sign to marvel at.",
        guidedQuestions: [
            "If diversity of language and color is a sign of Allah like the heavens and earth, how should it be treated?",
            "What prejudice or bias do you carry that this verse challenges you to confront?",
            "How can appreciating diversity become an act of worship (recognizing Allah's signs) for you?"
        ],
        linkedTraitSlug: "adl",
        linkedTafakkurSlugs: ["languages-and-cultures"],
        theme: "diversity-and-unity"
    },
    {
        slug: "28-5",
        verseKey: "28:5-6",
        arabicText: "وَنُرِيدُ أَن نَّمُنَّ عَلَى الَّذِينَ اسْتُضْعِفُوا فِي الْأَرْضِ وَنَجْعَلَهُمْ أَئِمَّةً وَنَجْعَلَهُمُ الْوَارِثِينَ",
        translation: "And We wanted to confer favor upon those who were oppressed in the land and make them leaders and make them inheritors.",
        context: "This is Allah's sunnah (way): the oppressed will eventually be elevated. Banu Israel were enslaved, then became leaders. Yusuf was imprisoned, then became ruler. Allah's justice operates on a timeline we cannot always see.",
        guidedQuestions: [
            "If Allah's plan is to elevate the oppressed, what role do you play in supporting those who are currently oppressed?",
            "Have you ever been in a position of weakness that Allah turned into strength? What did that teach you?",
            "How does this verse give you hope for the Muslim ummah's current challenges?"
        ],
        linkedTraitSlug: "sabr",
        linkedTafakkurSlugs: ["the-oppressed-finding-relief"],
        theme: "justice-and-elevation"
    },

    // ── Additional contemplation ayahs (not directly linked to a Tafakkur topic) ──
    {
        slug: "47-24",
        verseKey: "47:24",
        arabicText: "أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَىٰ قُلُوبٍ أَقْفَالُهَا",
        translation: "Then do they not ponder the Quran, or are there locks upon their hearts?",
        context: "The foundational verse of Tadabbur — Allah asks a piercing question: either you are pondering the Quran, or your heart has locks. There is no neutral state.",
        guidedQuestions: [
            "This verse implies your heart may be 'locked.' What might be locking your heart from the Quran's impact?",
            "When you read the Quran, do you read for quantity or quality? What would change if you slowed down?",
            "What is one verse you have read dozens of times but never truly stopped to ponder?"
        ],
        linkedTraitSlug: "khushoo",
        linkedTafakkurSlugs: [],
        theme: "tadabbur-itself"
    },
    {
        slug: "38-29",
        verseKey: "38:29",
        arabicText: "كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ وَلِيَتَذَكَّرَ أُولُو الْأَلْبَابِ",
        translation: "This is a blessed Book which We have revealed to you, that they might reflect upon its verses and that those of understanding would be reminded.",
        context: "The Quran was not revealed merely to be recited — it was revealed to be reflected upon. Its purpose is tadabbur (deep reflection) and tadhakkur (being reminded). Beautiful recitation without understanding misses the point.",
        guidedQuestions: [
            "If the Quran's purpose is reflection, how much of your Quran time is spent truly reflecting vs. simply reciting?",
            "What is one verse that 'reminded' you of something important at exactly the right moment in your life?",
            "How can you restructure your daily Quran practice to include even 5 minutes of real tadabbur?"
        ],
        linkedTraitSlug: "khushoo",
        linkedTafakkurSlugs: [],
        theme: "tadabbur-itself"
    }
];
