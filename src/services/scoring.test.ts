import type { FinancialData } from "../types/financialData.js";
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
        debtToEquity: 0.9,
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
        debtToEquity: 3,
        freeCashFlow: 4935200000000,
        cashFlowStatus: "POSITIVE",
        cashFlowSource: "OFFICIAL_REPORT",
    },
];

const minDividendYield = Math.min(
    ...companies.map((company) => company.dividendYield)
);

const maxDividendYield = Math.max(
    ...companies.map((company) => company.dividendYield)
);

const minNetProfit = Math.min(
    ...companies.map((company) => company.netProfit)
);

const maxNetProfit = Math.max(
    ...companies.map((company) => company.netProfit)
);

const minFreeCashFlow = Math.min(
    ...companies.map((company) => company.freeCashFlow ?? 0)
);

const maxFreeCashFlow = Math.max(
    ...companies.map((company) => company.freeCashFlow ?? 0)
);

console.log("\n=== AVEZ SCORING TEST ===\n");

for (const company of companies) {
    const result = calculateScore({
        data: company,

        minDividendYield,
        maxDividendYield,

        minNetProfit,
        maxNetProfit,

        minFreeCashFlow,
        maxFreeCashFlow,
    });

    console.log(company.ticker);
    console.log("Dividend Yield Score :", result.dividendYieldScore.toFixed(2));
    console.log("Payout Ratio Score   :", result.payoutRatioScore.toFixed(2));
    console.log("Net Profit Score     :", result.netProfitScore.toFixed(2));
    console.log("FCF Score            :", result.freeCashFlowScore?.toFixed(2));
    console.log("FINAL SCORE          :", result.finalScore.toFixed(2));
    console.log("------------------------------");
}