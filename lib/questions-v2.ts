import type { QuestionV2, ContextType, HEXACOFacet, TraitDomain } from "../types/assessment";

// ═══════════════════════════════════════════════════════════════
// HPMA v1.0 Question Bank — Option A (140 baseline + 96 context = 236)
// ═══════════════════════════════════════════════════════════════

// ID RANGES (UI ordering only)
export const ID_RANGES = {
  HEXACO: [1, 48],
  MOTIVES: [49, 78],
  AFFECTS: [79, 106],
  VALIDITY: [107, 112],
  ATTACHMENT: [201, 212],
  ANTAGONISM: [301, 316],
  CONTEXT_WORK: [401, 424],
  CONTEXT_STRESS: [425, 448],
  CONTEXT_INTIMACY: [449, 472],
  CONTEXT_PUBLIC: [473, 496],
} as const;

export const CONTEXT_STEMS: Record<ContextType, string> = {
  BASELINE: "",
  WORK: "At work or in structured obligations,",
  STRESS: "When I'm under pressure, overwhelmed, or threatened,",
  INTIMACY: "In close relationships (partner/close friends/family),",
  PUBLIC: "When I feel observed, judged, or graded,",
};

export const HEXACO_FACETS_ORDERED: HEXACOFacet[] = [
  "sincerity", "fairness", "greed_avoidance", "modesty",
  "fearfulness", "anxiety", "dependence", "sentimentality",
  "social_boldness", "sociability", "liveliness", "self_esteem",
  "forgivingness", "gentleness", "flexibility", "patience",
  "organization", "diligence", "perfectionism", "prudence",
  "aesthetic_appreciation", "inquisitiveness", "creativity", "unconventionality",
];

// ID starts for context phases (prevents hardcoded offsets drifting)
export const CONTEXT_START: Record<Exclude<ContextType, "BASELINE">, number> = {
  WORK: ID_RANGES.CONTEXT_WORK[0],
  STRESS: ID_RANGES.CONTEXT_STRESS[0],
  INTIMACY: ID_RANGES.CONTEXT_INTIMACY[0],
  PUBLIC: ID_RANGES.CONTEXT_PUBLIC[0],
};

// Programmatic context cloning (prevents drift)
// NOTE: Sentinels MUST be forward-keyed items (reversed: false) — enforced by test.
export function generateContextItems(sentinels: QuestionV2[]): QuestionV2[] {
  const contexts: Exclude<ContextType, "BASELINE">[] = ["WORK", "STRESS", "INTIMACY", "PUBLIC"];
  const out: QuestionV2[] = [];

  contexts.forEach((ctx) => {
    sentinels.forEach((s, i) => {
      out.push({
        id: CONTEXT_START[ctx] + i,
        facetId: s.facetId,
        text: s.text,
        module: "context",
        domain: s.domain,
        subdomain: s.subdomain,
        reversed: false,
        contextSentinel: false,
        context: ctx,
      });
    });
  });

  return out;
}

// ═══════════════════════════════════════════════════════════════
// HEXACO BASELINE — 48 items (2 per facet)
// ═══════════════════════════════════════════════════════════════
// Note: One item per facet (24 total) marked contextSentinel=true (forward-keyed only)

