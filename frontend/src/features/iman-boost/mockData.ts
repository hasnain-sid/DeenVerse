import { Sign } from './types';

/**
 * Full mock dataset mirroring the signsSeed.json entries on the backend.
 * Uses `summary` (not `content`) to match the backend model field name.
 *
 * Sources: Yaqeen Institute, Sunnah.com, Quran.com
 */ export const MOCK_SIGNS: Sign[] = [
    {
        _id: 'qs_01',
        category: 'quran_science',
        title: 'Human Embryonic Development',
        summary:
            "The Qur'an describes the sequential stages of embryo formation over 1,400 years before modern embryology confirmed them.",
        explanation:
            "In Surah Al-Mu'minun (23:12\u201314), the Qur'an outlines the developmental stages: nutfah (drop of fluid), 'alaqah (clinging substance), mudghah (chewed lump of flesh), then bones clothed with flesh. These stages align with the modern sequence described by Dr. Keith Moore, a leading embryologist, who stated the Qur'anic descriptions are accurate to current scientific knowledge.\n\nNote: These are signs (ayat) for reflection.",
        arabicText:
            '\u0648\u064e\u0644\u064e\u0642\u064e\u062f\u0652 \u062e\u064e\u0644\u064e\u0642\u0652\u0646\u064e\u0627 \u0627\u0644\u0652\u0625\u0650\u0646\u0633\u064e\u0627\u0646\u064e \u0645\u0650\u0646 \u0633\u064f\u0644\u064e\u0627\u0644\u064e\u0629\u064d \u0645\u0650\u0645\u0651\u064e\u0646 \u0637\u0650\u064a\u0646\u064d \u062b\u064f\u0645\u0651\u064e \u062c\u064e\u0639\u064e\u0644\u0652\u0646\u064e\u0627\u0647\u064f \u0646\u064f\u0637\u0652\u0641\u064e\u0629\u064b \u0641\u0650\u064a \u0642\u064e\u0631\u064e\u0627\u0631\u064d \u0645\u064e\u0651\u0643\u0650\u064a\u0646\u064d',
        translation:
            'And certainly did We create man from an extract of clay. Then We placed him as a sperm-drop in a firm lodging.',
        reference: 'Quran 23:12\u201314',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-quran-and-modern-science-compatible-or-incompatible',
        order: 1,
        tags: ['embryology', 'creation', 'science'],
        createdAt: '2026-02-24T00:00:00.000Z',
    },
    {
        _id: 'qs_02',
        category: 'quran_science',
        title: 'The Expanding Universe',
        summary:
            "The Qur'an states that the universe is being expanded \u2014 a fact confirmed by Edwin Hubble in 1929, over 13 centuries after the revelation.",
        explanation:
            "Surah Adh-Dhariyat (51:47): 'And the heaven We constructed with strength, and indeed, We are [its] expander.' The Arabic 'm\u016bsi\u02bfu\u016bn' means 'the expander.' The expanding universe was discovered by Hubble in 1929, 1,300+ years after this verse was revealed.",
        arabicText:
            '\u0648\u064e\u0627\u0644\u0633\u064e\u0651\u0645\u064e\u0627\u0621\u064e \u0628\u064e\u0646\u064e\u064a\u0652\u0646\u064e\u0627\u0647\u064e\u0627 \u0628\u0650\u0623\u064e\u064a\u0652\u062f\u064d \u0648\u064e\u0625\u0650\u0646\u064e\u0651\u0627 \u0644\u064e\u0645\u064f\u0648\u0633\u0650\u0639\u064f\u0648\u0646\u064e',
        translation: 'And the heaven We constructed with strength, and indeed, We are [its] expander.',
        reference: 'Quran 51:47',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-quran-and-modern-science-compatible-or-incompatible',
        order: 2,
        tags: ['cosmology', 'universe', 'science'],
        createdAt: '2026-02-23T00:00:00.000Z',
    },
    {
        _id: 'qs_03',
        category: 'quran_science',
        title: 'Mountains as Stabilizers',
        summary:
            "The Qur'an describes mountains as pegs driven into the earth \u2014 mirroring the geological discovery that mountains have deep roots anchoring tectonic plates.",
        explanation:
            "Surah An-Naba' (78:6\u20137): 'Have We not made the earth as a bed, and the mountains as pegs?' Modern geology confirms mountains have deep subterranean roots extending kilometres into the earth's crust, stabilizing tectonic plates.",
        arabicText:
            '\u0623\u064e\u0644\u064e\u0645\u0652 \u0646\u064e\u062c\u0652\u0639\u064e\u0644\u0650 \u0627\u0644\u0652\u0623\u064e\u0631\u0652\u0636\u064e \u0645\u0650\u0647\u064e\u0627\u062f\u064b\u0627 \u0648\u064e\u0627\u0644\u0652\u062c\u0650\u0628\u064e\u0627\u0644\u064e \u0623\u064e\u0648\u0652\u062a\u064e\u0627\u062f\u064b\u0627',
        translation: 'Have We not made the earth as a bed, and the mountains as pegs?',
        reference: 'Quran 78:6\u20137',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-quran-and-modern-science-compatible-or-incompatible',
        order: 3,
        tags: ['geology', 'mountains', 'science'],
        createdAt: '2026-02-22T00:00:00.000Z',
    },
    {
        _id: 'qs_04',
        category: 'quran_science',
        title: 'The Complete Water Cycle',
        summary:
            "The Qur'an describes the full water cycle \u2014 precipitation, river flow, and evaporation \u2014 centuries before it was scientifically understood.",
        explanation:
            "Surah Az-Zumar (39:21): 'Do you not see that Allah sends down rain from the sky and makes it flow as springs in the earth; then He produces crops of varying colors?' This describes the complete hydrological cycle, not documented by science until the 17th century.",
        arabicText:
            '\u0623\u064e\u0644\u064e\u0645\u0652 \u062a\u064e\u0631\u064e \u0623\u064e\u0646\u064e\u0651 \u0627\u0644\u0644\u064e\u0651\u0647\u064e \u0623\u064e\u0646\u0632\u064e\u0644\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0633\u064e\u0651\u0645\u064e\u0627\u0621\u0650 \u0645\u064e\u0627\u0621\u064b \u0641\u064e\u0633\u064e\u0644\u064e\u0643\u064e\u0647\u064f \u064a\u064e\u0646\u064e\u0627\u0628\u0650\u064a\u0639\u064e \u0641\u0650\u064a \u0627\u0644\u0652\u0623\u064e\u0631\u0652\u0636\u0650',
        translation:
            'Do you not see that Allah sends down rain from the sky and makes it flow as springs in the earth?',
        reference: 'Quran 39:21',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-quran-and-modern-science-compatible-or-incompatible',
        order: 4,
        tags: ['hydrology', 'water cycle', 'science'],
        createdAt: '2026-02-21T00:00:00.000Z',
    },
    {
        _id: 'qs_05',
        category: 'quran_science',
        title: 'Darkness in the Deep Seas',
        summary:
            "The Qur'an describes layered darkness in the deep ocean \u2014 complete darkness below 1,000m was confirmed only with modern diving technology.",
        explanation:
            "Surah An-Nur (24:40): 'Darknesses within a deep sea covered by waves, upon which are waves, over which are clouds.' Modern oceanography confirms below 200m all visible light is absorbed; below 1,000m there is total darkness. Internal waves were only documented in the 20th century.",
        arabicText:
            '\u0623\u064e\u0648\u0652 \u0643\u064e\u0638\u064f\u0644\u064f\u0645\u064e\u0627\u062a\u064d \u0641\u0650\u064a \u0628\u064e\u062d\u0652\u0631\u064d \u0644\u064f\u062c\u0651\u0650\u064a\u064d\u0651 \u064a\u064e\u063a\u0652\u0634\u064e\u0627\u0647\u064f \u0645\u064e\u0648\u0652\u062c\u064c \u0645\u0650\u0651\u0646 \u0641\u064e\u0648\u0652\u0642\u0650\u0647\u0650 \u0645\u064e\u0648\u0652\u062c\u064c',
        translation: 'Or like darknesses within a deep sea which is covered by waves, upon which are waves.',
        reference: 'Quran 24:40',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-quran-and-modern-science-compatible-or-incompatible',
        order: 5,
        tags: ['oceanography', 'deep sea', 'science'],
        createdAt: '2026-02-20T00:00:00.000Z',
    },
    {
        _id: 'qs_06',
        category: 'quran_science',
        title: 'Iron Sent Down from Space',
        summary:
            "The Qur'an says iron was 'sent down' \u2014 astrophysics confirms iron on Earth originated from supernovae explosions in outer space.",
        explanation:
            "Surah Al-Hadid (57:25): 'And We sent down iron.' The Arabic 'anzaln\u0101' implies extraterrestrial origin. Modern astrophysics confirms iron requires massive supernovae to form \u2014 Earth's iron is of extraterrestrial origin.",
        arabicText:
            '\u0648\u064e\u0623\u064e\u0646\u0632\u064e\u0644\u0652\u0646\u064e\u0627 \u0627\u0644\u0652\u062d\u064e\u062f\u0650\u064a\u062f\u064e \u0641\u0650\u064a\u0647\u0650 \u0628\u064e\u0623\u0652\u0633\u064c \u0634\u064e\u062f\u0650\u064a\u062f\u064c \u0648\u064e\u0645\u064e\u0646\u064e\u0627\u0641\u0650\u0639\u064f \u0644\u0650\u0644\u0646\u064e\u0651\u0627\u0633\u0650',
        translation: 'And We sent down iron, in which is great military might and benefits for the people.',
        reference: 'Quran 57:25',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-quran-and-modern-science-compatible-or-incompatible',
        order: 6,
        tags: ['astrophysics', 'iron', 'supernovae', 'science'],
        createdAt: '2026-02-19T00:00:00.000Z',
    },
    {
        _id: 'qs_07',
        category: 'quran_science',
        title: 'The Barrier Between Two Seas',
        summary:
            "The Qur'an describes an invisible barrier preventing the mixing of fresh and salt water \u2014 the pycnocline, confirmed by modern oceanography.",
        explanation:
            "Surah Ar-Rahman (55:19\u201320): 'He released the two seas, meeting side by side. Between them is a barrier so neither transgresses.' Modern oceanography identifies the pycnocline \u2014 a density gradient preventing full mixing of different bodies of water.",
        arabicText:
            '\u0645\u064e\u0631\u064e\u062c\u064e \u0627\u0644\u0652\u0628\u064e\u062d\u0652\u0631\u064e\u064a\u0652\u0646\u0650 \u064a\u064e\u0644\u0652\u062a\u064e\u0642\u0650\u064a\u064e\u0627\u0646\u0650 \u0628\u064e\u064a\u0652\u0646\u064e\u0647\u064f\u0645\u064e\u0627 \u0628\u064e\u0631\u0652\u0632\u064e\u062e\u064c \u0644\u064e\u0651\u0627 \u064a\u064e\u0628\u0652\u063a\u0650\u064a\u064e\u0627\u0646\u0650',
        translation:
            'He released the two seas, meeting side by side. Between them is a barrier so neither of them transgresses.',
        reference: 'Quran 55:19\u201320',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-quran-and-modern-science-compatible-or-incompatible',
        order: 7,
        tags: ['oceanography', 'seas', 'pycnocline', 'science'],
        createdAt: '2026-02-18T00:00:00.000Z',
    },
    {
        _id: 'qs_08',
        category: 'quran_science',
        title: 'The Frontal Lobe and Lying',
        summary:
            "The Qur'an describes a 'lying, sinful forelock' \u2014 modern neuroscience confirms the prefrontal cortex governs decision-making and deceptive behavior.",
        explanation:
            "Surah Al-'Alaq (96:15\u201316): 'No! ...We will drag him by the forelock \u2014 a lying, sinful forelock.' Neuroscience confirms the prefrontal cortex \u2014 at the front of the skull \u2014 governs decision making, moral behavior, and deception.",
        arabicText:
            '\u0643\u064e\u0644\u064e\u0651\u0627 \u0644\u064e\u0626\u0650\u0646 \u0644\u064e\u0651\u0645\u0652 \u064a\u064e\u0646\u062a\u064e\u0647\u0650 \u0644\u064e\u0646\u064e\u0633\u0652\u0641\u064e\u0639\u064b\u0627 \u0628\u0650\u0627\u0644\u0646\u064e\u0651\u0627\u0635\u0650\u064a\u064e\u0629\u0650 \u0646\u064e\u0627\u0635\u0650\u064a\u064e\u0629\u064d \u0643\u064e\u0627\u0630\u0650\u0628\u064e\u0629\u064d \u062e\u064e\u0627\u0637\u0650\u0626\u064e\u0629\u064d',
        translation:
            'No! If he does not desist, We will surely drag him by the forelock \u2014 a lying, sinful forelock.',
        reference: 'Quran 96:15\u201316',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-quran-and-modern-science-compatible-or-incompatible',
        order: 8,
        tags: ['neuroscience', 'brain', 'behavior', 'science'],
        createdAt: '2026-02-17T00:00:00.000Z',
    },
    {
        _id: 'qs_09',
        category: 'quran_science',
        title: 'Pain Receptors in the Skin',
        summary:
            "The Qur'an specifies punishment is felt through the skin \u2014 modern science confirms pain receptors (nociceptors) reside primarily in the skin, not internal organs.",
        explanation:
            "Surah An-Nisa' (4:56): 'Every time their skins are roasted through We will replace them with other skins so they may taste the punishment.' The skin contains the majority of pain receptors. Internal organs have far fewer \u2014 this precision was unknowable in 7th-century Arabia.",
        arabicText:
            '\u0643\u064f\u0644\u064e\u0651\u0645\u064e\u0627 \u0646\u064e\u0636\u0650\u062c\u064e\u062a\u0652 \u062c\u064f\u0644\u064f\u0648\u062f\u064f\u0647\u064f\u0645 \u0628\u064e\u062f\u064e\u0651\u0644\u0652\u0646\u064e\u0627\u0647\u064f\u0645\u0652 \u062c\u064f\u0644\u064f\u0648\u062f\u064b\u0627 \u063a\u064e\u064a\u0652\u0631\u064e\u0647\u064e\u0627 \u0644\u0650\u064a\u064e\u0630\u064f\u0648\u0642\u064f\u0648\u0627 \u0627\u0644\u0652\u0639\u064e\u0630\u064e\u0627\u0628\u064e',
        translation:
            'Every time their skins are roasted through We will replace them with other skins so they may taste the punishment.',
        reference: 'Quran 4:56',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-quran-and-modern-science-compatible-or-incompatible',
        order: 9,
        tags: ['medicine', 'anatomy', 'pain', 'science'],
        createdAt: '2026-02-16T00:00:00.000Z',
    },
    {
        _id: 'qs_10',
        category: 'quran_science',
        title: 'The Big Bang and the Separation of Heavens and Earth',
        summary:
            "The Qur'an describes the heavens and earth as one joined entity that was split apart \u2014 aligning with the Big Bang theory's account of the universe's origin.",
        explanation:
            "Surah Al-Anbiya' (21:30): 'Have those who disbelieved not considered that the heavens and the earth were a joined entity (ratqan), and We separated them (fataqn\u0101)?' Modern cosmology describes the Big Bang singularity from which all matter expanded. The 'joined entity' correlates with the pre-expansion singularity.",
        arabicText:
            '\u0623\u064e\u0648\u064e\u0644\u064e\u0645\u0652 \u064a\u064e\u0631\u064e \u0627\u0644\u064e\u0651\u0630\u0650\u064a\u0646\u064e \u0643\u064e\u0641\u064e\u0631\u064f\u0648\u0627 \u0623\u064e\u0646\u064e\u0651 \u0627\u0644\u0633\u064e\u0651\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0627\u0644\u0652\u0623\u064e\u0631\u0652\u0636\u064e \u0643\u064e\u0627\u0646\u064e\u062a\u064e\u0627 \u0631\u064e\u062a\u0652\u0642\u064b\u0627 \u0641\u064e\u0641\u064e\u062a\u064e\u0642\u0652\u0646\u064e\u0627\u0647\u064f\u0645\u064e\u0627',
        translation:
            'Have those who disbelieved not considered that the heavens and the earth were a joined entity, and We separated them?',
        reference: 'Quran 21:30',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-quran-and-modern-science-compatible-or-incompatible',
        order: 10,
        tags: ['cosmology', 'big bang', 'universe', 'science'],
        createdAt: '2026-02-15T00:00:00.000Z',
    },

    {
        _id: 'pr_01',
        category: 'prophecy',
        title: 'The Byzantines Will Rebound',
        summary:
            "The Qur'an predicted the Byzantine Empire would recover from a devastating defeat within 3\u20139 years \u2014 it happened in exactly that timeframe, fulfilling a prophecy the pagans mocked.",
        explanation:
            "Surah Ar-Rum (30:2\u20134) was revealed ~614 CE after Byzantine defeat by Persia. The Qur'an predicted: 'The Romans have been defeated...but they, after their defeat, will overcome within three to nine years.' Between 622\u2013628 CE, Emperor Heraclius reversed the Persian gains completely \u2014 precisely within the stated window.",
        arabicText:
            '\u063a\u064f\u0644\u0650\u0628\u064e\u062a\u0650 \u0627\u0644\u0631\u064e\u0651\u0648\u0645\u064f \u0641\u0650\u064a \u0623\u064e\u062f\u0652\u0646\u064e\u0649 \u0627\u0644\u0652\u0623\u064e\u0631\u0652\u0636\u0650 \u0648\u064e\u0647\u064f\u0645 \u0645\u0650\u0651\u0646 \u0628\u064e\u0639\u0652\u062f\u0650 \u063a\u064e\u0644\u064e\u0628\u0650\u0647\u0650\u0645\u0652 \u0633\u064e\u064a\u064e\u063a\u0652\u0644\u0650\u0628\u064f\u0648\u0646\u064e \u0641\u0650\u064a \u0628\u0650\u0636\u0652\u0639\u0650 \u0633\u0650\u0646\u0650\u064a\u0646\u064e',
        translation:
            'The Romans have been defeated in the nearest land. But they, after their defeat, will overcome within a few years.',
        reference: 'Quran 30:2\u20134',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/proofs-of-prophethood-series',
        order: 1,
        tags: ['byzantines', 'history', 'geopolitics', 'fulfilled'],
        createdAt: '2026-02-24T00:00:00.000Z',
    },
    {
        _id: 'pr_02',
        category: 'prophecy',
        title: "Abu Lahab's Fate \u2014 Foretold Years in Advance",
        summary:
            "The Qur'an predicted Abu Lahab would die as an enemy of Islam. He had 9+ years to prove it wrong by accepting Islam. He never did.",
        explanation:
            'When Surah Al-Masad (111) was revealed, Abu Lahab was alive and could immediately disprove it by reciting the shahada. He lived ~9 more years and died an enemy of the Prophet ﷺ, never accepting Islam. For a mortal to predict a specific living person would never accept Islam \u2014 with that person able to immediately disprove it \u2014 is logically extraordinary.',
        arabicText:
            '\u062a\u064e\u0628\u064e\u0651\u062a\u0652 \u064a\u064e\u062f\u064e\u0627 \u0623\u064e\u0628\u0650\u064a \u0644\u064e\u0647\u064e\u0628\u064d \u0648\u064e\u062a\u064e\u0628\u064e\u0651 \u0645\u064e\u0627 \u0623\u064e\u063a\u0652\u0646\u064e\u0649\u0670 \u0639\u064e\u0646\u0652\u0647\u064f \u0645\u064e\u0627\u0644\u064f\u0647\u064f \u0648\u064e\u0645\u064e\u0627 \u0643\u064e\u0633\u064e\u0628\u064e',
        translation: 'May the hands of Abu Lahab be ruined, and ruined is he. His wealth will not avail him.',
        reference: 'Quran 111:1\u20133',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/proofs-of-prophethood-series',
        order: 2,
        tags: ['prophecy', 'disbelief', 'quran', 'fulfilled'],
        createdAt: '2026-02-23T00:00:00.000Z',
    },
    {
        _id: 'pr_03',
        category: 'prophecy',
        title: 'Islam Will Reach Every Corner of the Earth',
        summary:
            'The Prophet ﷺ predicted Islam would reach every place touched by night and day. Today 1.9 billion Muslims span all 7 continents.',
        explanation:
            "Musnad Ahmad (16957, Sahih): 'This matter will definitely reach every place touched by night and day. Allah will not leave a house of mud or hair except that Allah will cause this religion to enter it.' At the time Islam was a small Arabian community. Today 1.9 billion Muslims live across every continent.",
        arabicText: null,
        translation: 'This matter will definitely reach every place touched by night and day.',
        reference: 'Musnad Ahmad 16957',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/proofs-of-prophethood-series',
        order: 3,
        tags: ['globalization', 'spread of islam', 'fulfilled'],
        createdAt: '2026-02-22T00:00:00.000Z',
    },
    {
        _id: 'pr_04',
        category: 'prophecy',
        title: 'The Conquest of Constantinople',
        summary:
            'The Prophet ﷺ predicted Constantinople would be conquered by a Muslim leader named Muhammad \u2014 over 800 years before Sultan Muhammad al-Fatih fulfilled it in 1453.',
        explanation:
            "Musnad Ahmad (18957, Hasan): 'Verily you shall conquer Constantinople. What a wonderful leader will her leader be.' Approximately 820 years later, in 1453 CE, Sultan Mehmed II (Muhammad al-Fatih) conquered Constantinople and ended the Byzantine Empire.",
        arabicText: null,
        translation: 'Verily you shall conquer Constantinople. What a wonderful leader will her leader be.',
        reference: 'Musnad Ahmad 18957',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/proofs-of-prophethood-series',
        order: 4,
        tags: ['constantinople', 'ottoman', 'conquest', 'fulfilled'],
        createdAt: '2026-02-21T00:00:00.000Z',
    },
    {
        _id: 'pr_05',
        category: 'prophecy',
        title: 'Barefoot Shepherds Competing in Tall Buildings',
        summary:
            "The Prophet ﷺ described a sign of the Last Hour: destitute shepherds competing in tall structures \u2014 the Gulf States' skyscraper boom is a striking fulfillment.",
        explanation:
            "Sahih Muslim (8): 'You will see barefoot, naked, destitute shepherds competing in constructing tall buildings.' 1,400 years ago Arabia was undeveloped. Today Dubai, Abu Dhabi, Riyadh, and Doha \u2014 formerly nomadic regions \u2014 host some of the world's tallest skyscrapers.",
        arabicText: null,
        translation: 'You will see the barefoot, naked, destitute shepherds competing in constructing tall buildings.',
        reference: 'Sahih Muslim 8 (Hadith of Jibril)',
        sourceUrl: 'https://sunnah.com/muslim:8',
        order: 5,
        tags: ['end times', 'signs', 'gulf states', 'fulfilled'],
        createdAt: '2026-02-20T00:00:00.000Z',
    },
    {
        _id: 'pr_06',
        category: 'prophecy',
        title: 'The Spread of Interest (Riba) Across Society',
        summary:
            "The Prophet ﷺ warned interest-based transactions would become so pervasive no one could avoid their effects \u2014 today's entire global economy is built on interest.",
        explanation:
            "Musnad Ahmad (10410, Sahih): 'A time will come when they will consume riba. Those who do not consume it will still be affected by its dust.' In the 7th century, a global interest-based financial system was inconceivable. Today interest is embedded in mortgages, bonds, student loans, and inflation.",
        arabicText: null,
        translation:
            'A time will come when they will consume riba. Those who do not consume it will still be affected by its dust.',
        reference: 'Musnad Ahmad 10410',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/proofs-of-prophethood-series',
        order: 6,
        tags: ['riba', 'interest', 'economy', 'end times', 'fulfilled'],
        createdAt: '2026-02-19T00:00:00.000Z',
    },
    {
        _id: 'pr_07',
        category: 'prophecy',
        title: 'A Woman Traveling Safely Alone',
        summary:
            'The Prophet ﷺ told a skeptic a woman would travel safely from Iraq to Makkah alone \u2014 the skeptic later witnessed it himself.',
        explanation:
            "Sahih al-Bukhari (3595): The Prophet ﷺ told 'Adi ibn Hatim: 'A woman will travel from al-Hira to make tawaf, fearing none but Allah.' 'Adi ibn Hatim later reported: 'I saw it with my own eyes.' The safety necessary for this across tribal 7th-century Arabia was unimaginable.",
        arabicText: null,
        translation: 'A woman will travel from al-Hira to make tawaf, fearing none but Allah.',
        reference: 'Sahih al-Bukhari 3595',
        sourceUrl: 'https://sunnah.com/bukhari:3595',
        order: 7,
        tags: ['women', 'safety', 'travel', 'fulfilled'],
        createdAt: '2026-02-18T00:00:00.000Z',
    },
    {
        _id: 'pr_08',
        category: 'prophecy',
        title: 'Objects Speaking to Their Owners',
        summary:
            "The Prophet ﷺ foretold that a man's possessions would speak to him about what his family does at home \u2014 matching modern smart devices and GPS tracking.",
        explanation:
            "Sunan al-Tirmidhi (2181, Hasan): 'The Hour will not be established until a man's thigh speaks to him about what his family did after he left.' This correlates with smartphones and smart home devices relaying real-time information about home events.",
        arabicText: null,
        translation: "The Hour will not be established until a man's thigh speaks to him about what his family did.",
        reference: 'Sunan al-Tirmidhi 2181',
        sourceUrl: 'https://sunnah.com/tirmidhi:2181',
        order: 8,
        tags: ['technology', 'smart devices', 'end times', 'fulfilled'],
        createdAt: '2026-02-17T00:00:00.000Z',
    },
    {
        _id: 'pr_09',
        category: 'prophecy',
        title: 'No More Caesar in Syria, No More Khosrow in Persia',
        summary:
            'The Prophet ﷺ predicted the end of both superpowers \u2014 the Byzantine and Sassanid Persian dynasties. Within decades, both empires collapsed exactly as prophesied.',
        explanation:
            "Sahih al-Bukhari (3618): 'There will be no Caesar after him in Syria, and no Khosrow after him in Persia.' Within 20 years, Muslim armies destroyed the Sassanid Empire and permanently ended Roman rule in Syria.",
        arabicText: null,
        translation: 'There will be no Caesar after him in Syria, and no Khosrow after him in Persia.',
        reference: 'Sahih al-Bukhari 3618',
        sourceUrl: 'https://sunnah.com/bukhari:3618',
        order: 9,
        tags: ['persia', 'rome', 'byzantines', 'history', 'fulfilled'],
        createdAt: '2026-02-16T00:00:00.000Z',
    },
    {
        _id: 'pr_10',
        category: 'prophecy',
        title: 'The Six Sequential Signs of the End Times',
        summary:
            'The Prophet ﷺ listed 6 signs of the Last Hour in order. The first 5 occurred in exact sequence within decades of his death \u2014 documented by companions.',
        explanation:
            'Sahih al-Bukhari (3176): (1) his death, (2) conquest of Jerusalem, (3) a plague, (4) wealth surplus, (5) a great Arab tribulation, (6) truce with Byzantines.\n\nFulfilled exactly: (1) 632 CE, (2) 638 CE, (3) Amwas Plague 638\u2013639 CE, (4) wealth from conquests, (5) First Fitna 656\u2013661 CE.',
        arabicText: null,
        translation:
            'Count six signs before the Hour: my death, then the conquest of Jerusalem, then a fatal plague, then wealth surplus, then a Great Tribulation, then a truce with the Byzantines.',
        reference: 'Sahih al-Bukhari 3176',
        sourceUrl: 'https://sunnah.com/bukhari:3176',
        order: 10,
        tags: ['end times', 'signs', 'sequential', 'fulfilled'],
        createdAt: '2026-02-15T00:00:00.000Z',
    },
    {
        _id: 'pr_11',
        category: 'prophecy',
        title: 'Arabia Will Return to Greenery and Rivers',
        summary:
            'The Prophet ﷺ foretold Arabia would once again become green with meadows and rivers. NASA satellite data confirms vegetation is returning.',
        explanation:
            "Sahih Muslim (157): 'The Hour will not be established until the land of the Arabs returns to being meadows and rivers.' NASA satellite imagery since the late 20th century documents substantial greening of Saudi Arabia via modern irrigation and shifting rainfall patterns.",
        arabicText: null,
        translation:
            'The Hour will not be established until the land of the Arabs returns to being meadows and rivers.',
        reference: 'Sahih Muslim 157',
        sourceUrl: 'https://sunnah.com/muslim:157',
        order: 11,
        tags: ['environment', 'green arabia', 'end times', 'fulfilled'],
        createdAt: '2026-02-14T00:00:00.000Z',
    },
    {
        _id: 'pr_12',
        category: 'prophecy',
        title: "The Preservation of the Qur'an \u2014 A Divine Guarantee",
        summary:
            "The Qur'an promised its own divine preservation \u2014 1,400 years later, millions memorize it word-for-word with manuscripts matching perfectly.",
        explanation:
            "Surah Al-Hijr (15:9): 'Indeed, it is We who sent down the Qur'an and indeed, We will be its guardian.' Today it is the most widely memorized book in history, with 10\u201315 million hafiz. The Birmingham Quran manuscript (568\u2013645 CE) matches today's text with only minor orthographical variations.",
        arabicText:
            '\u0625\u0650\u0646\u064e\u0651\u0627 \u0646\u064e\u062d\u0652\u0646\u064f \u0646\u064e\u0632\u064e\u0651\u0644\u0652\u0646\u064e\u0627 \u0627\u0644\u0630\u0651\u0650\u0643\u0652\u0631\u064e \u0648\u064e\u0625\u0650\u0646\u064e\u0651\u0627 \u0644\u064e\u0647\u064f \u0644\u064e\u062d\u064e\u0627\u0641\u0650\u0638\u064f\u0648\u0646\u064e',
        translation: "Indeed, it is We who sent down the Qur'an and indeed, We will be its guardian.",
        reference: 'Quran 15:9',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-eternal-challenge-a-miracle-of-the-quran',
        order: 12,
        tags: ['preservation', 'quran', 'manuscripts', 'memory'],
        createdAt: '2026-02-13T00:00:00.000Z',
    },

    {
        _id: 'lm_01',
        category: 'linguistic_miracle',
        title: "The Word 'Day' Appears Exactly 365 Times",
        summary:
            "The Arabic word for 'day' (yawm, \u064a\u0648\u0645) appears exactly 365 times in the Qur'an \u2014 matching the number of days in a solar year.",
        explanation:
            "Every singular occurrence of 'yawm' (\u064a\u0648\u0645 \u2014 day) across the full Qur'an totals exactly 365. Similarly: 'month' (shahr) appears 12 times, 'sea' 32 times and 'land' 13 times (ratio \u2248 Earth's actual ocean/land ratio). The Qur'an was revealed orally over 23 years \u2014 engineering consistent numerical patterns under those conditions is extraordinarily difficult.",
        arabicText: null,
        translation: null,
        reference: "Full Qur'an \u2014 word frequency analysis",
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-eternal-challenge-a-miracle-of-the-quran',
        order: 1,
        tags: ['numbers', 'word count', 'linguistics', 'miracle'],
        createdAt: '2026-02-24T00:00:00.000Z',
    },
    {
        _id: 'lm_02',
        category: 'linguistic_miracle',
        title: "The Middle Verse of Surah Al-Baqarah Contains the Word 'Moderate'",
        summary:
            "Surah Al-Baqarah has 286 verses. The exact middle verse (143) says 'a moderate nation' \u2014 perfect thematic alignment between structure and meaning.",
        explanation:
            "Surah Al-Baqarah (286 verses). Verse 143 \u2014 the mathematical center \u2014 reads: 'And thus We have made you a moderate community (ummatan wasatan).' The word 'wasatan' means middle/moderate. The ummah described as a middle nation appears at the precise mathematical middle of the Qur'an's longest surah.",
        arabicText:
            '\u0648\u064e\u0643\u064e\u0630\u064e\u0670\u0644\u0650\u0643\u064e \u062c\u064e\u0639\u064e\u0644\u0652\u0646\u064e\u0627\u0643\u064f\u0645\u0652 \u0623\u064f\u0645\u064e\u0651\u0629\u064b \u0648\u064e\u0633\u064e\u0637\u064b\u0627 \u0644\u0650\u0651\u062a\u064e\u0643\u064f\u0648\u0646\u064f\u0648\u0627 \u0634\u064f\u0647\u064e\u062f\u064e\u0627\u0621\u064e \u0639\u064e\u0644\u064e\u0649 \u0627\u0644\u0646\u064e\u0651\u0627\u0633\u0650',
        translation: 'And thus We have made you a moderate community so that you will be witnesses over the people.',
        reference: 'Quran 2:143',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-eternal-challenge-a-miracle-of-the-quran',
        order: 2,
        tags: ['structure', 'middle verse', 'linguistics', 'miracle'],
        createdAt: '2026-02-23T00:00:00.000Z',
    },
    {
        _id: 'lm_03',
        category: 'linguistic_miracle',
        title: "The Qur'anic Challenge \u2014 1,400 Years Unanswered",
        summary:
            "The Qur'an challenges humanity and jinn to produce even one chapter like it. Despite 1,400 years of attempts by the finest Arabic literary minds, the challenge stands unanswered.",
        explanation:
            "Quran 2:23: 'Produce a surah the like thereof.' Quran 17:88: 'If all mankind and jinn gathered, they could not produce the like of it.' For 1,400 years, Arab opponents with every motivation and the finest Arabic literary tradition conceded they could not match it.",
        arabicText:
            '\u0642\u064f\u0644 \u0644\u064e\u0651\u0626\u0650\u0646\u0650 \u0627\u062c\u0652\u062a\u064e\u0645\u064e\u0639\u064e\u062a\u0650 \u0627\u0644\u0652\u0625\u0650\u0646\u0633\u064f \u0648\u064e\u0627\u0644\u0652\u062c\u0650\u0646\u064e\u0651 \u0639\u064e\u0644\u064e\u0649\u0670 \u0623\u064e\u0646 \u064a\u064e\u0623\u0652\u062a\u064f\u0648\u0627 \u0628\u0650\u0645\u0650\u062b\u0652\u0644\u0650 \u0647\u064e\u0670\u0630\u064e\u0627 \u0627\u0644\u0652\u0642\u064f\u0631\u0652\u0622\u0646\u0650 \u0644\u064e\u0627 \u064a\u064e\u0623\u0652\u062a\u064f\u0648\u0646\u064e \u0628\u0650\u0645\u0650\u062b\u0652\u0644\u0650\u0647\u0650',
        translation:
            "Say: If all mankind and jinn gathered to produce the like of this Qur'an, they could not produce the like of it.",
        reference: 'Quran 17:88; 2:23',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-eternal-challenge-a-miracle-of-the-quran',
        order: 3,
        tags: ['challenge', 'inimitability', 'arabic', 'literature', 'miracle'],
        createdAt: '2026-02-22T00:00:00.000Z',
    },
    {
        _id: 'lm_04',
        category: 'linguistic_miracle',
        title: "Sea-to-Land Ratio Encoded in the Qur'an",
        summary:
            "The word 'sea' appears 32 times and 'land' 13 times \u2014 a ratio of 71.1% to 28.9%, mirroring Earth's actual ocean coverage of roughly 71%.",
        explanation:
            "Counting all occurrences: 'Sea' (bahr): 32, 'Land' (barr): 13, Total: 45. Sea percentage: 71.11%. Land percentage: 28.88%. Earth's actual ocean coverage: ~70.9%. This correlation \u2014 in a 7th-century text from a landlocked desert community \u2014 is cited as one of the Qur'an's numerical signs (with a note for further scholarly verification).",
        arabicText: null,
        translation: null,
        reference: "Full Qur'an \u2014 word frequency analysis",
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-eternal-challenge-a-miracle-of-the-quran',
        order: 4,
        tags: ['numbers', 'ocean', 'land', 'ratio', 'miracle'],
        createdAt: '2026-02-21T00:00:00.000Z',
    },
    {
        _id: 'lm_05',
        category: 'linguistic_miracle',
        title: 'Ring Composition in Surah Al-Baqarah',
        summary:
            'Surah Al-Baqarah (286 verses) exhibits perfect chiastic (mirror) structure \u2014 themes in the first half mirror the second half around a central pivot, revealed across years in oral form.',
        explanation:
            "Dr. Raymond Farrin's analysis (*Muslim World*, 2010) shows Surah Al-Baqarah forms a perfect ring structure across 7 sections. Each theme in the first half mirrors the corresponding section of the second half, with the central pivot at verse 143 ('a moderate community'). This structural sophistication in a surah revealed over multiple years without a written manuscript is recognized by Western literary scholars as extraordinary.",
        arabicText: null,
        translation: null,
        reference: "Surah Al-Baqarah (2:1\u2013286); Farrin, 'Surat al-Baqara: A Structural Analysis' (2010)",
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/literary-analysis-of-the-quran',
        order: 5,
        tags: ['ring composition', 'chiasmus', 'structure', 'literary', 'miracle'],
        createdAt: '2026-02-20T00:00:00.000Z',
    },
    {
        _id: 'lm_06',
        category: 'linguistic_miracle',
        title: 'Consistent Literary Style Across 23 Years',
        summary:
            "The Qur'an was revealed across 23 years in persecution, migration, warfare, and peace \u2014 yet maintains a single, unified, inimitable literary voice. No human author demonstrates this.",
        explanation:
            "The Qur'an was revealed in radically different circumstances across 23 years yet maintains a consistent voice, rhythm, and register that is immediately recognizable as the same source. Shakespeare's style measurably changed across his career; any human author shows traceable stylistic evolution. The Qur'an shows none.",
        arabicText: null,
        translation: null,
        reference: 'Quran 17:106; literary analysis across full text',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-eternal-challenge-a-miracle-of-the-quran',
        order: 6,
        tags: ['style', 'consistency', 'literary', '23 years', 'miracle'],
        createdAt: '2026-02-19T00:00:00.000Z',
    },

    {
        _id: 'hf_01',
        category: 'historical_fact',
        title: 'The First University Was Founded by a Muslim Woman',
        summary:
            "The University of al-Qarawiyyin in Fez, Morocco \u2014 founded in 859 CE by Fatima al-Fihri \u2014 is recognized by UNESCO and Guinness World Records as the world's oldest continuously operating university.",
        explanation:
            "In 859 CE, Fatima al-Fihri used her entire inheritance to found al-Qarawiyyin in Fez, Morocco. It grew into a full university offering grammar, rhetoric, logic, mathematics, and astronomy. UNESCO and the Guinness Book of Records recognize it as the world's oldest continuously operating educational institution.",
        arabicText: null,
        translation: null,
        reference: 'University of al-Qarawiyyin, Fez, Morocco (859 CE)',
        sourceUrl: 'https://www.bbc.com/travel/article/20190312-the-womans-world-first-university',
        order: 1,
        tags: ['education', 'university', 'women', 'fatima al-fihri', 'history'],
        createdAt: '2026-02-24T00:00:00.000Z',
    },
    {
        _id: 'hf_02',
        category: 'historical_fact',
        title: 'The Islamic Golden Age \u2014 When Muslim Scholars Shaped Civilization',
        summary:
            'From the 8th to 13th century, the Islamic world produced groundbreaking advances in algebra, optics, medicine, and astronomy while Europe was in the Dark Ages.',
        explanation:
            "Key achievements:\n\u2022 Al-Khwarizmi \u2014 'algebra' derives from his title; 'algorithm' from his Latinized name.\n\u2022 Ibn al-Haytham \u2014 *Book of Optics*, the most influential optics work before Newton.\n\u2022 Ibn Sina (Avicenna) \u2014 *Canon of Medicine*, standard European medical text until the 17th century.\n\u2022 Al-Zahrawi \u2014 invented 200+ surgical instruments still in use today.\n\u2022 First hospitals with wards, records, and qualified staff founded in the Islamic world.",
        arabicText: null,
        translation: null,
        reference: 'Islamic Golden Age (8th\u201313th century CE)',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-golden-age-of-islam',
        order: 2,
        tags: ['golden age', 'science', 'algebra', 'medicine', 'history'],
        createdAt: '2026-02-23T00:00:00.000Z',
    },
    {
        _id: 'hf_03',
        category: 'historical_fact',
        title: "The Prophet's Last Sermon \u2014 A Universal Declaration of Human Rights (632 CE)",
        summary:
            "Delivered 1,316 years before the UN Declaration of Human Rights, the Prophet's ﷺ Farewell Sermon established racial equality, women's rights, and the rule of law.",
        explanation:
            "On 9 Dhul-Hijjah 10 AH (632 CE), before ~124,000 people on Mount Arafat, the Prophet ﷺ declared:\n\n\u2022 'An Arab has no superiority over a non-Arab, nor a white over a black \u2014 except by piety.'\n\u2022 'Your lives and properties are forbidden to one another.'\n\u2022 'Women have rights over you, just as you have rights over them.'\n\nThe UN Declaration of Human Rights was adopted in 1948 \u2014 1,316 years later.",
        arabicText: null,
        translation: 'An Arab has no superiority over a non-Arab, nor a white over a black \u2014 except by piety.',
        reference: 'Farewell Sermon, Mount Arafat, 9 Dhul-Hijjah 10 AH (632 CE)',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/human-rights-in-islam',
        order: 3,
        tags: ['human rights', 'farewell sermon', 'equality', 'race', 'history'],
        createdAt: '2026-02-22T00:00:00.000Z',
    },
    {
        _id: 'hf_04',
        category: 'historical_fact',
        title: "The Qur'an \u2014 The Most Verified Text in History",
        summary:
            "No other ancient text has a documented transmission chain (isnad) as rigorous as the Qur'an. Every hafiz today traces their memorization back to the Prophet ﷺ himself.",
        explanation:
            "The Qur'an has two independent, mutually verifying preservation channels:\n\n1. **Manuscript**: The Birmingham Quran (568\u2013645 CE, radiocarbon dated) matches today's text with only minor orthographic variations. The earliest New Testament manuscripts date to ~200\u2013300 years after Jesus.\n\n2. **Hafiz chain**: Each hafiz names their teacher back to the Prophet ﷺ \u2014 a chain maintained by millions cross-checking each other.",
        arabicText:
            '\u0625\u0650\u0646\u064e\u0651\u0627 \u0646\u064e\u062d\u0652\u0646\u064f \u0646\u064e\u0632\u064e\u0651\u0644\u0652\u0646\u064e\u0627 \u0627\u0644\u0630\u0651\u0650\u0643\u0652\u0631\u064e \u0648\u064e\u0625\u0650\u0646\u064e\u0651\u0627 \u0644\u064e\u0647\u064f \u0644\u064e\u062d\u064e\u0627\u0641\u0650\u0638\u064f\u0648\u0646\u064e',
        translation: "Indeed, it is We who sent down the Qur'an and indeed, We will be its guardian. (Quran 15:9)",
        reference: 'Birmingham Quran manuscript; Sanaa manuscript; Hafiz transmission chains',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-eternal-challenge-a-miracle-of-the-quran',
        order: 4,
        tags: ['preservation', 'manuscripts', 'oral tradition', 'history'],
        createdAt: '2026-02-21T00:00:00.000Z',
    },
    {
        _id: 'hf_05',
        category: 'historical_fact',
        title: 'Al-Zahrawi \u2014 The Father of Modern Surgery',
        summary:
            'Abu al-Qasim al-Zahrawi (10th century) invented 200+ surgical instruments, many still in use today, and wrote the most comprehensive medieval medical encyclopedia.',
        explanation:
            'Al-Zahrawi (936\u20131013 CE), known as Albucasis in Europe, wrote the 30-volume *Al-Tasrif* including a surgical treatise describing 200+ instruments \u2014 curettes, bone saws, scalpels, and lithotomy tools. His work was a standard European medical textbook for five centuries. He pioneered catgut internal stitches still used in modern surgery.',
        arabicText: null,
        translation: null,
        reference: 'Al-Zahrawi (936\u20131013 CE), Al-Tasrif',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-golden-age-of-islam',
        order: 5,
        tags: ['surgery', 'medicine', 'golden age', 'al-zahrawi', 'history'],
        createdAt: '2026-02-20T00:00:00.000Z',
    },
    {
        _id: 'hf_06',
        category: 'historical_fact',
        title: "The World's First Hospitals Were Founded in the Islamic World",
        summary:
            'Before hospitals existed in Europe, the Islamic world established bimaristans \u2014 publicly funded institutions with wards, medical records, and free care for all patients regardless of religion.',
        explanation:
            'Key bimaristans:\n\u2022 Baghdad Bimaristan (805 CE): First with physician staff, separate wards, pharmacy.\n\u2022 Al-Adudi Hospital (981 CE): 24 physicians, mental health ward, medical school.\n\u2022 Al-Mansuri Hospital, Cairo (1284 CE): 8,000 patients; free care for all, rooted in Quran 5:32.',
        arabicText: null,
        translation: null,
        reference: 'Bimaristan institutions (805 CE onwards)',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-golden-age-of-islam',
        order: 6,
        tags: ['hospitals', 'medicine', 'history', 'golden age'],
        createdAt: '2026-02-19T00:00:00.000Z',
    },
    {
        _id: 'hf_07',
        category: 'historical_fact',
        title: 'House of Wisdom \u2014 How Islam Preserved Greek Philosophy',
        summary:
            "When Greek civilization declined, Muslim translators at Baghdad's House of Wisdom preserved Plato, Aristotle, and Galen, forming the intellectual foundation of the European Renaissance.",
        explanation:
            "The Translation Movement (8th\u201310th century) at the Bayt al-Hikmah in Baghdad systematically translated Greek, Persian, and Indian texts. European scholars later translated these Arabic works into Latin \u2014 and these formed the Renaissance's foundation. Without the Islamic Translation Movement, significant portions of classical Greek knowledge would have been lost.",
        arabicText: null,
        translation: null,
        reference: 'Bayt al-Hikmah, Baghdad (8th\u201310th century CE)',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-golden-age-of-islam',
        order: 7,
        tags: ['greek philosophy', 'translation', 'house of wisdom', 'history'],
        createdAt: '2026-02-18T00:00:00.000Z',
    },
    {
        _id: 'hf_08',
        category: 'historical_fact',
        title: 'Prophetic Environmental Laws \u2014 1,400 Years Before Environmentalism',
        summary:
            'The Prophet ﷺ established protections for trees, animals, and water sources 14 centuries before the first environmental legislation existed.',
        explanation:
            "Prophetic environmental practices:\n\u2022 Hima (protected zones): No-cutting, no-hunting zones around Madinah \u2014 the world's oldest documented nature reserve.\n\u2022 'If the Hour comes while you have a seedling in your hand, plant it.' (Musnad Ahmad, Hasan)\n\u2022 'There is a reward for serving any living being.' (Sahih al-Bukhari 2363)\n\nThe first modern environmental legislation began in the 19th century.",
        arabicText: null,
        translation: 'If the Hour comes while one of you has a seedling in his hand, plant it.',
        reference: 'Musnad Ahmad (tree planting); Sahih al-Bukhari 2363 (animal welfare)',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-environment-in-islam',
        order: 8,
        tags: ['environment', 'nature', 'history', 'law', 'animals'],
        createdAt: '2026-02-17T00:00:00.000Z',
    },

    {
        _id: 'pw_01',
        category: 'prophetic_wisdom',
        title: 'Quarantine Guidance \u2014 1,400 Years Before Germ Theory',
        summary:
            "The Prophet ﷺ prescribed exactly what modern public health calls 'quarantine' \u2014 well before Louis Pasteur and germ theory were even a concept.",
        explanation:
            "Sahih al-Bukhari (5728): 'If you hear of an outbreak of plague in a land, do not enter it; but if the plague breaks out in a place while you are in it, do not leave.' Germ theory was established by Pasteur and Koch only in the 19th century. This precise quarantine guidance predates it by 1,200+ years.",
        arabicText: null,
        translation:
            'If you hear of an outbreak of plague in a land, do not enter it; if it breaks out where you are, do not leave.',
        reference: 'Sahih al-Bukhari 5728; Sahih Muslim 2219',
        sourceUrl: 'https://sunnah.com/bukhari:5728',
        order: 1,
        tags: ['medicine', 'quarantine', 'disease', 'public health', 'wisdom'],
        createdAt: '2026-02-24T00:00:00.000Z',
    },
    {
        _id: 'pw_02',
        category: 'prophetic_wisdom',
        title: 'Handwashing Before and After Eating \u2014 Before Germ Theory',
        summary:
            "The Prophet ﷺ commanded washing hands before and after meals and emphasized cleanliness as 'half of faith' \u2014 centuries before bacteria were discovered.",
        explanation:
            "Sunan Abi Dawud (3761): 'The blessing of food lies in washing the hands before and after it.' And (Sahih Muslim 223): 'Cleanliness is half of faith.' The connection between handwashing and disease prevention was established only in 1847 by Dr. Semmelweis \u2014 1,200+ years after these teachings.",
        arabicText: null,
        translation: 'Cleanliness is half of faith.',
        reference: 'Sahih Muslim 223; Sunan Abi Dawud 3761',
        sourceUrl: 'https://sunnah.com/muslim:223',
        order: 2,
        tags: ['hygiene', 'handwashing', 'medicine', 'cleanliness', 'wisdom'],
        createdAt: '2026-02-23T00:00:00.000Z',
    },
    {
        _id: 'pw_03',
        category: 'prophetic_wisdom',
        title: 'Prophetic Guidance on Diet and Moderation',
        summary:
            'The Prophet ﷺ prescribed filling one-third with food, one-third with water, one-third with air \u2014 modern nutritional neuroscience validates this.',
        explanation:
            "Sunan al-Tirmidhi (2380, Hasan): 'Fill one third with food, one third with drink, and one third with air.' Modern science confirms: overeating reduces cognitive performance, increases inflammation, and is associated with depression. Caloric restriction improves mental clarity. Intermittent fasting (similar to Ramadan) has documented neurological and metabolic benefits.",
        arabicText: null,
        translation: 'Fill one third with food, one third with drink, and one third with air.',
        reference: 'Sunan al-Tirmidhi 2380',
        sourceUrl: 'https://sunnah.com/tirmidhi:2380',
        order: 3,
        tags: ['diet', 'nutrition', 'mental health', 'moderation', 'wisdom'],
        createdAt: '2026-02-22T00:00:00.000Z',
    },
    {
        _id: 'pw_04',
        category: 'prophetic_wisdom',
        title: 'Sleep Hygiene \u2014 Prophetic Practices Confirmed by Sleep Science',
        summary:
            'The Prophet ﷺ prescribed sleeping on the right side, early bedtime, and short naps \u2014 all confirmed by modern sleep medicine to optimize sleep quality.',
        explanation:
            'Sunnah sleep guidance mapped to modern science:\n\u2022 Right-side sleeping (Sahih al-Bukhari 247): Reduces acid reflux, benefits the lymphatic system.\n\u2022 Early bedtime: Aligns with circadian rhythm (chronobiology).\n\u2022 Qaylula (afternoon nap): NASA confirms a 10\u201320 min nap improves cognitive performance by up to 34%.\n\u2022 Dhikr before sleep: Corresponds to research showing bedtime mindfulness reduces insomnia.',
        arabicText: null,
        translation: null,
        reference: 'Sahih al-Bukhari 247; various sleep-related hadiths',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-sunnah-of-sleep',
        order: 4,
        tags: ['sleep', 'health', 'sunnah', 'science', 'wisdom'],
        createdAt: '2026-02-21T00:00:00.000Z',
    },
    {
        _id: 'pw_05',
        category: 'prophetic_wisdom',
        title: 'Animal Rights in Islam \u2014 1,400 Years Before Animal Welfare Legislation',
        summary:
            'The Prophet ﷺ instituted enforceable animal rights: prohibiting torture, unnecessary pain, and overloading \u2014 1,200 years before the first animal welfare law.',
        explanation:
            "The Prophet ﷺ: 'There is a reward for serving any living being.' (Sahih al-Bukhari 2363). And: 'Allah has prescribed excellence in all things. When you slaughter, slaughter well.' (Sahih Muslim 1955). Prohibited: branding on the face, using animals as targets, overloading, unnecessary caging. A man who gave water to a thirsty dog was praised with entrance to Paradise. The first animal welfare legislation: UK Cruelty to Animals Act (1835) \u2014 1,200+ years later.",
        arabicText: null,
        translation: 'There is a reward for serving any living being.',
        reference: 'Sahih al-Bukhari 2363; Sahih Muslim 1955',
        sourceUrl: 'https://sunnah.com/bukhari:2363',
        order: 5,
        tags: ['animals', 'rights', 'compassion', 'ethics', 'wisdom'],
        createdAt: '2026-02-20T00:00:00.000Z',
    },
    {
        _id: 'pw_06',
        category: 'prophetic_wisdom',
        title: 'Mental Health and the Prohibition of Hopelessness',
        summary:
            "The Qur'an explicitly prohibits despair from Allah's mercy \u2014 establishing spiritual hope as a health principle at a time when mental illness was seen as demonic possession.",
        explanation:
            "Surah Az-Zumar (39:53): 'O My servants who have transgressed against themselves! Do not despair of the mercy of Allah. Indeed, Allah forgives all sins.' Modern psychology identifies 'hopelessness' as one of the strongest predictors of depression and suicide. The Islamic prohibition of despair \u2014 and active cultivation of hope \u2014 is recognized by Muslim mental health practitioners as a significant protective factor.",
        arabicText:
            '\u0642\u064f\u0644\u0652 \u064a\u064e\u0627 \u0639\u0650\u0628\u064e\u0627\u062f\u0650\u064a\u064e \u0627\u0644\u064e\u0651\u0630\u0650\u064a\u0646\u064e \u0623\u064e\u0633\u0652\u0631\u064e\u0641\u064f\u0648\u0627 \u0639\u064e\u0644\u064e\u0649\u0670 \u0623\u064e\u0646\u0641\u064f\u0633\u0650\u0647\u0650\u0645\u0652 \u0644\u064e\u0627 \u062a\u064e\u0642\u0652\u0646\u064e\u0637\u064f\u0648\u0627 \u0645\u0650\u0646 \u0631\u064e\u0651\u062d\u0652\u0645\u064e\u0629\u0650 \u0627\u0644\u0644\u064e\u0651\u0647\u0650',
        translation:
            'Say: O My servants who have transgressed against themselves! Do not despair of the mercy of Allah.',
        reference: 'Quran 39:53; Sahih Muslim 2664',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/mental-health-in-the-quran-and-sunnah',
        order: 6,
        tags: ['mental health', 'hope', 'despair', 'psychology', 'wisdom'],
        createdAt: '2026-02-19T00:00:00.000Z',
    },
    {
        _id: 'pw_07',
        category: 'prophetic_wisdom',
        title: 'The Ethics of Business and Consumer Protection in Islam',
        summary:
            'The Prophet ﷺ established ethical trade rules \u2014 honesty, no deceptive packaging, fair weights \u2014 the equivalent of modern consumer protection law, 1,200 years early.',
        explanation:
            "The Prophet ﷺ discovered wet produce hidden beneath dry: 'He who deceives us is not of us.' (Sahih Muslim 102). Additional rules: required accurate weights, prohibited selling defective goods without disclosure, prohibited hoarding to inflate prices. The first modern consumer protection law (UK Sale of Goods Act, 1893) was enacted 1,260+ years after these teachings.",
        arabicText: null,
        translation: 'He who deceives us is not of us.',
        reference: 'Sahih Muslim 102',
        sourceUrl: 'https://sunnah.com/muslim:102',
        order: 7,
        tags: ['business', 'trade', 'ethics', 'consumer rights', 'wisdom'],
        createdAt: '2026-02-18T00:00:00.000Z',
    },
    {
        _id: 'pw_08',
        category: 'prophetic_wisdom',
        title: 'The Sunnah of Smiling \u2014 Science Confirms It Is Charity',
        summary:
            "The Prophet ﷺ described smiling at one's brother as an act of charity \u2014 modern psychology confirms smiling reduces stress and builds social trust.",
        explanation:
            "Sunan al-Tirmidhi (1956, Hasan): 'Your smile for your brother is an act of charity.' Modern psychology confirms: seeing a smile activates the orbitofrontal cortex (reward center); smiling reduces the body's stress response; mirror neurons automatically evoke a positive state in the recipient. The Prophet ﷺ framing smiling as sadaqa elevates a free, scientifically beneficial act to the status of worship.",
        arabicText: null,
        translation: 'Your smile for your brother is an act of charity.',
        reference: 'Sunan al-Tirmidhi 1956',
        sourceUrl: 'https://sunnah.com/tirmidhi:1956',
        order: 8,
        tags: ['smile', 'sadaqa', 'psychology', 'social', 'wisdom'],
        createdAt: '2026-02-17T00:00:00.000Z',
    },

    {
        _id: 'na_01',
        category: 'names_of_allah',
        title: 'Ar-Rahman \u2014 The Most Gracious',
        summary:
            'Ar-Rahman (\u0627\u0644\u0631\u064e\u0651\u062d\u0652\u0645\u064e\u0646) signifies divine mercy so vast it encompasses all of creation \u2014 believer and disbeliever alike \u2014 in this world.',
        explanation:
            "Ar-Rahman comes from the root 'r-h-m' (\u0631\u062d\u0645), related to 'rahim' (womb), evoking the tenderness of a mother's love \u2014 but infinitely greater. The Prophet ﷺ: 'Allah divided mercy into one hundred parts. He kept ninety-nine and sent one to the world \u2014 from this one part, creatures are merciful to one another.' (Sahih al-Bukhari 6000). Ar-Rahman is so specific to Allah it cannot be used as a human name.",
        arabicText:
            '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u064e\u0651\u0647\u0650 \u0627\u0644\u0631\u064e\u0651\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u064e\u0651\u062d\u0650\u064a\u0645\u0650',
        translation: 'In the name of Allah, the Most Gracious, the Most Merciful.',
        reference: 'Quran 1:1; Sahih al-Bukhari 6000',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-99-names-of-allah',
        order: 1,
        tags: ['names of allah', 'mercy', 'ar-rahman', 'attributes'],
        createdAt: '2026-02-24T00:00:00.000Z',
    },
    {
        _id: 'na_02',
        category: 'names_of_allah',
        title: 'Al-Alim \u2014 The All-Knowing',
        summary:
            'Al-Alim (\u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0645) means Allah knows everything \u2014 past, present, future, hidden and manifest, the spoken word and the whisper of a thought.',
        explanation:
            "Al-Alim appears 157 times in the Qur'an. Quran 6:59: 'And with Him are the keys of the Unseen; none knows them except Him. Not a leaf falls but that He knows it.' Reflecting on Al-Alim grounds believers in honesty \u2014 concealing inner states from others is possible, but not from Allah. It brings comfort \u2014 if Allah knows your hidden pain, He hears your unspoken supplication.",
        arabicText:
            '\u0648\u064e\u0639\u0650\u0646\u062f\u064e\u0647\u064f \u0645\u064e\u0641\u064e\u0627\u062a\u0650\u062d\u064f \u0627\u0644\u0652\u063a\u064e\u064a\u0652\u0628\u0650 \u0644\u064e\u0627 \u064a\u064e\u0639\u0652\u0644\u064e\u0645\u064f\u0647\u064e\u0627 \u0625\u0650\u0644\u064e\u0651\u0627 \u0647\u064f\u0648\u064e',
        translation: 'And with Him are the keys of the Unseen; none knows them except Him.',
        reference: 'Quran 6:59',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-99-names-of-allah',
        order: 2,
        tags: ['names of allah', 'knowledge', 'al-alim', 'attributes'],
        createdAt: '2026-02-23T00:00:00.000Z',
    },
    {
        _id: 'na_03',
        category: 'names_of_allah',
        title: 'Al-Khaliq \u2014 The Creator',
        summary:
            'Al-Khaliq (\u0627\u0644\u0652\u062e\u064e\u0627\u0644\u0650\u0642) means Allah creates from nothing \u2014 categorically different from any human creation, which only rearranges existing material.',
        explanation:
            "Al-Khaliq (\u062e\u0644\u0642) means creation ex nihilo \u2014 from absolute nothing. Quran 16:17: 'Is He who creates like one who does not create?' Al-Khaliq connects with Al-Bari' (the Originator) and Al-Musawwir (the Shaper of Forms). Modern cosmology's 'fine-tuning problem' \u2014 the extraordinary precision of universal constants needed for matter to exist \u2014 invites reflection on Al-Khaliq's creative deliberateness.",
        arabicText:
            '\u0647\u064f\u0648\u064e \u0627\u0644\u0644\u064e\u0651\u0647\u064f \u0627\u0644\u0652\u062e\u064e\u0627\u0644\u0650\u0642\u064f \u0627\u0644\u0652\u0628\u064e\u0627\u0631\u0650\u0626\u064f \u0627\u0644\u0652\u0645\u064f\u0635\u064e\u0648\u0651\u0650\u0631\u064f',
        translation: 'He is Allah, the Creator, the Originator, the Shaper of Forms.',
        reference: 'Quran 59:24',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-99-names-of-allah',
        order: 3,
        tags: ['names of allah', 'creation', 'al-khaliq', 'attributes'],
        createdAt: '2026-02-22T00:00:00.000Z',
    },
    {
        _id: 'na_04',
        category: 'names_of_allah',
        title: "Al-Sami' \u2014 The All-Hearing",
        summary:
            "Al-Sami' (\u0627\u0644\u0633\u064e\u0651\u0645\u0650\u064a\u0639) means Allah hears every sound in creation \u2014 from the cry of a newborn to the silent prayer in the heart. No call goes unheard.",
        explanation:
            "Al-Sami\u2019 hears all things without limitation of proximity, volume, or language. Quran 58:1 records an elderly woman who complained about her husband, and revelation came: 'Allah has heard the speech of the one who argued with you.' When making du\u2019a, know that even the softest whisper of the heart reaches a Listener who hears it perfectly.",
        arabicText:
            '\u0625\u0650\u0646\u064e\u0651 \u0627\u0644\u0644\u064e\u0651\u0647\u064e \u0633\u064e\u0645\u0650\u064a\u0639\u064c \u0639\u064e\u0644\u0650\u064a\u0645\u064c',
        translation: 'Indeed, Allah is All-Hearing, All-Knowing.',
        reference: 'Quran 2:127; Quran 58:1',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-99-names-of-allah',
        order: 4,
        tags: ['names of allah', 'hearing', 'al-sami', 'prayer', 'attributes'],
        createdAt: '2026-02-21T00:00:00.000Z',
    },
    {
        _id: 'na_05',
        category: 'names_of_allah',
        title: 'Al-Wadud \u2014 The Most Loving',
        summary:
            'Al-Wadud (\u0627\u0644\u0652\u0648\u064e\u062f\u064f\u0648\u062f) describes a love that is unconditional, initiative-taking \u2014 a love that initiated before you had the capacity to love back.',
        explanation:
            "Al-Wadud appears only twice in the Qur'an (11:90, 85:14) yet carries immense theological weight. Ibn al-Qayyim wrote Allah initiated love for you before you could love Him back \u2014 a proactive love that seeks your good. Quran 85:14: 'And He is the Forgiving, the Affectionate.' The combination with forgiveness shows Allah's love is not conditional on your perfection.",
        arabicText:
            '\u0648\u064e\u0647\u064f\u0648\u064e \u0627\u0644\u0652\u063a\u064e\u0641\u064f\u0648\u0631\u064f \u0627\u0644\u0652\u0648\u064e\u062f\u064f\u0648\u062f\u064f',
        translation: 'And He is the Forgiving, the Most Loving.',
        reference: 'Quran 85:14; Quran 11:90',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-99-names-of-allah',
        order: 5,
        tags: ['names of allah', 'love', 'al-wadud', 'attributes'],
        createdAt: '2026-02-20T00:00:00.000Z',
    },
    {
        _id: 'na_06',
        category: 'names_of_allah',
        title: 'Al-Sabur \u2014 The Most Patient',
        summary:
            'Al-Sabur (\u0627\u0644\u0635\u064e\u0651\u0628\u064f\u0648\u0631) \u2014 Allah witnesses every act of injustice and disobedience, yet withholds immediate punishment, giving creation time to return.',
        explanation:
            "Al-Sabur (from the hadith collections on the 99 Names) means Allah sees every injustice yet delays consequence out of wisdom, not inability. This grounds two virtues: (1) Hope \u2014 sins don't immediately destroy your relationship with Allah; (2) Patience in trials \u2014 since Allah Himself is Al-Sabur, exercising patience reflects a divine attribute. The Prophet ﷺ: 'No one has been given a better gift than patience.' (Sahih al-Bukhari 1469)",
        arabicText: null,
        translation: 'No one has been given a better or more abundant gift than patience.',
        reference: 'Sahih al-Bukhari 1469; 99 Names hadith',
        sourceUrl: 'https://yaqeeninstitute.org/read/paper/the-99-names-of-allah',
        order: 6,
        tags: ['names of allah', 'patience', 'al-sabur', 'attributes'],
        createdAt: '2026-02-19T00:00:00.000Z',
    },
];
export const fetchMockDailySign = async (): Promise<Sign> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const dayOfYear = Math.floor(
                (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
            );
            resolve(MOCK_SIGNS[dayOfYear % MOCK_SIGNS.length]);
        }, 600);
    });
};

export const fetchMockSigns = async (category?: string): Promise<Sign[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (category && category !== 'all') {
                resolve(MOCK_SIGNS.filter((s) => s.category === category));
            } else {
                resolve(MOCK_SIGNS);
            }
        }, 700);
    });
};
