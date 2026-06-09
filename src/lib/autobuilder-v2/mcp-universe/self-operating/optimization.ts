export function consumeOptimizationQueue(optimizationCandidates: string[] = []) {
  const candidates = optimizationCandidates.length > 0 ? optimizationCandidates : ["registry_coverage", "validation_depth", "connector_readiness"];
  return {
    productionActionAllowed: false,
    mode: "internal_optimization_queue",
    workItems: candidates.map((candidate, index) => ({
      id: `optimize-${candidate}`,
      target: candidate,
      rank: index + 1,
      hypothesis: `Improving ${candidate} should increase autonomous operating reliability and evidence quality.`,
      nextSafeStep: "Create internal experiment brief and validator before implementation."
    })),
    validators: ["business_value_check", "automation_value_check", "risk_check", "receipt_check"],
    nextAction: "Feed top optimization item into the next MCP pulse loop."
  };
}