export const HEXACO_BASELINE_V2: QuestionV2[] = [
  // Honesty-Humility (H) — IDs 1-8
  // Sincerity (2 items)
  { id: 1, facetId: "H_SIN_01", text: "I avoid manipulating people, even when it would benefit me.", module: "hexaco", domain: "H", subdomain: "sincerity", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 2, facetId: "H_SIN_02", text: "I would be tempted to bend the rules if I knew I wouldn't be caught.", module: "hexaco", domain: "H", subdomain: "sincerity", reversed: true, context: "BASELINE" },
  // Fairness (2 items)
  { id: 3, facetId: "H_FAI_01", text: "I feel uncomfortable taking more credit than I deserve.", module: "hexaco", domain: "H", subdomain: "fairness", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 4, facetId: "H_FAI_02", text: "I can justify exploiting a \"broken system\" if it works in my favor.", module: "hexaco", domain: "H", subdomain: "fairness", reversed: true, context: "BASELINE" },
  // Greed Avoidance (2 items)
  { id: 5, facetId: "H_GRE_01", text: "I'd rather be fair than win at someone else's expense.", module: "hexaco", domain: "H", subdomain: "greed_avoidance", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 6, facetId: "H_GRE_02", text: "I sometimes enjoy having power over others.", module: "hexaco", domain: "H", subdomain: "greed_avoidance", reversed: true, context: "BASELINE" },
  // Modesty (2 items)
  { id: 7, facetId: "H_MOD_01", text: "If I make a mistake, I try to own it quickly.", module: "hexaco", domain: "H", subdomain: "modesty", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 8, facetId: "H_MOD_02", text: "I think I'm entitled to special treatment compared to most people.", module: "hexaco", domain: "H", subdomain: "modesty", reversed: true, context: "BASELINE" },

  // Emotionality (E) — IDs 9-16
  // Fearfulness (2 items)
  { id: 9, facetId: "E_FEA_01", text: "I get shaken up by disturbing news or images.", module: "hexaco", domain: "E", subdomain: "fearfulness", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 10, facetId: "E_FEA_02", text: "I stay calm in scary or uncertain situations.", module: "hexaco", domain: "E", subdomain: "fearfulness", reversed: true, context: "BASELINE" },
  // Anxiety (2 items)
  { id: 11, facetId: "E_ANX_01", text: "I worry easily about things that might go wrong.", module: "hexaco", domain: "E", subdomain: "anxiety", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 12, facetId: "E_ANX_02", text: "I rarely feel anxious about the future.", module: "hexaco", domain: "E", subdomain: "anxiety", reversed: true, context: "BASELINE" },
  // Dependence (2 items)
  { id: 13, facetId: "E_DEP_01", text: "I feel deeply affected by rejection or abandonment.", module: "hexaco", domain: "E", subdomain: "dependence", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 14, facetId: "E_DEP_02", text: "I'm hard to rattle emotionally.", module: "hexaco", domain: "E", subdomain: "dependence", reversed: true, context: "BASELINE" },
  // Sentimentality (2 items)
  { id: 15, facetId: "E_SEN_01", text: "I strongly prefer having trusted people close by.", module: "hexaco", domain: "E", subdomain: "sentimentality", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 16, facetId: "E_SEN_02", text: "I can detach from emotional situations quickly.", module: "hexaco", domain: "E", subdomain: "sentimentality", reversed: true, context: "BASELINE" },

  // Extraversion (X) — IDs 17-24
  // Social Boldness (2 items)
  { id: 17, facetId: "X_SOB_01", text: "I enjoy being the one who starts conversations.", module: "hexaco", domain: "X", subdomain: "social_boldness", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 18, facetId: "X_SOB_02", text: "I avoid attention whenever possible.", module: "hexaco", domain: "X", subdomain: "social_boldness", reversed: true, context: "BASELINE" },
  // Sociability (2 items)
  { id: 19, facetId: "X_SOC_01", text: "I like group activities more than solitary ones.", module: "hexaco", domain: "X", subdomain: "sociability", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 20, facetId: "X_SOC_02", text: "I'm quiet and reserved around most people.", module: "hexaco", domain: "X", subdomain: "sociability", reversed: true, context: "BASELINE" },
  // Liveliness (2 items)
  { id: 21, facetId: "X_LIV_01", text: "I naturally bring energy into a room.", module: "hexaco", domain: "X", subdomain: "liveliness", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 22, facetId: "X_LIV_02", text: "I feel drained by social situations more than most people.", module: "hexaco", domain: "X", subdomain: "liveliness", reversed: true, context: "BASELINE" },
  // Self-Esteem (2 items)
  { id: 23, facetId: "X_EST_01", text: "I often feel confident speaking up in groups.", module: "hexaco", domain: "X", subdomain: "self_esteem", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 24, facetId: "X_EST_02", text: "I hesitate to engage unless I'm invited first.", module: "hexaco", domain: "X", subdomain: "self_esteem", reversed: true, context: "BASELINE" },

  // Agreeableness (A) — IDs 25-32
  // Forgivingness (2 items)
  { id: 25, facetId: "A_FOR_01", text: "I can forgive people fairly easily.", module: "hexaco", domain: "A", subdomain: "forgivingness", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 26, facetId: "A_FOR_02", text: "When someone annoys me, I hold onto it.", module: "hexaco", domain: "A", subdomain: "forgivingness", reversed: true, context: "BASELINE" },
  // Gentleness (2 items)
  { id: 27, facetId: "A_GEN_01", text: "I try to keep conflicts from escalating.", module: "hexaco", domain: "A", subdomain: "gentleness", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 28, facetId: "A_GEN_02", text: "I often suspect people are being selfish.", module: "hexaco", domain: "A", subdomain: "gentleness", reversed: true, context: "BASELINE" },
  // Flexibility (2 items)
  { id: 29, facetId: "A_FLE_01", text: "I assume good intent until proven otherwise.", module: "hexaco", domain: "A", subdomain: "flexibility", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 30, facetId: "A_FLE_02", text: "I enjoy arguing just to prove I'm right.", module: "hexaco", domain: "A", subdomain: "flexibility", reversed: true, context: "BASELINE" },
  // Patience (2 items)
  { id: 31, facetId: "A_PAT_01", text: "I stay patient even when people are frustrating.", module: "hexaco", domain: "A", subdomain: "patience", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 32, facetId: "A_PAT_02", text: "I'm quick to snap when pushed.", module: "hexaco", domain: "A", subdomain: "patience", reversed: true, context: "BASELINE" },

  // Conscientiousness (C) — IDs 33-40
  // Organization (2 items)
  { id: 33, facetId: "C_ORG_01", text: "I keep my life organized enough to avoid last-minute chaos.", module: "hexaco", domain: "C", subdomain: "organization", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 34, facetId: "C_ORG_02", text: "I struggle to stick to routines.", module: "hexaco", domain: "C", subdomain: "organization", reversed: true, context: "BASELINE" },
  // Diligence (2 items)
  { id: 35, facetId: "C_DIL_01", text: "I reliably follow through on what I promise.", module: "hexaco", domain: "C", subdomain: "diligence", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 36, facetId: "C_DIL_02", text: "I often procrastinate even on important tasks.", module: "hexaco", domain: "C", subdomain: "diligence", reversed: true, context: "BASELINE" },
  // Perfectionism (2 items)
  { id: 37, facetId: "C_PER_01", text: "I pay attention to details that others miss.", module: "hexaco", domain: "C", subdomain: "perfectionism", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 38, facetId: "C_PER_02", text: "I'm careless with deadlines.", module: "hexaco", domain: "C", subdomain: "perfectionism", reversed: true, context: "BASELINE" },
  // Prudence (2 items)
  { id: 39, facetId: "C_PRU_01", text: "I set goals and track progress toward them.", module: "hexaco", domain: "C", subdomain: "prudence", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 40, facetId: "C_PRU_02", text: "I get bored by planning and prefer winging it.", module: "hexaco", domain: "C", subdomain: "prudence", reversed: true, context: "BASELINE" },

  // Openness (O) — IDs 41-48
  // Aesthetic Appreciation (2 items)
  { id: 41, facetId: "O_AES_01", text: "I'm moved by art, music, or natural beauty.", module: "hexaco", domain: "O", subdomain: "aesthetic_appreciation", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 42, facetId: "O_AES_02", text: "I don't see much value in art, philosophy, or new perspectives.", module: "hexaco", domain: "O", subdomain: "aesthetic_appreciation", reversed: true, context: "BASELINE" },
  // Inquisitiveness (2 items)
  { id: 43, facetId: "O_INQ_01", text: "I enjoy thinking about abstract questions.", module: "hexaco", domain: "O", subdomain: "inquisitiveness", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 44, facetId: "O_INQ_02", text: "I avoid complex topics because they feel pointless.", module: "hexaco", domain: "O", subdomain: "inquisitiveness", reversed: true, context: "BASELINE" },
  // Creativity (2 items)
  { id: 45, facetId: "O_CRE_01", text: "I often connect ideas from different areas into something new.", module: "hexaco", domain: "O", subdomain: "creativity", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 46, facetId: "O_CRE_02", text: "I rarely feel curious about how things work.", module: "hexaco", domain: "O", subdomain: "creativity", reversed: true, context: "BASELINE" },
  // Unconventionality (2 items)
  { id: 47, facetId: "O_UNC_01", text: "I'm drawn to unfamiliar ideas and experiences.", module: "hexaco", domain: "O", subdomain: "unconventionality", reversed: false, contextSentinel: true, context: "BASELINE" },
  { id: 48, facetId: "O_UNC_02", text: "I prefer familiar routines over novelty.", module: "hexaco", domain: "O", subdomain: "unconventionality", reversed: true, context: "BASELINE" },
];

