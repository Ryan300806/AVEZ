import {
    getSchedules,
    updateNextRunAt,
} from "./scheduleService.js";

import {
    runDataEngineWithLogging,
} from "./dataEngineRunner.js";

import type {
    Schedule,
} from "./scheduleService.js";

const CHECK_INTERVAL_MS = 30_000;

let schedulerTimer:
    ReturnType<typeof setInterval> | null = null;

let isRunning = false;

function calculateNextRun(
    schedule: Schedule,
    fromDate: Date
): Date | null {
    const nextRun = new Date(fromDate);

    switch (schedule.scheduleType) {
        case "ONCE":
            return null;

        case "DAILY": {
            const [hours, minutes] =
                schedule.scheduleValue
                    .split(":")
                    .map(Number);

            if (
                !Number.isInteger(hours) ||
                !Number.isInteger(minutes) ||
                hours < 0 ||
                hours > 23 ||
                minutes < 0 ||
                minutes > 59
            ) {
                throw new Error(
                    `Format waktu DAILY tidak valid untuk schedule ${schedule.id}`
                );
            }

            nextRun.setHours(
                hours,
                minutes,
                0,
                0
            );

            if (nextRun <= fromDate) {
                nextRun.setDate(
                    nextRun.getDate() + 1
                );
            }

            return nextRun;
        }

        case "WEEKLY": {
            const [dayString, timeString] =
                schedule.scheduleValue.split(" ");

            const day =
                Number(dayString);

            const [
                hours,
                minutes,
            ] = (timeString ?? "")
                .split(":")
                .map(Number);

            if (
                !Number.isInteger(day) ||
                day < 0 ||
                day > 6 ||
                !Number.isInteger(hours) ||
                !Number.isInteger(minutes) ||
                hours < 0 ||
                hours > 23 ||
                minutes < 0 ||
                minutes > 59
            ) {
                throw new Error(
                    `Format waktu WEEKLY tidak valid untuk schedule ${schedule.id}`
                );
            }

            nextRun.setHours(
                hours,
                minutes,
                0,
                0
            );

            const currentDay =
                nextRun.getDay();

            let daysUntil =
                day - currentDay;

            if (
                daysUntil < 0 ||
                (
                    daysUntil === 0 &&
                    nextRun <= fromDate
                )
            ) {
                daysUntil += 7;
            }

            nextRun.setDate(
                nextRun.getDate() +
                    daysUntil
            );

            return nextRun;
        }

        default:
            throw new Error(
                `Schedule type tidak dikenal: ${schedule.scheduleType}`
            );
    }
}

async function executeSchedule(
    schedule: Schedule
): Promise<void> {
    console.log(
        `[Scheduler] Menjalankan schedule #${schedule.id} - ${schedule.name}`
    );

    try {
        await runDataEngineWithLogging({
            tickers: schedule.tickers,
            budget: schedule.budget,
            triggerType: "SCHEDULER",
        });

        console.log(
            `[Scheduler] Schedule #${schedule.id} berhasil`
        );
    } catch (error) {
        console.error(
            `[Scheduler] Schedule #${schedule.id} gagal:`,
            error
        );
    }

    const now = new Date();

    const nextRun =
        calculateNextRun(
            schedule,
            now
        );

    await updateNextRunAt(
        schedule.id,
        nextRun
    );

    if (nextRun) {
        console.log(
            `[Scheduler] Schedule #${schedule.id} berikutnya: ${nextRun.toISOString()}`
        );
    } else {
        console.log(
            `[Scheduler] Schedule #${schedule.id} selesai`
        );
    }
}

async function checkSchedules(): Promise<void> {
    if (isRunning) {
        return;
    }

    isRunning = true;

    try {
        const schedules =
            await getSchedules(true);

        const now = new Date();

        for (const schedule of schedules) {
            if (!schedule.nextRunAt) {
                const nextRun =
                    calculateNextRun(
                        schedule,
                        now
                    );

                await updateNextRunAt(
                    schedule.id,
                    nextRun
                );

                continue;
            }

            if (
                schedule.nextRunAt <= now
            ) {
                await executeSchedule(
                    schedule
                );
            }
        }
    } catch (error) {
        console.error(
            "[Scheduler] Gagal mengecek schedules:",
            error
        );
    } finally {
        isRunning = false;
    }
}

/**
 * Menjalankan satu kali pengecekan scheduler.
 * Digunakan untuk testing atau trigger manual.
 */
export async function runSchedulerCheck(): Promise<void> {
    await checkSchedules();
}

export function startScheduler(): void {
    if (schedulerTimer) {
        console.log(
            "[Scheduler] Sudah berjalan"
        );

        return;
    }

    console.log(
        "[Scheduler] Scheduler dimulai"
    );

    void checkSchedules();

    schedulerTimer = setInterval(
        () => {
            void checkSchedules();
        },
        CHECK_INTERVAL_MS
    );
}

export function stopScheduler(): void {
    if (!schedulerTimer) {
        return;
    }

    clearInterval(schedulerTimer);

    schedulerTimer = null;

    console.log(
        "[Scheduler] Scheduler dihentikan"
    );
}