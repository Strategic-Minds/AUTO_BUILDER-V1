export type FinanceAssumptions = {
  startingMonthlyLeads: number;
  monthlyLeadGrowth: number;
  leadToCallRate: number;
  callCloseRate: number;
  averageOrderValue: number;
  grossMargin: number;
  monthlyFixedOpex: number;
  cacPerLead: number;
};

export type FinanceScenario = {
  name: "downside" | "base" | "upside";
  probability: number;
  leadGrowth: number;
  closeRate: number;
  averageOrderValue: number;
  grossMargin: number;
  monthlyFixedOpex: number;
};

export const defaultFinanceAssumptions: FinanceAssumptions = {
  startingMonthlyLeads: 150,
  monthlyLeadGrowth: 0.08,
  leadToCallRate: 0.22,
  callCloseRate: 0.28,
  averageOrderValue: 4500,
  grossMargin: 0.65,
  monthlyFixedOpex: 45000,
  cacPerLead: 45
};

export const defaultFinanceScenarios: FinanceScenario[] = [
  {
    name: "downside",
    probability: 0.25,
    leadGrowth: 0.01,
    closeRate: 0.16,
    averageOrderValue: 3200,
    grossMargin: 0.5,
    monthlyFixedOpex: 55000
  },
  {
    name: "base",
    probability: 0.5,
    leadGrowth: 0.08,
    closeRate: 0.28,
    averageOrderValue: 4500,
    grossMargin: 0.65,
    monthlyFixedOpex: 45000
  },
  {
    name: "upside",
    probability: 0.25,
    leadGrowth: 0.14,
    closeRate: 0.36,
    averageOrderValue: 6200,
    grossMargin: 0.75,
    monthlyFixedOpex: 50000
  }
];

export const chrisFinanceBaseline = {
  owner: "Chris",
  profile: "mentor-boss-finance-command-center",
  source: "AUTO_BUILDER Financial Prediction Simulation workbook",
  mode: "seeded-assumption-model",
  liveDataStatus: "pending-live-source-sync",
  databaseStatus: "pending-finance-schema-activation"
};

export const defaultMonteCarloSummary = {
  seed: 42,
  runs: 1000,
  months: 36,
  meanNpv: 3454663.61,
  medianNpv: 1766971.06,
  p10Npv: -744085.84,
  p90Npv: 9578908.96,
  lossProbability: 0.23,
  interpretation: "Uploaded workbook assumptions support a high-upside but still risky model. Downside protection and approval gates remain mandatory."
};

export function isFinancialSimulationIdea(idea: string) {
  const normalized = idea.toLowerCase();
  return [
    "financial",
    "finance",
    "forecast",
    "simulation",
    "monte carlo",
    "cash runway",
    "ebitda",
    "npv",
    "valuation",
    "sensitivity",
    "scenario planning",
    "prediction system"
  ].some((term) => normalized.includes(term));
}

export function buildFinanceSimulationPacket(idea: string) {
  return {
    ideaBrief: {
      rawText: idea,
      desiredOutcome: "Financial prediction and simulation system",
      owner: "Chris",
      speedTarget: "Sandbox First"
    },
    classification: {
      route: "Financial prediction and simulation system",
      riskClass: "high",
      confidence: 92,
      escalationRequired: true
    },
    economicCase: {
      revenueHypothesis: "Decision-support system for offers, lead engines, retainers, Shopify growth, SaaS ideas, and internal investment choices.",
      marginHypothesis: "Improves capital allocation, reduces downside risk, and raises profitable decision quality.",
      speedToCash: "medium"
    },
    architecture: {
      frontend: "Next.js + Vercel dashboard",
      backend: "Supabase + Python simulation package",
      schema: [
        "leads",
        "opportunities",
        "sales",
        "spend",
        "customers",
        "cohorts",
        "forecasts",
        "simulation_runs",
        "decisions"
      ],
      modules: [
        "driver forecast",
        "scenario control",
        "monte carlo",
        "sensitivity analysis",
        "actual-vs-forecast calibration",
        "executive report"
      ],
      validationProfile: [
        "formula scan",
        "simulation seed reproducibility",
        "data freshness checks",
        "approval gate test"
      ]
    },
    governance: {
      doctrine: "Decision support only. No autonomous spend, trading, or financial commitment.",
      approvalRequiredFor: [
        "budget increases",
        "cash allocation changes",
        "client-facing forecast claims",
        "live connector writes"
      ]
    }
  };
}

export function simulateDeterministicForecast(
  assumptions: FinanceAssumptions = defaultFinanceAssumptions,
  months = 12
) {
  const rows = [] as Array<Record<string, number>>;
  let leads = assumptions.startingMonthlyLeads;
  let recurringRevenue = 0;

  for (let month = 1; month <= months; month += 1) {
    const calls = leads * assumptions.leadToCallRate;
    const customers = calls * assumptions.callCloseRate;
    const newRevenue = customers * assumptions.averageOrderValue;
    recurringRevenue = recurringRevenue * 1.04 + newRevenue * 0.35;
    const totalRevenue = newRevenue + recurringRevenue;
    const cacSpend = leads * assumptions.cacPerLead;
    const grossProfit = totalRevenue * assumptions.grossMargin;
    const netProfit = grossProfit - assumptions.monthlyFixedOpex - cacSpend;

    rows.push({
      month,
      leads,
      calls,
      customers,
      newRevenue,
      recurringRevenue,
      totalRevenue,
      cacSpend,
      grossProfit,
      netProfit
    });

    leads = leads * (1 + assumptions.monthlyLeadGrowth);
  }

  return rows;
}

export function buildFinanceCommandCenter() {
  const forecast = simulateDeterministicForecast();
  const finalMonth = forecast[forecast.length - 1];

  return {
    sourceProfile: chrisFinanceBaseline,
    assumptions: defaultFinanceAssumptions,
    scenarios: defaultFinanceScenarios,
    monteCarlo: defaultMonteCarloSummary,
    forecast,
    summary: {
      month: finalMonth.month,
      totalRevenue: finalMonth.totalRevenue,
      grossProfit: finalMonth.grossProfit,
      netProfit: finalMonth.netProfit
    },
    governance: {
      warning: "This system supports decisions. It does not guarantee outcomes or make financial commitments autonomously.",
      approvalGates: [
        "spend increase",
        "client-facing forecast release",
        "cash allocation change",
        "connector mutation"
      ]
    }
  };
}