// ═══════════════════════════════════════════════════════════════
// MOTIVES — 30 items (IDs 49-78)
// ═══════════════════════════════════════════════════════════════

export const MOTIVES_V2: QuestionV2[] = [
  // Security (5 items)
  { id: 49, facetId: "M_SEC_01", text: "I plan to reduce risk even if it limits options.", module: "motive", domain: "motive", subdomain: "security", reversed: false, context: "BASELINE" },
  { id: 50, facetId: "M_SEC_02", text: "I feel best when life is stable and predictable.", module: "motive", domain: "motive", subdomain: "security", reversed: false, context: "BASELINE" },
  { id: 51, facetId: "M_SEC_03", text: "I regularly think about \"worst-case scenarios.\"", module: "motive", domain: "motive", subdomain: "security", reversed: false, context: "BASELINE" },
  { id: 52, facetId: "M_SEC_04", text: "I'd rather miss an opportunity than risk a major loss.", module: "motive", domain: "motive", subdomain: "security", reversed: false, context: "BASELINE" },
  { id: 53, facetId: "M_SEC_05", text: "I seek environments where I can relax and feel safe.", module: "motive", domain: "motive", subdomain: "security", reversed: false, context: "BASELINE" },

  // Belonging (5 items)
  { id: 54, facetId: "M_BEL_01", text: "Feeling included matters to me more than being impressive.", module: "motive", domain: "motive", subdomain: "belonging", reversed: false, context: "BASELINE" },
  { id: 55, facetId: "M_BEL_02", text: "I invest time maintaining relationships even when I'm busy.", module: "motive", domain: "motive", subdomain: "belonging", reversed: false, context: "BASELINE" },
  { id: 56, facetId: "M_BEL_03", text: "I feel uneasy when I'm disconnected from my people.", module: "motive", domain: "motive", subdomain: "belonging", reversed: false, context: "BASELINE" },
  { id: 57, facetId: "M_BEL_04", text: "I'm motivated by being useful to a group.", module: "motive", domain: "motive", subdomain: "belonging", reversed: false, context: "BASELINE" },
  { id: 58, facetId: "M_BEL_05", text: "I prefer cooperation over competition.", module: "motive", domain: "motive", subdomain: "belonging", reversed: false, context: "BASELINE" },

  // Status (5 items)
  { id: 59, facetId: "M_STA_01", text: "Being respected is a major motivator for me.", module: "motive", domain: "motive", subdomain: "status", reversed: false, context: "BASELINE" },
  { id: 60, facetId: "M_STA_02", text: "I care about how others rank or evaluate me.", module: "motive", domain: "motive", subdomain: "status", reversed: false, context: "BASELINE" },
  { id: 61, facetId: "M_STA_03", text: "I like opportunities to stand out publicly.", module: "motive", domain: "motive", subdomain: "status", reversed: false, context: "BASELINE" },
  { id: 62, facetId: "M_STA_04", text: "I feel driven to build influence or reputation.", module: "motive", domain: "motive", subdomain: "status", reversed: false, context: "BASELINE" },
  { id: 63, facetId: "M_STA_05", text: "I feel energized when I'm admired.", module: "motive", domain: "motive", subdomain: "status", reversed: false, context: "BASELINE" },

  // Mastery (5 items)
  { id: 64, facetId: "M_MAS_01", text: "I'm motivated by getting better at difficult skills.", module: "motive", domain: "motive", subdomain: "mastery", reversed: false, context: "BASELINE" },
  { id: 65, facetId: "M_MAS_02", text: "I'd rather improve than just \"look good.\"", module: "motive", domain: "motive", subdomain: "mastery", reversed: false, context: "BASELINE" },
  { id: 66, facetId: "M_MAS_03", text: "I feel restless when I'm not progressing.", module: "motive", domain: "motive", subdomain: "mastery", reversed: false, context: "BASELINE" },
  { id: 67, facetId: "M_MAS_04", text: "I enjoy challenges that test my ability.", module: "motive", domain: "motive", subdomain: "mastery", reversed: false, context: "BASELINE" },
  { id: 68, facetId: "M_MAS_05", text: "I care a lot about doing things correctly.", module: "motive", domain: "motive", subdomain: "mastery", reversed: false, context: "BASELINE" },

  // Autonomy (5 items)
  { id: 69, facetId: "M_AUT_01", text: "I resist situations where someone controls how I work.", module: "motive", domain: "motive", subdomain: "autonomy", reversed: false, context: "BASELINE" },
  { id: 70, facetId: "M_AUT_02", text: "I feel most alive when I choose my own direction.", module: "motive", domain: "motive", subdomain: "autonomy", reversed: false, context: "BASELINE" },
  { id: 71, facetId: "M_AUT_03", text: "I prefer flexible rules over strict procedures.", module: "motive", domain: "motive", subdomain: "autonomy", reversed: false, context: "BASELINE" },
  { id: 72, facetId: "M_AUT_04", text: "I'd accept less reward to keep independence.", module: "motive", domain: "motive", subdomain: "autonomy", reversed: false, context: "BASELINE" },
  { id: 73, facetId: "M_AUT_05", text: "I'm motivated by self-directed goals more than assigned goals.", module: "motive", domain: "motive", subdomain: "autonomy", reversed: false, context: "BASELINE" },

  // Purpose (5 items)
  { id: 74, facetId: "M_PUR_01", text: "I want my life to contribute to something bigger than me.", module: "motive", domain: "motive", subdomain: "purpose", reversed: false, context: "BASELINE" },
  { id: 75, facetId: "M_PUR_02", text: "I feel driven by values more than comfort.", module: "motive", domain: "motive", subdomain: "purpose", reversed: false, context: "BASELINE" },
  { id: 76, facetId: "M_PUR_03", text: "I'm willing to sacrifice for a cause I believe in.", module: "motive", domain: "motive", subdomain: "purpose", reversed: false, context: "BASELINE" },
  { id: 77, facetId: "M_PUR_04", text: "Meaning matters to me more than pleasure.", module: "motive", domain: "motive", subdomain: "purpose", reversed: false, context: "BASELINE" },
  { id: 78, facetId: "M_PUR_05", text: "I often ask whether my actions align with my ideals.", module: "motive", domain: "motive", subdomain: "purpose", reversed: false, context: "BASELINE" },
];

