import type { FinancialData } from "../types/financialData.js";
import { screenCompany } from "./screening.js";
import { calculateScore } from "./scoring.js";

const companies: FinancialData[] = [
    {
        ticker: "TLKM",
        companyName: "PT Telkom Indonesia",
        sector: "NON_BANK",
        dividendYield: 0.05,
        payoutRatio: 0.60,
        netProfit: 25000000000000,
        totalLiabilities: 100000000000000,
        totalEquity: 80000000000000,
        debtToEquity: 1.25,
        freeCashFlow: 38074000000000,
        cashFlowStatus: "POSITIVE",
        cashFlowSource: "OFFICIAL_REPORT",
    },
    {
        ticker: "ASII",
        companyName: "PT Astra International",
        sector: "NON_BANK",
        dividendYield: 0.04,
        payoutRatio: 0.50,
        netProfit: 30000000000000,
        totalLiabilities: 90000000000000,
        totalEquity: 100000000000000,
        debtToEquity: 0.90,
        freeCashFlow: 28207000000000,
        cashFlowStatus: "POSITIVE",
        cashFlowSource: "OFFICIAL_REPORT",
    },
    {
        ticker: "UNVR",
        companyName: "PT Unilever Indonesia",
        sector: "NON_BANK",
        dividendYield: 0.06,
        payoutRatio: 0.70,
        netProfit: 7000000000000,
        totalLiabilities: 15000000000000,
        totalEquity: 5000000000000,
        debtToEquity: 3.0,
        freeCashFlow: 4935200000000,
        cashFlowStatus: "POSITIVE",
        cashFlowSource: "OFFICIAL_REPORT",
    },
];

console.log("\n=== AVEZ SCREENING → SCORING ===\n");

// ========================================
// 1. SCREENING
// ========================================

const screeningResults = companies.map((company) => ({
    company,
    screening: screenCompany(company),
}));

console.log("=== SCREENING RESULT ===\n");

for (const result of screeningResults) {
    console.log(
        `${result.company.ticker}: ${result.screening.status}`
    );

    console.log(
        `  Allocation Eligible: ${
            result.screening.allocationEligible
                ? "YES"
                : "NO"
        }`
    );

    if (result.screening.reasons.length > 0) {
        console.log(
            `  Alasan: ${result.screening.reasons.join(", ")}`
        );
    }
}

// ========================================
// 2. AMBIL YANG BOLEH MASUK ALLOCATION
// ========================================

const eligibleCompanies = screeningResults
    .filter(
        (result) =>
            result.screening.allocationEligible
    )
    .map((result) => result.company);

console.log("\n=== ALLOCATION ELIGIBLE COMPANIES ===\n");

for (const company of eligibleCompanies) {
    console.log(`✓ ${company.ticker}`);
}

// ========================================
// 3. HITUNG MIN/MAX
// ========================================

const minDividendYield = Math.min(
    ...eligibleCompanies.map(
        (company) => company.dividendYield
    )
);

const maxDividendYield = Math.max(
    ...eligibleCompanies.map(
        (company) => company.dividendYield
    )
);

const minNetProfit = Math.min(
    ...eligibleCompanies.map(
        (company) => company.netProfit
    )
);

const maxNetProfit = Math.max(
    ...eligibleCompanies.map(
        (company) => company.netProfit
    )
);

const fcfCompanies = eligibleCompanies.filter(
    (company) =>
        company.freeCashFlow !== null
);

const minFreeCashFlow = Math.min(
    ...fcfCompanies.map(
        (company) => company.freeCashFlow!
    )
);

const maxFreeCashFlow = Math.max(
    ...fcfCompanies.map(
        (company) => company.freeCashFlow!
    )
);

// ========================================
// 4. SCORING
// ========================================

const scoredCompanies = eligibleCompanies.map(
    (company) => {
        const score = calculateScore({
            data: company,

            minDividendYield,
            maxDividendYield,

            minNetProfit,
            maxNetProfit,

            minFreeCashFlow,
            maxFreeCashFlow,
        });

        return {
            company,
            score,
        };
    }
);

// ========================================
// 5. RANKING
// ========================================

scoredCompanies.sort(
    (a, b) =>
        b.score.finalScore -
        a.score.finalScore
);

// ========================================
// 6. OUTPUT
// ========================================

console.log("\n=== FINAL RANKING ===\n");

scoredCompanies.forEach(
    ({ company, score }, index) => {
        console.log(
            `${index + 1}. ${company.ticker}`
        );

        console.log(
            `   Yield Score : ${score.dividendYieldScore.toFixed(2)}`
        );

        console.log(
            `   Payout Score: ${score.payoutRatioScore.toFixed(2)}`
        );

        console.log(
            `   Profit Score: ${score.netProfitScore.toFixed(2)}`
        );

        console.log(
            `   FCF Score   : ${
                score.freeCashFlowScore?.toFixed(2)
            }`
        );

        console.log(
            `   FINAL SCORE : ${score.finalScore.toFixed(2)}`
        );

        console.log(
            "------------------------------"
        );
    }
);