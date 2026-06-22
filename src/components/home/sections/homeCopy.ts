/**
 * Default homepage section copy, bilingual (EN + AR; FR/ES fall back to
 * EN). Used when a CMS section has no locale copy yet — so the page is
 * never blank, and the heritage framing reads correctly in Arabic RTL.
 *
 * Admins override any of these via the home CMS editor; these are the
 * floor, not the ceiling.
 */
export type HomeCopyBundle = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  spotlight: { eyebrow: string; read: string };
  oral: { heading: string; subheading: string };
  issues: {
    heading: string;
    subheading: string;
    crowdfunded: string;
    funded: string;
  };
  collections: { heading: string; subheading: string; pieces: string };
  people: { heading: string; subheading: string };
  trips: { heading: string; subheading: string };
  bookClub: { heading: string; subheading: string };
  contribute: { heading: string; body: string; cta: string };
  viewAll: string;
};

const EN: HomeCopyBundle = {
  hero: {
    eyebrow: "A living Palestinian archive",
    title: "Stories that keep a homeland present.",
    subtitle:
      "Oral histories, testimonies, people and places — gathered, told, and preserved so they are not lost.",
    primaryCta: "Explore the archive",
    secondaryCta: "Read the spotlight",
  },
  spotlight: { eyebrow: "Spotlight", read: "Read the story" },
  oral: {
    heading: "Oral histories & testimonies",
    subheading: "Voices of memory — and open calls to add your own.",
  },
  issues: {
    heading: "Magazine issues",
    subheading: "Editorial editions and community-funded issues.",
    crowdfunded: "Crowdfunded",
    funded: "funded",
  },
  collections: {
    heading: "Curated collections",
    subheading: "Series that follow a place, a people, a thread.",
    pieces: "pieces",
  },
  people: {
    heading: "People of the archive",
    subheading: "Lives that shaped the story.",
  },
  trips: {
    heading: "Heritage trips",
    subheading: "Walk the places the stories come from.",
  },
  bookClub: {
    heading: "Book club",
    subheading: "What the community is reading now.",
  },
  contribute: {
    heading: "Add your story to the archive",
    body: "Every testimony preserved is a memory kept. Answer an open call and contribute.",
    cta: "Contribute",
  },
  viewAll: "View all",
};

const AR: HomeCopyBundle = {
  hero: {
    eyebrow: "أرشيف فلسطيني حيّ",
    title: "حكايات تُبقي الوطن حاضرًا.",
    subtitle:
      "تاريخ شفوي وشهادات وأناس وأماكن — تُجمع وتُروى وتُحفظ كي لا تضيع.",
    primaryCta: "استكشف الأرشيف",
    secondaryCta: "اقرأ المختارة",
  },
  spotlight: { eyebrow: "في الواجهة", read: "اقرأ القصة" },
  oral: {
    heading: "التاريخ الشفوي والشهادات",
    subheading: "أصوات الذاكرة — ودعوات مفتوحة لتضيف صوتك.",
  },
  issues: {
    heading: "أعداد المجلة",
    subheading: "إصدارات تحريرية وأعداد بتمويل المجتمع.",
    crowdfunded: "تمويل جماعي",
    funded: "مموّل",
  },
  collections: {
    heading: "مجموعات مختارة",
    subheading: "سلاسل تتبع مكانًا، وناسًا، وخيطًا من الذاكرة.",
    pieces: "مادة",
  },
  people: {
    heading: "أهل الأرشيف",
    subheading: "حيوات صاغت الحكاية.",
  },
  trips: {
    heading: "رحلات تراثية",
    subheading: "امشِ في الأماكن التي وُلدت منها الحكايات.",
  },
  bookClub: {
    heading: "نادي الكتاب",
    subheading: "ما يقرأه المجتمع الآن.",
  },
  contribute: {
    heading: "أضف حكايتك إلى الأرشيف",
    body: "كل شهادة محفوظة ذاكرة باقية. لبِّ دعوة مفتوحة وشارك.",
    cta: "شارك",
  },
  viewAll: "عرض الكل",
};

export function homeCopy(locale: string): HomeCopyBundle {
  return locale === "ar" ? AR : EN;
}
