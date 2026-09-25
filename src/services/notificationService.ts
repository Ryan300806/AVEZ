import type { DataEngineResult } from "./dataEngine.js";
import type { AllocationResponse } from "../types/allocation.js";

function formatRupiah(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatPercent(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
}

export function buildTelegramMessage(
    result: DataEngineResult
): string {
    const executionDate = new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
    }).format(new Date());

    const allocationResponse: AllocationResponse = {
        allocations: result.allocations.map(
            (allocation) => ({
                ticker: allocation.ticker,
                companyName: allocation.companyName,
                allocationAmount:
                    allocation.allocationAmount,
                dividendYield:
                    allocation.dividendYield,
            })
        ),

        disclaimer: result.disclaimer,
    };

    const lines: string[] = [];

    lines.push(
        "🤖 AutoGaji Rebalancing Report"
    );

    lines.push(`📅 ${executionDate}`);

    lines.push("");

    lines.push("📊 HASIL ALOKASI");

    lines.push("");

    if (
        allocationResponse.allocations.length === 0
    ) {
        lines.push(
            "Tidak ada emiten yang memenuhi kriteria alokasi."
        );
    } else {
        for (const allocation of allocationResponse.allocations) {
            lines.push(
                `🏢 ${allocation.ticker}`
            );

            lines.push(
                `   ${allocation.companyName}`
            );

            lines.push(
                `   Estimasi Yield: ${formatPercent(
                    allocation.dividendYield
                )}`
            );

            lines.push(
                `   Nominal Alokasi: ${formatRupiah(
                    allocation.allocationAmount
                )}`
            );

            lines.push("");
        }
    }

    lines.push("⚠️ DISCLAIMER");

    lines.push(
        allocationResponse.disclaimer
    );

    return lines.join("\n");
}