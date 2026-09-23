export type CompanySector =
    | "BANK"
    | "NON_BANK";

export interface FinancialData {
    ticker: string;
    companyName: string;
    sector: CompanySector;

    dividendYield: number;
    payoutRatio: number;
    netProfit: number;

    totalLiabilities: number;
    totalEquity: number;
    debtToEquity: number;

    freeCashFlow: number | null;

    cashFlowStatus:
        | "POSITIVE"
        | "NEGATIVE"
        | "NOT_APPLICABLE"
        | "UNAVAILABLE";

    cashFlowSource:
        | "SECTORS"
        | "OFFICIAL_REPORT"
        | "UNAVAILABLE";
}