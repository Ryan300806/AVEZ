import { getCompanyReport } from "./sectors.js";
import { mapFinancialData } from "./dataMapper.js";
import { screenCompany } from "./screening.js";

async function main() {
    const ticker = "BBCA";

    try {
        console.log(`Mengambil dan screening ${ticker}...`);

        const report = await getCompanyReport(ticker);

        const financialData = mapFinancialData(
            ticker,
            report
        );

        const screeningResult = screenCompany(
            financialData
        );

        console.log("\n=== FINANCIAL DATA ===");
        console.dir(financialData, { depth: null });

        console.log("\n=== SCREENING RESULT ===");
        console.dir(screeningResult, { depth: null });
    } catch (error) {
        console.error("\nGagal menjalankan integration test:");

        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
    }
}

main();