// ═══════════════════════════════════════════════════════════════
// AFFECTS — 28 items (IDs 79-106)
// ═══════════════════════════════════════════════════════════════

export const AFFECTS_V2: QuestionV2[] = [
  // Seeking (4 items)
  { id: 79, facetId: "AF_SEE_01", text: "I feel pulled toward new possibilities and \"what could be.\"", module: "affect", domain: "affect", subdomain: "seeking", reversed: false, context: "BASELINE" },
  { id: 80, facetId: "AF_SEE_02", text: "I get excited by starting new projects or adventures.", module: "affect", domain: "affect", subdomain: "seeking", reversed: false, context: "BASELINE" },
  { id: 81, facetId: "AF_SEE_03", text: "I get restless when life feels stagnant.", module: "affect", domain: "affect", subdomain: "seeking", reversed: false, context: "BASELINE" },
  { id: 82, facetId: "AF_SEE_04", text: "I enjoy exploring options even before committing.", module: "affect", domain: "affect", subdomain: "seeking", reversed: false, context: "BASELINE" },

  // Fear (4 items)
  { id: 83, facetId: "AF_FEA_01", text: "I often scan for what might go wrong.", module: "affect", domain: "affect", subdomain: "fear", reversed: false, context: "BASELINE" },
  { id: 84, facetId: "AF_FEA_02", text: "I avoid situations where I might fail publicly.", module: "affect", domain: "affect", subdomain: "fear", reversed: false, context: "BASELINE" },
  { id: 85, facetId: "AF_FEA_03", text: "Uncertainty makes me tense.", module: "affect", domain: "affect", subdomain: "fear", reversed: false, context: "BASELINE" },
  { id: 86, facetId: "AF_FEA_04", text: "I can tolerate risk better than most people.", module: "affect", domain: "affect", subdomain: "fear", reversed: true, context: "BASELINE" },

  // Anger (4 items)
  { id: 87, facetId: "AF_ANG_01", text: "When I feel treated unfairly, anger rises fast.", module: "affect", domain: "affect", subdomain: "anger", reversed: false, context: "BASELINE" },
  { id: 88, facetId: "AF_ANG_02", text: "I stay calm even when I'm disrespected.", module: "affect", domain: "affect", subdomain: "anger", reversed: true, context: "BASELINE" },
  { id: 89, facetId: "AF_ANG_03", text: "I can become confrontational when pushed.", module: "affect", domain: "affect", subdomain: "anger", reversed: false, context: "BASELINE" },
  { id: 90, facetId: "AF_ANG_04", text: "I often feel \"hot\" irritation under stress.", module: "affect", domain: "affect", subdomain: "anger", reversed: false, context: "BASELINE" },

  // Care (4 items)
  { id: 91, facetId: "AF_CAR_01", text: "I notice when someone is hurting and want to help.", module: "affect", domain: "affect", subdomain: "care", reversed: false, context: "BASELINE" },
  { id: 92, facetId: "AF_CAR_02", text: "People's pain affects me strongly.", module: "affect", domain: "affect", subdomain: "care", reversed: false, context: "BASELINE" },
  { id: 93, facetId: "AF_CAR_03", text: "I'm protective of vulnerable people.", module: "affect", domain: "affect", subdomain: "care", reversed: false, context: "BASELINE" },
  { id: 94, facetId: "AF_CAR_04", text: "I can ignore others' problems without much guilt.", module: "affect", domain: "affect", subdomain: "care", reversed: true, context: "BASELINE" },

  // Grief (4 items)
  { id: 95, facetId: "AF_GRI_01", text: "I feel strong distress when relationships feel threatened.", module: "affect", domain: "affect", subdomain: "grief", reversed: false, context: "BASELINE" },
  { id: 96, facetId: "AF_GRI_02", text: "I fear being left out or abandoned more than most people.", module: "affect", domain: "affect", subdomain: "grief", reversed: false, context: "BASELINE" },
  { id: 97, facetId: "AF_GRI_03", text: "I recover quickly from social loss or rejection.", module: "affect", domain: "affect", subdomain: "grief", reversed: true, context: "BASELINE" },
  { id: 98, facetId: "AF_GRI_04", text: "I get a heavy \"loss feeling\" even from small goodbyes.", module: "affect", domain: "affect", subdomain: "grief", reversed: false, context: "BASELINE" },

  // Play (4 items)
  { id: 99, facetId: "AF_PLA_01", text: "I like joking, playfulness, and light competition.", module: "affect", domain: "affect", subdomain: "play", reversed: false, context: "BASELINE" },
  { id: 100, facetId: "AF_PLA_02", text: "I bring humor into tense situations.", module: "affect", domain: "affect", subdomain: "play", reversed: false, context: "BASELINE" },
  { id: 101, facetId: "AF_PLA_03", text: "I feel uncomfortable being silly in public.", module: "affect", domain: "affect", subdomain: "play", reversed: true, context: "BASELINE" },
  { id: 102, facetId: "AF_PLA_04", text: "I get energized by fun group momentum.", module: "affect", domain: "affect", subdomain: "play", reversed: false, context: "BASELINE" },

  // Desire (4 items)
  { id: 103, facetId: "AF_DES_01", text: "I notice attraction quickly.", module: "affect", domain: "affect", subdomain: "desire", reversed: false, context: "BASELINE" },
  { id: 104, facetId: "AF_DES_02", text: "Desire strongly influences my choices sometimes.", module: "affect", domain: "affect", subdomain: "desire", reversed: false, context: "BASELINE" },
  { id: 105, facetId: "AF_DES_03", text: "I rarely feel romantic or attraction-related motivation.", module: "affect", domain: "affect", subdomain: "desire", reversed: true, context: "BASELINE" },
  { id: 106, facetId: "AF_DES_04", text: "I feel a strong pull toward bonding/intimacy.", module: "affect", domain: "affect", subdomain: "desire", reversed: false, context: "BASELINE" },
];

