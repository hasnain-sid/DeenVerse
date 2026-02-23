/**
 * Static topic and mood taxonomy for the Quran Topic Discovery feature.
 *
 * Each topic has:
 *  - slug: URL-safe identifier
 *  - name / nameArabic
 *  - icon: Lucide icon name (frontend renders)
 *  - description: one-line summary
 *  - category: grouping for browse UI
 *  - datasetTags: mapped to the Kaggle thematic dataset tags
 *  - ayahRefs: manually curated key ayah references (surah:ayah)
 *
 * Each mood has:
 *  - id, name, emoji
 *  - mappedEmotions: emotions from the dataset emotion column
 *  - relatedTopics: topic slugs that fit this mood
 */

// ── TOPICS ──────────────────────────────────────────────

export const TOPICS = [
  // ─── Faith & Belief ───────────────────────────────────
  {
    slug: "tawheed",
    name: "Tawheed (Oneness of Allah)",
    nameArabic: "التوحيد",
    icon: "Sun",
    description: "Verses affirming the absolute Oneness of Allah and the foundation of Islamic belief.",
    category: "Faith & Belief",
    datasetTags: ["Faith", "Tawheed", "Divine Attributes"],
    ayahRefs: [
      [112, 1], [112, 2], [112, 3], [112, 4],
      [2, 255], [59, 22], [59, 23], [59, 24],
      [3, 18], [6, 102], [6, 103], [20, 14],
      [23, 91], [42, 11], [57, 3],
    ],
  },
  {
    slug: "hereafter",
    name: "Belief in the Hereafter",
    nameArabic: "الآخرة",
    icon: "Sunrise",
    description: "What the Quran teaches about the Day of Judgment, paradise, and the afterlife.",
    category: "Faith & Belief",
    datasetTags: ["Hereafter", "Aqeedah", "Accountability"],
    ayahRefs: [
      [99, 1], [99, 2], [99, 3], [99, 4], [99, 5], [99, 6], [99, 7], [99, 8],
      [56, 1], [56, 2], [56, 3], [56, 4],
      [82, 1], [82, 2], [82, 3], [82, 4], [82, 5],
      [3, 185], [21, 35], [29, 57], [50, 19],
    ],
  },
  {
    slug: "tawakkul",
    name: "Trust in Allah (Tawakkul)",
    nameArabic: "التوكل على الله",
    icon: "Shield",
    description: "Relying on Allah after doing your best — the balance between effort and surrender.",
    category: "Faith & Belief",
    datasetTags: ["Tawakkul", "Faith", "Trust"],
    ayahRefs: [
      [3, 159], [65, 3], [8, 2], [9, 51],
      [12, 67], [14, 12], [33, 3], [39, 38],
      [5, 11], [7, 89], [11, 56], [13, 30],
      [25, 58], [26, 217],
    ],
  },

  // ─── Worship ──────────────────────────────────────────
  {
    slug: "salah",
    name: "Prayer (Salah)",
    nameArabic: "الصلاة",
    icon: "HandHeart",
    description: "The importance of establishing prayer and its role as a conversation with Allah.",
    category: "Worship",
    datasetTags: ["Worship", "Prayer", "Salah"],
    ayahRefs: [
      [2, 238], [29, 45], [20, 14], [11, 114],
      [2, 43], [4, 103], [17, 78], [23, 1], [23, 2],
      [70, 22], [70, 23], [70, 34],
      [2, 153], [107, 4], [107, 5],
    ],
  },
  {
    slug: "fasting",
    name: "Fasting (Sawm)",
    nameArabic: "الصيام",
    icon: "Moon",
    description: "Quranic guidance on fasting, its purpose, and its spiritual rewards.",
    category: "Worship",
    datasetTags: ["Worship", "Fasting"],
    ayahRefs: [
      [2, 183], [2, 184], [2, 185], [2, 186], [2, 187],
    ],
  },
  {
    slug: "charity-zakat",
    name: "Charity & Zakat",
    nameArabic: "الزكاة والصدقة",
    icon: "Heart",
    description: "Giving in the way of Allah — obligatory zakat and voluntary sadaqah.",
    category: "Worship",
    datasetTags: ["Charity", "Zakat", "Spending"],
    ayahRefs: [
      [2, 261], [2, 262], [2, 263], [2, 264],
      [2, 267], [2, 271], [2, 274],
      [9, 60], [9, 103], [57, 7], [57, 18],
      [64, 16], [92, 5], [92, 6], [92, 7],
    ],
  },
  {
    slug: "dua-supplication",
    name: "Dua & Supplication",
    nameArabic: "الدعاء",
    icon: "HandMetal",
    description: "Calling upon Allah — He is near and responds to the sincere caller.",
    category: "Worship",
    datasetTags: ["Supplication", "Dua", "Worship"],
    ayahRefs: [
      [2, 186], [40, 60], [27, 62],
      [7, 55], [7, 56], [3, 38],
      [14, 40], [14, 41], [25, 74],
      [21, 83], [21, 87], [21, 89],
    ],
  },

  // ─── Character ────────────────────────────────────────
  {
    slug: "patience-sabr",
    name: "Patience (Sabr)",
    nameArabic: "الصبر",
    icon: "Anchor",
    description: "Enduring trials with steadfastness — patience is half of faith.",
    category: "Character",
    datasetTags: ["Patience", "Sabr", "Steadfastness"],
    ayahRefs: [
      [2, 153], [2, 155], [2, 156], [2, 157],
      [3, 200], [11, 115], [16, 127],
      [39, 10], [103, 1], [103, 2], [103, 3],
      [31, 17], [46, 35], [90, 17],
    ],
  },
  {
    slug: "gratitude-shukr",
    name: "Gratitude (Shukr)",
    nameArabic: "الشكر",
    icon: "Sparkles",
    description: "Being thankful to Allah multiplies His blessings — gratitude as worship.",
    category: "Character",
    datasetTags: ["Gratitude", "Blessings", "Thankfulness"],
    ayahRefs: [
      [14, 7], [16, 18], [31, 12],
      [55, 13], [76, 3], [2, 152],
      [27, 40], [34, 13], [46, 15],
      [54, 17], [93, 11],
    ],
  },
  {
    slug: "humility",
    name: "Humility",
    nameArabic: "التواضع",
    icon: "Flower2",
    description: "Walking gently on earth — the virtue of humility before Allah and people.",
    category: "Character",
    datasetTags: ["Humility", "Ethics", "Character"],
    ayahRefs: [
      [25, 63], [31, 18], [31, 19],
      [17, 37], [26, 215], [15, 88],
      [49, 13],
    ],
  },
  {
    slug: "truthfulness",
    name: "Truthfulness & Honesty",
    nameArabic: "الصدق",
    icon: "CheckCircle",
    description: "Speaking truth even when it is difficult — honesty is a mark of the believer.",
    category: "Character",
    datasetTags: ["Truthfulness", "Honesty", "Ethics"],
    ayahRefs: [
      [9, 119], [33, 35], [33, 70],
      [4, 135], [5, 8], [3, 17],
      [49, 15],
    ],
  },
  {
    slug: "forgiveness",
    name: "Forgiveness",
    nameArabic: "المغفرة",
    icon: "HeartHandshake",
    description: "Forgiving others is closer to righteousness — letting go for Allah's sake.",
    category: "Character",
    datasetTags: ["Forgiveness", "Mercy", "Pardon"],
    ayahRefs: [
      [42, 40], [42, 43], [3, 134],
      [24, 22], [7, 199], [41, 34],
      [45, 14], [64, 14],
    ],
  },
  {
    slug: "kindness-ihsan",
    name: "Kindness & Ihsan",
    nameArabic: "الإحسان",
    icon: "Smile",
    description: "Excellence in worship and character — doing good as if you see Allah.",
    category: "Character",
    datasetTags: ["Ihsan", "Kindness", "Good Deeds"],
    ayahRefs: [
      [55, 60], [16, 90], [2, 195],
      [4, 36], [17, 7], [28, 77],
      [29, 69], [31, 3],
    ],
  },

  // ─── Social ───────────────────────────────────────────
  {
    slug: "family-marriage",
    name: "Family & Marriage",
    nameArabic: "الأسرة والزواج",
    icon: "Users",
    description: "Building a family on tranquility, love, and mercy — the Quranic framework.",
    category: "Social",
    datasetTags: ["Family", "Marriage", "Spouse"],
    ayahRefs: [
      [30, 21], [4, 1], [2, 187],
      [25, 74], [66, 6], [7, 189],
      [4, 19], [4, 34], [2, 228],
      [2, 229], [2, 231], [64, 14],
    ],
  },
  {
    slug: "parents",
    name: "Honouring Parents",
    nameArabic: "بر الوالدين",
    icon: "HeartPulse",
    description: "Kindness to parents — one of the most emphasized commands after worshipping Allah.",
    category: "Social",
    datasetTags: ["Parents", "Family", "Kindness"],
    ayahRefs: [
      [17, 23], [17, 24], [31, 14], [31, 15],
      [29, 8], [46, 15], [46, 17],
      [2, 83], [4, 36], [6, 151],
    ],
  },
  {
    slug: "justice",
    name: "Justice & Equity",
    nameArabic: "العدل",
    icon: "Scale",
    description: "Standing firmly for justice even against yourself or loved ones.",
    category: "Social",
    datasetTags: ["Justice", "Equity", "Fairness"],
    ayahRefs: [
      [4, 135], [5, 8], [16, 90],
      [4, 58], [6, 152], [49, 9],
      [42, 15], [57, 25],
    ],
  },
  {
    slug: "community",
    name: "Community & Brotherhood",
    nameArabic: "الأخوة والمجتمع",
    icon: "UsersRound",
    description: "The believers are but brothers — building unity and supporting one another.",
    category: "Social",
    datasetTags: ["Community", "Brotherhood", "Unity"],
    ayahRefs: [
      [49, 10], [49, 13], [3, 103],
      [3, 110], [9, 71], [48, 29],
      [59, 9], [8, 63],
    ],
  },

  // ─── Finance ──────────────────────────────────────────
  {
    slug: "riba-interest",
    name: "Riba / Interest",
    nameArabic: "الربا",
    icon: "Ban",
    description: "The clear prohibition of interest (riba) and the command to trade fairly.",
    category: "Finance",
    datasetTags: ["Justice", "Finance", "Prohibition"],
    ayahRefs: [
      [2, 275], [2, 276], [2, 277], [2, 278], [2, 279], [2, 280],
      [3, 130], [4, 161], [30, 39],
    ],
  },
  {
    slug: "halal-income",
    name: "Honest Trade & Halal Income",
    nameArabic: "الكسب الحلال",
    icon: "Handshake",
    description: "Earning a livelihood through honest means — fair trade and avoiding fraud.",
    category: "Finance",
    datasetTags: ["Trade", "Finance", "Ethics"],
    ayahRefs: [
      [2, 188], [4, 29], [2, 282],
      [11, 85], [83, 1], [83, 2], [83, 3],
      [17, 35], [26, 181], [26, 182], [26, 183],
    ],
  },
  {
    slug: "wealth-provision",
    name: "Wealth & Provision",
    nameArabic: "الرزق",
    icon: "Gem",
    description: "Allah is the Provider — understanding wealth as a test and a trust.",
    category: "Finance",
    datasetTags: ["Provision", "Wealth", "Blessings"],
    ayahRefs: [
      [11, 6], [51, 58], [67, 15],
      [2, 245], [34, 39], [65, 3],
      [17, 30], [28, 77], [62, 10],
    ],
  },

  // ─── Emotions & Healing ───────────────────────────────
  {
    slug: "anxiety-worry",
    name: "Anxiety & Worry",
    nameArabic: "القلق",
    icon: "CloudRain",
    description: "When you feel overwhelmed — Quranic comfort for the worried heart.",
    category: "Emotions",
    datasetTags: ["Hope", "Trust", "Comfort"],
    ayahRefs: [
      [94, 5], [94, 6], [2, 286],
      [13, 28], [3, 139], [9, 51],
      [65, 2], [65, 3], [39, 53],
      [10, 62], [41, 30],
    ],
  },
  {
    slug: "grief-sadness",
    name: "Grief & Sadness",
    nameArabic: "الحزن",
    icon: "CloudDrizzle",
    description: "Finding solace in Allah's words when sorrow weighs on your heart.",
    category: "Emotions",
    datasetTags: ["Comfort", "Patience", "Hope"],
    ayahRefs: [
      [2, 155], [2, 156], [2, 157],
      [12, 86], [12, 87], [93, 1], [93, 2], [93, 3], [93, 4], [93, 5],
      [94, 1], [94, 2], [94, 3], [94, 4],
      [39, 53], [3, 139],
    ],
  },
  {
    slug: "anger-management",
    name: "Anger Management",
    nameArabic: "كظم الغيظ",
    icon: "Flame",
    description: "Controlling anger is a mark of strength — the Quran's guidance on restraint.",
    category: "Emotions",
    datasetTags: ["Ethics", "Self-control", "Patience"],
    ayahRefs: [
      [3, 134], [42, 37], [7, 199],
      [41, 34], [23, 96], [16, 126],
      [3, 159], [25, 63],
    ],
  },
  {
    slug: "hope-optimism",
    name: "Hope & Optimism",
    nameArabic: "الرجاء والتفاؤل",
    icon: "SunMedium",
    description: "Never despair of Allah's mercy — hope as a pillar of the believer's outlook.",
    category: "Emotions",
    datasetTags: ["Hope", "Mercy", "Optimism"],
    ayahRefs: [
      [39, 53], [12, 87], [15, 56],
      [94, 5], [94, 6], [2, 214],
      [65, 7], [93, 3], [3, 139],
      [10, 62], [41, 30],
    ],
  },
  {
    slug: "loneliness",
    name: "Loneliness & Allah's Nearness",
    nameArabic: "الوحدة وقرب الله",
    icon: "HeartCrack",
    description: "You are never alone — Allah is closer to you than your jugular vein.",
    category: "Emotions",
    datasetTags: ["Comfort", "Divine Nearness", "Hope"],
    ayahRefs: [
      [50, 16], [2, 186], [57, 4],
      [58, 7], [56, 85], [8, 24],
      [29, 69], [9, 40],
    ],
  },

  // ─── Life Guidance ────────────────────────────────────
  {
    slug: "repentance-tawbah",
    name: "Repentance (Tawbah)",
    nameArabic: "التوبة",
    icon: "RotateCcw",
    description: "Returning to Allah — His door of mercy is always open for the sincere.",
    category: "Life Guidance",
    datasetTags: ["Repentance", "Forgiveness", "Mercy"],
    ayahRefs: [
      [39, 53], [4, 110], [25, 70], [25, 71],
      [66, 8], [3, 135], [3, 136],
      [11, 3], [11, 90], [20, 82],
      [24, 31],
    ],
  },
  {
    slug: "death-afterlife",
    name: "Death & the Afterlife",
    nameArabic: "الموت والآخرة",
    icon: "Hourglass",
    description: "Every soul will taste death — preparing for the meeting with Allah.",
    category: "Life Guidance",
    datasetTags: ["Death", "Hereafter", "Accountability"],
    ayahRefs: [
      [3, 185], [21, 35], [29, 57],
      [50, 19], [62, 8], [63, 10], [63, 11],
      [23, 99], [23, 100], [102, 1], [102, 2],
    ],
  },
  {
    slug: "knowledge-learning",
    name: "Knowledge & Learning",
    nameArabic: "العلم",
    icon: "BookOpen",
    description: "Seeking knowledge is worship — the Quran's emphasis on reading and understanding.",
    category: "Life Guidance",
    datasetTags: ["Knowledge", "Learning", "Reflection"],
    ayahRefs: [
      [96, 1], [96, 2], [96, 3], [96, 4], [96, 5],
      [20, 114], [39, 9], [58, 11],
      [3, 190], [3, 191], [35, 28],
    ],
  },
  {
    slug: "purpose-of-life",
    name: "Purpose of Life",
    nameArabic: "الغاية من الحياة",
    icon: "Compass",
    description: "Why were we created? The Quran's answer to life's biggest question.",
    category: "Life Guidance",
    datasetTags: ["Purpose", "Creation", "Worship"],
    ayahRefs: [
      [51, 56], [67, 2], [23, 115],
      [76, 1], [76, 2], [76, 3],
      [2, 30], [33, 72], [90, 4],
    ],
  },
  {
    slug: "trials-tests",
    name: "Trials & Tests",
    nameArabic: "الابتلاء",
    icon: "Mountain",
    description: "Life is a test — understanding hardship as a means of growth and purification.",
    category: "Life Guidance",
    datasetTags: ["Trials", "Patience", "Faith"],
    ayahRefs: [
      [2, 155], [2, 156], [2, 214],
      [29, 2], [29, 3], [67, 2],
      [21, 35], [47, 31], [3, 186],
      [89, 15], [89, 16],
    ],
  },

  // ─── Prohibitions ─────────────────────────────────────
  {
    slug: "backbiting-gossip",
    name: "Backbiting & Gossip",
    nameArabic: "الغيبة والنميمة",
    icon: "MessageSquareWarning",
    description: "Guard your tongue — backbiting is like eating your brother's flesh.",
    category: "Prohibitions",
    datasetTags: ["Speech", "Ethics", "Prohibition"],
    ayahRefs: [
      [49, 12], [49, 11], [104, 1],
      [68, 10], [68, 11], [24, 19],
      [33, 58],
    ],
  },
  {
    slug: "intoxicants",
    name: "Alcohol & Intoxicants",
    nameArabic: "الخمر والمسكرات",
    icon: "ShieldAlert",
    description: "The progressive prohibition of intoxicants and why they are harmful.",
    category: "Prohibitions",
    datasetTags: ["Prohibition", "Intoxicants"],
    ayahRefs: [
      [5, 90], [5, 91], [2, 219],
      [4, 43],
    ],
  },
  {
    slug: "fraud-deception",
    name: "Fraud & Deception",
    nameArabic: "الغش والخداع",
    icon: "AlertTriangle",
    description: "Woe to the defrauders — Islam's zero-tolerance for dishonesty in dealings.",
    category: "Prohibitions",
    datasetTags: ["Ethics", "Justice", "Prohibition"],
    ayahRefs: [
      [83, 1], [83, 2], [83, 3],
      [11, 85], [2, 188], [4, 29],
      [26, 181], [26, 182], [26, 183],
    ],
  },
];

