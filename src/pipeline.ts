import { getMarketData } from "./services/marketData.js";
import { saveExecutionLog } from "./services/executionLogger.js";
import type { AllocationResponse } from "./types/allocation.js";

export async function runPipeline(
    ticker: string,
    allocationResult?: AllocationResponse,
    triggerType: string = "manual-test"
) {
    const startTime = Date.now();

    try {
        console.log(`Menjalankan pipeline untuk ${ticker}...`);

        const marketData = await getMarketData(ticker);

        console.log("Market data berhasil diterima.");

        const result = {
            ticker,
            marketData,
            allocationResult,
        };

        const durationMs = Date.now() - startTime;

        await saveExecutionLog({
            triggerType,
            status: "SUCCESS",
            durationMs,
            message: "Pipeline berhasil dijalankan",
            payload: {
                ticker,
                allocationResult,
            },
        });

        return result;
    } catch (error) {
        const durationMs = Date.now() - startTime;

        const message =
            error instanceof Error
                ? error.message
                : "Unknown pipeline error";

        await saveExecutionLog({
            triggerType,
            status: "FAILED",
            durationMs,
            message,
            payload: {
                ticker,
            },
        });

        throw error;
    }
}