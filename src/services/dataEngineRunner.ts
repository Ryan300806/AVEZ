import {
    runDataEngine,
} from "./dataEngine.js";

import {
    saveExecutionLog,
} from "./executionLogger.js";

import {
    buildTelegramMessage,
} from "./notificationService.js";

import {
    sendTelegramMessage,
} from "./telegramService.js";

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
        // ========================================
        // 1. RUN DATA ENGINE
        // ========================================

        const result = await runDataEngine(
            input.tickers,
            input.budget
        );

        const durationMs =
            Date.now() - startedAt;

        // ========================================
        // 2. SAVE EXECUTION LOG
        // ========================================

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

        // ========================================
        // 3. BUILD TELEGRAM MESSAGE
        // ========================================

        const telegramMessage =
            buildTelegramMessage(result);

        // ========================================
        // 4. SEND TELEGRAM NOTIFICATION
        // ========================================

        try {
            await sendTelegramMessage(
                telegramMessage
            );

            console.log(
                "[Notification] Telegram berhasil dikirim"
            );
        } catch (notificationError) {
            console.error(
                "[Notification] Gagal mengirim Telegram:",
                notificationError
            );
        }

        // ========================================
        // 5. RETURN RESULT
        // ========================================

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