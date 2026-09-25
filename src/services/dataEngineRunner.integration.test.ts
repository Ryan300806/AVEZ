import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
    runDataEngine: vi.fn(),
    saveExecutionLog: vi.fn(),
    buildTelegramMessage: vi.fn(),
    sendTelegramMessage: vi.fn(),
}));

vi.mock("./dataEngine.js", () => ({
    runDataEngine: mocks.runDataEngine,
}));

vi.mock("./executionLogger.js", () => ({
    saveExecutionLog: mocks.saveExecutionLog,
}));

vi.mock("./notificationService.js", () => ({
    buildTelegramMessage: mocks.buildTelegramMessage,
}));

vi.mock("./telegramService.js", () => ({
    sendTelegramMessage: mocks.sendTelegramMessage,
}));

import {
    runDataEngineWithLogging,
} from "./dataEngineRunner.js";

describe("Data Engine Runner + Telegram", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.saveExecutionLog.mockResolvedValue(
            undefined
        );

        mocks.buildTelegramMessage.mockReturnValue(
            "TEST TELEGRAM MESSAGE"
        );

        mocks.sendTelegramMessage.mockResolvedValue(
            undefined
        );
    });

    it("menjalankan Data Engine, menyimpan log, lalu mengirim Telegram", async () => {
        const dummyResult = {
            budget: 1_000_000,

            companies: [],

            allocations: [
                {
                    ticker: "TLKM",
                    companyName: "Telkom Indonesia",
                    score: 80,
                    allocationAmount: 600_000,
                    dividendYield: 5.25,
                },
                {
                    ticker: "ASII",
                    companyName: "Astra International",
                    score: 70,
                    allocationAmount: 400_000,
                    dividendYield: 6.10,
                },
            ],

            disclaimer:
                "Hasil AVEZ merupakan analisis dan rekomendasi alokasi berbasis data fundamental, bukan instruksi untuk melakukan transaksi otomatis.",
        };

        mocks.runDataEngine.mockResolvedValue(
            dummyResult
        );

        const result =
            await runDataEngineWithLogging({
                tickers: ["TLKM", "ASII"],
                budget: 1_000_000,
                triggerType: "TEST",
            });

        expect(
            mocks.runDataEngine
        ).toHaveBeenCalledTimes(1);

        expect(
            mocks.runDataEngine
        ).toHaveBeenCalledWith(
            ["TLKM", "ASII"],
            1_000_000
        );

        expect(
            mocks.saveExecutionLog
        ).toHaveBeenCalledTimes(1);

        expect(
            mocks.saveExecutionLog
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                triggerType: "TEST",
                status: "SUCCESS",
                message:
                    "Data Engine berhasil dijalankan",
            })
        );

        expect(
            mocks.buildTelegramMessage
        ).toHaveBeenCalledTimes(1);

        expect(
            mocks.buildTelegramMessage
        ).toHaveBeenCalledWith(
            dummyResult
        );

        expect(
            mocks.sendTelegramMessage
        ).toHaveBeenCalledTimes(1);

        expect(
            mocks.sendTelegramMessage
        ).toHaveBeenCalledWith(
            "TEST TELEGRAM MESSAGE"
        );

        expect(result).toEqual(
            dummyResult
        );
    });

    it("tetap SUCCESS jika Telegram gagal", async () => {
        const dummyResult = {
            budget: 1_000_000,

            companies: [],

            allocations: [],

            disclaimer:
                "Test disclaimer",
        };

        mocks.runDataEngine.mockResolvedValue(
            dummyResult
        );

        mocks.sendTelegramMessage.mockRejectedValue(
            new Error("Telegram gagal")
        );

        const consoleErrorSpy =
            vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

        const result =
            await runDataEngineWithLogging({
                tickers: ["TLKM"],
                budget: 1_000_000,
                triggerType: "TEST",
            });

        expect(result).toEqual(
            dummyResult
        );

        expect(
            mocks.saveExecutionLog
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                status: "SUCCESS",
            })
        );

        expect(
            mocks.sendTelegramMessage
        ).toHaveBeenCalledTimes(1);

        consoleErrorSpy.mockRestore();
    });
});