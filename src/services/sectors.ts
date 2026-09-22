import "dotenv/config";
import type { SectorsCompanyReport } from "../types/sectors.js";

const BASE_URL = "https://api.sectors.app/v2";
const REQUEST_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCompanyReport(
    ticker: string
): Promise<SectorsCompanyReport> {
    const apiKey = process.env.SECTORS_API_KEY;

    if (!apiKey) {
        throw new Error("SECTORS_API_KEY belum ditemukan");
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, REQUEST_TIMEOUT_MS);

        let shouldRetry = false;

        try {
            const response = await fetch(
                `${BASE_URL}/company/report/${encodeURIComponent(ticker)}/`,
                {
                    method: "GET",
                    headers: {
                        Authorization: apiKey,
                    },
                    signal: controller.signal,
                }
            );

            if (response.ok) {
                return (await response.json()) as SectorsCompanyReport;
            }

            const errorBody = await response.text();

            lastError = new Error(
                `Sectors API error ${response.status}: ${errorBody}`
            );

            shouldRetry =
                response.status === 429 || response.status >= 500;
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                lastError = new Error("Sectors API request timeout");
                shouldRetry = true;
            } else if (error instanceof Error) {
                lastError = error;
                shouldRetry = true;
            } else {
                lastError = new Error("Unknown Sectors API error");
                shouldRetry = true;
            }
        } finally {
            clearTimeout(timeout);
        }

        if (!shouldRetry || attempt === MAX_RETRIES) {
            break;
        }

        await sleep(1000 * (attempt + 1));
    }

    throw lastError ?? new Error("Sectors API request gagal");
}