import { Question } from '@/types/assessment';

export const questions: Question[] = [
  // ═══════════════════════════════════════════════════════════════
  // PART I — TRAIT STRUCTURE (HEXACO) — Items 1-48
  // ═══════════════════════════════════════════════════════════════

  // Honesty-Humility (H) — Items 1-8
  { id: 1, text: "I feel uncomfortable taking more credit than I deserve.", domain: 'H', subdomain: 'fairness', reversed: false },
  { id: 2, text: "I would be tempted to bend the rules if I knew I wouldn't be caught.", domain: 'H', subdomain: 'sincerity', reversed: true },
  { id: 3, text: "I avoid manipulating people, even when it would benefit me.", domain: 'H', subdomain: 'sincerity', reversed: false },
  { id: 4, text: "I think I'm entitled to special treatment compared to most people.", domain: 'H', subdomain: 'modesty', reversed: true },
  { id: 5, text: "I'd rather be fair than win at someone else's expense.", domain: 'H', subdomain: 'fairness', reversed: false },
  { id: 6, text: "I sometimes enjoy having power over others.", domain: 'H', subdomain: 'greed-avoidance', reversed: true },
  { id: 7, text: "If I make a mistake, I try to own it quickly.", domain: 'H', subdomain: 'sincerity', reversed: false },
  { id: 8, text: "I can justify exploiting a \"broken system\" if it works in my favor.", domain: 'H', subdomain: 'fairness', reversed: true },

  // Emotionality (E) — Items 9-16
  { id: 9, text: "I worry easily about things that might go wrong.", domain: 'E', subdomain: 'anxiety', reversed: false },
  { id: 10, text: "I stay calm in scary or uncertain situations.", domain: 'E', subdomain: 'fearfulness', reversed: true },
  { id: 11, text: "I feel deeply affected by rejection or abandonment.", domain: 'E', subdomain: 'dependence', reversed: false },
  { id: 12, text: "I rarely feel anxious about the future.", domain: 'E', subdomain: 'anxiety', reversed: true },
  { id: 13, text: "I get shaken up by disturbing news or images.", domain: 'E', subdomain: 'sentimentality', reversed: false },
  { id: 14, text: "I'm hard to rattle emotionally.", domain: 'E', subdomain: 'fearfulness', reversed: true },
  { id: 15, text: "I strongly prefer having trusted people close by.", domain: 'E', subdomain: 'dependence', reversed: false },
  { id: 16, text: "I can detach from emotional situations quickly.", domain: 'E', subdomain: 'sentimentality', reversed: true },

  // Extraversion (X) — Items 17-24
  { id: 17, text: "I enjoy being the one who starts conversations.", domain: 'X', subdomain: 'social-boldness', reversed: false },
  { id: 18, text: "I feel drained by social situations more than most people.", domain: 'X', subdomain: 'liveliness', reversed: true },
  { id: 19, text: "I naturally bring energy into a room.", domain: 'X', subdomain: 'liveliness', reversed: false },
  { id: 20, text: "I avoid attention whenever possible.", domain: 'X', subdomain: 'social-boldness', reversed: true },
  { id: 21, text: "I like group activities more than solitary ones.", domain: 'X', subdomain: 'sociability', reversed: false },
  { id: 22, text: "I'm quiet and reserved around most people.", domain: 'X', subdomain: 'sociability', reversed: true },
  { id: 23, text: "I often feel confident speaking up in groups.", domain: 'X', subdomain: 'social-boldness', reversed: false },
  { id: 24, text: "I hesitate to engage unless I'm invited first.", domain: 'X', subdomain: 'sociability', reversed: true },

  // Agreeableness (A) — Items 25-32
  { id: 25, text: "I can forgive people fairly easily.", domain: 'A', subdomain: 'forgiveness', reversed: false },
  { id: 26, text: "When someone annoys me, I hold onto it.", domain: 'A', subdomain: 'forgiveness', reversed: true },
  { id: 27, text: "I stay patient even when people are frustrating.", domain: 'A', subdomain: 'patience', reversed: false },
  { id: 28, text: "I enjoy arguing just to prove I'm right.", domain: 'A', subdomain: 'flexibility', reversed: true },
  { id: 29, text: "I try to keep conflicts from escalating.", domain: 'A', subdomain: 'gentleness', reversed: false },
  { id: 30, text: "I'm quick to snap when pushed.", domain: 'A', subdomain: 'patience', reversed: true },
  { id: 31, text: "I assume good intent until proven otherwise.", domain: 'A', subdomain: 'flexibility', reversed: false },
  { id: 32, text: "I often suspect people are being selfish.", domain: 'A', subdomain: 'gentleness', reversed: true },

  // Conscientiousness (C) — Items 33-40
  { id: 33, text: "I reliably follow through on what I promise.", domain: 'C', subdomain: 'diligence', reversed: false },
  { id: 34, text: "I often procrastinate even on important tasks.", domain: 'C', subdomain: 'diligence', reversed: true },
  { id: 35, text: "I keep my life organized enough to avoid last-minute chaos.", domain: 'C', subdomain: 'organization', reversed: false },
  { id: 36, text: "I get bored by planning and prefer winging it.", domain: 'C', subdomain: 'prudence', reversed: true },
  { id: 37, text: "I pay attention to details that others miss.", domain: 'C', subdomain: 'perfectionism', reversed: false },
  { id: 38, text: "I'm careless with deadlines.", domain: 'C', subdomain: 'diligence', reversed: true },
  { id: 39, text: "I set goals and track progress toward them.", domain: 'C', subdomain: 'prudence', reversed: false },
  { id: 40, text: "I struggle to stick to routines.", domain: 'C', subdomain: 'organization', reversed: true },

  // Openness (O) — Items 41-48
  { id: 41, text: "I'm drawn to unfamiliar ideas and experiences.", domain: 'O', subdomain: 'unconventionality', reversed: false },
  { id: 42, text: "I prefer familiar routines over novelty.", domain: 'O', subdomain: 'unconventionality', reversed: true },
  { id: 43, text: "I enjoy thinking about abstract questions.", domain: 'O', subdomain: 'inquisitiveness', reversed: false },
  { id: 44, text: "I don't see much value in art, philosophy, or new perspectives.", domain: 'O', subdomain: 'aesthetic-appreciation', reversed: true },
  { id: 45, text: "I like exploring \"why things are the way they are.\"", domain: 'O', subdomain: 'inquisitiveness', reversed: false },
  { id: 46, text: "I avoid complex topics because they feel pointless.", domain: 'O', subdomain: 'inquisitiveness', reversed: true },
  { id: 47, text: "I often connect ideas from different areas into something new.", domain: 'O', subdomain: 'creativity', reversed: false },
  { id: 48, text: "I rarely feel curious about how things work.", domain: 'O', subdomain: 'inquisitiveness', reversed: true },

  // ═══════════════════════════════════════════════════════════════
  // PART II — MOTIVATIONAL DRIVERS — Items 49-78
  // ═══════════════════════════════════════════════════════════════

  // Security / Safety — Items 49-53
  { id: 49, text: "I plan to reduce risk even if it limits options.", domain: 'motive', subdomain: 'security', reversed: false },
  { id: 50, text: "I feel best when life is stable and predictable.", domain: 'motive', subdomain: 'security', reversed: false },
  { id: 51, text: "I regularly think about \"worst-case scenarios.\"", domain: 'motive', subdomain: 'security', reversed: false },
  { id: 52, text: "I'd rather miss an opportunity than risk a major loss.", domain: 'motive', subdomain: 'security', reversed: false },
  { id: 53, text: "I seek environments where I can relax and feel safe.", domain: 'motive', subdomain: 'security', reversed: false },

  // Belonging / Connection — Items 54-58
  { id: 54, text: "Feeling included matters to me more than being impressive.", domain: 'motive', subdomain: 'belonging', reversed: false },
  { id: 55, text: "I invest time maintaining relationships even when I'm busy.", domain: 'motive', subdomain: 'belonging', reversed: false },
  { id: 56, text: "I feel uneasy when I'm disconnected from my people.", domain: 'motive', subdomain: 'belonging', reversed: false },
  { id: 57, text: "I'm motivated by being useful to a group.", domain: 'motive', subdomain: 'belonging', reversed: false },
  { id: 58, text: "I prefer cooperation over competition.", domain: 'motive', subdomain: 'belonging', reversed: false },

  // Status / Recognition — Items 59-63
  { id: 59, text: "Being respected is a major motivator for me.", domain: 'motive', subdomain: 'status', reversed: false },
  { id: 60, text: "I care about how others rank or evaluate me.", domain: 'motive', subdomain: 'status', reversed: false },
  { id: 61, text: "I like opportunities to stand out publicly.", domain: 'motive', subdomain: 'status', reversed: false },
  { id: 62, text: "I feel driven to build influence or reputation.", domain: 'motive', subdomain: 'status', reversed: false },
  { id: 63, text: "I feel energized when I'm admired.", domain: 'motive', subdomain: 'status', reversed: false },

  // Mastery / Competence — Items 64-68
  { id: 64, text: "I'm motivated by getting better at difficult skills.", domain: 'motive', subdomain: 'mastery', reversed: false },
  { id: 65, text: "I'd rather improve than just \"look good.\"", domain: 'motive', subdomain: 'mastery', reversed: false },
  { id: 66, text: "I feel restless when I'm not progressing.", domain: 'motive', subdomain: 'mastery', reversed: false },
  { id: 67, text: "I enjoy challenges that test my ability.", domain: 'motive', subdomain: 'mastery', reversed: false },
  { id: 68, text: "I care a lot about doing things correctly.", domain: 'motive', subdomain: 'mastery', reversed: false },

  // Autonomy / Freedom — Items 69-73
  { id: 69, text: "I resist situations where someone controls how I work.", domain: 'motive', subdomain: 'autonomy', reversed: false },
  { id: 70, text: "I feel most alive when I choose my own direction.", domain: 'motive', subdomain: 'autonomy', reversed: false },
  { id: 71, text: "I prefer flexible rules over strict procedures.", domain: 'motive', subdomain: 'autonomy', reversed: false },
  { id: 72, text: "I'd accept less reward to keep independence.", domain: 'motive', subdomain: 'autonomy', reversed: false },
  { id: 73, text: "I'm motivated by self-directed goals more than assigned goals.", domain: 'motive', subdomain: 'autonomy', reversed: false },

  // Purpose / Meaning — Items 74-78
  { id: 74, text: "I want my life to contribute to something bigger than me.", domain: 'motive', subdomain: 'purpose', reversed: false },
  { id: 75, text: "I feel driven by values more than comfort.", domain: 'motive', subdomain: 'purpose', reversed: false },
  { id: 76, text: "I'm willing to sacrifice for a cause I believe in.", domain: 'motive', subdomain: 'purpose', reversed: false },
  { id: 77, text: "Meaning matters to me more than pleasure.", domain: 'motive', subdomain: 'purpose', reversed: false },
  { id: 78, text: "I often ask whether my actions align with my ideals.", domain: 'motive', subdomain: 'purpose', reversed: false },

  // ═══════════════════════════════════════════════════════════════
  // PART III — AFFECTIVE SYSTEMS — Items 79-106
  // ═══════════════════════════════════════════════════════════════

  // SEEKING (curiosity/drive) — Items 79-82
  { id: 79, text: "I feel pulled toward new possibilities and \"what could be.\"", domain: 'affect', subdomain: 'seeking', reversed: false },
  { id: 80, text: "I get excited by starting new projects or adventures.", domain: 'affect', subdomain: 'seeking', reversed: false },
  { id: 81, text: "I get restless when life feels stagnant.", domain: 'affect', subdomain: 'seeking', reversed: false },
  { id: 82, text: "I enjoy exploring options even before committing.", domain: 'affect', subdomain: 'seeking', reversed: false },

  // FEAR (threat vigilance) — Items 83-86
  { id: 83, text: "I often scan for what might go wrong.", domain: 'affect', subdomain: 'fear', reversed: false },
  { id: 84, text: "I avoid situations where I might fail publicly.", domain: 'affect', subdomain: 'fear', reversed: false },
  { id: 85, text: "Uncertainty makes me tense.", domain: 'affect', subdomain: 'fear', reversed: false },
  { id: 86, text: "I can tolerate risk better than most people.", domain: 'affect', subdomain: 'fear', reversed: true },

  // RAGE / ANGER (boundary-defense) — Items 87-90
  { id: 87, text: "When I feel treated unfairly, anger rises fast.", domain: 'affect', subdomain: 'anger', reversed: false },
  { id: 88, text: "I stay calm even when I'm disrespected.", domain: 'affect', subdomain: 'anger', reversed: true },
  { id: 89, text: "I can become confrontational when pushed.", domain: 'affect', subdomain: 'anger', reversed: false },
  { id: 90, text: "I often feel \"hot\" irritation under stress.", domain: 'affect', subdomain: 'anger', reversed: false },

  // CARE (nurturance/compassion) — Items 91-94
  { id: 91, text: "I notice when someone is hurting and want to help.", domain: 'affect', subdomain: 'care', reversed: false },
  { id: 92, text: "People's pain affects me strongly.", domain: 'affect', subdomain: 'care', reversed: false },
  { id: 93, text: "I'm protective of vulnerable people.", domain: 'affect', subdomain: 'care', reversed: false },
  { id: 94, text: "I can ignore others' problems without much guilt.", domain: 'affect', subdomain: 'care', reversed: true },

  // PANIC/GRIEF (separation distress) — Items 95-98
  { id: 95, text: "I feel strong distress when relationships feel threatened.", domain: 'affect', subdomain: 'grief', reversed: false },
  { id: 96, text: "I fear being left out or abandoned more than most people.", domain: 'affect', subdomain: 'grief', reversed: false },
  { id: 97, text: "I recover quickly from social loss or rejection.", domain: 'affect', subdomain: 'grief', reversed: true },
  { id: 98, text: "I get a heavy \"loss feeling\" even from small goodbyes.", domain: 'affect', subdomain: 'grief', reversed: false },

  // PLAY (social joy) — Items 99-102
  { id: 99, text: "I like joking, playfulness, and light competition.", domain: 'affect', subdomain: 'play', reversed: false },
  { id: 100, text: "I bring humor into tense situations.", domain: 'affect', subdomain: 'play', reversed: false },
  { id: 101, text: "I feel uncomfortable being silly in public.", domain: 'affect', subdomain: 'play', reversed: true },
  { id: 102, text: "I get energized by fun group momentum.", domain: 'affect', subdomain: 'play', reversed: false },

  // DESIRE / DRIVE (attraction energy) — Items 103-106
  { id: 103, text: "I notice attraction quickly.", domain: 'affect', subdomain: 'desire', reversed: false },
  { id: 104, text: "Desire strongly influences my choices sometimes.", domain: 'affect', subdomain: 'desire', reversed: false },
  { id: 105, text: "I rarely feel romantic or attraction-related motivation.", domain: 'affect', subdomain: 'desire', reversed: true },
  { id: 106, text: "I feel a strong pull toward bonding/intimacy.", domain: 'affect', subdomain: 'desire', reversed: false },

  // ═══════════════════════════════════════════════════════════════
  // PART IV — VALIDITY CHECKS — Items 107-112
  // ═══════════════════════════════════════════════════════════════
  { id: 107, text: "I have never told a lie in my entire life.", domain: 'validity', subdomain: 'idealized', reversed: false },
  { id: 108, text: "I sometimes feel jealous.", domain: 'validity', subdomain: 'normal', reversed: false },
  { id: 109, text: "I always stay perfectly calm no matter what.", domain: 'validity', subdomain: 'idealized', reversed: false },
  { id: 110, text: "I have had at least one conflict with someone in the past year.", domain: 'validity', subdomain: 'normal', reversed: false },
  { id: 111, text: "I read every statement carefully before answering.", domain: 'validity', subdomain: 'attentiveness', reversed: false },
  { id: 112, text: "I answered some questions randomly.", domain: 'validity', subdomain: 'random', reversed: false },
];

// Question ID ranges by domain
export const QUESTION_RANGES = {
  H: [1, 8],
  E: [9, 16],
  X: [17, 24],
  A: [25, 32],
  C: [33, 40],
  O: [41, 48],
  security: [49, 53],
  belonging: [54, 58],
  status: [59, 63],
  mastery: [64, 68],
  autonomy: [69, 73],
  purpose: [74, 78],
  seeking: [79, 82],
  fear: [83, 86],
  anger: [87, 90],
  care: [91, 94],
  grief: [95, 98],
  play: [99, 102],
  desire: [103, 106],
  validity: [107, 112],
} as const;

export function getQuestionsForDomain(domain: keyof typeof QUESTION_RANGES): Question[] {
  const [start, end] = QUESTION_RANGES[domain];
  return questions.filter(q => q.id >= start && q.id <= end);
}
