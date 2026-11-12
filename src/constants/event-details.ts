import type { EventItem as BaseEventItem } from "@/types/event";

// Local extension: optional individual coordinator email addresses.
type EventItem = BaseEventItem & { contacts: Array<BaseEventItem["contacts"][number] & { email?: string }> };
import { hackathon } from "./event-details/hackathon";

const otherEvents: EventItem[] = [
  
{
  "slug": "hack-the-hardware",
  "number": "01",
  "name": "Hack The Hardware",
  "category": "Hardware",
  "tagline": "National Hardware Innovation Challenge · TECHNEX'26",
  "quote": "Innovate. Prototype. Engineer.",

  "about": "Hack the Hardware is a national-level hardware innovation challenge conducted as part of TECHNEX 2026. It is designed for students and hardware builders to solve real-world engineering problems through embedded systems, robotics, automation, agriculture and environment, and safety and disaster-management solutions. The challenge follows a multi-round format, starting with an online PPT and simulation video submission. Shortlisted teams are invited to SVPCET, Nagpur, for an industry-oriented problem-solving and prototyping round, followed by a final technical defense before judges.",

  "domains": [
    "Hardware Innovation",
    "Embedded Systems",
    "Robotics",
    "Industrial Automation",
    "Agriculture & Environment",
    "Safety & Disaster Management",
    "Prototyping"
  ],

  "source": {
    "title": "Iron Man — Marvel Comics",
    "text": "Tony Stark's powered armour represents the integration of hardware engineering, electronics, robotics and intelligent systems."
  },

  "innovation": {
    "title": "Real-World Hardware Innovation",
    "text": "Embedded systems, robotics, industrial automation, microcontrollers, IoT, sensor-based solutions and functional engineering prototypes."
  },

  "stats": [
    {
      "icon": "calendar",
      "label": "Event Format",
      "value": "Hybrid",
      "sub": "Round 1: Online | Round 2: On Campus"
    },
    {
      "icon": "pin",
      "label": "Venue",
      "value": "SVPCET, Nagpur",
      "sub": "St. Vincent Pallotti College of Engineering & Technology"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "2–4 Members",
      "sub": "Team-based hardware challenge"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "TBA"
    }
  ],

  "rounds": [
    {
      "title": "Round 1 — Online Screening",
      "text": "Teams must submit a PPT or PDF presentation along with a simulation or demonstration video explaining their proposed hardware solution. Submissions should communicate the problem statement, proposed approach, technical design, innovation and expected real-world impact. Teams will be shortlisted for the next round based on evaluation."
    },
    {
      "title": "Round 2 — Campus Problem-Solving & Prototyping",
      "text": "Shortlisted teams will receive industry-oriented problem statements approximately five days before the on-campus round. Teams must ideate, design, prototype and develop their hardware solutions during the challenge at St. Vincent Pallotti College of Engineering & Technology, Nagpur."
    }
  ],

  "rules": [
    {
      "title": "Originality of Work",
      "text": "All solutions, code, designs, prototypes and submissions must be original or properly attributed. Copied or plagiarized work may be rejected."
    },
    {
      "title": "Deadlines and Event Instructions",
      "text": "Participants must follow all announced deadlines, venue instructions, event procedures and judging protocols."
    },
    {
      "title": "Fair Participation",
      "text": "Teams must accurately represent their work and technical contributions. Fraudulent submissions or misrepresentation of work are prohibited."
    },
    {
      "title": "Disqualification",
      "text": "Teams may be disqualified for plagiarism, fraudulent submissions, violation of event rules, misrepresentation of work or failure to meet mandatory requirements."
    }
  ],

  "faqs": [
    {
      "q": "What is the team size?",
      "a": "Each team must have a minimum of 2 and a maximum of 4 members."
    },
    {
      "q": "Are there registration fees?",
      "a": "Round 1 is planned as free registration. Any fees for later rounds will be confirmed by the organizers before publication."
    },
    {
      "q": "What are the submission rules?",
      "a": "Round 1 requires a PPT or PDF presentation along with a simulation or demonstration video explaining the proposed hardware solution. Additional requirements will be communicated to shortlisted teams."
    },
    {
      "q": "What tools are allowed?",
      "a": "Relevant hardware, microcontrollers, embedded platforms, sensors, actuators, robotics platforms, IoT modules and simulation tools are allowed unless restricted by a specific problem statement."
    },
    {
      "q": "What are the selection criteria?",
      "a": "Teams will be evaluated based on innovation, technical implementation, engineering quality, problem-solving approach, feasibility, scalability, real-world potential and completeness of the solution."
    },
    {
      "q": "What is the final round format?",
      "a": "Selected teams will build or refine their hardware solutions and present a complete prototype or demonstration with a technical defense before the final judging panel on campus."
    },
    {
      "q": "Where will the event take place?",
      "a": "The event follows a hybrid format. Round 1 is conducted online, while the on-campus challenge takes place at St. Vincent Pallotti College of Engineering & Technology (SVPCET), Nagpur."
    },
  ],

  "contacts": [
    {
      "name": "Arpit Kharwade",
     
      "phone": "9156867498",
      "email": "",
     
    },
    {
      "name": "Shravani Bobde",
      
      "phone": "8530080205",
      "email": ""},
    {
      "name": "Vedant Bhaganagare",
      
      "phone": "8999078014",
      "email": ""}
  ],

  "registerUrl": "",
  "rulebookUrl": "",

  "shape": "ship",
  "image": "/events/Hack the hardware.jpeg",

  "highlights": [
    {
      "value": "2–4",
      "label": "Team Members"
    },
    {
      "value": "Hybrid",
      "label": "Event Format"
    },
    {
      "value": "2",
      "label": "Main Rounds"
    }
  ],

  "perks": [
    "National-level hardware innovation challenge",
    "Real-world industry-oriented problem statements",
    "Hands-on hardware prototyping experience",
    "Opportunity to demonstrate engineering solutions",
    "Technical evaluation by a judging panel",
    "Exposure to embedded systems, robotics and automation",
    "Collaborative team-based engineering experience"
  ],

  "whoCanJoin": "Students, hardware builders and engineering enthusiasts interested in embedded systems, robotics, automation, IoT, agriculture, environmental solutions and safety technologies. Participants must register in teams of 2 to 4 members."
},

  
{
  "slug": "envision",
  "number": "03",
  "name": "Envision",
  "category": "Medtech",
  "tagline": "AI & Data Science Challenge · TECHNEX'26",
  "quote": "Explore. Analyze. Innovate.",

  "about": "Envision - AI & Data Science Challenge is a technical event under TECHNEX'26, conducted in a hybrid mode. The event welcomes participants to engage in challenges involving Data Scraping, Exploratory Data Analysis (EDA), Data Visualization, Deep Learning, and AI Solutions. The hackathon follows a four-round structure, taking participants from data exploration to developing AI-powered solutions for defined real-world problems.",

  "domains": [
    "Data Scraping",
    "Exploratory Data Analysis (EDA)",
    "Data Visualization",
    "Deep Learning",
    "AI Solutions",
    "Datathon"
  ],

  "source": {
    "title": "Fantastic Voyage — Isaac Asimov (1966)",
    "text": "A miniature submarine travels inside the human body."
  },

  "innovation": {
    "title": "AI & Data Science Innovation",
    "text": "Data scraping, exploratory data analysis, data visualization, deep learning models, and AI-powered solutions for real-world problems."
  },

  "stats": [
    {
      "icon": "calendar",
      "label": "Event Format",
      "value": "Hybrid",
      "sub": "4-round AI & Data Science Challenge"
    },
    {
      "icon": "pin",
      "label": "Venue",
      "value": "SVPCET, Nagpur",
      "sub": "St. Vincent Pallotti College of Engineering and Technology"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "2–4 Members",
      "sub": "Duo, Trio or Squad"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "₹50,000"
    }
  ],

  "rounds": [
    {
      "title": "Round 1 — Data Scraping and EDA",
      "text": "Participants collect or use an approved dataset, perform data cleaning and preprocessing, and conduct Exploratory Data Analysis (EDA) to identify meaningful patterns, trends, and insights. This round is conducted in hybrid mode."
    },
    {
      "title": "Round 2 — Data Visualization",
      "text": "Participants create clear, informative, and meaningful data visualizations based on their analysis. Teams must submit a GitHub repository containing their work along with a research report. This round is conducted in hybrid mode."
    },
    {
      "title": "Round 3 — Deep Learning Models and AI Solutions",
      "text": "Teams develop a deep learning model and an AI-powered solution addressing a defined real-world problem. Required submissions include a Jupyter Notebook (.ipynb) and a PowerPoint presentation (PPT). This round is conducted in hybrid mode."
    },
    {
      "title": "Final Round — Jury Evaluation and Live Demonstration",
      "text": "Finalist teams present their AI-powered solutions through live demonstrations before the judging panel. Participants explain their technical approach, model performance, innovation, and real-world applicability, followed by a jury question-and-answer session. This round is conducted in hybrid mode."
    }
  ],

  "rules": [
    {
      "title": "Dataset and Model Restrictions",
      "text": "The use of Kaggle, pre-trained data, and pre-trained models is strictly prohibited."
    },
    {
      "title": "Mandatory Screen Sharing",
      "text": "Hybrid participants must keep their screens shared throughout the event. A screen-sharing interruption exceeding 10 minutes without prior notice will result in disqualification."
    },
    {
      "title": "Discord Connectivity",
      "text": "Participants must remain connected to their assigned Discord voice channel throughout the event."
    },
    {
      "title": "Original Work and External Assistance",
      "text": "All work must be completed solely by registered team members. External assistance and remote access tools are strictly prohibited."
    },
    {
      "title": "Camera Verification",
      "text": "Organizers may conduct random camera checks. Participants must turn on their camera within 2 minutes when requested."
    },
    {
      "title": "Device Restrictions",
      "text": "Mobile screen sharing and mobile-based execution tools are not permitted during active competition rounds."
    },
    {
      "title": "Submission Requirements",
      "text": "Round 2 requires a GitHub repository and research report. Round 3 requires a Jupyter Notebook (.ipynb) and a PowerPoint presentation (PPT)."
    },
    {
      "title": "Evaluation Criteria",
      "text": "Winners will be selected based on technical quality, innovation, real-world applicability, and presentation."
    }
  ],

  "faqs": [
    {
      "q": "What is the team size?",
      "a": "Each team must consist of 2 to 4 members. Participants can register as a Duo (2), Trio (3), or Squad (4)."
    },
    {
      "q": "Are there registration fees?",
      "a": "Yes. The registration fee is ₹350 for Duo (2 members), ₹400 for Trio (3 members), and ₹450 for Squad (4 members)."
    },
    {
      "q": "What are the submission rules?",
      "a": "Round 2 requires a GitHub repository and research report. Round 3 requires a Jupyter Notebook (.ipynb) and PowerPoint presentation (PPT)."
    },
    {
      "q": "What tools are allowed?",
      "a": "Data scraping tools, data analysis tools, data visualization tools, deep learning technologies, Tableau, and Power BI are allowed, subject to the event restrictions."
    },
    {
      "q": "What are the selection criteria?",
      "a": "Winners will be selected based on technical quality, innovation, real-world applicability, and presentation."
    },
    {
      "q": "What is the final round format?",
      "a": "The final round consists of Jury Evaluation and Live Demonstration, where finalist teams present their AI-powered solutions and answer questions from the judges."
    },
    {
      "q": "Is the event online or offline?",
      "a": "Envision is conducted in hybrid mode, allowing participation according to the event's hybrid arrangements."
    },
    {
      "q": "What is the total prize pool?",
      "a": "The total prize pool for Envision is ₹50,000."
    }
  ],

  "contacts": [
    {
      "name": "Abhinav Singh",
      
      "phone": "7887387652",
      "email": ""},
    {
      "name": "Yash Lute",
    
      "phone": "7387091508",
      "email": ""}
  ],

  "registerUrl": "",
  "rulebookUrl": "",

  "shape": "ship",
  "image": "/events/envision.webp",

  "highlights": [
    {
      "value": "₹50,000",
      "label": "Prize Pool"
    },
    {
      "value": "2–4",
      "label": "Team Members"
    },
    {
      "value": "4",
      "label": "Competition Rounds"
    }
  ],

  "perks": [
    "Compete for a ₹50,000 prize pool",
    "Experience a four-round AI & Data Science Challenge",
    "Work on real-world datasets and AI solutions",
    "Demonstrate data scraping and exploratory data analysis skills",
    "Develop data visualizations and deep learning models",
    "Present AI-powered solutions before a judging panel",
    "Gain practical experience in data science and AI development"
  ],

  "whoCanJoin": "Students, AI enthusiasts, data science learners, programmers, and technology enthusiasts interested in data scraping, exploratory data analysis, data visualization, deep learning, and AI-powered problem-solving. Teams must consist of 2 to 4 members."
},

  
{
  "slug": "vortex",
  "number": "04",
  "name": "Vortex",
  "category": "Esports Fiesta",
  "tagline": "Valorant Esports Tournament · TECHNEX'26",
  "quote": "Compete. Conquer. Dominate.",

  "about": "VORTEX'26 is a Valorant Esports Tournament organized under TECHNEX'26, providing a competitive platform for gaming enthusiasts and students to showcase their gaming skills, teamwork, strategy, and coordination. The event follows a 5v5 team format, where teams compete in a single-elimination knockout tournament.",

  "domains": [
    "Esports Gaming",
    "Team-Based Competition",
    "Strategy and Coordination",
    "Knockout Tournament",
    "Live Streaming"
  ],

  "source": {
    "title": "Ready Player One — Ernest Cline (2011)",
    "text": "The OASIS, an immersive shared virtual universe."
  },

  "innovation": {
    "title": "Competitive Esports",
    "text": "Valorant-based tactical gaming, strategic teamwork, competitive coordination and multiplayer esports."
  },

  "stats": [
    {
      "icon": "calendar",
      "label": "Grand Finale",
      "value": "20 Dec 2026",
      "sub": "Final match and prize distribution"
    },
    {
      "icon": "pin",
      "label": "Venue",
      "value": "St. Vincent Pallotti College of Engineering & Technology"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "5 Members",
      "sub": "5v5 Valorant format"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "₹70,000"
    }
  ],

  
"rounds": [
  {
    "title": "Round 1 — Knockout Stage",
    "text": "The tournament follows a single-elimination format. Losing teams are eliminated, while winners advance to the next round."
  },
  {
    "title": "Round 2 — Knockout Progression",
    "text": "Teams qualifying from Round 1 compete in the next knockout stage. Winners advance to the subsequent rounds."
  },
  {
    "title": "Semi-Finals",
    "text": "The remaining qualifying teams compete for a place in the grand finale. The winning teams advance to the championship match."
  },
  {
    "title": "Grand Finale",
    "text": "The final two teams compete in the championship match. The winning team is declared the tournament champion."
  }
],


  "rules": [
    {
      "title": "Registration and Player Details",
      "text": "Teams must submit accurate team names, captain details, player lists and contact information during registration. Incorrect or false player information may lead to disqualification."
    },
    {
      "title": "Check-In and Roster Verification",
      "text": "All teams must complete check-in and roster verification before their scheduled matches."
    },
    {
      "title": "Match Schedule and Communication",
      "text": "Participants must follow the official match schedule and tournament rules. Match schedules, lobby details, announcements and results will be communicated through Discord."
    },
    {
      "title": "Player Changes",
      "text": "Any changes to player details must be communicated to the organizers beforehand. Last-minute changes will not be permitted."
    },
    {
      "title": "Disqualification",
      "text": "Teams may be disqualified for failing to report for scheduled matches, violating tournament rules, or submitting incorrect or false player details. Disputes will be handled by event administrators."
    }
  ],

  "faqs": [
    {
      "q": "What is the team size?",
      "a": "Each team must have 5 players and compete in a 5v5 Valorant format."
    },
    {
      "q": "Are there registration fees?",
      "a": "Registration is proposed to remain open until 15 December 2026. The registration fee amount is yet to be announced."
    },
    {
      "q": "What are the submission rules?",
      "a": "Participants must submit their team name, captain details, player list and contact information. All teams must complete check-in and roster verification before matches."
    },
    {
      "q": "What tools are allowed?",
      "a": "Participants will compete using the Valorant gaming platform. Internet connectivity and required gaming equipment will be provided as per the event setup."
    },
    {
      "q": "What are the selection criteria?",
      "a": "A total of 56 teams are expected. Eight teams will qualify directly for Round 2 through seeding or draw, while the remaining teams compete in Round 1."
    },
    {
      "q": "What is the final round format?",
      "a": "The grand finale will be a 5v5 Valorant match between the two teams qualifying from the semi-finals. The winning team will be declared tournament champion. The final is scheduled for 20 December 2026, followed by prize distribution and awards."
    }
  ],

  "contacts": [
    {
      "name": "Alan Biju",
      
      "phone": "+919643728841",
      "email": ""},
    {
      "name": "Sneha Agrawal",
      "phone": "+918080550340",
      "email": ""}
  ],

  "registerUrl": "",
  "rulebookUrl": "",

  "shape": "ship",
  "image": "/events/vortex.jpeg",

  "highlights": [
    {
      "value": "₹70,000",
      "label": "Prize Pool"
    },
    {
      "value": "5v5",
      "label": "Team Format"
    },
    {
      "value": "56",
      "label": "Expected Teams"
    }
  ],

  "perks": [
    "Competitive Valorant esports experience",
    "Live streaming",
    "Team-based tactical competition",
    "Grand finale and award distribution"
  ],

  "whoCanJoin": "Gaming enthusiasts and students participating in teams of 5 players."
},
  
{
  "slug": "gamer-conquest",
  "number": "05",
  "name": "Gamers Conquest 3.0",
  "category": "Esports Fiesta",
  "tagline": "BGMI Battle Royale Tournament · TECHNEX'26",
  "quote": "Drop. Survive. Conquer.",

  "about": "Gamers Conquest 3.0 is the esports flagship of TECHNEX'26. The tournament features BGMI, a squad-based battle royale with qualifiers on Day 1 and Grand Finals on Day 2, where the top 16 squads compete across multiple maps for the Chicken Dinner. The event brings a live esports atmosphere to campus, complete with a big-screen broadcast, thematic decoration, and a planned interactive experience zone.",

  "domains": [
    "Esports/Gaming Tournament",
    "BGMI",
    "Battle Royale",
    "Live Broadcast",
    "College Gaming Community"
  ],

  "source": {
    "title": "Ready Player One — Ernest Cline (2011)",
    "text": "The OASIS, an immersive shared virtual universe."
  },

  "innovation": {
    "title": "Competitive Esports & Gaming",
    "text": "BGMI battle royale competition, squad-based strategy, competitive multiplayer gaming, live esports broadcasting, and campus gaming experiences."
  },

  "stats": [
    {
      "icon": "calendar",
      "label": "Event Dates",
      "value": "19–20 Dec 2026",
      "sub": "Day 1: Qualifiers | Day 2: Grand Finals"
    },
    {
      "icon": "pin",
      "label": "Venue",
      "value": "SVPCET, Nagpur",
      "sub": "St. Vincent Pallotti College of Engineering and Technology"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "4 Members",
      "sub": "BGMI Squad Format"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "₹70,000"
    }
  ],

  "rounds": [
    {
      "title": "Day 1 — Qualifiers (19 December 2026)",
      "text": "Online and offline qualifiers where all registered BGMI squads compete. Squads are evaluated based on placement points and kill points. The top 16 squads with the highest total scores qualify for the Grand Finals."
    },
    {
      "title": "Day 2 — Grand Finals (20 December 2026)",
      "text": "The top 16 qualified squads compete physically at SVPCET, Nagpur, in 6 matches across Erangel, Rondo, and Miramar. The squad with the highest cumulative points across all matches is declared the winner."
    }
  ],

  "rules": [
    {
      "title": "Grand Finals Attendance",
      "text": "All players from qualified BGMI squads must be physically present at the event venue for the Grand Finals."
    },
    {
      "title": "Devices and Identification",
      "text": "Participants must bring their own fully charged mobile devices and valid identification."
    },
    {
      "title": "Online Qualifier Requirements",
      "text": "Participants competing in online qualifiers are responsible for arranging their own devices and stable internet connections."
    },
    {
      "title": "Fair Play and Anti-Cheating",
      "text": "Hacks, cheats, third-party tools, emulator misuse, teaming with opponents, and unauthorized software are strictly prohibited and will result in immediate disqualification."
    },
    {
      "title": "Final Decision",
      "text": "The decisions of the event organizers and referees regarding rules, disputes, and results are final."
    }
  ],

  "faqs": [
    {
      "q": "What is the team size?",
      "a": "Each BGMI squad must consist of 4 members."
    },
    {
      "q": "Are there registration fees?",
      "a": "Registration fees are yet to be confirmed by the organizers."
    },
    {
      "q": "What are the submission rules?",
      "a": "Participants must register their squad online through the official Google Form, providing all player names and in-game IDs."
    },
    {
      "q": "What tools are allowed?",
      "a": "Participants must use their own mobile devices and charging accessories. Emulators and unauthorized third-party tools are strictly prohibited."
    },
    {
      "q": "What are the selection criteria?",
      "a": "The top 16 squads with the highest total scores, calculated using placement points and kill points from Day 1 qualifiers, advance to the Grand Finals."
    },
    {
      "q": "What is the final round format?",
      "a": "The offline Grand Finals take place on 20 December 2026 at SVPCET, Nagpur. The top 16 squads compete in 6 matches across Erangel, Rondo, and Miramar."
    },
    {
      "q": "When will the qualifiers take place?",
      "a": "The online and offline qualifiers are scheduled for 19 December 2026."
    },
    {
      "q": "When are the Grand Finals?",
      "a": "The Grand Finals are scheduled for 20 December 2026."
    },
    {
      "q": "How many squads qualify for the finals?",
      "a": "The top 16 squads from Day 1 qualifiers advance to the Grand Finals."
    },
    {
      "q": "Which maps will be played in the finals?",
      "a": "The Grand Finals consist of 6 matches played across Erangel, Rondo, and Miramar."
    }
  ],

  "contacts": [
    {
      "name": "Yug Meshram",
      "phone": "+91 9921143282",
      "email": ""},
    {
      "name": "Shreyash Tiwari",
      "phone": "+91 9623719736",
      "email": ""}
  ],

  "registerUrl": "",
  "rulebookUrl": "",

  "shape": "ship",
  "image": "/events/Gamer Conquest.jpeg",

  "highlights": [
    {
      "value": "₹70,000",
      "label": "Prize Pool"
    },
    {
      "value": "4",
      "label": "Members per Squad"
    },
    {
      "value": "16",
      "label": "Finalist Squads"
    }
  ],

  "perks": [
    "Compete for a ₹70,000 prize pool",
    "Experience competitive BGMI battle royale gaming",
    "Online and offline qualifiers",
    "Grand Finals featuring the top 16 squads",
    "Six final matches across Erangel, Rondo, and Miramar",
    "Live esports atmosphere with big-screen broadcast",
    "Planned interactive gaming experience zone"
  ],

  "whoCanJoin": "BGMI players and college gaming enthusiasts interested in competitive squad-based battle royale tournaments. Participants must register in squads of 4 members and provide accurate player details and in-game IDs."
},

  {
  "slug": "ctf",
  "name": "APEX CTF",
  "category": "Cyber",
  "tagline": "Capture the Flag · TECHNEX'26",
  "quote": "Explore. Create. Innovate.",
  "about": "APEX CTF is a multi-domain Capture the Flag competition hosted by the ACM Student Chapter at SVPCET, Nagpur, under TECHNEX'26. Teams decode clues, trace evidence and solve technical challenges to capture flags. The event includes an 8-hour online qualifier and a 24-hour offline Final Arena.",
  "domains": [
    "Capture the Flag (CTF)",
    "Cybersecurity",
    "Cryptography",
    "Web Security",
    "Reverse Engineering",
    "Binary Exploitation",
    "OSINT",
    "Digital Forensics",
    "Android",
    "Hardware"
  ],
  "stats": [
    {
      "icon": "calendar",
      "label": "Event Format",
      "value": "8h + 24h",
      "sub": "Online qualifier and offline final"
    },
    {
      "icon": "pin",
      "label": "Final Venue",
      "value": "SVPCET, Nagpur",
      "sub": "St. Vincent Pallotti College of Engineering & Technology, Nagpur"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "2–4 Members"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "₹2,00,000"
    }
  ],
  "rounds": [
    {
      "title": "Round 1 — Online Qualifier (8 Hours)",
      "text": "Teams solve multi-domain challenges and submit flags through the official CTF platform. The top teams advance based on scores and an organizer-announced cutoff."
    },
    {
      "title": "Round 2 — Final Arena (24 Hours)",
      "text": "Qualified teams compete in a 24-hour offline CTF final at SVPCET, Nagpur. Flags are submitted on the official platform; challenge write-ups may be requested to verify solutions before winners are confirmed."
    }
  ],
  "rules": [
    {
      "title": "Independent Solutions",
      "text": "Teams must solve challenges themselves. Sharing flags, solutions or write-ups with other teams is prohibited."
    },
    {
      "title": "Authorized Scope Only",
      "text": "Do not attack event infrastructure, other participants or systems outside the authorized challenge scope."
    },
    {
      "title": "Disqualification",
      "text": "Flag sharing, collusion, attacks outside scope, impersonation and plagiarism can lead to disqualification."
    },
    {
      "title": "Credentials & Conduct",
      "text": "Keep account credentials private and respect participants and staff."
    },
    {
      "title": "Verification & Ties",
      "text": "Final-round write-ups may be required. In a tie, the team reaching the tied score first ranks higher."
    }
  ],
  "faqs": [
    {
      "q": "What is the team size?",
      "a": "2–4 members per team."
    },
    {
      "q": "Are there registration fees?",
      "a": "Round 1 is free. Round 2 is planned at ₹300 per qualified team, subject to confirmation."
    },
    {
      "q": "What are the submission rules?",
      "a": "Submit flags through the official CTF platform. Final-round write-ups may be required; PPT and demo videos are not required."
    },
    {
      "q": "What tools are allowed?",
      "a": "Domain-relevant programming languages, developer tools, Linux utilities, debugging tools and OSINT resources within authorized challenge scope. AI/automation restrictions will be announced."
    },
    {
      "q": "What are the selection criteria?",
      "a": "Round 1 platform scores determine advancement, according to a cutoff announced by organizers."
    },
    {
      "q": "What is the final round format?",
      "a": "A 24-hour offline CTF final at SVPCET, Nagpur, with winners confirmed after any required write-up verification."
    }
  ],
  "contacts": [
    {
      "name": "Rishi Walokar",
      "phone": "9373334727",
      "email": "",
    },
    {
      "name": "Zubiya Khushgil Khan",
      "phone": "8668260665",
      "email": ""}
  ],
  "highlights": [
    {
      "value": "₹2,00,000",
      "label": "Prize Pool"
    },
    {
      "value": "8 Hours",
      "label": "Online Qualifier"
    },
    {
      "value": "24 Hours",
      "label": "Offline Final"
    }
  ],
  "perks": [
    "Multi-domain CTF challenges",
    "Online qualifier and offline final arena",
    "Challenge verification and score-based rankings"
  ],
  "whoCanJoin": "Teams of 2–4 interested in cybersecurity, cryptography, forensics and related technical CTF domains.",
  "innovation": {
    "title": "Applied Cybersecurity",
    "text": "Authorized challenge-based cryptography, forensics, web security and reverse-engineering problem solving."
  },
  "number": "06",
  "source": {
    "title": "The Imitation Game (2014)",
    "text": "The story of Alan Turing and the effort to decipher Enigma-encrypted messages."
  },
  "image": "/events/CTF.jpeg",
  "shape": "ship",
  "registerUrl": "",
  "rulebookUrl": ""
},
  {
  "slug": "build-the-brand",
  "name": "BIZCON 2026",
  "category": "Expo",
  "tagline": "Startup Conclave & Entrepreneurship · TECHNEX-26",
  "quote": "Explore. Create. Innovate.",
  "about": "BIZCON is a national-level startup conclave and entrepreneurial competition bringing together student founders, early-stage startups, aspiring entrepreneurs, investors, mentors and incubation ecosystem representatives under TECHNEX-26. It focuses on product positioning, market understanding, problem-solving, pitching and business readiness. Participants present products, tackle business scenarios, connect with the startup ecosystem and explore mentorship, incubation and investment opportunities.",
  "domains": [
    "Startup Conclave",
    "Entrepreneurial Competition",
    "Pitching",
    "Business Strategy",
    "Innovation",
    "Networking"
  ],
  "stats": [
    {
      "icon": "calendar",
      "label": "Event Format",
      "value": "3 Rounds",
      "sub": "Pitch, business scenario and final evaluation"
    },
    {
      "icon": "pin",
      "label": "Venue",
      "value": "SVPCET, Nagpur",
      "sub": "St. Vincent Pallotti College of Engineering & Technology, Nagpur"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "TBA"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "₹50,000"
    }
  ],
  "rounds": [
    {
      "title": "Round 1 — Startup / Product Pitch",
      "text": "Present the problem, proposed solution, target customers and business value."
    },
    {
      "title": "Round 2 — Business Situation Round",
      "text": "Respond to practical market and entrepreneurial challenges."
    },
    {
      "title": "Round 3 — Final Business Evaluation",
      "text": "Judges assess commercial potential, scalability, execution and business readiness."
    }
  ],
  "rules": [
    {
      "title": "Expected Participants",
      "text": "Open to business-school students, entrepreneurship clubs, student founders, early-stage startups, aspiring entrepreneurs and young professionals."
    },
    {
      "title": "Eligible Sectors",
      "text": "Open across AI/ML, SaaS, FinTech, HealthTech, EdTech, AgriTech, CleanTech, Mobility, Robotics, Consumer Products, Social Impact and emerging technologies."
    }
  ],
  "faqs": [
    {
      "q": "What is the team size?",
      "a": "TBA."
    },
    {
      "q": "Are there registration fees?",
      "a": "TBA."
    },
    {
      "q": "What are the submission rules?",
      "a": "TBA."
    },
    {
      "q": "What tools are allowed?",
      "a": "TBA."
    },
    {
      "q": "What are the selection criteria?",
      "a": "Commercial potential, scalability, execution, business readiness and responses to practical market challenges."
    },
    {
      "q": "What is the final round format?",
      "a": "Final Business Evaluation assessing commercial potential, scalability, execution and readiness."
    }
  ],
  "contacts": [
    {
      "name": "TBA",
      
      "phone": "9284996092",
      "email": "abelkoshy06@gmail.com",
      
    }
  ],
  "highlights": [
    {
      "value": "₹50,000",
      "label": "Prize Pool"
    },
    {
      "value": "3",
      "label": "Rounds"
    },
    {
      "value": "TBA",
      "label": "Team Size"
    }
  ],
  "perks": [
    "Startup and product pitching",
    "Practical business situation challenges",
    "Networking and startup ecosystem exposure"
  ],
  "whoCanJoin": "Business-school students, entrepreneurship clubs, student founders, early-stage startups, aspiring entrepreneurs and young professionals across all listed sectors.",
  "innovation": {
    "title": "Entrepreneurship & Business Innovation",
    "text": "Startup pitching, market understanding, commercial validation, scalability and business readiness."
  },
  "number": "07",
  "source": {
    "title": "Shark Tank",
    "text": "Entrepreneurs present innovative business ideas to investors."
  },
  "image": "",
  "shape": "ship",
  "registerUrl": "",
  "rulebookUrl": ""
},
  
{
  "slug": "coastal-clash",
  "number": "08",
  "name": "Coastal Clash 3.0",
  "category": "Marine",
  "tagline": "RC Boat Racing · TECHNEX'26",
  "quote": "Design. Build. Race. Dominate.",

  "about": "Coastal Clash 3.0 is an inter-college RC Boat Designing and Racing Competition challenging participants to design, build, and race their own high-performance remote-controlled boats. The event promotes practical engineering, marine design understanding, and electronics integration through a hands-on workshop followed by high-speed racing in custom water arenas.",

  "domains": [
    "RC Boat Design",
    "Electronics Integration",
    "Hydro-Dynamics",
    "High-Speed Racing"
  ],

  "source": {
    "title": "Leonardo da Vinci — Watercraft Sketches",
    "text": "Renaissance designs exploring mechanical ways to move vessels through water."
  },

  "innovation": {
    "title": "Modern Marine Engineering",
    "text": "Remote-controlled boats, hydrodynamic hull design, electronic control systems, propulsion technologies, and high-performance marine racing."
  },

  "stats": [
    {
      "icon": "calendar",
      "label": "Event Dates",
      "value": "18–19 Dec 2026"
    },
    {
      "icon": "pin",
      "label": "Venue",
      "value": "SVPCET, Nagpur",
      "sub": "St. Vincent Pallotti College of Engineering & Technology"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "1–4 Members",
      "sub": "Engineering & Junior College Students"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "Up to ₹50,000"
    }
  ],

  "rounds": [
    {
      "title": "Round 1 — The Gauntlet (Knockout)",
      "text": "A head-to-head race through moderate hurdles and directional gates. The top 20 participants qualify for the next round."
    },
    {
      "title": "Round 2 — Time Attack (Finale)",
      "text": "Solo runs against the clock in a maximum-difficulty arena with sharp turns and obstacles."
    }
  ],

  "rules": [
    {
      "title": "Team Size",
      "text": "Each team may consist of 1 to 4 members. Engineering and junior college students can participate."
    },
    {
      "title": "Arena",
      "text": "The competition takes place on a water track featuring buoys, narrow passages, and zig-zag paths."
    },
    {
      "title": "Event Format",
      "text": "The competition is conducted offline on campus."
    },
    {
      "title": "Judging Criteria",
      "text": "Speed, stability, and manoeuvrability determine the winners."
    },
    {
      "title": "Boat Building Kit",
      "text": "Participants receive motors, propellers, ESP-32, and crafting materials."
    }
  ],

  "faqs": [
    {
      "q": "Who can participate?",
      "a": "Engineering and junior college students can participate in Coastal Clash 3.0."
    },
    {
      "q": "What is the team size?",
      "a": "Each team can have 1 to 4 members."
    },
    {
      "q": "Do we need to bring our own materials?",
      "a": "Participants receive a kit containing motors, propellers, ESP-32, and crafting materials."
    },
    {
      "q": "What happens in the workshop?",
      "a": "Participants get hands-on experience with RC boat design, construction, and electronics integration before the racing competition."
    },
    {
      "q": "What is the racing format?",
      "a": "Round 1 is a head-to-head knockout race through moderate hurdles and directional gates, with the top 20 qualifying. Round 2 is an individual time attack on a more challenging track."
    },
    {
      "q": "What is the registration fee?",
      "a": "The entry fee is ₹399."
    },
    {
      "q": "What is the prize pool?",
      "a": "The total prize pool is up to ₹50,000."
    },
    {
      "q": "Where will the event take place?",
      "a": "The event takes place offline at St. Vincent Pallotti College of Engineering & Technology, Nagpur."
    }
  ],

  "contacts": [],

  "registerUrl": "",
  "rulebookUrl": "",

  "shape": "ship",
  "image": "/events/coastal-clash.webp",

  "highlights": [
    {
      "value": "₹50,000",
      "label": "Prize Pool"
    },
    {
      "value": "1–4",
      "label": "Team Members"
    },
    {
      "value": "₹399",
      "label": "Entry Fee"
    }
  ],

  "perks": [
    "Hands-on RC boat designing and racing experience",
    "Boat-building kit with motors, propellers, ESP-32, and crafting materials",
    "Practical exposure to marine engineering and electronics",
    "Head-to-head racing competition",
    "High-speed time attack finale",
    "Compete for prizes worth up to ₹50,000"
  ],

  "whoCanJoin": "Engineering and junior college students interested in marine engineering, remote-controlled boats, electronics, and competitive racing. Participants can register individually or in teams of up to 4 members."
},

  {
  "slug": "robo-sumo",
  "name": "Robo Sumo",
  "category": "Robotics",
  "tagline": "Robot Sumo Competition · TECHNEX 2026",
  "quote": "Explore. Create. Innovate.",
  "about": "Robo Sumo is a competitive robotics event under TECHNEX 2026 where two robots enter a circular arena and attempt to push each other outside the ring. Participants build robots focused on strength, stability, traction and control. The robot remaining in the ring wins the round. The competition applies mechanical design, motor control, sensors and teamwork.",
  "domains": [
    "Robotics",
    "Mechanical Design",
    "Motor Control",
    "Competition"
  ],
  "stats": [
    {
      "icon": "calendar",
      "label": "Event Format",
      "value": "2 Days",
      "sub": "Day 1 qualifiers · Day 2 finals"
    },
    {
      "icon": "pin",
      "label": "Venue",
      "value": "SVPCET, Nagpur",
      "sub": "St. Vincent Pallotti College of Engineering & Technology, Nagpur"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "1–4 Members"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "₹50,000"
    }
  ],
  "rounds": [
    {
      "title": "Day 1 — Inspection & Qualifiers",
      "text": "Robots are inspected for weight and dimensions, then all teams participate in qualifier matches. Top-performing teams are shortlisted."
    },
    {
      "title": "Day 2 — Elimination Finals",
      "text": "Shortlisted teams compete in elimination rounds, including semifinals, final and third-place matches, followed by prize distribution."
    },
    {
      "title": "Match Execution",
      "text": "Two robots enter the circular arena and compete after a countdown. A match ends when a robot is forced out or the time limit expires. Knockout matches are decided by the applicable point scoring."
    }
  ],
  "rules": [
    {
      "title": "Timely Reporting",
      "text": "Teams must arrive on time or risk elimination."
    },
    {
      "title": "Conduct",
      "text": "Misbehavior may lead to removal or disqualification."
    },
    {
      "title": "No Interference",
      "text": "Deliberate interference with other robots or damage to the arena leads to disqualification."
    },
    {
      "title": "Registration Details",
      "text": "Team details cannot be changed after registration."
    },
    {
      "title": "Repairs",
      "text": "Only minor repairs are permitted between matches; major redesigns are not allowed."
    }
  ],
  "faqs": [
    {
      "q": "What is the team size?",
      "a": "1–4 members per team."
    },
    {
      "q": "Are there registration fees?",
      "a": "One registration fee, amount TBA, covers all rounds."
    },
    {
      "q": "What are the submission rules?",
      "a": "Submit robot specifications (size and weight), component list and power details (battery type and voltage); present the robot for inspection at the scheduled reporting time."
    },
    {
      "q": "What tools are allowed?",
      "a": "Only minor repairs between matches are allowed; major redesigns are not permitted."
    },
    {
      "q": "What are the selection criteria?",
      "a": "Robot performance in the arena, ability to push or immobilize the opponent, stability and control."
    },
    {
      "q": "What is the final round format?",
      "a": "Typically knockout or best-of-three; the robot that pushes the opponent out or immobilizes it within the time limit wins."
    }
  ],
  "contacts": [
    {
      "name": "Kartikeya Shivankar",
      
      "phone": "9356635146",
      "email": ""},
    {
      "name": "R. Bhavya Naidu",
      
      "phone": "8459884596",
      "email": ""}
  ],
  "highlights": [
    {
      "value": "₹50,000",
      "label": "Prize Pool"
    },
    {
      "value": "1–4",
      "label": "Team Members"
    },
    {
      "value": "2 Days",
      "label": "Competition"
    }
  ],
  "perks": [
    "Competitive robot sumo matches",
    "Robot inspection and qualifying rounds",
    "Semifinal, final and third-place matches"
  ],
  "whoCanJoin": "Teams of 1–4 interested in mechanical design, motor control and competitive robotics.",
  "innovation": {
    "title": "Practical Robotics Engineering",
    "text": "Mechanical design, traction, stability, motor control and sensors for robot-sumo competition."
  },
  "number": "09",
  "source": {
    "title": "Real Steel (2011)",
    "text": "Fictional boxing robots designed to fight in an arena under human control or with automated routines."
  },
  "image": "/events/robo-sumo.webp",
  "shape": "ship",
  "registerUrl": "",
  "rulebookUrl": ""
},
  
{
  "slug": "overdrive",
  "number": "10",
  "name": "Overdrive 9.0",
  "category": "Racing",
  "tagline": "Multi-Terrain Robotics Racing · TECHNEX'26",
  "quote": "Build. Race. Conquer.",

  "about": "Overdrive 9.0 is a robotics competition organized under TECHNEX'26 in which teams design and build bots to navigate a multi-terrain arena. Participants face speed challenges, terrain adaptability, and engineering precision within strict time limits. The event runs over two days. Day 1 features a 1v1 bot race where penalties and clock time determine the qualifiers for Day 2. Day 2 is an individual time-based challenge on a more difficult track, testing navigation accuracy, control, and overall bot performance.",

  "domains": [
    "Robotics",
    "Competition",
    "Bot Race",
    "Multi-Terrain Arena",
    "Engineering Precision"
  ],

  "source": {
    "title": "Speed Racer — Tatsuo Yoshida (1966)",
    "text": "The Mach 5, a high-performance racing car designed with specialized features for competitive racing."
  },

  "innovation": {
    "title": "Real-World Robotics Innovation",
    "text": "Robotics engineering, motor control, precision steering, suspension systems, terrain adaptability, and obstacle navigation in competitive bot racing."
  },

  "stats": [
    {
      "icon": "calendar",
      "label": "Event Duration",
      "value": "2 Days",
      "sub": "Day 1: 1v1 Race | Day 2: Time Challenge"
    },
    {
      "icon": "pin",
      "label": "Venue",
      "value": "SVPCET, Nagpur",
      "sub": "St. Vincent Pallotti College of Engineering & Technology"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "2–4 Members",
      "sub": "One designated bot controller"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "Up to ₹1,00,000",
      "sub": "1st: ₹50K | 2nd: ₹30K | 3rd: ₹15K | Additional: ₹5K"
    }
  ],

  "rounds": [
    {
      "title": "Round 1 — 1v1 Bot Race (Day 1)",
      "text": "Two bots compete head-to-head through a designated maze. Each bot is evaluated based on its adjusted completion time, calculated as actual completion time plus total penalties. The bot with the lowest adjusted time wins. Rematches will be conducted in case of a tie. Teams qualify for Day 2 based on their performance."
    },
    {
      "title": "Round 2 — Time-Based Challenge (Day 2)",
      "text": "Qualified bots compete individually on a different and more challenging multi-terrain track. This round tests navigation accuracy, speed, control, and adaptability. The bot with the lowest adjusted completion time, including penalties for boundary violations or missed checkpoints, wins."
    },
    {
      "title": "Technical Inspection & Evaluation",
      "text": "Bots undergo technical inspection for weight, dimensions, safety, and rule compliance. The evaluation process includes preliminary performance assessment, qualification for finals, final competition, and result declaration based on verified completion times and penalties."
    }
  ],

  "rules": [
    {
      "title": "Bot Weight Limit",
      "text": "The maximum permitted bot weight is 5 kg. No tolerance is allowed beyond this limit."
    },
    {
      "title": "Bot Dimensions",
      "text": "The maximum permitted bot dimensions are 30 × 30 × 30 cm. Bots must comply with these dimensions during technical inspection."
    },
    {
      "title": "Control Mechanism",
      "text": "Both wired and wireless bot control are permitted. Wired bots must have a control wire measuring 2 to 3 metres."
    },
    {
      "title": "Bot Operation",
      "text": "Only one team member is permitted to control the bot during a race."
    },
    {
      "title": "Modification Restrictions",
      "text": "Bot modifications during the competition are prohibited."
    },
    {
      "title": "Fair Play & Safety",
      "text": "Cheating, unsafe practices, deliberate arena damage, or violation of competition rules may result in disqualification."
    },
    {
      "title": "Final Decision",
      "text": "The event coordinator's decision regarding rule enforcement, penalties, disputes, and results will be final."
    }
  ],

  "faqs": [
    {
      "q": "What is the team size?",
      "a": "Each team must consist of 2 to 4 members. Only one team member may control the bot during a race."
    },
    {
      "q": "Are there registration fees?",
      "a": "Yes. The planned registration fee is ₹450 per team, subject to confirmation by the organizers."
    },
    {
      "q": "What are the submission rules?",
      "a": "No online submission is required. Teams must bring their physical bot to the event venue, where it will undergo technical inspection before each round."
    },
    {
      "q": "What tools are allowed?",
      "a": "Both wired and wireless bot control systems are allowed. Wired bots must use a control wire measuring 2 to 3 metres."
    },
    {
      "q": "How are teams selected for Day 2?",
      "a": "Teams are evaluated based on their adjusted completion time during Day 1's 1v1 bot race. The adjusted time includes actual completion time and applicable penalties."
    },
    {
      "q": "What is the final round format?",
      "a": "Day 2 features an individual time-based challenge on a more difficult track. The bot with the lowest adjusted time, including penalties for boundary violations or missed checkpoints, wins."
    },
  ],

  "contacts": [
    {
      "name": "Rishika Appa",
      
      "phone": "8329225243",
      "email": ""},
    {
      "name": "Akash Bhanuse",
      
      "phone": "7499652092",
      "email": ""}
  ],

  "registerUrl": "",
  "rulebookUrl": "",

  "shape": "ship",
  "image": "/events/overdrive.webp",

  "highlights": [
    {
      "value": "₹1 Lakh",
      "label": "Maximum Prize Pool"
    },
    {
      "value": "2–4",
      "label": "Team Members"
    },
    {
      "value": "2 Days",
      "label": "Racing Competition"
    }
  ],

  "perks": [
    "Compete for a prize pool of up to ₹1,00,000",
    "Experience competitive multi-terrain robotics racing",
    "Test engineering precision and bot navigation skills",
    "Participate in exciting head-to-head bot races",
    "Demonstrate robotics design and control capabilities",
    "Compete in a challenging time-based final round"
  ],

  "whoCanJoin": "Students, robotics enthusiasts, and engineering teams interested in designing and racing multi-terrain bots. Each team must consist of 2 to 4 members and bring a bot that complies with the event's technical requirements."
},

  {
  "slug": "techquest",
  "name": "TECHQUEST 2k26",
  "category": "Forensics",
  "tagline": "Technical Treasure Hunt & Coding · TECHNEX-26",
  "quote": "Explore. Create. Innovate.",
  "about": "TECHQUEST 2k26 is an interactive, high-octane three-round technical adventure combining QR-based real-world treasure hunting, logical puzzles, technical quizzes, rapid coding, debugging, and cryptography. Teams begin with an outdoor sequential QR coding hunt across designated campus locations. Qualified teams progress to indoor technical quizzes and a final breakout challenge involving live coding and systems debugging to unlock the target software system.",
  "domains": [
    "Competitive Programming",
    "Web Technologies",
    "Cryptography & Security",
    "AI & Computer Fundamentals",
    "Logical & Algorithmic Reasoning",
    "Treasure Hunt",
    "Tech Quiz"
  ],
  "stats": [
    {
      "icon": "calendar",
      "label": "Event Format",
      "value": "3 Rounds",
      "sub": "Outdoor QR hunt, computer-based quiz and final breakout"
    },
    {
      "icon": "pin",
      "label": "Venue",
      "value": "SVPCET, Nagpur",
      "sub": "St. Vincent Pallotti College of Engineering & Technology, Nagpur"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "2–5 Members"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "₹40,000",
      "sub": "1st ₹15K · 2nd ₹10K · 3rd ₹5K · Special ₹10K"
    }
  ],
  "rounds": [
    {
      "title": "Round 1 — QR Coding Hunt",
      "text": "Offline campus outdoor treasure hunt via the event web portal. Teams scan physical QR codes at designated campus locations. Each scan reveals a logical coding challenge; solving it unlocks the clue to the next location."
    },
    {
      "title": "Round 2 — Technical Quiz",
      "text": "Qualified teams take an online computer-based, fast-paced quiz covering C++, Python, DSA, AI and logical reasoning, using hints unlocked in Round 1."
    },
    {
      "title": "Round 3 — Grand Mix Tech Quiz (Final Breakout)",
      "text": "Top teams compete in a time-bound online breakout challenge, fixing broken code, decrypting cryptographic ciphers and solving system logic to unlock the final target software system."
    }
  ],
  "rules": [
    {
      "title": "Live Work Only",
      "text": "All code solutions, submissions and cipher decryptions must be produced live. Pre-written scripts and unauthorized external tools are prohibited."
    },
    {
      "title": "One Active Device",
      "text": "Only one laptop or smartphone may be logged in per team at a time."
    },
    {
      "title": "Fair Play",
      "text": "Tampering with QR codes, sharing hints across teams, using multiple active devices, late reporting or disruptive behavior can result in disqualification."
    },
    {
      "title": "Allowed Tools",
      "text": "Standard built-in programming language functions are allowed in the final round. External automated solver tools are forbidden."
    },
    {
      "title": "Reporting",
      "text": "Teams must report at their assigned time slots."
    }
  ],
  "faqs": [
    {
      "q": "What is the team size?",
      "a": "2–5 members per team."
    },
    {
      "q": "Are there registration fees?",
      "a": "₹50 per participant (for example, ₹200 for a team of four). Fees are non-refundable."
    },
    {
      "q": "What are the submission rules?",
      "a": "Submit live through the official event web application: web-based code editor entries, cipher passphrase strings and digital multiple-choice answers."
    },
    {
      "q": "What tools are allowed?",
      "a": "One logged-in laptop or smartphone per team, standard web browsers and the official event web interface."
    },
    {
      "q": "What are the selection criteria?",
      "a": "Technical accuracy and code correctness 35%; speed and time efficiency 30%; logical and cryptographic problem solving 15%; team coordination 10%; system breakout completion 10%."
    },
    {
      "q": "What is the final round format?",
      "a": "A time-bound Grand Mix Tech Quiz (Final Breakout) involving code fixes, cipher decryption and system-logic problems to unlock the target software."
    }
  ],
  "contacts": [
    {
      "name": "Raj Kubde",
      
      "phone": "+919284221610",
      "email": ""},
    {
      "name": "Devansh Yadav",
      
      "phone": "+917057555407",
      "email": ""}
  ],
  "highlights": [
    {
      "value": "₹40,000",
      "label": "Prize Pool"
    },
    {
      "value": "3",
      "label": "Rounds"
    },
    {
      "value": "2–5",
      "label": "Team Members"
    }
  ],
  "perks": [
    "QR-based campus treasure hunt",
    "Technical quiz in C++, Python, DSA and AI",
    "Live coding, debugging and cryptography finale"
  ],
  "whoCanJoin": "Teams of 2–5 participants interested in programming, logical reasoning, cybersecurity and technical problem-solving.",
  "innovation": {
    "title": "Technical Investigation & Logic",
    "text": "QR-driven puzzle solving, programming, debugging, cryptography and system breakout challenges."
  },
  "number": "11",
  "source": {
    "title": "Sherlock Holmes — Arthur Conan Doyle",
    "text": "A fictional detective who solves mysteries through observation, deduction and clues."
  },
  "image": "/events/TechQuest.jpeg",
  "shape": "ship",
  "registerUrl": "",
  "rulebookUrl": ""
},
  {
  "slug": "ai-agent-arena",
  "name": "Agentic Arena",
  "category": "AI",
  "tagline": "24-Hour Agentic AI Hackathon · TECHNEX'26",
  "quote": "Explore. Create. Innovate.",
  "about": "Agentic Arena is a 24-hour offline Agentic AI hackathon organized under TECHNEX'26. Student teams design, build and demonstrate practical AI-agent systems for domain-specific challenges. Rather than merely calling an LLM, an agentic solution should interpret goals, plan actions, use tools and execute workflows. Teams then participate in a controlled 'Break Your Opponent’s Agent' challenge to assess reliability, reasoning and security, followed by live pitches.",
  "domains": [
    "Agentic AI",
    "Hackathon",
    "LLMs",
    "Automation",
    "Problem-Solving",
    "Biotechnology",
    "SpaceTech",
    "Cognitive Systems",
    "Robotics",
    "Cybersecurity"
  ],
  "stats": [
    {
      "icon": "calendar",
      "label": "Event Duration",
      "value": "24 Hours",
      "sub": "Offline hackathon"
    },
    {
      "icon": "pin",
      "label": "Venue",
      "value": "SVPCET, Nagpur",
      "sub": "St. Vincent Pallotti College of Engineering & Technology, Nagpur"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "2–4 Members"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "₹70,000"
    }
  ],
  "rounds": [
    {
      "title": "Round 1 — Build & Initial Evaluation",
      "text": "Teams select a domain, randomly draw a problem statement and build a functional agentic AI prototype. Checkpoint evaluations take place at 2:00 PM and 4:00 PM; approximately 30–35 teams are shortlisted."
    },
    {
      "title": "Round 2 — Break Your Opponent’s Agent",
      "text": "Qualified teams take part in controlled, authorized adversarial testing of another team’s agent for errors, reliability and robustness."
    },
    {
      "title": "Final Pitch — Top 10 Teams",
      "text": "The top 10 teams present their problem, solution, architecture, testing outcomes and live demonstration to the jury."
    }
  ],
  "rules": [
    {
      "title": "Attribution",
      "text": "Pre-built components, open-source libraries, templates and third-party services are permitted when disclosed and properly attributed."
    },
    {
      "title": "Originality",
      "text": "Plagiarism, unauthorized copying, misrepresentation of authorship and presenting an existing project as newly developed work are prohibited."
    },
    {
      "title": "Authorized Testing Only",
      "text": "Testing another team’s agent is allowed only during the designated controlled challenge and within authorized scope."
    },
    {
      "title": "Evaluation Access",
      "text": "Teams must provide access to their source code and make the solution available for evaluation."
    },
    {
      "title": "Protect Sensitive Data",
      "text": "Do not expose API keys, credentials, personal data or sensitive information in repositories or demos."
    }
  ],
  "faqs": [
    {
      "q": "What is the team size?",
      "a": "2–4 participants per team."
    },
    {
      "q": "Are there registration fees?",
      "a": "₹200 per team."
    },
    {
      "q": "What are the submission rules?",
      "a": "Submit a GitHub repository or source code, working demo, final PPT/PDF presentation and concise technical documentation."
    },
    {
      "q": "What tools are allowed?",
      "a": "LLMs, APIs, agent frameworks, orchestration libraries, databases and AI coding assistants; pre-built tools must be attributed."
    },
    {
      "q": "What are the selection criteria?",
      "a": "Problem alignment, agent architecture, reasoning and planning, tool integration, error recovery and robustness under unexpected inputs."
    },
    {
      "q": "What is the final round format?",
      "a": "The top 10 teams deliver a final pitch covering their problem, solution, testing outcomes and live demo to the jury."
    }
  ],
  "contacts": [
    {
      "name": "Kaushik Khodke",
      
      "phone": "8806275531",
      "email": "",
    },
    {
      "name": "Anushree Khobe",
      
      "phone": "9503334551",
      "email": ""}
  ],
  "highlights": [
    {
      "value": "₹70,000",
      "label": "Prize Pool"
    },
    {
      "value": "24 Hours",
      "label": "Hackathon"
    },
    {
      "value": "Top 10",
      "label": "Final Pitch Teams"
    }
  ],
  "perks": [
    "Build practical goal-driven AI agents",
    "Controlled robustness evaluation",
    "Live final pitch and demonstration"
  ],
  "whoCanJoin": "Student teams of 2–4 interested in building practical agentic AI systems across the listed domains.",
  "innovation": {
    "title": "Real-World Agentic AI",
    "text": "Goal interpretation, planning, tool use, workflow execution and robustness evaluation."
  },
  "number": "12",
  "source": {
    "title": "J.A.R.V.I.S. — Marvel’s Iron Man",
    "text": "An intelligent AI assistant that understands commands, analyses information and helps execute complex tasks."
  },
  "image": "",
  "shape": "ship",
  "registerUrl": "",
  "rulebookUrl": ""
},
  
{
  "slug": "designx",
  "number": "13",
  "name": "DesignX Studio",
  "category": "Design",
  "tagline": "BIM & 3D Visualization · TECHNEX'26",
  "quote": "Imagine. Design. Visualize.",

  "about": "DesignX Studio – BIM & 3D Visualization Workshop and Competition is a six-day technical learning and design event organized under Technex Fest 2026. The event provides practical exposure to architectural modelling, Building Information Modelling (BIM), 3D product modelling, and photorealistic rendering using Autodesk Revit and Autodesk Fusion. It begins with a four-day hands-on workshop followed by a two-day competition.",

  "domains": [
    "BIM",
    "Architectural Design",
    "3D Modelling",
    "Product Design",
    "Interior Visualisation",
    "Rendering"
  ],

  "source": {
    "title": "Leonardo da Vinci — Engineering Sketches",
    "text": "Creative engineering concepts and architectural sketches that explored innovative structures and futuristic designs."
  },

  "innovation": {
    "title": "Modern BIM & 3D Visualization",
    "text": "Building Information Modelling, Autodesk Revit, Autodesk Fusion, architectural visualization, product modelling and photorealistic rendering."
  },

  "stats": [
    {
      "icon": "calendar",
      "label": "Event Duration",
      "value": "6 Days",
      "sub": "4-day workshop + 2-day competition"
    },
    {
      "icon": "pin",
      "label": "Venue",
      "value": "St. Vincent Pallotti College of Engineering & Technology"
    },
    {
      "icon": "team",
      "label": "Team Size",
      "value": "Solo / Up to 2",
      "sub": "Revit: up to 2 | Fusion: Solo"
    },
    {
      "icon": "trophy",
      "label": "Prize Pool",
      "value": "TBA"
    }
  ],

  "rounds": [
    {
      "title": "Competition Day 1 — Revit Architecture Challenge",
      "text": "Participants must design a compact community library or community building using Building Information Modelling (BIM) principles. Solo participation or teams of up to 2 members are allowed. Duration: 3 hours."
    },
    {
      "title": "Competition Day 2 — Fusion Render Studio",
      "text": "Participants must select a real photograph of an object or interior and recreate it as a photorealistic 3D scene using Autodesk Fusion or equivalent software. This is a solo competition. Duration: 4 hours."
    }
  ],

  "rules": [
    {
      "title": "Software Requirements",
      "text": "Participants must install the required software before the workshop and bring their personal laptops if required by the organizers. Autodesk Revit and Autodesk Fusion will be used."
    },
    {
      "title": "Workshop Participation",
      "text": "Participants must follow the instructions provided by trainers and event coordinators during the competition."
    },
    {
      "title": "Time Limit",
      "text": "All practical assignments and competition tasks must be completed within the allotted time."
    },
    {
      "title": "Submission Format",
      "text": "Participants must submit PDF files containing their completed work online immediately after the event."
    },
    
  ],

  "faqs": [
    {
      "q": "What is the team size?",
      "a": "Fusion Render Studio requires solo participation. Revit Architecture Challenge allows solo participants or teams of up to 2 members."
    },
    {
      "q": "Are there registration fees?",
      "a": "The registration fee is ₹200 for Revit Architecture Challenge and ₹200 for Fusion Render Studio."
    },
    {
      "q": "What are the submission rules?",
      "a": "Participants must submit PDF files containing their completed work online immediately after the event."
    },
    {
      "q": "What tools are allowed?",
      "a": "Participants may use PCs from the CAD lab or personal laptops. Autodesk Revit and Autodesk Fusion will be used."
    },
    {
      "q": "What are the selection criteria?",
      "a": "Submissions will be evaluated for Best Design by a panel of faculty members and industry professionals based on creativity, technical skills, accuracy, design quality and software proficiency."
    },
  ],

  "contacts": [
    {
      "name": "Event Coordinator",
    
      "phone": "To be announced",
      "email": ""}
  ],

  "registerUrl": "",
  "rulebookUrl": "",

  "shape": "ship",
  "image": "",

  "highlights": [
    {
      "value": "6 Days",
      "label": "Workshop & Competition"
    },
    {
      "value": "₹200",
      "label": "Registration Per Challenge"
    },
    {
      "value": "2",
      "label": "Design Challenges"
    }
  ],

  "perks": [
    "Four-day hands-on BIM and 3D visualization workshop",
    "Practical exposure to Autodesk Revit and Fusion",
    "Architectural and product modelling experience",
    "Photorealistic rendering and visualization skills",
    "Design evaluation by faculty and industry professionals"
  ],

  "whoCanJoin": "Students and design enthusiasts interested in BIM, architectural modelling, product design and 3D visualization. Solo participation is allowed in both challenges, while Revit Architecture Challenge also permits teams of up to 2 members."
},

];

export const eventDetails: EventItem[] = [...otherEvents, hackathon].sort((a,b) => Number(a.number) - Number(b.number));
export const getEventDetail = (slug: string) => eventDetails.find((e) => e.slug === slug);
