import type { EventItem } from "@/types/event";

export const hackathon: EventItem = {
  slug: "hackathon",
  image: "/hackathon.webp",
  number: "02",
  name: "Hackathon",
  category: "Software",
  tagline: "Build · Innovate · Solve · Create",
  quote: "Ideas build realities",
  about:
    "A 24-hour innovation challenge where ideas meet execution. Build real-world solutions, collaborate with brilliant minds and push your creativity, coding and problem-solving skills to the limit.",
  domains: ["AI", "Web", "IoT", "Sustainability", "Open theme"],
  source: { title: "Star Trek", text: "The ship's computer" },
  innovation: { title: "Modern AI systems", text: "Voice-driven, problem-solving software" },
  stats: [
    { icon: "calendar", label: "Date", value: "18 – 19 Dec", sub: "24 hours" },
    { icon: "pin", label: "Venue", value: "Main Auditorium", sub: "Block A" },
    { icon: "team", label: "Team size", value: "2 – 4 members" },
    { icon: "trophy", label: "Prize pool", value: "₹70,000+", sub: "Cash, certificates, goodies" },
  ],
  rounds: [
    { title: "Online ideation", text: "Submit your idea and problem statement." },
    { title: "Hackathon (24 hours)", text: "Build your solution on campus." },
    { title: "Evaluation", text: "Present to expert judges." },
    { title: "Finale", text: "Winners announced, top teams get prizes." },
  ],
  rules: [
    { title: "Guidelines", text: "Follow the code of conduct for the full 24 hours." },
    { title: "Eligibility", text: "Add who can participate." },
    { title: "Submission process", text: "Add how and where to submit." },
    { title: "Evaluation criteria", text: "Add the judging criteria." },
  ],
  faqs: [
    { q: "What are the eligibility criteria?", a: "Add eligibility details here." },
    { q: "Can we participate in a team?", a: "Yes. Teams of 2 to 4 members." },
    { q: "What kind of projects are allowed?", a: "AI, Web, IoT, Sustainability or any open idea that solves a real problem." },
    { q: "Will internet be provided?", a: "Add details here." },
    { q: "What is the evaluation criteria?", a: "Add criteria here." },
    { q: "Where and when is the event?", a: "18 – 19 Dec, Main Auditorium, Block A." },
  ],
  contacts: [
    { name: "Coordinator 1", phone: "+91 00000 00000" },
    { name: "Coordinator 2", phone: "+91 00000 00000" },
  ],
  registerUrl: "#",
  rulebookUrl: "#",
  shape: "ship",
};