import { screenCompany } from "./screening.js";
import type { FinancialData } from "../types/financialData.js";

const testData: FinancialData[] = [
    {
        ticker: "BBCA",
        companyName: "PT Bank Central Asia Tbk.",
        sector: "BANK",

        dividendYield: 0.06145,
        payoutRatio: 0.80149,
        netProfit: 57537287000000,

        totalLiabilities: 1305140000000000,
        totalEquity: 281687555000000,
        debtToEquity: 4.63,

        freeCashFlow: null,
        cashFlowStatus: "UNAVAILABLE",
        cashFlowSource: "UNAVAILABLE",
    },

    {
        ticker: "TLKM",
        companyName: "PT Telkom Indonesia (Persero) Tbk",
        sector: "NON_BANK",

        dividendYield: 0,
        payoutRatio: 0,
        netProfit: 0,

        totalLiabilities: 0,
        totalEquity: 0,
        debtToEquity: 1.5,

        freeCashFlow: 38074000000000,
        cashFlowStatus: "POSITIVE",
        cashFlowSource: "OFFICIAL_REPORT",
    },

    {
        ticker: "ASII",
        companyName: "PT Astra International Tbk",
        sector: "NON_BANK",

        dividendYield: 0,
        payoutRatio: 0,
        netProfit: 0,

        totalLiabilities: 0,
        totalEquity: 0,
        debtToEquity: 2.5,

        freeCashFlow: 28207000000000,
        cashFlowStatus: "POSITIVE",
        cashFlowSource: "OFFICIAL_REPORT",
    },
];

for (const data of testData) {
    const result = screenCompany(data);

    console.log(`\n=== ${data.ticker} ===`);
    console.dir(result, { depth: null });
}