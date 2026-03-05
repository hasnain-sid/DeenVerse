export interface ScholarApplication {
    id: string;
    name: string;
    avatar: string;
    specialties: string[];
    credentials: string[];
    applicationDate: string;
    bio: string;
}

export const mockApplications: ScholarApplication[] = [
    {
        id: 'app_1',
        name: 'Sheikh Ahmad Hassan',
        avatar: 'AH',
        specialties: ['Tajweed', 'Quranic Sciences'],
        credentials: ['Ijazah in Quran recitation', '15+ years teaching'],
        applicationDate: '2026-02-28T10:30:00Z',
        bio: 'Dedicated Quran teacher with over 15 years of experience in tajweed and Quranic sciences. Has taught thousands of students across multiple countries and holds multiple ijazahs in various qira\'aat.',
    },
    {
        id: 'app_2',
        name: 'Dr. Fatima Al-Rashid',
        avatar: 'FR',
        specialties: ['Fiqh', 'Islamic Jurisprudence'],
        credentials: ['PhD in Islamic Studies', 'Published Author'],
        applicationDate: '2026-02-27T14:15:00Z',
        bio: 'Academic researcher and author specializing in comparative fiqh. Published multiple papers on contemporary issues in Islamic jurisprudence. Currently serving as an assistant professor at an Islamic university.',
    },
    {
        id: 'app_3',
        name: 'Ustadh Yusuf Ibrahim',
        avatar: 'YI',
        specialties: ['Hadith', 'Sunnah Studies'],
        credentials: ['Graduated from Madinah University', 'Memorized 6 major hadith collections'],
        applicationDate: '2026-02-25T09:45:00Z',
        bio: 'Graduate of the Islamic University of Madinah with specialization in Hadith sciences. Has memorized and studied the six major hadith collections with chains of narration to their compilers.',
    },
    {
        id: 'app_4',
        name: 'Shaykha Maryam Noor',
        avatar: 'MN',
        specialties: ['Arabic Language', 'Tafsir'],
        credentials: ['MA in Arabic Linguistics', 'Certified Mufassirah'],
        applicationDate: '2026-02-22T16:20:00Z',
        bio: 'Passionate Arabic linguist and Quran exegete. Holds a master\'s degree in Arabic linguistics and is certified in Quranic tafsir. Specializes in making classical Arabic accessible to modern students.',
    },
    {
        id: 'app_5',
        name: 'Imam Khalid Mahmoud',
        avatar: 'KM',
        specialties: ['Aqeedah', 'Islamic Theology'],
        credentials: ['10+ years as Imam', 'Graduate of Al-Azhar'],
        applicationDate: '2026-02-20T11:00:00Z',
        bio: 'Serving imam with a decade of community leadership experience. Al-Azhar graduate specializing in Islamic creed and theology. Known for presenting complex theological concepts in an accessible manner.',
    },
    {
        id: 'app_6',
        name: 'Dr. Omar Suleiman',
        avatar: 'OS',
        specialties: ['Seerah', 'Islamic History'],
        credentials: ['PhD in Islamic Civilization', 'Popular Lecturer'],
        applicationDate: '2026-02-18T08:30:00Z',
        bio: 'Renowned scholar of Islamic history and the Prophetic biography. Has delivered hundreds of lectures worldwide and authored several books on the life of Prophet Muhammad ﷺ and the early Islamic period.',
    },
];
