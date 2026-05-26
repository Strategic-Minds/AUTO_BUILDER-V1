insert into public.forecasts (
  version,
  owner,
  inputs_json,
  output_json,
  confidence
)
values (
  'chris-baseline-v1',
  'Chris',
  jsonb_build_object(
    'startingMonthlyLeads', 150,
    'monthlyLeadGrowth', 0.08,
    'leadToCallRate', 0.22,
    'callCloseRate', 0.28,
    'averageOrderValue', 4500,
    'grossMargin', 0.65,
    'monthlyFixedOpex', 45000,
    'cacPerLead', 45,
    'sourceProfile', jsonb_build_object(
      'owner', 'Chris',
      'profile', 'mentor-boss-finance-command-center',
      'source', 'AUTO_BUILDER Financial Prediction Simulation workbook',
      'mode', 'seeded-assumption-model'
    )
  ),
  jsonb_build_object(
    'summary', jsonb_build_object(
      'month', 12,
      'totalRevenue', 430627.24532880925,
      'grossProfit', 279907.70946372603,
      'netProfit', 219169.1462336074
    ),
    'scenarios', jsonb_build_array(
      jsonb_build_object('name','downside','probability',0.25,'leadGrowth',0.01,'closeRate',0.16,'averageOrderValue',3200,'grossMargin',0.5,'monthlyFixedOpex',55000),
      jsonb_build_object('name','base','probability',0.5,'leadGrowth',0.08,'closeRate',0.28,'averageOrderValue',4500,'grossMargin',0.65,'monthlyFixedOpex',45000),
      jsonb_build_object('name','upside','probability',0.25,'leadGrowth',0.14,'closeRate',0.36,'averageOrderValue',6200,'grossMargin',0.75,'monthlyFixedOpex',50000)
    )
  ),
  'medium'
)
on conflict do nothing;

insert into public.simulation_runs (
  seed,
  model_version,
  inputs_hash,
  outputs_json
)
values (
  42,
  'finance-sim-v1',
  'chris-baseline-seeded-workbook-model',
  jsonb_build_object(
    'runs', 1000,
    'months', 36,
    'meanNpv', 3454663.61,
    'medianNpv', 1766971.06,
    'p10Npv', -744085.84,
    'p90Npv', 9578908.96,
    'lossProbability', 0.23,
    'interpretation', 'Uploaded workbook assumptions support a high-upside but still risky model. Downside protection and approval gates remain mandatory.'
  )
)
on conflict do nothing;

insert into public.decisions (
  forecast_id,
  decision_type,
  decision_signal,
  approval_status,
  evidence_json
)
select
  forecast_id,
  'executive_review',
  'seeded_baseline_ready_for_operator_review',
  'needs_review',
  jsonb_build_object(
    'requiredApprovals', jsonb_build_array(
      'spend increase',
      'client-facing forecast release',
      'cash allocation change',
      'connector mutation'
    ),
    'riskSummary', jsonb_build_object(
      'lossProbability', 0.23,
      'p10Npv', -744085.84,
      'meanNpv', 3454663.61
    )
  )
from public.forecasts
where version = 'chris-baseline-v1'
on conflict do nothing;
