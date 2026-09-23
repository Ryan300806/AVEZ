import { allocateBudget } from "./allocation.js";

const budget = 5_000_000;

const companies = [
    {
        ticker: "TLKM",
        companyName: "PT Telkom Indonesia",
        score: 75,
        dividendYield: 0.05,
    },
    {
        ticker: "ASII",
        companyName: "PT Astra International",
        score: 40,
        dividendYield: 0.04,
    },
];

const result = allocateBudget(
    budget,
    companies
);

console.log("\n=== AVEZ ALLOCATION TEST ===\n");

for (const allocation of result) {
    console.log(
        `${allocation.ticker} → Rp${allocation.allocationAmount.toLocaleString("id-ID")}`
    );

    console.log(
        `Score          : ${allocation.score}`
    );

    console.log(
        `Dividend Yield : ${(allocation.dividendYield * 100).toFixed(2)}%`
    );

    console.log("------------------------------");
}

const totalAllocation = result.reduce(
    (total, allocation) =>
        total + allocation.allocationAmount,
    0
);

console.log(
    `TOTAL ALLOCATION → Rp${totalAllocation.toLocaleString("id-ID")}`
);

console.log(
    `EXPECTED BUDGET  → Rp${budget.toLocaleString("id-ID")}`
);

console.log(
    `MATCH            → ${totalAllocation === budget ? "YES ✓" : "NO ✗"}`
);