// ═══════════════════════════════════════════════════════════════
// VALIDITY — 6 items (IDs 107-112)
// ═══════════════════════════════════════════════════════════════

export const VALIDITY_V2: QuestionV2[] = [
  { id: 107, facetId: "V_IDE_01", text: "I have never told a lie in my entire life.", module: "validity", domain: "validity", subdomain: "idealized", reversed: false, context: "BASELINE" },
  { id: 108, facetId: "V_NOR_01", text: "I sometimes feel jealous.", module: "validity", domain: "validity", subdomain: "normal", reversed: false, context: "BASELINE" },
  { id: 109, facetId: "V_IDE_02", text: "I always stay perfectly calm no matter what.", module: "validity", domain: "validity", subdomain: "idealized", reversed: false, context: "BASELINE" },
  { id: 110, facetId: "V_NOR_02", text: "I have had at least one conflict with someone in the past year.", module: "validity", domain: "validity", subdomain: "normal", reversed: false, context: "BASELINE" },
  { id: 111, facetId: "V_ATT_01", text: "I read every statement carefully before answering.", module: "validity", domain: "validity", subdomain: "attentiveness", reversed: false, context: "BASELINE" },
  { id: 112, facetId: "V_RAN_01", text: "I answered some questions randomly.", module: "validity", domain: "validity", subdomain: "random", reversed: false, context: "BASELINE" },
];

