import {
    runDataEngine,
} from "./dataEngine.js";

import {
    saveExecutionLog,
} from "./executionLogger.js";

import type {
    DataEngineResult,
} from "./dataEngine.js";

export interface DataEngineRunInput {
    tickers: string[];
    budget: number;
    triggerType: string;
}

export async function runDataEngineWithLogging(
    input: DataEngineRunInput
): Promise<DataEngineResult> {
    const startedAt = Date.now();

    try {
        const result = await runDataEngine(
            input.tickers,
            input.budget
        );

        const durationMs =
            Date.now() - startedAt;

        await saveExecutionLog({
            triggerType:
                input.triggerType,

            status: "SUCCESS",

            durationMs,

            message:
                "Data Engine berhasil dijalankan",

            payload: {
                budget: result.budget,

                tickers: input.tickers,

                allocations:
                    result.allocations,

                companyCount:
                    result.companies.length,
            },
        });

        return result;
    } catch (error) {
        const durationMs =
            Date.now() - startedAt;

        const message =
            error instanceof Error
                ? error.message
                : "Unknown Data Engine error";

        await saveExecutionLog({
            triggerType:
                input.triggerType,

            status: "FAILED",

            durationMs,

            message,

            payload: {
                budget: input.budget,

                tickers: input.tickers,
            },
        });

        throw error;
    }
}