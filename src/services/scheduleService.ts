import { db } from "../config/database.js";

export type ScheduleType =
    | "ONCE"
    | "DAILY"
    | "WEEKLY";

export interface Schedule {
    id: number;
    name: string;
    tickers: string[];
    budget: number;
    scheduleType: ScheduleType;
    scheduleValue: string;
    isActive: boolean;
    nextRunAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateScheduleInput {
    name: string;
    tickers: string[];
    budget: number;
    scheduleType: ScheduleType;
    scheduleValue: string;
    nextRunAt?: Date | null;
}

export interface UpdateScheduleInput {
    name?: string;
    tickers?: string[];
    budget?: number;
    scheduleType?: ScheduleType;
    scheduleValue?: string;
    isActive?: boolean;
    nextRunAt?: Date | null;
}

interface ScheduleRow {
    id: number;
    name: string;
    tickers: string | string[];
    budget: number;
    schedule_type: ScheduleType;
    schedule_value: string;
    is_active: number | boolean;
    next_run_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

function mapSchedule(
    row: ScheduleRow
): Schedule {
    let tickers: string[];

    if (Array.isArray(row.tickers)) {
        tickers = row.tickers;
    } else {
        tickers = JSON.parse(row.tickers);
    }

    return {
        id: row.id,
        name: row.name,
        tickers,
        budget: Number(row.budget),
        scheduleType: row.schedule_type,
        scheduleValue: row.schedule_value,
        isActive: Boolean(row.is_active),
        nextRunAt: row.next_run_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function validateScheduleInput(
    input: CreateScheduleInput
): void {
    if (!input.name.trim()) {
        throw new Error(
            "Nama schedule tidak boleh kosong"
        );
    }

    if (
        !Array.isArray(input.tickers) ||
        input.tickers.length === 0
    ) {
        throw new Error(
            "Minimal satu ticker harus diberikan"
        );
    }

    if (
        !Number.isFinite(input.budget) ||
        input.budget <= 0
    ) {
        throw new Error(
            "Budget harus lebih besar dari 0"
        );
    }

    if (
        !["ONCE", "DAILY", "WEEKLY"].includes(
            input.scheduleType
        )
    ) {
        throw new Error(
            "Schedule type tidak valid"
        );
    }

    if (!input.scheduleValue.trim()) {
        throw new Error(
            "Schedule value tidak boleh kosong"
        );
    }
}

export async function createSchedule(
    input: CreateScheduleInput
): Promise<Schedule> {
    validateScheduleInput(input);

    const normalizedTickers = [
        ...new Set(
            input.tickers
                .map((ticker) =>
                    ticker.trim().toUpperCase()
                )
                .filter(Boolean)
        ),
    ];

    if (normalizedTickers.length === 0) {
        throw new Error(
            "Tidak ada ticker yang valid"
        );
    }

    const query = `
        INSERT INTO schedules
        (
            name,
            tickers,
            budget,
            schedule_type,
            schedule_value,
            is_active,
            next_run_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
        input.name.trim(),
        JSON.stringify(normalizedTickers),
        input.budget,
        input.scheduleType,
        input.scheduleValue.trim(),
        true,
        input.nextRunAt ?? null,
    ]);

    const insertId = (
        result as { insertId: number }
    ).insertId;

    const schedule =
        await getScheduleById(insertId);

    if (!schedule) {
        throw new Error(
            "Schedule berhasil dibuat tetapi tidak dapat ditemukan"
        );
    }

    return schedule;
}

export async function getSchedules(
    activeOnly: boolean = false
): Promise<Schedule[]> {
    let query = `
        SELECT
            id,
            name,
            tickers,
            budget,
            schedule_type,
            schedule_value,
            is_active,
            next_run_at,
            created_at,
            updated_at
        FROM schedules
    `;

    if (activeOnly) {
        query += `
            WHERE is_active = TRUE
        `;
    }

    query += `
        ORDER BY id ASC
    `;

    const [rows] = await db.execute(
        query
    );

    return (rows as ScheduleRow[]).map(
        mapSchedule
    );
}

export async function getScheduleById(
    id: number
): Promise<Schedule | null> {
    const query = `
        SELECT
            id,
            name,
            tickers,
            budget,
            schedule_type,
            schedule_value,
            is_active,
            next_run_at,
            created_at,
            updated_at
        FROM schedules
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(
        query,
        [id]
    );

    const row =
        (rows as ScheduleRow[])[0];

    if (!row) {
        return null;
    }

    return mapSchedule(row);
}

export async function updateSchedule(
    id: number,
    input: UpdateScheduleInput
): Promise<Schedule | null> {
    const existing =
        await getScheduleById(id);

    if (!existing) {
        return null;
    }

    const name =
        input.name !== undefined
            ? input.name.trim()
            : existing.name;

    const tickers =
        input.tickers !== undefined
            ? [
                  ...new Set(
                      input.tickers
                          .map((ticker) =>
                              ticker
                                  .trim()
                                  .toUpperCase()
                          )
                          .filter(Boolean)
                  ),
              ]
            : existing.tickers;

    const budget =
        input.budget !== undefined
            ? input.budget
            : existing.budget;

    const scheduleType =
        input.scheduleType !== undefined
            ? input.scheduleType
            : existing.scheduleType;

    const scheduleValue =
        input.scheduleValue !== undefined
            ? input.scheduleValue.trim()
            : existing.scheduleValue;

    const isActive =
        input.isActive !== undefined
            ? input.isActive
            : existing.isActive;

    const nextRunAt =
        input.nextRunAt !== undefined
            ? input.nextRunAt
            : existing.nextRunAt;

    validateScheduleInput({
        name,
        tickers,
        budget,
        scheduleType,
        scheduleValue,
        nextRunAt,
    });

    const query = `
        UPDATE schedules
        SET
            name = ?,
            tickers = ?,
            budget = ?,
            schedule_type = ?,
            schedule_value = ?,
            is_active = ?,
            next_run_at = ?
        WHERE id = ?
    `;

    await db.execute(query, [
        name,
        JSON.stringify(tickers),
        budget,
        scheduleType,
        scheduleValue,
        isActive,
        nextRunAt,
        id,
    ]);

    return await getScheduleById(id);
}

export async function deleteSchedule(
    id: number
): Promise<boolean> {
    const query = `
        DELETE FROM schedules
        WHERE id = ?
    `;

    const [result] = await db.execute(
        query,
        [id]
    );

    const affectedRows = (
        result as { affectedRows: number }
    ).affectedRows;

    return affectedRows > 0;
}

export async function setScheduleActive(
    id: number,
    isActive: boolean
): Promise<Schedule | null> {
    const query = `
        UPDATE schedules
        SET is_active = ?
        WHERE id = ?
    `;

    await db.execute(query, [
        isActive,
        id,
    ]);

    return await getScheduleById(id);
}

export async function updateNextRunAt(
    id: number,
    nextRunAt: Date | null
): Promise<void> {
    const query = `
        UPDATE schedules
        SET next_run_at = ?
        WHERE id = ?
    `;

    await db.execute(query, [
        nextRunAt,
        id,
    ]);
}