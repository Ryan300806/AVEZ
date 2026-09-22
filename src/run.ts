import { runPipeline } from "./pipeline.js";

async function main() {
    await runPipeline("BBCA", undefined, "manual-test");

    console.log("AVEZ pipeline selesai.");
}

main().catch((error) => {
    console.error("AVEZ pipeline gagal:");
    console.error(error);
    process.exit(1);
});