// ── MOODS ───────────────────────────────────────────────

export const MOODS = [
  {
    id: "anxious",
    name: "Anxious / Worried",
    emoji: "😰",
    description: "When you feel overwhelmed by worry or uncertainty.",
    mappedEmotions: ["Fear", "Concern", "Anxiety"],
    relatedTopics: ["tawakkul", "anxiety-worry", "dua-supplication"],
  },
  {
    id: "sad",
    name: "Sad / Grieving",
    emoji: "😢",
    description: "When sorrow weighs on your heart and you need comfort.",
    mappedEmotions: ["Grief", "Loss", "Sadness"],
    relatedTopics: ["grief-sadness", "patience-sabr", "hope-optimism"],
  },
  {
    id: "grateful",
    name: "Grateful",
    emoji: "🤲",
    description: "When you want to express thanks to Allah for His blessings.",
    mappedEmotions: ["Gratitude", "Joy", "Contentment"],
    relatedTopics: ["gratitude-shukr", "charity-zakat", "wealth-provision"],
  },
  {
    id: "angry",
    name: "Angry / Frustrated",
    emoji: "😤",
    description: "When you need help controlling anger and responding wisely.",
    mappedEmotions: ["Anger", "Frustration"],
    relatedTopics: ["anger-management", "patience-sabr", "forgiveness"],
  },
  {
    id: "hopeful",
    name: "Hopeful",
    emoji: "🌅",
    description: "When you want to strengthen your hope and look forward with faith.",
    mappedEmotions: ["Hope", "Optimism", "Aspiration"],
    relatedTopics: ["hope-optimism", "tawakkul", "repentance-tawbah"],
  },
  {
    id: "lost",
    name: "Lost / Confused",
    emoji: "🤔",
    description: "When you are looking for direction and purpose in life.",
    mappedEmotions: ["Reflection", "Searching", "Confusion"],
    relatedTopics: ["purpose-of-life", "knowledge-learning", "tawakkul"],
  },
  {
    id: "peaceful",
    name: "Peaceful",
    emoji: "😌",
    description: "When you want to deepen your sense of inner calm and serenity.",
    mappedEmotions: ["Peace", "Serenity", "Calm"],
    relatedTopics: ["dua-supplication", "salah", "tawheed"],
  },
  {
    id: "motivated",
    name: "Motivated",
    emoji: "💪",
    description: "When you are ready to take action and strive for good.",
    mappedEmotions: ["Determination", "Strength", "Energy"],
    relatedTopics: ["purpose-of-life", "kindness-ihsan", "charity-zakat"],
  },
  {
    id: "guilty",
    name: "Seeking Repentance",
    emoji: "🙏",
    description: "When you want to return to Allah and start fresh.",
    mappedEmotions: ["Remorse", "Regret", "Repentance"],
    relatedTopics: ["repentance-tawbah", "forgiveness", "hope-optimism"],
  },
  {
    id: "lonely",
    name: "Lonely",
    emoji: "💔",
    description: "When you feel alone — remember Allah is always near.",
    mappedEmotions: ["Isolation", "Longing"],
    relatedTopics: ["loneliness", "dua-supplication", "community"],
  },
];

