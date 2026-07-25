/**
 * Project-wide constants.
 */

/** Canonical site origin for metadata (metadataBase, canonical, JSON-LD). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://traceofthetide.org";

export const CONTRIBUTION_FORM_INPUT_BASE =
  "w-full select-none rounded-lg border bg-[var(--tott-well-bg)] px-3 py-2 text-sm text-[color:var(--tott-panel-text)] placeholder:text-gray-500 transition-colors hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent focus:ring-[#C9A96E] focus:border-[#C9A96E] sm:px-4 sm:py-3 sm:text-base";

export const COUNTRY_CODES = [
  { code: "+20", country: "Egypt" },
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "UK" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+91", country: "India" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+972", country: "Israel" },
  { code: "+962", country: "Jordan" },
  { code: "+961", country: "Lebanon" },
  { code: "+213", country: "Algeria" },
  { code: "+212", country: "Morocco" },
  { code: "+216", country: "Tunisia" },
  { code: "+90", country: "Turkey" },
  { code: "+27", country: "South Africa" },
  { code: "+234", country: "Nigeria" },
  { code: "+254", country: "Kenya" },
  { code: "+61", country: "Australia" },
  { code: "+55", country: "Brazil" },
  { code: "+52", country: "Mexico" },
  { code: "+7", country: "Russia" },
  { code: "+82", country: "South Korea" },
  { code: "+65", country: "Singapore" },
  { code: "+31", country: "Netherlands" },
  { code: "+41", country: "Switzerland" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+45", country: "Denmark" },
  { code: "+358", country: "Finland" },
  { code: "+48", country: "Poland" },
  { code: "+351", country: "Portugal" },
  { code: "+353", country: "Ireland" },
  { code: "+43", country: "Austria" },
  { code: "+30", country: "Greece" },
  { code: "+968", country: "Oman" },
  { code: "+974", country: "Qatar" },
  { code: "+965", country: "Kuwait" },
  { code: "+973", country: "Bahrain" },
  { code: "+964", country: "Iraq" },
  { code: "+963", country: "Syria" },
  { code: "+970", country: "Palestine" },
  { code: "+218", country: "Libya" },
  { code: "+249", country: "Sudan" },
  { code: "+60", country: "Malaysia" },
  { code: "+62", country: "Indonesia" },
  { code: "+92", country: "Pakistan" },
  { code: "+98", country: "Iran" },
] as const;

export const TRIP_HERO = {
  image: "/images/trip.png",
  title: "Insert card title here",
  price: "$850 USD",
  difficulty: "Moderate",
  from: "Interlaken, Swiss",
  to: "Zermatt, Swiss",
} as const;

export const TRIP_DETAILS = [
  { label: "Date", value: "August 15, 2025" },
  { label: "Duration", value: "4 nights, 3 days" },
  { label: "Group size", value: "6-12 people" },
  { label: "Languages", value: "English, Arabic" },
  { label: "Location", value: "USA" },
] as const;

export const TRIP_HIGHLIGHTS = [
  "Lorem ipsum dolor sit amet elit.",
  "Quisque tempor felis a pretium.",
  "Maecenas vel nulla nec leo tincidunt.",
  "Sed ac sapien tristique urna porta leo.",
  "Fusce suscipit felis ut sem bibendum.",
  "In tempor massa eget lobortis",
] as const;

export const TRIP_ABOUT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur sodales sagittis tempor. Donec elementum ornare justo, nec feugiat lorem sodales eu. In tincidunt, velit eget faucibus auctor, odio metus porttitor ipsum, in lobortis mi felis fermentum nulla. Donec lacults tincidunt lacinia. Vestibulum vel volutpat ante. Mauris rutrum enim vitae mi posuere, sit amet pulvinar orci tincidunt. Vivamus imperdiet tempus faucibus. Sed vitae leo eget lectus venenatis pharetra. Phasellus dictum eget turpis in molestie. Nullam facilisis ultrices arcu vitae viverra. Praesent cursus felis at nisl fringilla, in semper nisl lacinia. Maecenas ut purus et ex scelerisque tempor a non ante.";

export const TRIP_TIMELINE = [
  {
    title: "Journey schedule title",
    date: "Month 00, 1234",
    time: "00:00 PM",
    description:
      "Lorem ipsum dolor sit amet adipiscing elit. Curabitur sodales sagittis tempor onec ornare justo nec feugiat lorem sodales eut tincidunt velit auctor odio metus.",
    location: "Lat: 46.6863, Lng: 7.8632",
  },
  {
    title: "Journey schedule title",
    date: "Month 00, 1234",
    time: "00:00 PM",
    description:
      "Lorem ipsum dolor sit amet adipiscing elit. Curabitur sodales sagittis tempor onec ornare justo nec feugiat lorem sodales eut tincidunt velit auctor odio metus.",
    location: "Lat: 46.6863, Lng: 7.8632",
  },
  {
    title: "Journey schedule title",
    date: "Month 00, 1234",
    time: "00:00 PM",
    description:
      "Lorem ipsum dolor sit amet adipiscing elit. Curabitur sodales sagittis tempor onec ornare justo nec feugiat lorem sodales eut tincidunt velit auctor odio metus.",
    location: "Lat: 46.6863, Lng: 7.8632",
  },
  {
    title: "Journey schedule title",
    date: "Month 00, 1234",
    time: "00:00 PM",
    description:
      "Lorem ipsum dolor sit amet adipiscing elit. Curabitur sodales sagittis tempor onec ornare justo nec feugiat lorem sodales eut tincidunt velit auctor odio metus.",
    location: "Lat: 46.6863, Lng: 7.8632",
  },
] as const;

export const CONTENT_MEDIA_AUDIO = {
  type: "audio" as const,
  src: "/media/audio.mp3",
  thumbnail: "/images/image.png",
  title: "The Future of Sustainable Technology",
  duration: "24:00",
};

export const CONTENT_BREADCRUMBS = [
  { label: "Breadcrumb label", href: "#" },
  { label: "Breadcrumb label", href: "#" },
  { label: "Breadcrumb label" },
] as const;

export const CONTENT_AUTHOR = {
  name: "Fadi Barghouti",
  initials: "FB",
  link: "about.me/fadi-b",
  color: "#E8D5A8",
} as const;

export const CONTENT_CONTRIBUTORS = [
  { name: "Ahmed Sameer", role: "Main Contributor", initials: "A", color: "#E8D5A8" },
  { name: "Salma Fathi", role: "Contributor", initials: "S", color: "#E8D5A8" },
  { name: "Mustafa khaled", role: "Contributor", initials: "M", color: "#E8D5A8" },
  { name: "Saleh Muhammed", role: "Contributor", initials: "S", color: "#E8D5A8" },
] as const;

export const CONTENT_COLLECTION = {
  articleCount: 10,
  duration: "2.5 hours",
  items: [
    { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", description: "Lorem ipsum dolor sit amet adipiscing elit suscipit aliqu..." },
    { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", description: "Lorem ipsum dolor sit amet adipiscing elit suscipit aliqu..." },
    { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", description: "Lorem ipsum dolor sit amet adipiscing elit suscipit aliqu..." },
    { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", description: "Lorem ipsum dolor sit amet adipiscing elit suscipit aliqu..." },
    { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", description: "Lorem ipsum dolor sit amet adipiscing elit suscipit aliqu..." },
    { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", description: "Lorem ipsum dolor sit amet adipiscing elit suscipit aliqu..." },
    { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", description: "Lorem ipsum dolor sit amet adipiscing elit suscipit aliqu..." },
    { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", description: "Lorem ipsum dolor sit amet adipiscing elit suscipit aliqu..." },
    { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", description: "Lorem ipsum dolor sit amet adipiscing elit suscipit aliqu..." },
    { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", description: "Lorem ipsum dolor sit amet adipiscing elit suscipit aliqu..." },
  ],
} as const;

export const CONTENT_RELATED = [
  { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", edition: "Edition" },
  { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", edition: "Edition" },
  { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", edition: "Edition" },
  { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", edition: "Edition" },
  { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", edition: "Edition" },
  { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", edition: "Edition" },
  { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", edition: "Edition" },
  { image: "/images/image.png", title: "Insert card title here", author: "Author", date: "Date", edition: "Edition" },
] as const;

export const THREADS_BREADCRUMBS = [
  { label: "Breadcrumb label", href: "#" },
  { label: "Breadcrumb label", href: "#" },
  { label: "Threads" },
] as const;

export const THREADS_MAIN = {
  title: "The History of the State of Palestine: A Timeline of Key Events",
  publishedDate: "June 27, 2025",
  readingTime: "2.4 hours read",
} as const;

export const THREADS_ENTRIES = [
  {
    image: "/images/image.png",
    title: "Daily Life in Jerusalem: Stories from Old City",
    edition: "Edition",
    category: "Category name",
    publishedDate: "June 27, 2025",
    readingTime: "8 min read",
    sections: [
      {
        paragraphs: [
          "In an era where climate change and technological advancement intersect, sustainable technology emerges as our beacon of hope. This comprehensive exploration delves into the revolutionary innovations that are not only transforming industries but also paving the way for a more environmentally conscious future.",
        ],
        quote: "The Dawn of a Sustainable Revolution",
      },
      {
        paragraphs: [
          "The 21st century has witnessed an unprecedented convergence of technological innovation and environmental consciousness. As we stand at the crossroads of climate crisis and digital transformation, sustainable technology has emerged as the defining paradigm of our time.",
        ],
      },
    ],
  },
  {
    image: "/images/image.png",
    title: "Voices from Gaza: Life Under Blockade",
    edition: "Edition",
    category: "Category name",
    publishedDate: "June 27, 2005",
    readingTime: "8 min read",
    sections: [
      {
        paragraphs: [
          "The concept of sustainable technology encompasses a broad spectrum of innovations designed to meet human needs while minimizing environmental impact. From artificial intelligence optimizing energy grids to biotechnology creating biodegradable materials.",
        ],
        quote: "The Dawn of a Sustainable Revolution",
      },
      {
        heading: "Energy Storage: Solving the Intermittency Challenge",
        paragraphs: [
          "One of the most significant challenges facing renewable energy has been intermittency. However, revolutionary advances in energy storage technology are rapidly solving this problem. Lithium-ion battery costs have plummeted by 89% since 2010.",
        ],
      },
    ],
  },
  {
    image: "/images/image.png",
    title: "From Mandate to Statehood: 1948 and Beyond",
    edition: "Edition",
    category: "Category name",
    publishedDate: "June 27, 2025",
    readingTime: "6 min read",
    sections: [
      {
        paragraphs: [
          "The declaration of the State of Israel in 1948 marked a turning point. This entry traces the immediate aftermath, refugee flows, and the consolidation of borders in the following decades.",
        ],
      },
    ],
  },
  {
    image: "/images/image.png",
    title: "Oslo and the Peace Process",
    edition: "Edition",
    category: "Category name",
    publishedDate: "June 27, 2025",
    readingTime: "7 min read",
    sections: [
      {
        paragraphs: [
          "The Oslo Accords of the 1990s opened a new chapter in Israeli–Palestinian relations. Here we look at the hopes, implementation challenges, and lasting impact of those agreements.",
        ],
        quote: "A handshake on the White House lawn.",
      },
    ],
  },
] as const;
