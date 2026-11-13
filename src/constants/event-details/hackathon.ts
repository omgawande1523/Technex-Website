
import type { EventItem } from "@/types/event";

export const hackathon: EventItem = {
  slug: "hackathon",
  image: "/hackathon.webp",
  number: "02",
  name: "Hackathon-2026",
  category: "Software",
  tagline: "Build · Innovate · Solve · Create",
  quote: "Ideas build realities",

  about:
    "Hackathon-2026 is a national-level 24-hour hackathon organised by the CSI Student Chapter under TECHNEX-26 at St. Vincent Pallotti College of Engineering and Technology (SVPCET), Nagpur, on 19–20 December 2026. It is open to undergraduate students from across India, who work in teams of 3–5 members on real-world problem statements. The event features an online PPT-based ideation round followed by a 24-hour on-campus hackathon. The top 50 teams from Round 1 advance to develop solutions for new industry-based problem statements.",

  domains: [
    "AI & Machine Learning",
    "Sustainability",
    "HealthTech",
    "EdTech",
    "Cyber Security",
    "Open Innovation",
  ],

  source: {
    title: "Star Trek",
    text: "The ship's computer",
  },

  innovation: {
    title: "Modern AI Systems",
    text: "AI-powered software, machine learning, intelligent automation, and innovative solutions addressing real-world challenges.",
  },

  stats: [
    {
      icon: "calendar",
      label: "Date",
      value: "19–20 Dec 2026",
      sub: "24-hour on-campus hackathon",
    },
    {
      icon: "pin",
      label: "Venue",
      value: "SVPCET, Nagpur",
      sub: "St. Vincent Pallotti College of Engineering and Technology",
    },
    {
      icon: "team",
      label: "Team Size",
      value: "3–5 Members",
      sub: "Undergraduate students",
    },
    {
      icon: "trophy",
      label: "Prize Pool",
      value: "₹1,00,000",
    },
  ],

  rounds: [
    {
      title: "Round 1 — Online Ideation / PPT Submission",
      text: "Teams participate in an online ideation round by submitting a PowerPoint presentation describing their proposed solution. Submissions are evaluated according to the published rubric, and the top 50 teams qualify for the on-campus hackathon.",
    },
    {
      title: "Round 2 — 24-Hour On-Campus Hackathon",
      text: "The top 50 shortlisted teams participate in a 24-hour hackathon at SVPCET, Nagpur, on 19–20 December 2026. Teams receive a new industry-based problem statement and must develop a working prototype during the event. Final submissions include the working prototype, GitHub source code, and a final presentation.",
    },
    {
      title: "Final Evaluation & Presentation",
      text: "Teams demonstrate their working prototypes and present their solutions to the judging panel. Evaluation follows the published judging criteria, and winners are selected based on their performance.",
    },
  ],

  rules: [
    {
      title: "Code Development",
      text: "All Round 2 code must be developed during the 24-hour on-campus hackathon.",
    },
    {
      title: "Originality & Attribution",
      text: "Projects must be original. Teams must disclose significant third-party or open-source components used in their solutions.",
    },
    {
      title: "Plagiarism & Fraudulent Submissions",
      text: "Plagiarism, fraudulent submissions, or misrepresentation of work will lead to disqualification.",
    },
    {
      title: "Submission Deadlines",
      text: "Teams must submit their work within the announced deadlines. Late submissions may be penalized or rejected.",
    },
    {
      title: "Team Requirements",
      text: "Each team must consist of 3 to 5 members. The event is open to undergraduate students from across India.",
    },
    {
      title: "Venue & Safety Guidelines",
      text: "Participants must follow all venue instructions, safety requirements, and directions issued by the event organizers.",
    },
    {
      title: "Final Submission Requirements",
      text: "Round 1 requires a PPT submission. Round 2 requires a working prototype, GitHub source code, and a final presentation.",
    },
  ],

  faqs: [
    {
      q: "What is the team size?",
      a: "Each team must consist of 3 to 5 members.",
    },
    {
      q: "Are there registration fees?",
      a: "Yes. The registration fee is ₹600 per team.",
    },
    {
      q: "What are the submission rules?",
      a: "Round 1 requires a PowerPoint presentation (PPT). Round 2 requires a working prototype, GitHub source code, and a final presentation.",
    },
    {
      q: "What tools are allowed?",
      a: "The list of permitted tools is yet to be announced by the organizers.",
    },
    {
      q: "What are the selection criteria?",
      a: "The top 50 teams qualify from Round 1. Both rounds are evaluated using the published judging rubrics.",
    },
    {
      q: "What is the final round format?",
      a: "A 24-hour on-campus hackathon at SVPCET, Nagpur, on 19–20 December 2026, where shortlisted teams develop and present solutions to new industry-based problem statements.",
    },
    {
      q: "Who can participate?",
      a: "Undergraduate students from across India can participate in teams of 3 to 5 members.",
    },
    {
      q: "Where will the hackathon take place?",
      a: "Round 1 is conducted online. Round 2 takes place at St. Vincent Pallotti College of Engineering and Technology (SVPCET), Nagpur.",
    },
    {
      q: "How many teams qualify for Round 2?",
      a: "The top 50 teams from the online PPT-based ideation round qualify for the 24-hour on-campus hackathon.",
    },
  ],

  contacts: [
    {
      name: "Arpit Tiwari",
      phone: "+91 8390218889",
      email: "tiwariarpit672@gmail.com",
    },
    {
      name: "Tanushri Kalaskar",
      phone: "+91 9764027188",
      email: "tanushrikalaskar08@gmail.com",
    },
  ],

  whoCanJoin:
    "Undergraduate students across India (BTech, BE, BCA, and BSc).",

  registerUrl: "/register/hackathon",
  rulebookUrl: "#",

  highlights: [
    {
      value: "24 hrs",
      label: "Non-stop building",
    },
    {
      value: "3–5",
      label: "Members per team",
    },
    {
      value: "₹1 Lakh",
      label: "Prize pool",
    },
  ],

  shape: "ship",
};