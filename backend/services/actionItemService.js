/**
 * Dynamic action-item generation — theme-based template library.
 *
 * 1. Detects theme from the verse translation text (keyword scoring).
 * 2. Picks a matching action-item template deterministically so the
 *    same verse always maps to the same action item.
 */

// ── Theme-based template library ────────────────────────────────

const ACTION_TEMPLATES = {
  patience: [
    {
      title: "Practice Sabr Today",
      context:
        "This ayah reminds us that patience is not passive waiting — it is active trust in Allah's timing.",
      actionItem:
        'Identify one situation today where you can respond with patience instead of reacting immediately. Pause, breathe, and say "Inna lillahi wa inna ilayhi raji\'un."',
    },
    {
      title: "The Patience Challenge",
      context:
        "Patience is mentioned over 90 times in the Quran — it is one of Allah's most emphasized qualities for believers.",
      actionItem:
        'When you feel frustrated today, pause for 10 seconds before responding. Use that time to say "SubhanAllah" three times.',
    },
  ],
  gratitude: [
    {
      title: "Count Your Blessings",
      context:
        "Gratitude (shukr) multiplies blessings. When we acknowledge what Allah has given, we open the door for more.",
      actionItem:
        "Write down 3 specific blessings from today that you might have overlooked — even something as simple as clean water or a friend's message.",
    },
    {
      title: "Express Thanks",
      context:
        'The Prophet ﷺ said: "He who does not thank people, does not thank Allah."',
      actionItem:
        "Send a genuine thank-you message to one person who helped you recently, no matter how small their contribution.",
    },
  ],
  tawakkul: [
    {
      title: "Trust Allah's Plan",
      context:
        "Tawakkul means you do your best, then trust Allah with the outcome. It's the balance between effort and surrender.",
      actionItem:
        "What is one outcome you're anxious about right now? Write it down, make a sincere dua about it, and consciously release the anxiety.",
    },
    {
      title: "Let Go of Control",
      context:
        "We plan, but Allah is the best of planners. Tawakkul is trusting that His plan is better than ours, even when we can't see it.",
      actionItem:
        'Replace one "I\'m worried about..." thought today with "I trust Allah\'s plan for this."',
    },
  ],
  family: [
    {
      title: "Show Family Love",
      context:
        "The Quran repeatedly emphasizes maintaining family bonds (silat ar-rahim). These connections are a trust from Allah.",
      actionItem:
        "Call or message one family member today just to check in and show love — no agenda, just genuine care.",
    },
    {
      title: "Serve Your Family",
      context:
        "The Prophet ﷺ was in the service of his family at home. True strength is shown in gentleness with those closest to us.",
      actionItem:
        "Do one small act of service for your family today without being asked — make tea, help with a chore, or simply listen.",
    },
  ],
  speech: [
    {
      title: "Guard Your Tongue",
      context:
        "The Quran warns about the power of words — both to heal and to harm. Every word is recorded.",
      actionItem:
        'Before speaking today, pause and ask yourself: "Is this necessary? Is it kind? Is it true?" Skip one conversation that might lead to gossip.',
    },
    {
      title: "Speak with Kindness",
      context:
        "Allah commands us to say the best of words. A kind word is a form of charity that costs nothing.",
      actionItem:
        "Say one genuinely encouraging thing to a colleague, friend, or family member today. Make it specific, not generic.",
    },
  ],
  charity: [
    {
      title: "Give Today",
      context:
        "Sadaqah (charity) extinguishes sins like water extinguishes fire. It doesn't have to be money — time and kindness count too.",
      actionItem:
        "Find one opportunity today to give — whether it's money, time, a kind word, or simply holding the door for someone.",
    },
    {
      title: "Prioritize Giving",
      context:
        "The companions would give before they spent on themselves. Even a small, consistent sadaqah is beloved to Allah.",
      actionItem:
        "Set aside a small amount for sadaqah today before spending on anything else. Even 1 unit of currency counts.",
    },
  ],
  prayer: [
    {
      title: "Pray with Presence",
      context:
        "Salah is the first thing we'll be asked about on the Day of Judgment. It's not just a ritual — it's a conversation with Allah.",
      actionItem:
        "Put your phone in another room before your next salah. Aim for full khushoo (presence) — even if just for two rak'ahs.",
    },
    {
      title: "Extend Your Dua",
      context:
        "The Prophet ﷺ said supplication is the essence of worship. After salah is one of the best times for dua.",
      actionItem:
        "Add one extra minute of personal dua after your next salah — talk to Allah about your day, your worries, and your hopes.",
    },
  ],
  knowledge: [
    {
      title: "Learn Something New",
      context:
        'The first word revealed was "Iqra" — Read. Seeking knowledge is an obligation upon every Muslim.',
      actionItem:
        "Spend 5 minutes today learning something new about Islam — read a hadith, a tafseer paragraph, or listen to a short reminder.",
    },
    {
      title: "Reflect on Understanding",
      context:
        'The Quran asks: "Do they not reflect upon the Quran?" Understanding deepens our connection.',
      actionItem:
        "Pick one ayah you heard today and look up its brief tafseer. Write one sentence about what you learned.",
    },
  ],
  honesty: [
    {
      title: "Be Truthful Today",
      context:
        "Allah loves those who are truthful. Honesty may be hard in the moment, but it builds lasting trust and peace.",
      actionItem:
        "In one conversation today, choose complete honesty even when it's uncomfortable. Speak the truth gently but clearly.",
    },
  ],
  forgiveness: [
    {
      title: "Forgive Someone",
      context:
        "Allah tells us that forgiving others is closer to righteousness. Holding grudges only weighs down your own heart.",
      actionItem:
        "Think of one person who wronged you recently. In your heart, choose to forgive them — not for their sake, but for your peace and for Allah's sake.",
    },
  ],
  justice: [
    {
      title: "Stand for Justice",
      context:
        "The Quran commands us to stand firmly for justice even against ourselves or our loved ones.",
      actionItem:
        "If you witness something unfair today — at work, in conversation, or online — speak up respectfully. Justice starts with small moments.",
    },
  ],
  nature: [
    {
      title: "Observe Allah's Signs",
      context:
        "The Quran points to the natural world as signs (ayat) of Allah — in the sky, the mountains, the rain, and in ourselves.",
      actionItem:
        'Step outside today, look at the sky or a plant, and spend 30 seconds reflecting: "SubhanAllah — this is from You."',
    },
  ],
  death: [
    {
      title: "Remember the Hereafter",
      context:
        "Every soul shall taste death. Remembering our mortality is not morbid — it gives urgency and meaning to our choices today.",
      actionItem:
        'Ask yourself: "If this were my last day, what is one thing I would regret not doing?" Take one small step toward it today.',
    },
  ],
};

