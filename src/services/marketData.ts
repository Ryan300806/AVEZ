import { getCompanyReport } from "./sectors.js";
import type { SectorsCompanyReport } from "../types/sectors.js";

export async function getMarketData(
    ticker: string
): Promise<SectorsCompanyReport> {
    return await getCompanyReport(ticker);
}