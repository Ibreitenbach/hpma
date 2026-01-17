import {
  ALL_QUESTIONS_V2,
  BASELINE_QUESTIONS_V2,
  CONTEXT_QUESTIONS_V2,
  HEXACO_FACETS_ORDERED,
  HEXACO_SENTINELS_BASELINE,
  ID_RANGES,
  getBaselineByModule,
  getQuestionsByContext,
} from "../lib/questions-v2";

function expectIdRange(items: { id: number }[], min: number, max: number) {
  for (const it of items) {
    expect(it.id).toBeGreaterThanOrEqual(min);
    expect(it.id).toBeLessThanOrEqual(max);
  }
}

describe("HPMA v1.0 Option A integrity", () => {
  test("baseline module counts are correct (Option A)", () => {
    expect(getBaselineByModule("hexaco").length).toBe(48);
    expect(getBaselineByModule("motive").length).toBe(30);
    expect(getBaselineByModule("affect").length).toBe(28);
    expect(getBaselineByModule("validity").length).toBe(6);
    expect(getBaselineByModule("attachment").length).toBe(12);
    expect(getBaselineByModule("antagonism").length).toBe(16);
    expect(BASELINE_QUESTIONS_V2.length).toBe(140);
  });

  test("baseline questions all have explicit context: 'BASELINE' and no context-module", () => {
    for (const q of BASELINE_QUESTIONS_V2) {
      expect(q.context).toBe("BASELINE");
      expect(q.module).not.toBe("context");
    }
  });

  test("sentinel count is exactly 24", () => {
    expect(HEXACO_SENTINELS_BASELINE.length).toBe(24);
  });

  test("sentinels cover every HEXACO facet exactly once (by subdomain)", () => {
    const counts = new Map<string, number>();
    for (const q of HEXACO_SENTINELS_BASELINE) {
      counts.set(q.subdomain, (counts.get(q.subdomain) ?? 0) + 1);
    }
    expect(counts.size).toBe(24);
    for (const facet of HEXACO_FACETS_ORDERED) {
      expect(counts.get(facet)).toBe(1);
    }
  });

  test("sentinel facetIds are unique", () => {
    const ids = HEXACO_SENTINELS_BASELINE.map((q) => q.facetId);
    expect(new Set(ids).size).toBe(24);
  });

  test("sentinels are all forward-keyed (reversed === false)", () => {
    for (const q of HEXACO_SENTINELS_BASELINE) {
      expect(q.reversed).toBe(false);
    }
  });

  test("baseline items are all within their designated ID ranges", () => {
    const hexaco = getBaselineByModule("hexaco");
    const motives = getBaselineByModule("motive");
    const affects = getBaselineByModule("affect");
    const validity = getBaselineByModule("validity");
    const attachment = getBaselineByModule("attachment");
    const antagonism = getBaselineByModule("antagonism");

    expectIdRange(hexaco, ID_RANGES.HEXACO[0], ID_RANGES.HEXACO[1]);
    expectIdRange(motives, ID_RANGES.MOTIVES[0], ID_RANGES.MOTIVES[1]);
    expectIdRange(affects, ID_RANGES.AFFECTS[0], ID_RANGES.AFFECTS[1]);
    expectIdRange(validity, ID_RANGES.VALIDITY[0], ID_RANGES.VALIDITY[1]);
    expectIdRange(attachment, ID_RANGES.ATTACHMENT[0], ID_RANGES.ATTACHMENT[1]);
    expectIdRange(antagonism, ID_RANGES.ANTAGONISM[0], ID_RANGES.ANTAGONISM[1]);
  });

  test("context counts are correct (96 total, 24 per context)", () => {
    expect(getQuestionsByContext("WORK").length).toBe(24);
    expect(getQuestionsByContext("STRESS").length).toBe(24);
    expect(getQuestionsByContext("INTIMACY").length).toBe(24);
    expect(getQuestionsByContext("PUBLIC").length).toBe(24);
    expect(CONTEXT_QUESTIONS_V2.length).toBe(96);
  });

  test("context items are forward, non-sentinel clones with matching facetIds", () => {
    const sentinelFacetIds = new Set(HEXACO_SENTINELS_BASELINE.map((q) => q.facetId));
    for (const q of CONTEXT_QUESTIONS_V2) {
      expect(q.module).toBe("context");
      expect(q.context).not.toBeUndefined();
      expect(q.context).not.toBe("BASELINE");
      expect(q.contextSentinel).toBe(false);
      expect(q.reversed).toBe(false);
      expect(sentinelFacetIds.has(q.facetId)).toBe(true);
    }
  });

  test("context clones preserve domain/subdomain for each facetId", () => {
    const sentinelByFacetId = new Map(HEXACO_SENTINELS_BASELINE.map((s) => [s.facetId, s]));
    for (const q of CONTEXT_QUESTIONS_V2) {
      const s = sentinelByFacetId.get(q.facetId)!;
      expect(q.domain).toBe(s.domain);
      expect(q.subdomain).toBe(s.subdomain);
    }
  });

  test("context IDs are in the correct ranges and sequential per context", () => {
    const work = getQuestionsByContext("WORK");
    const stress = getQuestionsByContext("STRESS");
    const intimacy = getQuestionsByContext("INTIMACY");
    const pub = getQuestionsByContext("PUBLIC");

    expectIdRange(work, ID_RANGES.CONTEXT_WORK[0], ID_RANGES.CONTEXT_WORK[1]);
    expectIdRange(stress, ID_RANGES.CONTEXT_STRESS[0], ID_RANGES.CONTEXT_STRESS[1]);
    expectIdRange(intimacy, ID_RANGES.CONTEXT_INTIMACY[0], ID_RANGES.CONTEXT_INTIMACY[1]);
    expectIdRange(pub, ID_RANGES.CONTEXT_PUBLIC[0], ID_RANGES.CONTEXT_PUBLIC[1]);

    const seqCheck = (items: { id: number }[], start: number) => {
      const ids = [...items].map((x) => x.id).sort((a, b) => a - b);
      expect(ids.length).toBe(24);
      for (let i = 0; i < 24; i++) {
        expect(ids[i]).toBe(start + i);
      }
    };

    seqCheck(work, ID_RANGES.CONTEXT_WORK[0]);
    seqCheck(stress, ID_RANGES.CONTEXT_STRESS[0]);
    seqCheck(intimacy, ID_RANGES.CONTEXT_INTIMACY[0]);
    seqCheck(pub, ID_RANGES.CONTEXT_PUBLIC[0]);
  });

  test("all baseline IDs are unique", () => {
    const ids = BASELINE_QUESTIONS_V2.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("all question IDs are unique across entire bank", () => {
    const ids = ALL_QUESTIONS_V2.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("grand total is 236 (140 baseline + 96 context)", () => {
    expect(ALL_QUESTIONS_V2.length).toBe(236);
  });
});
