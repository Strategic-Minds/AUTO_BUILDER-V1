import { normalizeStateCode, STATE_NAMES } from "./states";
import type { EpoxyCompetitorCandidate, EpoxyQueueJob, EpoxySheetRow } from "./types";

const TARGET_COMPETITORS_PER_STATE = 50;

const DRY_RUN_CANDIDATES: EpoxyCompetitorCandidate[] = [
  {
    competitorKey: "tx-dallas-epoxy-pros",
    name: "Dallas Epoxy Pros",
    stateCode: "TX",
    city: "Dallas",
    website: null,
    categories: ["epoxy flooring", "garage floor coatings"],
    services: ["garage epoxy floors", "metallic epoxy", "decorative concrete coatings"],
    source: "uploaded_clone_benchmark_seed",
    evidence: {
      sourceFile: "01-Strategic_Minds_AI_Level5_APX_Clone_Benchmark_RE_Enhanced.xlsx",
      sourceStatus: "seeded during Drive bootstrap"
    },
    verificationStatus: "NEEDS_REVIEW",
    confidenceScore: 0.66,
    notes: "Dry-run seed only. Requires public source verification before production intelligence use."
  },
  {
    competitorKey: "tx-epoxy-floors-texas",
    name: "Epoxy Floors Texas",
    stateCode: "TX",
    city: null,
    website: null,
    categories: ["epoxy flooring", "concrete coatings"],
    services: ["epoxy floors", "commercial coatings", "residential coatings"],
    source: "uploaded_clone_benchmark_seed",
    evidence: {
      sourceFile: "01-Strategic_Minds_AI_Level5_APX_Clone_Benchmark_RE_Enhanced.xlsx",
      sourceStatus: "seeded during Drive bootstrap"
    },
    verificationStatus: "NEEDS_REVIEW",
    confidenceScore: 0.62,
    notes: "Dry-run seed only. Needs website and service-area verification."
  },
  {
    competitorKey: "tx-level-10-coatings",
    name: "Level 10 Coatings",
    stateCode: "TX",
    city: null,
    website: null,
    categories: ["concrete coatings", "epoxy flooring"],
    services: ["decorative concrete coatings", "garage coatings"],
    source: "uploaded_clone_benchmark_seed",
    evidence: {
      sourceFile: "01-Strategic_Minds_AI_Level5_APX_Clone_Benchmark_RE_Enhanced.xlsx",
      sourceStatus: "seeded during Drive bootstrap"
    },
    verificationStatus: "NEEDS_REVIEW",
    confidenceScore: 0.58,
    notes: "Dry-run seed only. Needs location, website, and offer verification."
  }
];

function compactTimestamp(timestamp: string) {
  return timestamp.replace(/[-:.TZ]/g, "").slice(0, 14);
}

export function buildStateQueueJob(input: {
  state?: string | null;
  source: string;
  timestamp: string;
  status?: EpoxyQueueJob["status"];
}): EpoxyQueueJob {
  const stateCode = normalizeStateCode(input.state);
  return {
    jobKey: `EQ-STATE-${stateCode}-${compactTimestamp(input.timestamp)}`,
    jobType: "discover_state_competitors",
    stateCode,
    status: input.status ?? "DRY_RUN",
    priority: 100,
    targetCompetitorCount: TARGET_COMPETITORS_PER_STATE,
    createdAt: input.timestamp,
    source: input.source
  };
}

export function buildDryRunCandidates(state: string | null | undefined, maxCandidates = 10) {
  const stateCode = normalizeStateCode(state);
  return DRY_RUN_CANDIDATES.filter((candidate) => candidate.stateCode === stateCode).slice(0, maxCandidates);
}

export function buildSheetRows(input: {
  queueJob: EpoxyQueueJob;
  candidates: EpoxyCompetitorCandidate[];
  timestamp: string;
}): EpoxySheetRow[] {
  const stateName = STATE_NAMES[input.queueJob.stateCode];
  const queueRow: EpoxySheetRow = {
    tab: "Queue",
    operation: "upsert",
    key: input.queueJob.jobKey,
    values: {
      job_key: input.queueJob.jobKey,
      job_type: input.queueJob.jobType,
      state_code: input.queueJob.stateCode,
      state_name: stateName,
      status: input.queueJob.status,
      priority: input.queueJob.priority,
      target_competitor_count: input.queueJob.targetCompetitorCount,
      source: input.queueJob.source,
      generated_at: input.timestamp
    }
  };

  const stateRow: EpoxySheetRow = {
    tab: "State Master",
    operation: "upsert",
    key: input.queueJob.stateCode,
    values: {
      state_code: input.queueJob.stateCode,
      state_name: stateName,
      target_competitor_count: input.queueJob.targetCompetitorCount,
      discovered_count: input.candidates.length,
      status: input.candidates.length > 0 ? "DRY_RUN_SEEDED" : "NEEDS_DISCOVERY",
      last_run_at: input.timestamp
    }
  };

  const competitorRows = input.candidates.map((candidate): EpoxySheetRow => ({
    tab: "Competitor Master",
    operation: "upsert",
    key: candidate.competitorKey,
    values: {
      competitor_key: candidate.competitorKey,
      name: candidate.name,
      state_code: candidate.stateCode,
      city: candidate.city,
      website: candidate.website,
      categories: candidate.categories.join(", "),
      services: candidate.services.join(", "),
      verification_status: candidate.verificationStatus,
      confidence_score: candidate.confidenceScore,
      source: candidate.source,
      notes: candidate.notes,
      updated_at: input.timestamp
    }
  }));

  return [queueRow, stateRow, ...competitorRows];
}
