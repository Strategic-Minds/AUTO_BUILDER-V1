# Financial Prediction & Simulation System

## Purpose
Build a governed decision-support system for Chris that can forecast revenue, profit, cash runway, expected value, risk-adjusted upside, and scenario outcomes for offers, lead engines, client systems, SaaS ideas, Shopify growth, retainers, and internal investment decisions.

## Core modules
- Driver-based forecast engine
- Scenario planning
- Monte Carlo simulation with seed control
- Sensitivity analysis
- Attribution-ready data contracts
- Approval gates and governance
- Actual-vs-forecast calibration
- Weekly executive reporting

## Architecture
- Next.js and Vercel for dashboard and approval surface
- Supabase for leads, opportunities, sales, spend, forecasts, simulation runs, and decisions
- Python package under `packages/finance-sim/` for reproducible simulation runs
- Approval queue for spend, cash allocation, client-facing forecast claims, and live connector mutations

## Limits
This system supports decisions. It does not trade securities, guarantee outcomes, move money, increase ad spend, or commit resources autonomously.

## Validation requirements
- Formula scan
- Simulation seed reproducibility
- Data freshness checks
- Source-backed assumptions
- Approval gate test
- Actual-vs-forecast drift review

## First implementation order
1. Replace placeholder assumptions with source-backed data
2. Apply the finance schema migration
3. Run the Python simulation scaffold with fixed seed control
4. Expose scenarios and decision signals through the dashboard
5. Add actual-vs-forecast calibration and weekly boss report
