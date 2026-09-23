import fcfDataJson from "../data/fcf.json";

export interface FCFData {
    ticker: string;
    period: string;
    operatingCashFlow: number | null;
    capitalExpenditure: number | null;
    freeCashFlow: number | null;
    status:
        | "AVAILABLE"
        | "NOT_APPLICABLE"
        | "UNAVAILABLE";
    source:
        | "SECTORS"
        | "OFFICIAL_REPORT"
        | "UNAVAILABLE";
    sourceType: "FINANCIAL_STATEMENT";
}

const fcfData = fcfDataJson as FCFData[];

export function getFCFData(ticker: string): FCFData | null {
    const normalizedTicker = ticker.trim().toUpperCase();

    const result = fcfData.find(
        (item) => item.ticker === normalizedTicker
    );

    return result ?? null;
}