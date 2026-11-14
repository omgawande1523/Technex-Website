import type { ApiChatMessage } from "@/types/chat";

const FEST_SIGNALS = [
  /\btechnex\b/i,
  /\b(fest|festival)\b/i,
  /\b(events?|competitions?)\b/i,
  /\b(registration|register|registering|sign\s*up|enrol(?:l)?ment|apply|entry)\b/i,
  /\b(schedule|timetable|event timings|daily timings|when|time|timing|dates?)\b/i,
  /\b(venue|campus|college|svpcet|nagpur|st\s*vincent|pallotti|where|location)\b/i,
  /\b(rules?|eligibility|team|teams|team size|team members?|rounds?|timeline|criteria|rulebook)\b/i,
  /\b(fees?|price|cost|free|payment|prize|prizes|cash prize|prizepool|prize pool|reward|rewards|certificate|certificates)\b/i,
  /\b(accommodation|stay|hotel|food|parking|facilit(?:y|ies))\b/i,
  /\b(organis(?:er|ers)|organiz(?:er|ers)|coordinator|coordinators|help.?desk|contact|sponsor|sponsors|faculty)\b/i,
  /\b(workshops?|technical events?|non.?technical events?|hands.?on)\b/i,
  /\b(theme|tagline|incarnation|participate|participation|join|attend|volunteers?|announcement|announcements|winners?)\b/i,
  /\b(website section|registration link|event link|event details)\b/i,
  // Specific TECHNEX 2026 events
  /\b(agentic(\s*arena)?|apex(\s*ctf)?|ctf|bizcon|designx(studio)?|envision|gamers?\s*conquest|gaming|valorant|bgmi|hack\s*the\s*hardware|hardware|hackathon|overdrive|robo\s*race|roborace|robo\s*sumo|robosumo|sumo|techquest|vortex)\b/i,
  // Common fest inquiries
  /\b(what\s+is|tell\s+me|show\s+me|details|info|information|overview|how\s+to|which)\b/i
];

const GREETING_PATTERN = /^(hi|hello|hey|namaste|greetings|good\s*(morning|afternoon|evening)|yo|sup|hola)\b/i;
const IDENTITY_PATTERN = /\b(who are you|what can you do|what are you|what is your name|help me|tell me about yourself|how does this work)\b/i;

export function isGreetingOrIdentity(text: string): boolean {
  const clean = text.trim().toLowerCase().replace(/[?!.,]+$/, "");
  return GREETING_PATTERN.test(clean) || IDENTITY_PATTERN.test(clean);
}

export function createGreetingReply(): string {
  return "Hello! I'm **TECHNEX AI**, the official intelligence assistant for **TECHNEX 2026** at SVPCET Nagpur.\n\nAsk me anything about:\n- **Events & Competitions** (Hackathon, Agentic Arena, Overdrive, Apex CTF, Robo Sumo, Vortex, and more)\n- **Workshops & Hands-on sessions**\n- **Registration steps & fees**\n- **Prizes, schedules, rules & venue**\n\nHow can I help you today?";
}

const CODING_OR_DELIVERABLE_REQUEST = [
  /\b(write|generate|give|create|build|make|provide|show|send|develop)\b[\s\S]{0,55}\b(html|css|javascript|typescript|python|java|c\+\+|sql|code|coding|script|program|website|application|app)\b/i,
  /\b(html|css|javascript|typescript|python|java|c\+\+|sql)\b[\s\S]{0,45}\b(code|program|script|assignment|homework)\b/i,
  /\b(do|solve|complete|answer)\s+(my\s+)?(homework|assignment|exam|question paper|project report)\b/i,
  /\b(write|draft|compose)\s+(me\s+)?(an?\s+)?(essay|poem|story|email|caption|report)\b/i
];

const INSULT_PATTERN = /\b(stupid|idiot|dumb|moron|useless|trash|shut up|pathetic|fool|clown|brain.?dead|stfu|fuck you|bitch|asshole)\b/i;

function hasFestSignal(text: string): boolean {
  return FEST_SIGNALS.some((pattern) => pattern.test(text));
}

function isDeliverableRequest(text: string): boolean {
  return CODING_OR_DELIVERABLE_REQUEST.some((pattern) => pattern.test(text));
}

