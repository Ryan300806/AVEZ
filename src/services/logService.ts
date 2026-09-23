import { db } from "../config/database.js";

export interface ExecutionLog {
    id: number;
    executedAt: Date;
    triggerType: string;
    status: "SUCCESS" | "FAILED";
    durationMs: number | null;
    message: string | null;
}

interface ExecutionLogRow {
    id: number;
    executed_at: Date;
    trigger_type: string;
    status: "SUCCESS" | "FAILED";
    duration_ms: number | null;
    message: string | null;
}

export async function getExecutionLogs(
    status?: "SUCCESS" | "FAILED"
): Promise<ExecutionLog[]> {

    let query = `
        SELECT
            id,
            executed_at,
            trigger_type,
            status,
            duration_ms,
            message
        FROM execution_logs
    `;

    const params: string[] = [];

    if (status) {
        query += `
            WHERE status = ?
        `;

        params.push(status);
    }

    query += `
        ORDER BY executed_at DESC
    `;

    const [rows] = await db.execute(query, params);

    return (rows as ExecutionLogRow[]).map((row) => ({
        id: row.id,
        executedAt: row.executed_at,
        triggerType: row.trigger_type,
        status: row.status,
        durationMs: row.duration_ms,
        message: row.message,
    }));
}

export async function getExecutionLogById(
    id: number
): Promise<ExecutionLog | null> {

    const query = `
        SELECT
            id,
            executed_at,
            trigger_type,
            status,
            duration_ms,
            message
        FROM execution_logs
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(query, [id]);

    const row = (rows as ExecutionLogRow[])[0];

    if (!row) {
        return null;
    }

    return {
        id: row.id,
        executedAt: row.executed_at,
        triggerType: row.trigger_type,
        status: row.status,
        durationMs: row.duration_ms,
        message: row.message,
    };
}