// ═══════════════════════════════════════════════════════════════
// ATTACHMENT — 12 items (IDs 201-212)
// ═══════════════════════════════════════════════════════════════

export const ATTACHMENT_V2: QuestionV2[] = [
  // Attachment Anxiety (6 items)
  { id: 201, facetId: "AT_ANX_01", text: "I worry that partners will leave me.", module: "attachment", domain: "attachment", subdomain: "anxiety", reversed: false, context: "BASELINE" },
  { id: 202, facetId: "AT_ANX_02", text: "I need a lot of reassurance that I'm loved.", module: "attachment", domain: "attachment", subdomain: "anxiety", reversed: false, context: "BASELINE" },
  { id: 203, facetId: "AT_ANX_03", text: "I often feel insecure about where I stand with people close to me.", module: "attachment", domain: "attachment", subdomain: "anxiety", reversed: false, context: "BASELINE" },
  { id: 204, facetId: "AT_ANX_04", text: "I get very upset when others don't respond to me quickly.", module: "attachment", domain: "attachment", subdomain: "anxiety", reversed: false, context: "BASELINE" },
  { id: 205, facetId: "AT_ANX_05", text: "I fear being rejected by those I care about.", module: "attachment", domain: "attachment", subdomain: "anxiety", reversed: false, context: "BASELINE" },
  { id: 206, facetId: "AT_ANX_06", text: "I often wonder if people really care about me.", module: "attachment", domain: "attachment", subdomain: "anxiety", reversed: false, context: "BASELINE" },

  // Attachment Avoidance (6 items)
  { id: 207, facetId: "AT_AVO_01", text: "I find it difficult to depend on others.", module: "attachment", domain: "attachment", subdomain: "avoidance", reversed: false, context: "BASELINE" },
  { id: 208, facetId: "AT_AVO_02", text: "I prefer not to show others how I feel deep down.", module: "attachment", domain: "attachment", subdomain: "avoidance", reversed: false, context: "BASELINE" },
  { id: 209, facetId: "AT_AVO_03", text: "I am uncomfortable being too close to others.", module: "attachment", domain: "attachment", subdomain: "avoidance", reversed: false, context: "BASELINE" },
  { id: 210, facetId: "AT_AVO_04", text: "I pull away when relationships get too intimate.", module: "attachment", domain: "attachment", subdomain: "avoidance", reversed: false, context: "BASELINE" },
  { id: 211, facetId: "AT_AVO_05", text: "I try to avoid getting too emotionally invested in others.", module: "attachment", domain: "attachment", subdomain: "avoidance", reversed: false, context: "BASELINE" },
  { id: 212, facetId: "AT_AVO_06", text: "I feel uncomfortable when others want to be very close.", module: "attachment", domain: "attachment", subdomain: "avoidance", reversed: false, context: "BASELINE" },
];

