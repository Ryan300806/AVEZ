import { describe, it, expect } from "vitest";

import {
    createSchedule,
    getSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
} from "./scheduleService.js";

describe("Schedule Service", () => {
    let createdScheduleId: number;

    it("should create a schedule", async () => {
        const schedule =
            await createSchedule({
                name: "Test AVEZ Scheduler",

                tickers: [
                    "TLKM",
                    "ASII",
                    "UNVR",
                ],

                budget: 5_000_000,

                scheduleType: "DAILY",

                scheduleValue: "08:00",

                nextRunAt:
                    new Date(
                        "2026-09-24T08:00:00"
                    ),
            });

        expect(schedule).toBeDefined();

        expect(schedule.id).toBeGreaterThan(0);

        expect(schedule.name).toBe(
            "Test AVEZ Scheduler"
        );

        expect(schedule.tickers).toEqual([
            "TLKM",
            "ASII",
            "UNVR",
        ]);

        expect(schedule.budget).toBe(
            5_000_000
        );

        expect(schedule.scheduleType).toBe(
            "DAILY"
        );

        expect(schedule.scheduleValue).toBe(
            "08:00"
        );

        expect(schedule.isActive).toBe(true);

        createdScheduleId =
            schedule.id;
    });

    it("should get the created schedule by ID", async () => {
        const schedule =
            await getScheduleById(
                createdScheduleId
            );

        expect(schedule).not.toBeNull();

        expect(schedule?.id).toBe(
            createdScheduleId
        );

        expect(schedule?.name).toBe(
            "Test AVEZ Scheduler"
        );
    });

    it("should get active schedules", async () => {
        const schedules =
            await getSchedules(true);

        expect(
            Array.isArray(schedules)
        ).toBe(true);

        const schedule =
            schedules.find(
                (item) =>
                    item.id ===
                    createdScheduleId
            );

        expect(schedule).toBeDefined();
    });

    it("should update the schedule", async () => {
        const schedule =
            await updateSchedule(
                createdScheduleId,
                {
                    name:
                        "Updated AVEZ Scheduler",

                    budget: 7_500_000,

                    tickers: [
                        "TLKM",
                        "ASII",
                    ],

                    scheduleValue: "09:00",
                }
            );

        expect(schedule).not.toBeNull();

        expect(schedule?.name).toBe(
            "Updated AVEZ Scheduler"
        );

        expect(schedule?.budget).toBe(
            7_500_000
        );

        expect(schedule?.tickers).toEqual([
            "TLKM",
            "ASII",
        ]);

        expect(schedule?.scheduleValue).toBe(
            "09:00"
        );
    });

    it("should delete the schedule", async () => {
        const deleted =
            await deleteSchedule(
                createdScheduleId
            );

        expect(deleted).toBe(true);

        const schedule =
            await getScheduleById(
                createdScheduleId
            );

        expect(schedule).toBeNull();
    });
});