function isContextualFollowUp(text: string, priorMessages: ApiChatMessage[]): boolean {
  const priorUserMessages = priorMessages.filter((message) => message.role === "user");
  const previousQuestion = priorUserMessages.at(-1)?.content ?? "";
  if (!previousQuestion || isDeliverableRequest(previousQuestion) || !hasFestSignal(previousQuestion)) return false;
  if (text.trim().split(/\s+/).length > 8) return false;
  return /\b(it|that|this|they|them|those|there|these|one|ones)\b|^and\b|^what about\b|^how about\b/i.test(text);
}

export function isTechnexQuestion(text: string, priorMessages: ApiChatMessage[] = []): boolean {
  if (isGreetingOrIdentity(text)) return true;
  // Task requests are blocked even if someone tries to attach the TECHNEX name.
  if (isDeliverableRequest(text)) return false;
  return hasFestSignal(text) || isContextualFollowUp(text, priorMessages);
}

export function countPreviousOffTopicMessages(messages: ApiChatMessage[]): number {
  let count = 0;
  for (const message of [...messages].reverse()) {
    if (message.role !== "user") continue;
    if (hasFestSignal(message.content) && !isDeliverableRequest(message.content)) break;
    count += 1;
  }
  return count;
}

function isInsult(text: string): boolean {
  return INSULT_PATTERN.test(text);
}

function isCodingRequest(text: string): boolean {
  return isDeliverableRequest(text) && /\b(html|css|javascript|typescript|python|java|c\+\+|sql|code|coding|script|program)\b/i.test(text);
}

export function createOffTopicReply(text: string, previousOffTopicCount: number): string {
  const level = Math.min(Math.max(previousOffTopicCount, 0), 4);
  const isInsulting = isInsult(text);
  const isCode = isCodingRequest(text) || /\b(code|coding|html|css|javascript|typescript|python|java|sql|website|app|script|program)\b/i.test(text);
  const openers = [
    ["That question took a confident little vacation away from relevance.", "Interesting. Not relevant, but definitely interesting.", "I see we're exploring topics completely unrelated to why this chatbot exists.", "Bold question. Wrong desk, though."],
    ["Back again with a question from a different planet?", "The dedication to avoiding the actual topic is almost impressive.", "We're developing a pattern here, and relevance isn't part of it.", "Another detour. At this point, even Google Maps would give up."],
    ["You do realise this is a TECHNEX assistant, right? Just checking the signal.", "At this point, your off-topic streak deserves its own event category.", "The question is wandering. The chatbot is not.", "A spectacular attempt to make me the internet. Still no."],
    ["I admire the persistence. The topic discipline, less so.", "You've tested the boundary enough times to know exactly where it is.", "This conversation is trying very hard to become something it isn't.", "Even the loading spinner is now pointing you toward TECHNEX."],
    ["Final level unlocked: asking the TECHNEX bot literally anything except TECHNEX.", "The commitment to irrelevance is now statistically significant.", "We have reached the part where I repeat the purpose and you pretend it's new information.", "That's enough side quests. The main quest is still TECHNEX."]
  ];
  const codeLines = [
    "Looking for code? Wrong terminal. I'm here for TECHNEX information, not to build your next assignment.",
    "No code generation here. This is a fest information desk, not a developer-for-hire speedrun.",
    "HTML, CSS, Python, whatever—the answer is still no. My stack is TECHNEX facts. Ask about the fest.",
    "I won't write code or create deliverables. Try asking something useful about TECHNEX instead."
  ];
  const insultLines = [
    "That roast needs debugging. Anyway, I'm here for TECHNEX information. Ask about the fest.",
    "I've received your review and filed it under 'not a TECHNEX query'. Ask me about the fest.",
    "If that was meant to hurt, it arrived without documentation. TECHNEX questions are still welcome.",
    "We can trade insults, or you can get useful TECHNEX information. One of those is actually my job."
  ];
  const hashValue = [...text.toLowerCase()].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  const pick = (items: string[]) => items[hashValue % items.length];
  const opener = pick(openers[level]);
  const comeback = isInsulting ? pick(insultLines) : isCode ? pick(codeLines) : "I'm not going to answer unrelated questions, but I can deliver a sharp redirect.";
  const redirect = "Ask me about TECHNEX events, registration, schedules, rules, venue, facilities or other verified fest information.";
  return `${opener} ${comeback}\n\n${redirect}`;
}

export function createNoKnowledgeReply(_question: string): string {
  return "I don't have a confirmed detail for that yet, and I won't guess or invent official TECHNEX information. Please check the relevant official TECHNEX announcement or confirm it with the organizers.";
}