// ═══════════════════════════════════════════════════════════════
// ANTAGONISM — 16 items (IDs 301-316)
// ═══════════════════════════════════════════════════════════════

export const ANTAGONISM_V2: QuestionV2[] = [
  // Exploitative (4 items)
  { id: 301, facetId: "AN_EXP_01", text: "I use people to get what I want.", module: "antagonism", domain: "antagonism", subdomain: "exploitative", reversed: false, context: "BASELINE" },
  { id: 302, facetId: "AN_EXP_02", text: "I can be charming to manipulate situations.", module: "antagonism", domain: "antagonism", subdomain: "exploitative", reversed: false, context: "BASELINE" },
  { id: 303, facetId: "AN_EXP_03", text: "I don't mind using flattery to get my way.", module: "antagonism", domain: "antagonism", subdomain: "exploitative", reversed: false, context: "BASELINE" },
  { id: 304, facetId: "AN_EXP_04", text: "I know how to leverage others' weaknesses.", module: "antagonism", domain: "antagonism", subdomain: "exploitative", reversed: false, context: "BASELINE" },

  // Callous (4 items)
  { id: 305, facetId: "AN_CAL_01", text: "I don't feel much when others are hurt.", module: "antagonism", domain: "antagonism", subdomain: "callous", reversed: false, context: "BASELINE" },
  { id: 306, facetId: "AN_CAL_02", text: "I'm rarely moved by others' suffering.", module: "antagonism", domain: "antagonism", subdomain: "callous", reversed: false, context: "BASELINE" },
  { id: 307, facetId: "AN_CAL_03", text: "People say I'm cold or insensitive.", module: "antagonism", domain: "antagonism", subdomain: "callous", reversed: false, context: "BASELINE" },
  { id: 308, facetId: "AN_CAL_04", text: "I can watch others struggle without feeling the need to help.", module: "antagonism", domain: "antagonism", subdomain: "callous", reversed: false, context: "BASELINE" },

  // Combative (4 items)
  { id: 309, facetId: "AN_COM_01", text: "I enjoy arguments and winning debates.", module: "antagonism", domain: "antagonism", subdomain: "combative", reversed: false, context: "BASELINE" },
  { id: 310, facetId: "AN_COM_02", text: "I don't back down from confrontations.", module: "antagonism", domain: "antagonism", subdomain: "combative", reversed: false, context: "BASELINE" },
  { id: 311, facetId: "AN_COM_03", text: "I tend to react aggressively when challenged.", module: "antagonism", domain: "antagonism", subdomain: "combative", reversed: false, context: "BASELINE" },
  { id: 312, facetId: "AN_COM_04", text: "I sometimes provoke others to see how they react.", module: "antagonism", domain: "antagonism", subdomain: "combative", reversed: false, context: "BASELINE" },

  // Image-Driven (4 items)
  { id: 313, facetId: "AN_IMG_01", text: "I need others to see me as impressive.", module: "antagonism", domain: "antagonism", subdomain: "image_driven", reversed: false, context: "BASELINE" },
  { id: 314, facetId: "AN_IMG_02", text: "I often exaggerate my accomplishments.", module: "antagonism", domain: "antagonism", subdomain: "image_driven", reversed: false, context: "BASELINE" },
  { id: 315, facetId: "AN_IMG_03", text: "I feel slighted when I don't get special treatment.", module: "antagonism", domain: "antagonism", subdomain: "image_driven", reversed: false, context: "BASELINE" },
  { id: 316, facetId: "AN_IMG_04", text: "I deserve more recognition than I get.", module: "antagonism", domain: "antagonism", subdomain: "image_driven", reversed: false, context: "BASELINE" },
];

