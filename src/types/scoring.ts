export type ScreeningStatus =
    | "ELIGIBLE"
    | "ELIMINATED";

export interface ScreeningResult {
    ticker: string;
    sector: "BANK" | "NON_BANK";
    status: ScreeningStatus;
    allocationEligible: boolean;
    reasons: string[];
}

export interface ScoreResult {
    ticker: string;
    score: number;
    screening: ScreeningResult;
}