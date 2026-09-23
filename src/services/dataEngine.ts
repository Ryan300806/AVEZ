import { getCompanyReport } from "./sectors.js";
import { mapFinancialData } from "./dataMapper.js";
import { screenCompany } from "./screening.js";
import { calculateScore } from "./scoring.js";
import { allocateBudget } from "./allocation.js";

import type { FinancialData } from "../types/financialData.js";
import type { ScreeningResult } from "../types/scoring.js";
import type {
    AllocationOutput,
    AllocationInput,
} from "./allocation.js";

export interface DataEngineCompanyResult {
    financialData: FinancialData;
    screening: ScreeningResult;
    score: number | null;
}

export interface DataEngineResult {
    budget: number;
    companies: DataEngineCompanyResult[];
    allocations: AllocationOutput[];
    disclaimer: string;
}

export async function runDataEngine(
    tickers: string[],
    budget: number
): Promise<DataEngineResult> {
    if (budget <= 0) {
        throw new Error(
            "Budget harus lebih besar dari 0"
        );
    }

    if (tickers.length === 0) {
        throw new Error(
            "Minimal satu ticker harus diberikan"
        );
    }

    // ========================================
    // 1. NORMALISASI + HILANGKAN DUPLIKAT
    // ========================================

    const normalizedTickers = [
        ...new Set(
            tickers
                .map((ticker) =>
                    ticker.trim().toUpperCase()
                )
                .filter(Boolean)
        ),
    ];

    if (normalizedTickers.length === 0) {
        throw new Error(
            "Tidak ada ticker yang valid"
        );
    }

    // ========================================
    // 2. AMBIL DATA SECTORS API SECARA PARALEL
    // ========================================

    const results: DataEngineCompanyResult[] =
        await Promise.all(
            normalizedTickers.map(
                async (ticker) => {
                    const report =
                        await getCompanyReport(
                            ticker
                        );

                    const financialData =
                        mapFinancialData(
                            ticker,
                            report
                        );

                    const screening =
                        screenCompany(
                            financialData
                        );

                    return {
                        financialData,
                        screening,
                        score: null,
                    };
                }
            )
        );

    // ========================================
    // 3. AMBIL COMPANY YANG BOLEH ALLOCATION
    // ========================================

    const eligibleResults =
        results.filter(
            (result) =>
                result.screening
                    .allocationEligible
        );

    if (eligibleResults.length === 0) {
        return {
            budget,
            companies: results,
            allocations: [],
            disclaimer:
                "Tidak ada emiten yang memenuhi kriteria allocation AVEZ.",
        };
    }

    // ========================================
    // 4. HITUNG MIN/MAX
    // ========================================

    const minDividendYield =
        Math.min(
            ...eligibleResults.map(
                (result) =>
                    result.financialData
                        .dividendYield
            )
        );

    const maxDividendYield =
        Math.max(
            ...eligibleResults.map(
                (result) =>
                    result.financialData
                        .dividendYield
            )
        );

    const minNetProfit =
        Math.min(
            ...eligibleResults.map(
                (result) =>
                    result.financialData
                        .netProfit
            )
        );

    const maxNetProfit =
        Math.max(
            ...eligibleResults.map(
                (result) =>
                    result.financialData
                        .netProfit
            )
        );

    const fcfResults =
        eligibleResults.filter(
            (result) =>
                result.financialData
                    .freeCashFlow !== null
        );

    const minFreeCashFlow =
        fcfResults.length > 0
            ? Math.min(
                  ...fcfResults.map(
                      (result) =>
                          result.financialData
                              .freeCashFlow!
                  )
              )
            : undefined;

    const maxFreeCashFlow =
        fcfResults.length > 0
            ? Math.max(
                  ...fcfResults.map(
                      (result) =>
                          result.financialData
                              .freeCashFlow!
                  )
              )
            : undefined;

    // ========================================
    // 5. SCORING
    // ========================================

    const allocationInputs:
        AllocationInput[] = [];

    for (const result of eligibleResults) {
        const scoreResult =
            calculateScore({
                data: result.financialData,

                minDividendYield,
                maxDividendYield,

                minNetProfit,
                maxNetProfit,

                minFreeCashFlow,
                maxFreeCashFlow,
            });

        result.score =
            scoreResult.finalScore;

        allocationInputs.push({
            ticker:
                result.financialData.ticker,

            companyName:
                result.financialData
                    .companyName,

            score:
                scoreResult.finalScore,

            dividendYield:
                result.financialData
                    .dividendYield,
        });
    }

    // ========================================
    // 6. ALLOCATION
    // ========================================

    const allocations =
        allocateBudget(
            budget,
            allocationInputs
        );

    // ========================================
    // 7. RETURN RESULT
    // ========================================

    return {
        budget,
        companies: results,
        allocations,
        disclaimer:
            "Hasil AVEZ merupakan analisis dan rekomendasi alokasi berbasis data fundamental, bukan instruksi untuk melakukan transaksi otomatis.",
    };
}