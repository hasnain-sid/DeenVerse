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
    pillar: "Faith & Worship",
    cluster: "Core Beliefs",
    relatedTopics: ["hereafter", "tawakkul", "purpose-of-life"],
    name: "Tawheed (Oneness of Allah)",
    nameArabic: "التوحيد",
    icon: "Sun",
    description: "Verses affirming the absolute Oneness of Allah and the foundation of Islamic belief.",
    category: "Faith & Belief",
    datasetTags: ["Faith", "Tawheed", "Divine Attributes", "ikhlas", "muraqaba"],
    ayahRefs: [
      [112, 1], [112, 2], [112, 3], [112, 4],
      [2, 255], [59, 22], [59, 23], [59, 24],
      [3, 18], [6, 102], [6, 103], [20, 14],
      [23, 91], [42, 11], [57, 3],
    ],
  },
  {
    slug: "hereafter",
    pillar: "Faith & Worship",
    cluster: "Core Beliefs",
    relatedTopics: ["tawheed", "death-afterlife", "repentance-tawbah"],
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
    pillar: "Faith & Worship",
    cluster: "Core Beliefs",
    relatedTopics: ["anxiety-worry", "dua-supplication", "patience-sabr", "tawheed"],
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
    pillar: "Faith & Worship",
    cluster: "Acts of Worship",
    relatedTopics: ["dua-supplication", "fasting", "charity-zakat"],
    name: "Prayer (Salah)",
    nameArabic: "الصلاة",
    icon: "HandHeart",
    description: "The importance of establishing prayer and its role as a conversation with Allah.",
    category: "Worship",
    datasetTags: ["Worship", "Prayer", "Salah", "khushoo"],
    ayahRefs: [
      [2, 238], [29, 45], [20, 14], [11, 114],
      [2, 43], [4, 103], [17, 78], [23, 1], [23, 2],
      [70, 22], [70, 23], [70, 34],
      [2, 153], [107, 4], [107, 5],
    ],
  },
  {
    slug: "fasting",
    pillar: "Faith & Worship",
    cluster: "Acts of Worship",
    relatedTopics: ["salah", "patience-sabr", "gratitude-shukr"],
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
    pillar: "Faith & Worship",
    cluster: "Acts of Worship",
    relatedTopics: ["wealth-provision", "salah", "kindness-ihsan"],
    name: "Charity & Zakat",
    nameArabic: "الزكاة والصدقة",
    icon: "Heart",
    description: "Giving in the way of Allah — obligatory zakat and voluntary sadaqah.",
    category: "Worship",
    datasetTags: ["Charity", "Zakat", "Spending", "karam"],
    ayahRefs: [
      [2, 261], [2, 262], [2, 263], [2, 264],
      [2, 267], [2, 271], [2, 274],
      [9, 60], [9, 103], [57, 7], [57, 18],
      [64, 16], [92, 5], [92, 6], [92, 7],
    ],
  },
  {
    slug: "dua-supplication",
    pillar: "Faith & Worship",
    cluster: "Acts of Worship",
    relatedTopics: ["tawakkul", "salah", "loneliness", "anxiety-worry"],
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
    pillar: "Heart & Soul",
    cluster: "Inner Character",
    relatedTopics: ["trials-tests", "gratitude-shukr", "anger-management", "hope-optimism"],
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
    pillar: "Heart & Soul",
    cluster: "Inner Character",
    relatedTopics: ["patience-sabr", "wealth-provision", "humility"],
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
    pillar: "Heart & Soul",
    cluster: "Inner Character",
    relatedTopics: ["gratitude-shukr", "kindness-ihsan", "truthfulness"],
    name: "Humility",
    nameArabic: "التواضع",
    icon: "Flower2",
    description: "Walking gently on earth — the virtue of humility before Allah and people.",
    category: "Character",
    datasetTags: ["Humility", "Ethics", "Character", "hayaa"],
    ayahRefs: [
      [25, 63], [31, 18], [31, 19],
      [17, 37], [26, 215], [15, 88],
      [49, 13],
    ],
  },
  {
    slug: "truthfulness",
    pillar: "Heart & Soul",
    cluster: "Inner Character",
    relatedTopics: ["humility", "justice", "fraud-deception"],
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
    pillar: "Heart & Soul",
    cluster: "Emotional Healing",
    relatedTopics: ["anger-management", "patience-sabr", "repentance-tawbah"],
    name: "Forgiveness",
    nameArabic: "المغفرة",
    icon: "HeartHandshake",
    description: "Forgiving others is closer to righteousness — letting go for Allah's sake.",
    category: "Character",
    datasetTags: ["Forgiveness", "Mercy", "Pardon", "afw"],
    ayahRefs: [
      [42, 40], [42, 43], [3, 134],
      [24, 22], [7, 199], [41, 34],
      [45, 14], [64, 14],
    ],
  },
  {
    slug: "kindness-ihsan",
    pillar: "Heart & Soul",
    cluster: "Inner Character",
    relatedTopics: ["charity-zakat", "humility", "community"],
    name: "Kindness & Ihsan",
    nameArabic: "الإحسان",
    icon: "Smile",
    description: "Excellence in worship and character — doing good as if you see Allah.",
    category: "Character",
    datasetTags: ["Ihsan", "Kindness", "Good Deeds", "rahma"],
    ayahRefs: [
      [55, 60], [16, 90], [2, 195],
      [4, 36], [17, 7], [28, 77],
      [29, 69], [31, 3],
    ],
  },

  // ─── Social ───────────────────────────────────────────
  {
    slug: "family-marriage",
    pillar: "Life & Society",
    cluster: "Relationships",
    relatedTopics: ["parents", "community", "kindness-ihsan"],
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
    pillar: "Life & Society",
    cluster: "Relationships",
    relatedTopics: ["family-marriage", "kindness-ihsan", "gratitude-shukr"],
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
    pillar: "Life & Society",
    cluster: "Relationships",
    relatedTopics: ["truthfulness", "community", "fraud-deception"],
    name: "Justice & Equity",
    nameArabic: "العدل",
    icon: "Scale",
    description: "Standing firmly for justice even against yourself or loved ones.",
    category: "Social",
    datasetTags: ["Justice", "Equity", "Fairness", "adl"],
    ayahRefs: [
      [4, 135], [5, 8], [16, 90],
      [4, 58], [6, 152], [49, 9],
      [42, 15], [57, 25],
    ],
  },
  {
    slug: "community",
    pillar: "Life & Society",
    cluster: "Relationships",
    relatedTopics: ["family-marriage", "justice", "kindness-ihsan"],
    name: "Community & Brotherhood",
    nameArabic: "الأخوة والمجتمع",
    icon: "UsersRound",
    description: "The believers are but brothers — building unity and supporting one another.",
    category: "Social",
    datasetTags: ["Community", "Brotherhood", "Unity", "wafa"],
    ayahRefs: [
      [49, 10], [49, 13], [3, 103],
      [3, 110], [9, 71], [48, 29],
      [59, 9], [8, 63],
    ],
  },

  // ─── Finance ──────────────────────────────────────────
  {
    slug: "riba-interest",
    pillar: "Life & Society",
    cluster: "Wealth & Ethics",
    relatedTopics: ["halal-income", "fraud-deception", "wealth-provision"],
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
    pillar: "Life & Society",
    cluster: "Wealth & Ethics",
    relatedTopics: ["riba-interest", "fraud-deception", "truthfulness"],
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
    pillar: "Life & Society",
    cluster: "Wealth & Ethics",
    relatedTopics: ["charity-zakat", "gratitude-shukr", "tawakkul"],
    name: "Wealth & Provision",
    nameArabic: "الرزق",
    icon: "Gem",
    description: "Allah is the Provider — understanding wealth as a test and a trust.",
    category: "Finance",
    datasetTags: ["Provision", "Wealth", "Blessings", "qanaa", "zuhd"],
    ayahRefs: [
      [11, 6], [51, 58], [67, 15],
      [2, 245], [34, 39], [65, 3],
      [17, 30], [28, 77], [62, 10],
    ],
  },

  // ─── Emotions & Healing ───────────────────────────────
  {
    slug: "anxiety-worry",
    pillar: "Heart & Soul",
    cluster: "Emotional Healing",
    relatedTopics: ["tawakkul", "dua-supplication", "hope-optimism", "loneliness"],
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
    pillar: "Heart & Soul",
    cluster: "Emotional Healing",
    relatedTopics: ["patience-sabr", "hope-optimism", "loneliness", "forgiveness"],
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
    pillar: "Heart & Soul",
    cluster: "Emotional Healing",
    relatedTopics: ["patience-sabr", "forgiveness", "humility"],
    name: "Anger Management",
    nameArabic: "كظم الغيظ",
    icon: "Flame",
    description: "Controlling anger is a mark of strength — the Quran's guidance on restraint.",
    category: "Emotions",
    datasetTags: ["Ethics", "Self-control", "Patience", "hilm"],
    ayahRefs: [
      [3, 134], [42, 37], [7, 199],
      [41, 34], [23, 96], [16, 126],
      [3, 159], [25, 63],
    ],
  },
  {
    slug: "hope-optimism",
    pillar: "Heart & Soul",
    cluster: "Emotional Healing",
    relatedTopics: ["anxiety-worry", "grief-sadness", "tawakkul", "repentance-tawbah"],
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
    pillar: "Heart & Soul",
    cluster: "Emotional Healing",
    relatedTopics: ["dua-supplication", "anxiety-worry", "community"],
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
    pillar: "Guidance & Growth",
    cluster: "Life Direction",
    relatedTopics: ["forgiveness", "hope-optimism", "hereafter"],
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
    pillar: "Guidance & Growth",
    cluster: "Life Direction",
    relatedTopics: ["hereafter", "repentance-tawbah", "purpose-of-life"],
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
    pillar: "Guidance & Growth",
    cluster: "Life Direction",
    relatedTopics: ["purpose-of-life", "humility", "tawheed"],
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
    pillar: "Guidance & Growth",
    cluster: "Life Direction",
    relatedTopics: ["tawheed", "knowledge-learning", "death-afterlife", "trials-tests"],
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
    pillar: "Guidance & Growth",
    cluster: "Life Direction",
    relatedTopics: ["patience-sabr", "tawakkul", "hope-optimism", "purpose-of-life"],
    name: "Trials & Tests",
    nameArabic: "الابتلاء",
    icon: "Mountain",
    description: "Life is a test — understanding hardship as a means of growth and purification.",
    category: "Life Guidance",
    datasetTags: ["Trials", "Patience", "Faith", "mujahadah", "shajaa"],
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
    pillar: "Guidance & Growth",
    cluster: "Boundaries",
    relatedTopics: ["truthfulness", "anger-management", "community"],
    name: "Backbiting & Gossip",
    nameArabic: "الغيبة والنميمة",
    icon: "MessageSquareWarning",
    description: "Guard your tongue — backbiting is like eating your brother's flesh.",
    category: "Prohibitions",
    datasetTags: ["Speech", "Ethics", "Prohibition", "husn-al-dhann"],
    ayahRefs: [
      [49, 12], [49, 11], [104, 1],
      [68, 10], [68, 11], [24, 19],
      [33, 58],
    ],
  },
  {
    slug: "intoxicants",
    pillar: "Guidance & Growth",
    cluster: "Boundaries",
    relatedTopics: ["backbiting-gossip", "fraud-deception", "repentance-tawbah"],
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
    pillar: "Guidance & Growth",
    cluster: "Boundaries",
    relatedTopics: ["halal-income", "riba-interest", "truthfulness", "justice"],
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
  "hereafter": {
    title: "Living with the Hereafter in Mind",
    explanation:
      "Surah Az-Zalzalah (99) paints a vivid scene: the earth will shake violently, reveal its burdens, and every person will see the weight of their deeds — even an atom's worth of good or evil. These verses, alongside passages from Surah Al-Waqi'ah and Al-Infitar, remind us that this life is temporary and the real accounting is coming. The Quran uses the Hereafter not to paralyse with fear but to calibrate our priorities — every small choice echoes into eternity.",
    practicalActions: [
      "Read Surah Az-Zalzalah (99) slowly today and reflect: if every deed — even a smile or a harsh word — is weighed, how does that change my behaviour?",
      "Pick one 'small' good deed you normally skip (returning a greeting, removing litter, making dua for someone) and do it today knowing it will appear on your scale.",
      "Before making a decision today, ask: 'Will this benefit me on the Day I stand before Allah?'",
    ],
  },
  "fasting": {
    title: "Fasting — The School of Self-Discipline",
    explanation:
      "The fasting verses in Surah Al-Baqarah (2:183-187) are among the most personal in the Quran. Allah says fasting was prescribed 'so that you may attain taqwa' — God-consciousness. The passage then reveals a beautiful secret: 'When My servants ask you about Me, I am near. I respond to the call of the caller when he calls upon Me.' Fasting is not merely abstaining from food — it is training the nafs (self) to prefer what Allah wants over what the body craves.",
    practicalActions: [
      "If you are not in Ramadan, consider fasting a voluntary Monday or Thursday this week — the Prophet ﷺ regularly fasted on these days.",
      "During your next fast, use the hunger pangs as a trigger for dua — each pang is a reminder that you are doing this for Allah.",
      "Reflect on what non-food 'fast' you could practice: fasting from social media, gossip, or complaining for one day.",
    ],
  },
  "charity-zakat": {
    title: "Giving That Grows",
    explanation:
      "The Quran uses a powerful metaphor: a single grain of charity is like a seed that sprouts seven ears, each bearing a hundred grains — a 700-fold return (2:261). But the next verses add conditions: do not follow your charity with reminders or hurtful words, or it will be nullified. Allah pairs generosity with sincerity throughout these passages, and Surah At-Tawbah (9:60) specifies the eight categories of zakat recipients, making the obligation precise and just.",
    practicalActions: [
      "Calculate your zakat if you haven't done so recently. Use an online zakat calculator and pay it promptly — it is the right of the poor, not optional generosity.",
      "Give a small sadaqah today — even a dollar or a kind word — and consciously intend it for Allah's pleasure alone.",
      "Identify one recurring expense you can redirect to charity: a subscription you don't use, an impulse purchase you can skip this week.",
    ],
  },
  "dua-supplication": {
    title: "The Weapon of the Believer",
    explanation:
      "Allah places a stunning verse in the middle of the fasting passage: 'When My servants ask you about Me — indeed I am near. I respond to the invocation of the supplicant when he calls upon Me' (2:186). Dua is the essence of worship — it is admitting your need before Allah and trusting His response. The Quran shows prophets calling upon Allah in every situation: Zakariya for a child, Ayyub in illness, Yunus in the belly of the whale. Each was answered.",
    practicalActions: [
      "Make one heartfelt dua today — not a memorised formula, but a real conversation with Allah in your own language about what matters most to you right now.",
      "Learn and recite the dua of Prophet Ibrahim: 'Rabbi-j'alni muqeemas-salati wa min dhurriyyati, Rabbana wa taqabbal du'a' (14:40).",
      "Set a daily dua time — after fajr or before sleeping — and keep a small list of things you are asking Allah for. Review it monthly to see His answers.",
    ],
  },
  "humility": {
    title: "Walking Gently on Earth",
    explanation:
      "The Quran describes the servants of the Most Merciful: 'They walk upon the earth gently, and when the ignorant address them, they say words of peace' (25:63). Humility in Islam is not low self-esteem — it is knowing your true place before Allah. Luqman's advice to his son captures both sides: do not turn your cheek away from people in arrogance, and do not walk through the earth exultantly — for Allah does not like every self-deluded boaster (31:18).",
    practicalActions: [
      "The next time someone corrects you or offers a different opinion, pause and genuinely consider it before responding. Humility is accepting truth regardless of who delivers it.",
      "Observe the way you walk, talk, and enter a room. Are you seeking attention or serving the space? Practice 'entering small' — greeting first, sitting where there is room.",
      "Make sujood tonight with extra focus — your forehead on the ground is the physical expression of humility before the Most High.",
    ],
  },
  "truthfulness": {
    title: "The Path of the Truthful",
    explanation:
      "Allah commands: 'O you who believe, fear Allah and be with those who are truthful' (9:119). Truthfulness (sidq) is not merely avoiding lies — it is alignment between your inner state and outer expression. The Quran links it directly to taqwa: 'O you who believe, fear Allah and speak words of appropriate justice' (33:70). The truthful are ranked alongside prophets, martyrs, and the righteous in the Quran's hierarchy of honour.",
    practicalActions: [
      "Conduct a truthfulness audit of your last 24 hours: did you exaggerate, omit important details, or make a promise you might not keep?",
      "If you discover a small untruth you told recently — even a social pleasantry like 'I'm busy' when you weren't — correct it.",
      "Be truthful with yourself about one area of your life you've been avoiding. Write it down privately and make dua for the courage to address it.",
    ],
  },
  "kindness-ihsan": {
    title: "Excellence in Everything You Do",
    explanation:
      "Ihsan means doing things with excellence and beauty, as if you see Allah watching — because though you may not see Him, He certainly sees you. The Quran commands ihsan broadly: 'Indeed, Allah orders justice and ihsan' (16:90). The verse 'Is the reward for ihsan anything but ihsan?' (55:60) promises that excellence is met with excellence from Allah. Ihsan transforms routine acts — cooking, studying, working — into worship when done with care and consciousness of Allah.",
    practicalActions: [
      "Choose one routine task today — making your bed, cooking a meal, writing an email — and do it with deliberate excellence, as an act of worship.",
      "Show unexpected kindness to someone who cannot repay you: a stranger, a child, an elderly neighbour.",
      "Before sleeping, review your day through the lens of ihsan: where did I do my best for Allah, and where did I cut corners?",
    ],
  },
  "parents": {
    title: "A Command Paired with Tawheed",
    explanation:
      "In Surah Al-Isra (17:23-24), Allah pairs the command to worship Him alone with the command to show ihsan to parents — placing it as the second highest obligation. The language is remarkably specific: do not say 'uff' to them (the smallest expression of annoyance), do not repel them, speak to them a generous word, and lower the wing of humility to them out of mercy. Luqman echoes this, and even when parents push toward shirk, the Quran says: 'accompany them in this world with kindness' (31:15).",
    practicalActions: [
      "Call or visit your parent(s) today — not because they asked, but because Allah asked. If they have passed, make dua for them.",
      "Identify one way you have been impatient or dismissive toward a parent recently. Consciously correct it this week.",
      "Make the dua Allah taught us: 'Rabbi-rhamhuma kama rabbayani sagheera' — My Lord, have mercy on them as they raised me when I was small (17:24).",
    ],
  },
  "justice": {
    title: "Standing Firm Even Against Yourself",
    explanation:
      "The Quran's command for justice is absolute: 'O you who believe, be persistently standing firm in justice, witnesses for Allah, even if it be against yourselves, your parents, or your relatives' (4:135). Justice in Islam is not situational — it does not bend for loyalty, wealth, or personal interest. Surah An-Nahl ties justice to ihsan and giving to relatives as the three pillars of a righteous society (16:90).",
    practicalActions: [
      "Think of a situation where you were unfair to someone — a colleague, sibling, or friend. Take one step to correct it today, even if it costs you something.",
      "When you hear a dispute between two people, resist the urge to side with whoever you like more. Listen to both sides with genuine impartiality.",
      "In your next business or financial dealing, ask yourself: 'Would I be comfortable if this transaction was displayed to everyone on the Day of Judgment?'",
    ],
  },
  "community": {
    title: "The Believers Are But Brothers",
    explanation:
      "Surah Al-Hujurat delivers the blueprint for community: 'The believers are but brothers, so make reconciliation between your brothers' (49:10). The same surah warns against mocking, name-calling, suspicion, and spying — social diseases that destroy communal bonds. The Quran then elevates unity to the level of divine blessing: 'Hold firmly to the rope of Allah all together and do not become divided. And remember the favour of Allah upon you when you were enemies and He brought your hearts together' (3:103).",
    practicalActions: [
      "Reach out to one Muslim brother or sister you haven't spoken to in a while — rebuild a connection that has weakened.",
      "If you know of a conflict between two people in your community, gently try to mediate or at least make dua for their reconciliation.",
      "Attend a community event, prayer, or gathering this week with the intention of strengthening the ummah — even if you prefer being alone.",
    ],
  },
  "halal-income": {
    title: "Earning with a Clean Conscience",
    explanation:
      "The Quran is precise about financial ethics: 'Do not consume one another's wealth unjustly or send it to the rulers in order that they might aid you to consume a portion of the wealth of the people in sin, while you know' (2:188). Surah Al-Mutaffifin opens with 'Woe to the defrauders' — those who take full measure but give less when measuring for others. Prophet Shu'ayb's message was centered on honest trade (11:85). In Islam, how you earn is as important as how much you earn.",
    practicalActions: [
      "Audit your income sources honestly: is every stream of income clearly halal? If anything is doubtful, research it or consult a scholar.",
      "In your next transaction — buying, selling, or at work — be scrupulously honest, even in small details. Give people their full due.",
      "Learn the fiqh of your profession: what does Islam specifically say about ethical conduct in your line of work?",
    ],
  },
  "wealth-provision": {
    title: "Allah is the Provider",
    explanation:
      "The Quran reframes our relationship with money: 'There is no creature on earth but that upon Allah is its provision' (11:6). Wealth is a test, not a measure of worth. The verses in Surah Al-Hadid invite us to spend from what Allah has made us trustees of (57:7), and Surah At-Talaq links provision to tawakkul: 'Whoever relies upon Allah — He is sufficient for him' (65:3). Understanding provision as Allah's domain frees us from the anxiety of accumulation.",
    practicalActions: [
      "Reflect honestly: has the pursuit of wealth caused me to neglect prayer, family, or my relationship with Allah? Identify one adjustment to make.",
      "Spend in Allah's cause today with the belief that it will not decrease your wealth but increase it — as the Prophet ﷺ promised.",
      "When you feel financial anxiety, recite 'Allahummak-fini bi-halalika an haramik, wa aghnini bi-fadlika amman siwak' and take practical steps while trusting Allah's plan.",
    ],
  },
  "grief-sadness": {
    title: "Solace for the Sorrowful Heart",
    explanation:
      "The Quran does not dismiss grief — it honours it. Ya'qub (Jacob) wept for Yusuf until he lost his sight, yet he said: 'I only complain of my suffering and my grief to Allah' (12:86). Surah Ad-Duha was revealed to comfort the Prophet ﷺ himself during a period of sadness: 'Your Lord has not forsaken you, nor has He become displeased.' And Surah Ash-Sharh follows with its double assurance: with every hardship comes ease — mentioned twice, a divine emphasis that relief is guaranteed.",
    practicalActions: [
      "If you are grieving, allow yourself to feel it — then direct it toward Allah. Talk to Him about your pain as Ya'qub did: 'I only complain to Allah.'",
      "Read Surah Ad-Duha (93) slowly and imagine Allah speaking directly to you. He has not abandoned you.",
      "Do one thing today that brings you peace — a walk in nature, reciting Quran, or sitting in a quiet place — and dedicate it to healing your heart.",
    ],
  },
  "anger-management": {
    title: "Strength Is in Restraint",
    explanation:
      "The Quran praises those 'who restrain anger and who pardon the people — and Allah loves the doers of good' (3:134). Controlling anger is not weakness — the Prophet ﷺ said the truly strong person is one who controls themselves when angry. These verses pair anger management with forgiveness and ihsan, showing that restraint is the first step, then forgiveness, then actively doing good. Surah Fussilat goes further: 'Repel evil with that which is better, and thereupon the one between whom and you was enmity will become as a devoted friend' (41:34).",
    practicalActions: [
      "The next time you feel anger rising, change your physical state immediately: if standing, sit down; if sitting, lie down. The Prophet ﷺ taught this as a practical technique.",
      "Say 'A'udhu billahi minash-shaytanir-rajeem' when angry — and mean it. Anger is a door Shaytan uses.",
      "Think of someone who recently angered you. Instead of replaying the incident, make dua for them. This breaks the cycle of resentment.",
    ],
  },
  "hope-optimism": {
    title: "Never Despair of Allah's Mercy",
    explanation:
      "The Quran's most hopeful verse may be: 'Say, O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins' (39:53). Despair of Allah's mercy is itself a sin — because it underestimates the Most Merciful. Ya'qub told his sons: 'Do not despair of relief from Allah. Indeed, no one despairs of relief from Allah except the disbelieving people' (12:87). The Quran weaves hope into every difficulty: after hardship, ease; after night, dawn; after winter, spring.",
    practicalActions: [
      "If you are in a dark place right now, read 39:53 and let it settle in your heart. Allah is speaking to you — not to the perfect, but to those who have stumbled.",
      "Replace one negative 'what if' thought today with a positive one grounded in trust: 'What if Allah has something better planned for me?'",
      "Share a message of hope with someone who is struggling — a verse, a kind word, or simply your presence. Hope multiplies when shared.",
    ],
  },
  "loneliness": {
    title: "You Are Never Truly Alone",
    explanation:
      "Allah says: 'We are closer to him than his jugular vein' (50:16). When you feel isolated from people, the Quran redirects your attention to the One who is always present. He is with you wherever you are (57:4). He responds when you call (2:186). Even in the cave, fleeing persecution, the Prophet ﷺ told Abu Bakr: 'Do not grieve; indeed Allah is with us' (9:40). Loneliness in the Quran is healed not by crowds but by nearness to Allah.",
    practicalActions: [
      "Sit alone in a quiet place and talk to Allah as you would to a close friend. Tell Him how you feel — He already knows, but the act of speaking heals.",
      "Recite Surah Al-Baqarah 2:186 and reflect on Allah's response: 'I am near.' Let this awareness accompany you throughout the day.",
      "Take one step toward community: attend a prayer, send a message, or volunteer. Allah placed comfort in community for a reason (49:10).",
    ],
  },
  "knowledge-learning": {
    title: "Read — The First Revelation",
    explanation:
      "The first word revealed to the Prophet ﷺ was 'Iqra' — Read (96:1). The Quran elevates those who know above those who do not (39:9) and raises in degree those given knowledge (58:11). But Quranic knowledge is not mere information — it is knowledge that leads to awe of Allah: 'Only those fear Allah, from among His servants, who have knowledge' (35:28). The verses of Surah Aal-Imran describe people of understanding as those who reflect on creation and declare: 'Our Lord, You did not create this in vain.'",
    practicalActions: [
      "Dedicate 15 minutes today to learning something about your deen — a tafsir excerpt, a hadith explanation, or an Islamic lecture. Make it a daily habit.",
      "Choose one verse of the Quran and look up its tafsir. Understanding even one ayah deeply is better than reading many without reflection.",
      "Share something beneficial you learned today with one person. The Prophet ﷺ said: 'Convey from me, even if it is one verse.'",
    ],
  },
  "trials-tests": {
    title: "Hardship as a Ladder, Not a Punishment",
    explanation:
      "The Quran is clear: 'Do people think they will be left to say, We believe, and they will not be tested?' (29:2). Trials are not signs of Allah's displeasure — they are how faith is refined. The same surah that promises ease with hardship (94:5-6) also narrates the trials of prophets. Allah tests with loss, fear, and hunger (2:155) but gives good news to the patient. Surah Al-Mulk frames all of existence as a test: 'He who created death and life to test you as to which of you is best in deed' (67:2).",
    practicalActions: [
      "Reframe one current difficulty in your life: instead of asking 'Why me?', ask 'What is Allah teaching me through this?'",
      "Look back at a past trial you survived. Write down the growth or good that came from it — this builds resilience for current challenges.",
      "When tested, immediately say 'Inna lillahi wa inna ilayhi raji'un' — this is the Quran's prescribed response (2:156) and it recenters the heart.",
    ],
  },
  "backbiting-gossip": {
    title: "Guard Your Tongue",
    explanation:
      "The Quran uses a visceral image: 'Would one of you like to eat the flesh of his dead brother? You would detest it' (49:12). Backbiting (gheebah) is speaking about someone in a way they would dislike, even if it is true. The same surah forbids mockery, name-calling, suspicion, and spying — an entire social hygiene framework in a few verses. Surah Al-Humazah warns of specific punishment for the habitual slanderer and backbiter.",
    practicalActions: [
      "For the rest of today, before speaking about anyone who is not present, apply this filter: 'Would I say this if they were sitting next to me?'",
      "If someone starts backbiting in front of you, gently redirect the conversation or defend the absent person. Silence is complicity.",
      "Make istighfar for anyone you have spoken about negatively — and if appropriate, ask their forgiveness directly.",
    ],
  },
  "intoxicants": {
    title: "The Progressive Prohibition of Intoxicants",
    explanation:
      "The Quran prohibited alcohol through a gradual, wise approach. First, it acknowledged both benefit and harm in it — but noted the harm is greater (2:219). Then it prohibited approaching prayer while intoxicated (4:43). Finally, the definitive verse: 'O you who believe, intoxicants, gambling, stone altars, and divining arrows are but defilement from the work of Satan, so avoid them that you may be successful' (5:90). The next verse explains why: Satan seeks to incite enmity, hatred, and distract from remembrance of Allah and prayer.",
    practicalActions: [
      "If you or someone you know struggles with substance use, recognize it is a battle that deserves compassion, not shame. Seek professional help and pair it with dua.",
      "Examine your habits for 'modern intoxicants' — anything that numbs your awareness of Allah and consumes your time compulsively (excessive gaming, binge-watching, doomscrolling).",
      "Read the story of how the Sahaba immediately poured out their wine when the prohibition was revealed. Use their resolve as inspiration for quitting a harmful habit.",
    ],
  },
  "fraud-deception": {
    title: "Woe to the Defrauders",
    explanation:
      "Surah Al-Mutaffifin opens with one of the Quran's most direct warnings: 'Woe to those who give less' — those who demand full measure when buying but cheat when selling (83:1-3). Prophet Shu'ayb's entire mission to the people of Madyan centered on honest dealings (11:85). The Quran forbids consuming wealth through falsehood (2:188, 4:29) and demands precision in contracts (2:282). Fraud is not just a financial crime — it is a violation of trust that unravels the social fabric Allah wants to protect.",
    practicalActions: [
      "Review your recent dealings — sales, work commitments, promises. Have you delivered exactly what you promised? If not, make it right.",
      "When tempted to cut a corner that no one will notice, remember: 'Do they not know that Allah sees?' (96:14). Integrity is how you act when unseen.",
      "Be precise in contracts and agreements: the Quran commands writing down debts and having witnesses (2:282). Apply this to your personal and professional dealings.",
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
