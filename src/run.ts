import { runPipeline } from "./pipeline.js";
import { db } from "./config/database.js";

async function main() {
    try {
        await runPipeline("BBCA", undefined, "manual-test");

        console.log("AVEZ pipeline selesai.");
    } finally {
        await db.end();
    }
}

main().catch((error) => {
    console.error("AVEZ pipeline gagal:");
    console.error(error);
    process.exit(1);
});