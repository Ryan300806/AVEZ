import { describe, it, expect } from "vitest";

import {
    createSchedule,
    deleteSchedule,
    getScheduleById,
} from "./scheduleService.js";

import {
    runSchedulerCheck,
} from "./scheduler.js";

describe("Scheduler", () => {
    let scheduleId: number;

    it("should create a schedule that is ready to run", async () => {
        const schedule =
            await createSchedule({
                name: "Scheduler Integration Test",

                tickers: [
                    "TLKM",
                    "ASII",
                ],

                budget: 1_000_000,

                scheduleType: "ONCE",

                scheduleValue:
                    "2026-09-23 23:59",

                nextRunAt:
                    new Date(
                        Date.now() - 1_000
                    ),
            });

        expect(schedule).toBeDefined();

        expect(schedule.id).toBeGreaterThan(0);

        expect(schedule.isActive).toBe(true);

        expect(
            schedule.nextRunAt
        ).not.toBeNull();

        scheduleId =
            schedule.id;
    });

    it("should execute the due schedule", async () => {
        await runSchedulerCheck();

        const schedule =
            await getScheduleById(
                scheduleId
            );

        expect(schedule).not.toBeNull();

        expect(
            schedule?.nextRunAt
        ).toBeNull();
    });

    it("should delete the test schedule", async () => {
        const deleted =
            await deleteSchedule(
                scheduleId
            );

        expect(deleted).toBe(true);

        const schedule =
            await getScheduleById(
                scheduleId
            );

        expect(schedule).toBeNull();
    });
});