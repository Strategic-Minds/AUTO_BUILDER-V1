from dataclasses import dataclass
from random import Random
from statistics import mean, median


@dataclass
class FinanceInputs:
    starting_leads: float = 150
    lead_growth_low: float = 0.00
    lead_growth_mode: float = 0.08
    lead_growth_high: float = 0.16
    lead_to_call_rate: float = 0.22
    close_rate_low: float = 0.12
    close_rate_mode: float = 0.28
    close_rate_high: float = 0.42
    aov_low: float = 3000
    aov_mode: float = 4500
    aov_high: float = 7500
    gross_margin_low: float = 0.45
    gross_margin_mode: float = 0.65
    gross_margin_high: float = 0.80
    cac_low: float = 30
    cac_mode: float = 45
    cac_high: float = 95
    fixed_opex_low: float = 35000
    fixed_opex_mode: float = 45000
    fixed_opex_high: float = 70000


def triangular(rand: Random, low: float, mode: float, high: float) -> float:
    return rand.triangular(low, high, mode)


def run_simulation(seed: int = 42, runs: int = 1000, months: int = 36):
    rand = Random(seed)
    inputs = FinanceInputs()
    npvs = []

    for _ in range(runs):
        leads = inputs.starting_leads
        total_profit = 0.0
        growth = triangular(rand, inputs.lead_growth_low, inputs.lead_growth_mode, inputs.lead_growth_high)
        close_rate = triangular(rand, inputs.close_rate_low, inputs.close_rate_mode, inputs.close_rate_high)
        aov = triangular(rand, inputs.aov_low, inputs.aov_mode, inputs.aov_high)
        margin = triangular(rand, inputs.gross_margin_low, inputs.gross_margin_mode, inputs.gross_margin_high)
        cac = triangular(rand, inputs.cac_low, inputs.cac_mode, inputs.cac_high)
        opex = triangular(rand, inputs.fixed_opex_low, inputs.fixed_opex_mode, inputs.fixed_opex_high)

        for _month in range(months):
            calls = leads * inputs.lead_to_call_rate
            customers = calls * close_rate
            revenue = customers * aov
            gross_profit = revenue * margin
            spend = leads * cac
            net_profit = gross_profit - spend - opex
            total_profit += net_profit
            leads *= (1 + growth)

        npvs.append(total_profit)

    sorted_npvs = sorted(npvs)
    loss_probability = sum(1 for value in npvs if value < 0) / len(npvs)
    return {
        "seed": seed,
        "runs": runs,
        "mean_npv": mean(npvs),
        "median_npv": median(npvs),
        "p10_npv": sorted_npvs[int(len(sorted_npvs) * 0.10)],
        "p90_npv": sorted_npvs[int(len(sorted_npvs) * 0.90)],
        "loss_probability": loss_probability,
    }


if __name__ == "__main__":
    print(run_simulation())