// ── CATEGORY LIST for browse UI ─────────────────────────

export const CATEGORIES = [
  "Faith & Belief",
  "Worship",
  "Character",
  "Social",
  "Finance",
  "Emotions",
  "Life Guidance",
  "Prohibitions",
];

// ── LESSONS (per topic) — brief context + practical actions ──

export const TOPIC_LESSONS = {
  "riba-interest": {
    title: "Understanding the Prohibition of Riba",
    explanation:
      "These verses from Surah Al-Baqarah form the most comprehensive passage on riba (interest/usury) in the Quran. Revealed in Madinah, they address the financial ethics of the Muslim community. Allah contrasts interest — which appears to increase wealth — with charity, which truly grows with Allah. The passage escalates from a warning to a declaration of war from Allah and His Messenger against those who persist in dealing with riba.",
    practicalActions: [
      "Review your bank accounts and financial dealings — identify any interest-based transactions.",
      "Research Islamic banking alternatives (profit-sharing accounts, murabaha financing) available in your area.",
      "If you have interest income, give it away as charity immediately — do not keep it for yourself.",
      "Learn the difference between riba (prohibited) and legitimate trade profit (halal) to make informed financial decisions.",
    ],
  },
  "patience-sabr": {
    title: "The Noble Virtue of Patience",
    explanation:
      "Patience (sabr) is mentioned over 90 times in the Quran, making it one of the most emphasized qualities. These verses show three dimensions of patience: patience during hardship, patience in obeying Allah, and patience in avoiding sin. The promise is clear — Allah is with the patient, and their reward is without measure.",
    practicalActions: [
      "Identify one difficulty you are facing right now. Instead of complaining, say 'Inna lillahi wa inna ilayhi raji'un' and make dua for strength.",
      "When you feel like giving up on a good habit (prayer, fasting, kindness), remember that consistency in obedience is a form of sabr.",
      "Practice the 10-second rule: when frustrated, pause for 10 seconds and say 'SubhanAllah' three times before responding.",
    ],
  },
  "anxiety-worry": {
    title: "Quranic Comfort for the Anxious Heart",
    explanation:
      "These verses are a lifeline for the anxious soul. The Quran acknowledges human worry as real but redirects our focus — with every hardship comes ease (repeated twice for emphasis in Surah Ash-Sharh). Allah does not burden a soul beyond its capacity. And the hearts find rest only in the remembrance of Allah.",
    practicalActions: [
      "Write down what is worrying you right now. Then sincerely hand it over to Allah in dua — tell Him everything.",
      "When anxiety spikes, recite 'HasbunAllahu wa ni'mal wakeel' (Allah is sufficient for us, and He is the best Disposer of affairs).",
      "Establish a 5-minute daily dhikr routine — Quran 13:28 promises that remembrance of Allah calms the heart.",
    ],
  },
  "gratitude-shukr": {
    title: "Gratitude Multiplies Blessings",
    explanation:
      "Allah's promise in Surah Ibrahim is profound: 'If you are grateful, I will surely increase you.' Gratitude (shukr) is not just saying 'Alhamdulillah' — it is recognizing blessings with the heart, expressing thanks with the tongue, and using the blessings in obedience to Allah.",
    practicalActions: [
      "Write down 3 specific blessings from today that you overlooked — even something as simple as clean water or health.",
      "Send a genuine thank-you message to someone who helped you recently — the Prophet ﷺ said those who don't thank people don't thank Allah.",
      "Begin and end your day with Alhamdulillah. Make it the first and last word on your lips.",
    ],
  },
  "forgiveness": {
    title: "The Freedom of Forgiveness",
    explanation:
      "The Quran elevates forgiveness as a hallmark of the righteous. These verses make clear that while justice is permissible, forgiveness is better and brings healing. The one who forgives and makes reconciliation — their reward is with Allah. Forgiveness is not weakness; it is liberating yourself from the burden of resentment.",
    practicalActions: [
      "Think of one person who wronged you recently. In your heart, choose to forgive them — not for their sake, but for yours and for Allah's sake.",
      "If someone apologizes to you today, accept it gracefully. Holding grudges harms the holder more than the offender.",
      "Make dua for someone who hurt you. This is the hardest but most liberating act of forgiveness.",
    ],
  },
  "tawakkul": {
    title: "Trust in Allah After Doing Your Best",
    explanation:
      "Tawakkul is the balance between action and surrender. The Quran commands both: make your best effort, then trust Allah with the outcome. It is not passive resignation — the Prophet ﷺ tied his camel, then relied on Allah. These verses show that whoever places their trust in Allah, He is sufficient for them.",
    practicalActions: [
      "Identify one outcome you are anxious about. Do your best preparation, then make dua and consciously let go of the anxiety.",
      "Replace one 'I'm worried about...' thought today with 'I trust Allah's plan for this, and I know He sees the bigger picture.'",
      "Before starting any task today, say 'Bismillah, tawakkaltu alAllah' (In the name of Allah, I place my trust in Allah).",
    ],
  },
  "repentance-tawbah": {
    title: "The Door of Mercy Never Closes",
    explanation:
      "One of the most hopeful themes in the Quran: no matter how far you have strayed, Allah's mercy is greater than your sins. These verses assure us that Allah loves those who repent, that He transforms evil deeds into good ones for the sincere, and that His forgiveness encompasses all sins.",
    practicalActions: [
      "Make a sincere tawbah right now: acknowledge a specific sin, feel genuine regret, ask Allah for forgiveness, and commit to not returning to it.",
      "Pray two rak'ahs of salat at-tawbah. Pour your heart out to Allah in sujood — He is listening.",
      "Remember: shame should drive you toward Allah, not away from Him. He is Al-Ghaffar (the Ever-Forgiving).",
    ],
  },
  "death-afterlife": {
    title: "Preparing for the Inevitable Meeting",
    explanation:
      "The Quran does not shy away from death — it uses it as a motivator. Every soul will taste death, and we will be asked about how we spent our time. These verses are not meant to frighten but to prioritize: what matters today in light of eternity?",
    practicalActions: [
      "Ask yourself: 'If this were my last day, what would I regret not doing?' Take one small step toward it today.",
      "Write a will (wasiyyah) if you haven't — it is a Sunnah and a practical act of preparation.",
      "Increase your good deeds today with the awareness that each one is a seed for your eternal garden.",
    ],
  },
  "salah": {
    title: "Prayer — Your Direct Line to Allah",
    explanation:
      "Salah is the pillar of Islam and the first thing we will be asked about. These verses show that prayer restrains from shameful deeds, that the middle prayer deserves special protection, and that prayer times are divinely appointed. It is not just a ritual — it is standing before the Creator of the universe.",
    practicalActions: [
      "Pray your next salah with full khushoo — put your phone in another room and focus completely on the conversation with Allah.",
      "Add one extra minute of personal dua after your salah — talk to Allah about your day.",
      "If you've been missing prayers, start today: pray the next one on time. Don't wait for 'motivation' — discipline comes first.",
    ],
  },
  "tawheed": {
    title: "The Foundation of Everything",
    explanation:
      "Tawheed (the Oneness of Allah) is the central message of the entire Quran. These verses — including Ayat al-Kursi (2:255), the greatest verse in the Quran — declare Allah's absolute sovereignty, knowledge, and uniqueness. Nothing resembles Him, and He is the source of all existence.",
    practicalActions: [
      "Memorize Ayat al-Kursi (2:255) if you haven't already. Recite it after every salah and before sleep — the Prophet ﷺ confirmed its special protection.",
      "Recite Surah Al-Ikhlas (112) three times — it equals one-third of the Quran in meaning.",
      "Look around you right now: the sky, your hands, the air you breathe. Each is a sign of the One Creator.",
    ],
  },
  "family-marriage": {
    title: "Building a Family on Mercy and Love",
    explanation:
      "The Quran describes the spousal relationship as one of the greatest signs of Allah: He created mates for you that you may find tranquility in them, and placed between you affection and mercy. These verses provide the framework for a harmonious family — built on mutual respect, consultation, and kindness.",
    practicalActions: [
      "Show appreciation to your spouse or family members today — a kind word, a small gesture, or simply listening with full attention.",
      "If there is a disagreement, approach it with the Quranic principle of 'consultation' (shura) rather than trying to win.",
      "Make dua for your family: 'Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yun' (Our Lord, grant us joy through our spouses and children).",
    ],
  },
  "purpose-of-life": {
    title: "Why Were We Created?",
    explanation:
      "The Quran answers humanity's deepest question with elegant clarity: 'I did not create the jinn and mankind except to worship Me.' But worship here is not limited to prayer — it encompasses every good deed, intention, and thought directed toward pleasing Allah. Life is a trust, a test, and a journey back to our Creator.",
    practicalActions: [
      "Set one intention today: whatever task you do next, silently dedicate it to serving Allah's purpose — even cooking, studying, or working.",
      "Reflect on Surah Al-Mulk 67:2 — life and death are a test. How are you performing in the test today?",
      "Before sleeping tonight, ask yourself: 'Did I move closer to my purpose today, or further away?'",
    ],
  },
};

/**
 * Helper: get a topic by slug.
 * @param {string} slug
 * @returns {object|undefined}
 */
export function getTopicBySlug(slug) {
  return TOPICS.find((t) => t.slug === slug);
}

/**
 * Helper: get a mood by id.
 * @param {string} id
 * @returns {object|undefined}
 */
export function getMoodById(id) {
  return MOODS.find((m) => m.id === id);
}
