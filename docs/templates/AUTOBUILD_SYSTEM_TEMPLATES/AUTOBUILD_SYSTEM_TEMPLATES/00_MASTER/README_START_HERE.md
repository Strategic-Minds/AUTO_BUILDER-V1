# AI Consultant End-to-End Document System

## Purpose
This package is a human-readable, GPT-ready consulting document system for taking a business from first conversation to a finished autonomous AI system.

It is designed for four delivery levels:
- MVP
- Scaffold
- Production
- Enterprise

It includes:
- exact discovery questions
- pre-development templates
- development templates
- Auto Builder canon inputs
- a benchmark stack recommendation
- handoff structure for GitHub, Vercel, Supabase, Redis, CRM, and scheduler-driven operation

## How to use this package
1. Start with `01_DISCOVERY/MASTER_CLIENT_DISCOVERY_QUESTIONNAIRE.md`.
2. Complete the pre-development documents in `02_PRE_DEVELOPMENT`.
3. Choose the target build level in `04_TRACKS`.
4. Complete the build documents in `03_DEVELOPMENT`.
5. Fill the Auto Builder canon set in `05_AUTO_BUILDER_INPUTS`.
6. Use `06_BENCHMARKS/BENCHMARK_STANDARD_STACK.md` to choose the default stack.
7. Store all finished documents in the client admin control plane.

## Core rule
The documents should define the system before GPT builds the system.

## Expected outcome
When these documents are complete, GPT or an Auto Builder should be able to generate almost the entire system, with the remaining manual work limited to:
- opening accounts
- setting environment variables
- granting connector access
- reviewing final deployment
- performing live acceptance testing