// ═══════════════════════════════════════════════════════════════
// DERIVED COLLECTIONS
// ═══════════════════════════════════════════════════════════════

export const BASELINE_QUESTIONS_V2: QuestionV2[] = [
  ...HEXACO_BASELINE_V2,
  ...MOTIVES_V2,
  ...AFFECTS_V2,
  ...VALIDITY_V2,
  ...ATTACHMENT_V2,
  ...ANTAGONISM_V2,
];

// Sentinel subset (must be exactly 24, one per facet, all forward-keyed)
export const HEXACO_SENTINELS_BASELINE: QuestionV2[] =
  HEXACO_BASELINE_V2.filter((q) => q.contextSentinel === true);

export const CONTEXT_QUESTIONS_V2: QuestionV2[] =
  generateContextItems(HEXACO_SENTINELS_BASELINE);

export const ALL_QUESTIONS_V2: QuestionV2[] = [
  ...BASELINE_QUESTIONS_V2,
  ...CONTEXT_QUESTIONS_V2,
];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getQuestionsByModule(module: QuestionV2["module"]): QuestionV2[] {
  return ALL_QUESTIONS_V2.filter((q) => q.module === module);
}

export function getBaselineByModule(module: QuestionV2["module"]): QuestionV2[] {
  return BASELINE_QUESTIONS_V2.filter((q) => q.module === module);
}

export function getQuestionsByContext(ctx: ContextType): QuestionV2[] {
  return ALL_QUESTIONS_V2.filter((q) => q.module === "context" && q.context === ctx);
}
