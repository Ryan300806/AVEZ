import express from "express";
import path from "path";

import {
    getExecutionLogs,
    getExecutionLogById,
} from "./services/logService.js";

import {
    runDataEngineWithLogging,
} from "./services/dataEngineRunner.js";

import {
    createSchedule,
    getSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
    setScheduleActive,
} from "./services/scheduleService.js";

import type {
    ScheduleType,
} from "./services/scheduleService.js";

import {
    startScheduler,
} from "./services/scheduler.js";


const app = express();

const PORT = 3000;


/* =========================================================
   BASIC CONFIGURATION
   ========================================================= */

app.use(express.json());


/* =========================================================
   STATIC FRONTEND / LOG VIEWER
   ========================================================= */

app.use(
    express.static(
        path.join(process.cwd(), "public")
    )
);

app.get("/logs", (_req, res) => {
    res.sendFile(
        path.join(
            process.cwd(),
            "public",
            "logs.html"
        )
    );
});


/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "AVEZ API is running",
    });
});


/* =========================================================
   ANALYSIS
   ========================================================= */

/**
 * Menjalankan analisis AVEZ secara langsung.
 */

app.post(
    "/api/analysis/run",
    async (req, res) => {

        try {

            const {
                tickers,
                budget,
            } = req.body;


            if (
                !Array.isArray(tickers) ||
                tickers.length === 0
            ) {

                res.status(400).json({
                    success: false,
                    message:
                        "Tickers harus berupa array dan minimal memiliki satu ticker",
                });

                return;
            }


            if (
                typeof budget !== "number" ||
                !Number.isFinite(budget) ||
                budget <= 0
            ) {

                res.status(400).json({
                    success: false,
                    message:
                        "Budget harus berupa angka dan lebih besar dari 0",
                });

                return;
            }


            const result =
                await runDataEngineWithLogging({
                    tickers,
                    budget,
                    triggerType: "API",
                });


            res.json({
                success: true,
                message:
                    "Analisis AVEZ berhasil dijalankan",
                data: result,
            });

        } catch (error) {

            console.error(
                "Gagal menjalankan analisis AVEZ:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Gagal menjalankan analisis AVEZ",
            });

        }

    }
);


/* =========================================================
   SCHEDULES
   ========================================================= */

/**
 * Membuat schedule baru.
 */

app.post(
    "/api/schedules",
    async (req, res) => {

        try {

            const {
                name,
                tickers,
                budget,
                scheduleType,
                scheduleValue,
                nextRunAt,
            } = req.body;


            const validScheduleTypes: ScheduleType[] = [
                "ONCE",
                "DAILY",
                "WEEKLY",
            ];


            if (
                !validScheduleTypes.includes(
                    scheduleType
                )
            ) {

                res.status(400).json({
                    success: false,
                    message:
                        "scheduleType harus ONCE, DAILY, atau WEEKLY",
                });

                return;
            }


            const schedule =
                await createSchedule({
                    name,
                    tickers,
                    budget,
                    scheduleType,
                    scheduleValue,
                    nextRunAt:
                        nextRunAt
                            ? new Date(
                                nextRunAt
                            )
                            : null,
                });


            res.status(201).json({
                success: true,
                message:
                    "Schedule berhasil dibuat",
                data: schedule,
            });

        } catch (error) {

            console.error(
                "Gagal membuat schedule:",
                error
            );


            res.status(400).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Gagal membuat schedule",
            });

        }

    }
);


/**
 * Mengambil semua schedule.
 *
 * ?active=true
 * hanya mengambil schedule aktif.
 */

app.get(
    "/api/schedules",
    async (req, res) => {

        try {

            const activeOnly =
                req.query.active === "true";


            const schedules =
                await getSchedules(
                    activeOnly
                );


            res.json({
                success: true,
                data: schedules,
            });

        } catch (error) {

            console.error(
                "Gagal mengambil schedules:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Gagal mengambil schedules",
            });

        }

    }
);


/**
 * Mengambil schedule berdasarkan ID.
 */

app.get(
    "/api/schedules/:id",
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                res.status(400).json({
                    success: false,
                    message:
                        "ID schedule tidak valid",
                });

                return;
            }


            const schedule =
                await getScheduleById(id);


            if (!schedule) {

                res.status(404).json({
                    success: false,
                    message:
                        "Schedule tidak ditemukan",
                });

                return;
            }


            res.json({
                success: true,
                data: schedule,
            });

        } catch (error) {

            console.error(
                "Gagal mengambil schedule:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Gagal mengambil schedule",
            });

        }

    }
);


/**
 * Mengubah schedule.
 */

