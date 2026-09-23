import type { FinancialData } from "../types/financialData.js";

function normalizeMinMax(
    value: number,
    min: number,
    max: number
): number {
    if (max === min) {
        return 100;
    }

    return ((value - min) / (max - min)) * 100;
}

function calculatePayoutScore(payoutRatio: number): number {
    // Payout ratio 30%–70% dianggap sebagai rentang target.
    // Di luar rentang tersebut, score berkurang secara bertahap.
    const lowerBound = 0.30;
    const upperBound = 0.70;

    if (payoutRatio >= lowerBound && payoutRatio <= upperBound) {
        return 100;
    }

    if (payoutRatio < lowerBound) {
        return Math.max(
            0,
            (payoutRatio / lowerBound) * 100
        );
    }

    return Math.max(
        0,
        ((1 - payoutRatio) / (1 - upperBound)) * 100
    );
}

export interface ScoringInput {
    data: FinancialData;

    minDividendYield: number;
    maxDividendYield: number;

    minNetProfit: number;
    maxNetProfit: number;

    minFreeCashFlow?: number;
    maxFreeCashFlow?: number;
}

export interface ScoreBreakdown {
    dividendYieldScore: number;
    payoutRatioScore: number;
    netProfitScore: number;
    freeCashFlowScore: number | null;

    finalScore: number;
}

export function calculateScore(
    input: ScoringInput
): ScoreBreakdown {
    const {
        data,
        minDividendYield,
        maxDividendYield,
        minNetProfit,
        maxNetProfit,
        minFreeCashFlow,
        maxFreeCashFlow,
    } = input;

    const dividendYieldScore = normalizeMinMax(
        data.dividendYield,
        minDividendYield,
        maxDividendYield
    );

    const payoutRatioScore = calculatePayoutScore(
        data.payoutRatio
    );

    const netProfitScore = normalizeMinMax(
        data.netProfit,
        minNetProfit,
        maxNetProfit
    );

    let freeCashFlowScore: number | null = null;

    if (
        data.freeCashFlow !== null &&
        minFreeCashFlow !== undefined &&
        maxFreeCashFlow !== undefined
    ) {
        freeCashFlowScore = normalizeMinMax(
            data.freeCashFlow,
            minFreeCashFlow,
            maxFreeCashFlow
        );
    }

    let finalScore: number;

    if (freeCashFlowScore !== null) {
        // Non-bank
        finalScore =
            dividendYieldScore * 0.30 +
            payoutRatioScore * 0.15 +
            netProfitScore * 0.25 +
            freeCashFlowScore * 0.30;
    } else {
        // Bank:
        // FCF tidak tersedia, sehingga bobot yang tersedia
        // dinormalisasi kembali dari total 70% menjadi 100%.
        finalScore =
            (
                dividendYieldScore * 0.30 +
                payoutRatioScore * 0.15 +
                netProfitScore * 0.25
            ) / 0.70;
    }

    return {
        dividendYieldScore,
        payoutRatioScore,
        netProfitScore,
        freeCashFlowScore,
        finalScore,
    };
}