import { db } from "./database";

async function main() {
    try {
        // INSERT log dummy
        await db.execute(
            `INSERT INTO execution_logs
            (trigger_type, status, duration_ms, message, payload)
            VALUES (?, ?, ?, ?, ?)`,
            [
                "manual-test",
                "SUCCESS",
                150,
                "Database logging test",
                JSON.stringify({
                    test: true,
                    source: "database.test.ts"
                })
            ]
        );

        console.log("Log berhasil disimpan!");

        // SELECT log terakhir
        const [rows] = await db.execute(
            `SELECT * FROM execution_logs
             ORDER BY id DESC
             LIMIT 1`
        );

        console.log("Log terakhir:");
        console.log(rows);

        await db.end();

    } catch (error) {
        console.error("Database test gagal:");
        console.error(error);
        process.exit(1);
    }
}

main();