import { runDataEngine } from "./dataEngine.js";

async function main() {
    const tickers = ["TLKM", "ASII", "UNVR"];
    const budget = 5_000_000;

    try {
        console.log("\n=== AVEZ DATA ENGINE TEST ===\n");

        console.log(
            `Ticker : ${tickers.join(", ")}`
        );

        console.log(
            `Budget : Rp${budget.toLocaleString("id-ID")}`
        );

        console.log(
            "\nMenjalankan Data Engine..."
        );

        const result = await runDataEngine(
            tickers,
            budget
        );

        console.log("\n=== COMPANY RESULT ===\n");

        for (const company of result.companies) {
            console.log(
                `Ticker           : ${company.financialData.ticker}`
            );

            console.log(
                `Company          : ${company.financialData.companyName}`
            );

            console.log(
                `Sector           : ${company.financialData.sector}`
            );

            console.log(
                `Screening        : ${company.screening.status}`
            );

            console.log(
                `Allocation Ready : ${
                    company.screening
                        .allocationEligible
                        ? "YES"
                        : "NO"
                }`
            );

            console.log(
                `Score            : ${
                    company.score !== null
                        ? company.score.toFixed(2)
                        : "N/A"
                }`
            );

            if (
                company.screening
                    .reasons.length > 0
            ) {
                console.log(
                    `Reason           : ${company.screening.reasons.join(", ")}`
                );
            }

            console.log(
                "------------------------------"
            );
        }

        console.log(
            "\n=== ALLOCATION ===\n"
        );

        if (result.allocations.length === 0) {
            console.log(
                "Tidak ada allocation."
            );
        } else {
            for (const allocation of result.allocations) {
                console.log(
                    `${allocation.ticker} → Rp${allocation.allocationAmount.toLocaleString("id-ID")}`
                );
            }
        }

        console.log(
            `\nDISCLAIMER:\n${result.disclaimer}`
        );
    } catch (error) {
        console.error(
            "\nData Engine gagal:"
        );

        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
    }
}

main();