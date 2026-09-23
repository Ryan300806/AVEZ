import type { SectorsCompanyReport } from "../types/sectors.js";
import type { FinancialData } from "../types/financialData.js";
import { getFCFData } from "./fcfService.js";

const BANK_TICKERS = new Set([
    "BBCA",
    "BBRI",
    "BMRI",
    "BBNI",
    "BRIS",
    "BBTN",
]);

export function mapFinancialData(
    ticker: string,
    report: SectorsCompanyReport
): FinancialData {
    const normalizedTicker = ticker.trim().toUpperCase();

    const sector = BANK_TICKERS.has(normalizedTicker)
        ? "BANK"
        : "NON_BANK";

    const company = report.peers
        .flatMap((peer) => peer.peers_data.companies)
        .find(
            (item) =>
                item.symbol === `${normalizedTicker}.JK` &&
                item.year === 2025
        );

    if (!company) {
        throw new Error(
            `Data finansial ${normalizedTicker} tahun 2025 tidak ditemukan dari Sectors API`
        );
    }

    const dividendYield =
        typeof report.dividend?.yield_ttm === "number"
            ? report.dividend.yield_ttm
            : 0;

    const payoutRatio =
        typeof report.dividend?.payout_ratio === "number"
            ? report.dividend.payout_ratio
            : 0;

    const totalLiabilities = company.total_liabilities;
    const totalEquity = company.total_equity;

    const debtToEquity =
        totalEquity !== 0
            ? totalLiabilities / totalEquity
            : 0;

    const fcfData = getFCFData(normalizedTicker);

    let cashFlowStatus: FinancialData["cashFlowStatus"] =
        "UNAVAILABLE";

    if (fcfData?.status === "AVAILABLE") {
        cashFlowStatus =
            (fcfData.freeCashFlow ?? 0) > 0
                ? "POSITIVE"
                : "NEGATIVE";
    }

    return {
        ticker: normalizedTicker,
        companyName: company.company_name,
        sector,

        dividendYield,
        payoutRatio,
        netProfit: company.net_income,

        totalLiabilities,
        totalEquity,
        debtToEquity,

        freeCashFlow: fcfData?.freeCashFlow ?? null,

        cashFlowStatus,

        cashFlowSource: fcfData
            ? fcfData.source
            : "UNAVAILABLE",
    };
}