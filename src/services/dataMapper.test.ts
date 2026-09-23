import { getCompanyReport } from "./sectors.js";
import { mapFinancialData } from "./dataMapper.js";

async function main() {
    const ticker = "BBCA";

    try {
        console.log(`Mengambil data ${ticker} dari Sectors API...`);

        const report = await getCompanyReport(ticker);

        console.log("\n=== ROOT KEYS ===");
        console.log(Object.keys(report));

        console.log("\n=== DIVIDEND OBJECT ===");
        console.dir(report.dividend, { depth: null });

        const financialData = mapFinancialData(ticker, report);

        console.log("\n=== HASIL DATA MAPPER ===");
        console.dir(financialData, { depth: null });
    } catch (error) {
        console.error("\nGagal menjalankan data mapper:");

        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
    }
}

main();