import { db } from "../config/database.js";

export interface ExecutionLogInput {
    triggerType: string;
    status: "SUCCESS" | "FAILED";
    durationMs: number;
    message: string;
    payload?: unknown;
}

export async function saveExecutionLog(
    log: ExecutionLogInput
): Promise<void> {
    const query = `
        INSERT INTO execution_logs
        (
            trigger_type,
            status,
            duration_ms,
            message,
            payload
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    await db.execute(query, [
        log.triggerType,
        log.status,
        log.durationMs,
        log.message,
        log.payload ? JSON.stringify(log.payload) : null,
    ]);
}