// ── Theme detection (keyword scoring) ───────────────────────────

const THEME_KEYWORDS = {
  patience: [
    "patient", "patience", "steadfast", "endure", "persever", "sabr",
  ],
  gratitude: [
    "grateful", "thankful", "blessing", "bounty", "favor", "shukr", "praise",
  ],
  tawakkul: [
    "trust", "rely", "depend", "sufficient", "guardian", "protector", "plan",
  ],
  family: [
    "parent", "mother", "father", "children", "offspring", "family", "kin",
    "spouse", "wife", "husband",
  ],
  speech: [
    "tongue", "speak", "word", "say", "gossip", "slander", "backbit", "lie",
    "truth",
  ],
  charity: [
    "charity", "give", "spend", "alms", "sadaqah", "zakat", "poor", "needy",
  ],
  prayer: [
    "prayer", "salah", "salat", "worship", "prostrat", "bow", "remember",
  ],
  knowledge: [
    "knowledge", "learn", "read", "understand", "reflect", "think", "reason",
    "sign",
  ],
  honesty: ["honest", "truthful", "sincere", "upright", "righteous"],
  forgiveness: [
    "forgiv", "pardon", "merciful", "mercy", "repent", "turn back",
  ],
  justice: ["justice", "just", "fair", "equity", "oppress", "wrong"],
  nature: [
    "heaven", "earth", "sky", "mountain", "sea", "rain", "tree", "creat",
    "seed", "night", "day",
  ],
  death: [
    "death", "die", "hereafter", "resurrection", "judgment", "account",
    "grave",
  ],
};

/**
 * Detect the primary theme of a verse from its English translation.
 * @param {string} translationText
 * @returns {string} theme key
 */
export function detectTheme(translationText) {
  const lower = translationText.toLowerCase();
  let bestTheme = "knowledge"; // fallback
  let bestScore = 0;

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  }
  return bestTheme;
}

/**
 * Get an action item for the given verse.
 * Deterministic: same verse always maps to the same template.
 *
 * @param {string} translationText   English translation of the verse
 * @param {number} contentIndex      Numeric index (e.g. global ayah number)
 * @returns {{ title: string, context: string, actionItem: string, theme: string }}
 */
export function getActionItem(translationText, contentIndex) {
  const theme = detectTheme(translationText);
  const templates = ACTION_TEMPLATES[theme];
  const index = contentIndex % templates.length;
  return { ...templates[index], theme };
}
