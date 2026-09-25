import {
    getSchedules,
    updateNextRunAt,
    setScheduleActive,
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

/**
 * Menghitung jadwal eksekusi berikutnya.
 *
 * DAILY:
 *   scheduleValue = "08:00"
 *
 * WEEKLY:
 *   scheduleValue = "1 08:00"
 *   0 = Minggu
 *   1 = Senin
 *   ...
 *   6 = Sabtu
 *
 * ONCE:
 *   Tidak mempunyai jadwal berikutnya.
 */
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

            /*
             * Jika waktu hari ini sudah lewat,
             * jadwalkan untuk besok.
             */
            if (nextRun <= fromDate) {
                nextRun.setDate(
                    nextRun.getDate() + 1
                );
            }

            return nextRun;
        }

        case "WEEKLY": {
            const parts =
                schedule.scheduleValue.trim().split(/\s+/);

            if (parts.length !== 2) {
                throw new Error(
                    `Format waktu WEEKLY tidak valid untuk schedule ${schedule.id}. Gunakan "day HH:mm".`
                );
            }

            const [
                dayString,
                timeString,
            ] = parts;

            const day =
                Number(dayString);

            const [
                hours,
                minutes,
            ] = timeString
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

            /*
             * Jika hari target sudah lewat,
             * atau hari sama tetapi jam sudah lewat,
             * jadwalkan minggu berikutnya.
             */
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

/**
 * Menjalankan satu schedule.
 *
 * Setelah execution:
 * - ONCE → schedule dinonaktifkan.
 * - DAILY/WEEKLY → nextRunAt dihitung ulang.
 */
async function executeSchedule(
    schedule: Schedule
): Promise<void> {
    console.log(
        `[Scheduler] Menjalankan schedule #${schedule.id} - ${schedule.name}`
    );

    let executionSuccess = false;

    try {
        await runDataEngineWithLogging({
            tickers: schedule.tickers,
            budget: schedule.budget,
            triggerType: "SCHEDULER",
        });

        executionSuccess = true;

        console.log(
            `[Scheduler] Schedule #${schedule.id} berhasil`
        );
    } catch (error) {
        console.error(
            `[Scheduler] Schedule #${schedule.id} gagal:`,
            error
        );
    }

    /*
     * Waktu dasar untuk menghitung jadwal berikutnya.
     *
     * Kita menggunakan waktu sekarang setelah execution
     * selesai supaya nextRunAt tidak kembali ke waktu
     * yang sudah terlewat.
     */
    const now = new Date();

    try {
        /*
         * ONCE:
         *
         * Schedule hanya boleh berjalan satu kali.
         * Setelah execution selesai, nonaktifkan schedule.
         */
        if (schedule.scheduleType === "ONCE") {
            await setScheduleActive(
                schedule.id,
                false
            );

            await updateNextRunAt(
                schedule.id,
                null
            );

            console.log(
                `[Scheduler] Schedule #${schedule.id} selesai dan dinonaktifkan`
            );

            return;
        }

        /*
         * DAILY / WEEKLY:
         *
         * Hitung jadwal berikutnya.
         */
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
        }

        /*
         * executionSuccess hanya digunakan untuk
         * logging/diagnostic di sini.
         *
         * Schedule recurring tetap dijadwalkan ulang
         * meskipun execution sebelumnya gagal.
         */
        if (!executionSuccess) {
            console.log(
                `[Scheduler] Schedule #${schedule.id} tetap aktif untuk eksekusi berikutnya`
            );
        }
    } catch (error) {
        /*
         * Jangan sampai error saat update schedule
         * membuat scheduler crash secara keseluruhan.
         */
        console.error(
            `[Scheduler] Gagal memperbarui schedule #${schedule.id}:`,
            error
        );
    }
}

/**
 * Melakukan satu kali pengecekan terhadap seluruh
 * schedule aktif.
 *
 * Fungsi ini menggunakan lock sederhana melalui
 * isRunning agar dua proses checkSchedules()
 * tidak berjalan bersamaan.
 */
async function checkSchedules(): Promise<void> {
    if (isRunning) {
        console.log(
            "[Scheduler] Check sebelumnya masih berjalan, skip."
        );

        return;
    }

    isRunning = true;

    try {
        const schedules =
            await getSchedules(true);

        const now = new Date();

        for (const schedule of schedules) {
            /*
             * Jika schedule belum mempunyai nextRunAt,
             * tentukan jadwal berikutnya terlebih dahulu.
             */
            if (!schedule.nextRunAt) {
                /*
                 * ONCE tanpa nextRunAt tidak mempunyai
                 * waktu eksekusi yang bisa digunakan.
                 *
                 * Kita skip agar tidak terjadi eksekusi
                 * yang tidak terduga.
                 */
                if (
                    schedule.scheduleType ===
                    "ONCE"
                ) {
                    console.warn(
                        `[Scheduler] Schedule ONCE #${schedule.id} tidak memiliki nextRunAt, dilewati.`
                    );

                    continue;
                }

                const nextRun =
                    calculateNextRun(
                        schedule,
                        now
                    );

                await updateNextRunAt(
                    schedule.id,
                    nextRun
                );

                console.log(
                    `[Scheduler] Schedule #${schedule.id} memiliki nextRunAt baru: ${nextRun?.toISOString()}`
                );

                continue;
            }

            /*
             * Schedule belum waktunya.
             */
            if (
                schedule.nextRunAt > now
            ) {
                continue;
            }

            /*
             * Schedule sudah waktunya.
             */
            await executeSchedule(
                schedule
            );
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
 *
 * Digunakan untuk:
 * - testing
 * - manual trigger
 * - debugging
 */
export async function runSchedulerCheck(): Promise<void> {
    await checkSchedules();
}

/**
 * Memulai scheduler.
 *
 * Scheduler melakukan:
 * 1. Immediate check.
 * 2. Check setiap 30 detik.
 */
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

    /*
     * Langsung lakukan pengecekan pertama
     * ketika server mulai.
     */
    void checkSchedules();

    /*
     * Setelah itu cek setiap 30 detik.
     */
    schedulerTimer = setInterval(
        () => {
            void checkSchedules();
        },
        CHECK_INTERVAL_MS
    );
}

/**
 * Menghentikan scheduler.
 */
export function stopScheduler(): void {
    if (!schedulerTimer) {
        return;
    }

    clearInterval(
        schedulerTimer
    );

    schedulerTimer = null;

    console.log(
        "[Scheduler] Scheduler dihentikan"
    );
}