app.put(
    "/api/schedules/:id",
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                res.status(400).json({
                    success: false,
                    message:
                        "ID schedule tidak valid",
                });

                return;
            }


            const {
                name,
                tickers,
                budget,
                scheduleType,
                scheduleValue,
                isActive,
                nextRunAt,
            } = req.body;


            const validScheduleTypes: ScheduleType[] = [
                "ONCE",
                "DAILY",
                "WEEKLY",
            ];


            if (
                scheduleType !== undefined &&
                !validScheduleTypes.includes(
                    scheduleType
                )
            ) {

                res.status(400).json({
                    success: false,
                    message:
                        "scheduleType harus ONCE, DAILY, atau WEEKLY",
                });

                return;
            }


            const schedule =
                await updateSchedule(
                    id,
                    {
                        name,
                        tickers,
                        budget,
                        scheduleType,
                        scheduleValue,
                        isActive,
                        nextRunAt:
                            nextRunAt === undefined
                                ? undefined
                                : nextRunAt === null
                                    ? null
                                    : new Date(
                                        nextRunAt
                                    ),
                    }
                );


            if (!schedule) {

                res.status(404).json({
                    success: false,
                    message:
                        "Schedule tidak ditemukan",
                });

                return;
            }


            res.json({
                success: true,
                message:
                    "Schedule berhasil diperbarui",
                data: schedule,
            });

        } catch (error) {

            console.error(
                "Gagal memperbarui schedule:",
                error
            );


            res.status(400).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Gagal memperbarui schedule",
            });

        }

    }
);


/**
 * Mengaktifkan / menonaktifkan schedule.
 */

app.patch(
    "/api/schedules/:id/status",
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                res.status(400).json({
                    success: false,
                    message:
                        "ID schedule tidak valid",
                });

                return;
            }


            const {
                isActive,
            } = req.body;


            if (
                typeof isActive !==
                "boolean"
            ) {

                res.status(400).json({
                    success: false,
                    message:
                        "isActive harus berupa boolean",
                });

                return;
            }


            const schedule =
                await setScheduleActive(
                    id,
                    isActive
                );


            if (!schedule) {

                res.status(404).json({
                    success: false,
                    message:
                        "Schedule tidak ditemukan",
                });

                return;
            }


            res.json({
                success: true,
                message: isActive
                    ? "Schedule diaktifkan"
                    : "Schedule dinonaktifkan",
                data: schedule,
            });

        } catch (error) {

            console.error(
                "Gagal mengubah status schedule:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Gagal mengubah status schedule",
            });

        }

    }
);


/**
 * Menghapus schedule.
 */

app.delete(
    "/api/schedules/:id",
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                res.status(400).json({
                    success: false,
                    message:
                        "ID schedule tidak valid",
                });

                return;
            }


            const deleted =
                await deleteSchedule(id);


            if (!deleted) {

                res.status(404).json({
                    success: false,
                    message:
                        "Schedule tidak ditemukan",
                });

                return;
            }


            res.json({
                success: true,
                message:
                    "Schedule berhasil dihapus",
            });

        } catch (error) {

            console.error(
                "Gagal menghapus schedule:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Gagal menghapus schedule",
            });

        }

    }
);


/* =========================================================
   EXECUTION LOGS
   ========================================================= */

/**
 * Mengambil execution logs.
 */

app.get(
    "/api/logs",
    async (req, res) => {

        try {

            const statusParam =
                req.query.status;


            let status:
                | "SUCCESS"
                | "FAILED"
                | undefined;


            if (
                statusParam === "SUCCESS" ||
                statusParam === "FAILED"
            ) {

                status =
                    statusParam;
            }


            const logs =
                await getExecutionLogs(
                    status
                );


            res.json({
                success: true,
                data: logs,
            });

        } catch (error) {

            console.error(
                "Gagal mengambil execution logs:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Gagal mengambil execution logs",
            });

        }

    }
);


/**
 * Mengambil execution log berdasarkan ID.
 */

app.get(
    "/api/logs/:id",
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                res.status(400).json({
                    success: false,
                    message:
                        "ID log tidak valid",
                });

                return;
            }


            const log =
                await getExecutionLogById(
                    id
                );


            if (!log) {

                res.status(404).json({
                    success: false,
                    message:
                        "Execution log tidak ditemukan",
                });

                return;
            }


            res.json({
                success: true,
                data: log,
            });

        } catch (error) {

            console.error(
                "Gagal mengambil execution log:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Gagal mengambil execution log",
            });

        }

    }
);


/* =========================================================
   START SERVER
   ========================================================= */

app.listen(PORT, () => {

    console.log(
        `AVEZ API berjalan di http://localhost:${PORT}`
    );

    console.log(
        `AVEZ Log Viewer: http://localhost:${PORT}/logs`
    );

    startScheduler();

});