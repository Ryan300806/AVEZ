import { describe, it, expect } from "vitest";

import {
    runDataEngineWithLogging,
} from "./dataEngineRunner.js";

import {
    getExecutionLogs,
} from "./logService.js";

describe("Data Engine Runner", () => {
    it("should execute Data Engine and save SUCCESS log", async () => {
        const result =
            await runDataEngineWithLogging({
                tickers: ["TLKM", "ASII"],
                budget: 5_000_000,
                triggerType: "TEST_RUNNER",
            });

        expect(result).toBeDefined();
        expect(result.allocations.length).toBeGreaterThan(0);

        const logs =
            await getExecutionLogs();

        const latestLog = logs.find(
            (log) =>
                log.triggerType ===
                "TEST_RUNNER"
        );

        expect(latestLog).toBeDefined();

        expect(latestLog?.status).toBe(
            "SUCCESS"
        );

        expect(
            latestLog?.durationMs
        ).toBeGreaterThanOrEqual(0);
    });

    it("should execute Data Engine and save FAILED log", async () => {
        await expect(
            runDataEngineWithLogging({
                tickers: [],
                budget: 5_000_000,
                triggerType: "TEST_FAILED",
            })
        ).rejects.toThrow();

        const logs =
            await getExecutionLogs();

        const latestLog = logs.find(
            (log) =>
                log.triggerType ===
                "TEST_FAILED"
        );

        expect(latestLog).toBeDefined();

        expect(latestLog?.status).toBe(
            "FAILED"
        );

        expect(
            latestLog?.durationMs
        ).toBeGreaterThanOrEqual(0);
    });
});