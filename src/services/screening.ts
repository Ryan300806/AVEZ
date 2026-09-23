import type { FinancialData } from "../types/financialData.js";
import type { ScreeningResult } from "../types/scoring.js";

export function screenCompany(
    data: FinancialData
): ScreeningResult {
    const reasons: string[] = [];

    if (data.netProfit <= 0) {
        reasons.push("Net Profit tidak positif");
    }

    if (data.sector === "NON_BANK") {
        if (data.debtToEquity > 2.0) {
            reasons.push("DER lebih besar dari 2.0");
        }

        if (
            data.freeCashFlow === null ||
            data.freeCashFlow <= 0
        ) {
            reasons.push(
                "FCF tidak positif atau tidak tersedia"
            );
        }
    }

    const status =
        reasons.length === 0
            ? "ELIGIBLE"
            : "ELIMINATED";

    // Allocation eligibility:
    // issuer harus lolos screening terlebih dahulu.
    let allocationEligible = status === "ELIGIBLE";

    // Untuk bank, FCF konvensional belum tersedia.
    // Karena PRD mensyaratkan Positive Cash Flow untuk
    // issuer yang dialokasikan, bank belum boleh masuk
    // allocation sampai cash-flow health dapat diverifikasi.
    if (
        data.sector === "BANK" &&
        data.cashFlowStatus === "UNAVAILABLE"
    ) {
        allocationEligible = false;

        reasons.push(
            "Positive Cash Flow bank belum terverifikasi"
        );
    }

    return {
        ticker: data.ticker,
        sector: data.sector,
        status,
        allocationEligible,
        reasons,
    };
}