/**
 * Dignitaries and keynote speakers. Moved here from AboutSection so the home
 * Tech Conclave scene and the About page share one source.
 *
 * NOTE: `previousGuests` are guests of PAST editions. The TECHNEX 26-27
 * Tech Conclave line-up is not in the repo yet.
 * TODO: confirm value — add the 26-27 conclave speakers when announced.
 */
export interface Dignitary {
  name: string;
  title: string;
  role: string;
  image: string;
  quote: string;
  /** Longer bio for hover panels. TODO: confirm value — no bios in the repo yet. */
  bio?: string | null;
}

export const chiefGuest: Dignitary = {
  name: "Dr. Shankar S Mantha",
  title: "Chancellor of Ramdeobaba University, Nagpur & Former Chairman, AICTE",
  role: "Honorary Chief Guest",
  image: "/SS-Mantha.webp",
  quote:
    "Technological symposiums like TECHNEX are the crucibles where raw talent transforms into national innovation and leadership.",
};

export const previousGuests: Dignitary[] = [
  {
    name: "Shri. Nitin Gadkari",
    title: "Minister of Road Transport and Highways of India",
    role: "Distinguished Chief Guest",
    image: "/nitin-gadkari.webp",
    quote: "Very good institution, giving good education and character to the students.",
  },
  {
    name: "Dr. Kavi Arya",
    title: "Founder, E-Yantra & Professor, IIT Bombay",
    role: "Keynote Speaker",
    image: "/kavi-arya.webp",
    quote: "Pallotti College's E-Yantra robotics lab ranks among the top 13 laboratories in India.",
  },
  {
    name: "Dr. Vishnu Vardhan",
    title: "Founder & CEO, Vizzy Multiomics, Bengaluru",
    role: "Guest of Honour",
    image: "/Dr-Vishnu-Vardhan.webp",
    quote: "I am very impressed by the research laboratories and the progressive vision of the institution.",
  },
  {
    name: "Dr. Ritu Jain Gaurav",
    title: "CTO, U2U Systems, Singapore",
    role: "Global Tech Luminary",
    image: "/riitu_jain.webp",
    quote: "I admire the exceptional discipline of St. Vincent Pallotti College; it is a true honour to be here.",
  },
  {
    name: "Dr. Pratap Khanwilkar",
    title: "CEO, Ignition Key, USA",
    role: "International Keynote",
    image: "/Dr-Pratap-Khanwilkar.webp",
    quote:
      "Dream big, execute, make real things and help people. We are all here to make each other healthier and stronger.",
  },
  {
    name: "Mr. Shrikant Sarda",
    title: "Managing Director, Accenture Technology, Pune",
    role: "Industry Leader",
    image: "/Mr-Shrikant-Sarda.webp",
    quote:
      "It is my honour to be standing here. I am impressed by the students, their academic rigour, and institution discipline.",
  },
  {
    name: "Dr. Ravinder Singhal",
    title: "Additional Director General of Police (ADGP)",
    role: "Special Guest",
    image: "/Dr-Ravinder-Singhal.webp",
    quote: "Technology driven by youth is the backbone of modern progress and security.",
  },
];

export const principal: Dignitary = {
  name: "Dr. Vijay Wadhai",
  title: "Principal, SVPCET",
  role: "Institutional Leadership",
  image: "/Principal.webp",
  quote:
    "In today's rapidly evolving technological era, platforms like TECHNEX play a crucial role in nurturing innovation, creativity, and problem-solving abilities among students.",
};

export const director: Dignitary = {
  name: "Dr. Fr. Paul Chandrankunnel",
  title: "Director, SVPCET",
  role: "Institutional Patron",
  image: "/director_paul_chandrankunnel.webp",
  quote:
    "Technex, the annual technical festival of St. Vincent Pallotti College of Engineering and Technology, has emerged as a premier national platform where aspiring engineers rub shoulders with each other to claim the coveted prizes.",
};
