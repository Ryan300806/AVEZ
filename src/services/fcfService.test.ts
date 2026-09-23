import { getFCFData } from "./fcfService.js";

const tickers = ["TLKM", "ASII", "UNVR", "BBCA"];

for (const ticker of tickers) {
    const result = getFCFData(ticker);

    console.log(`\n=== ${ticker} ===`);

    if (!result) {
        console.log("FCF data tidak ditemukan.");
        continue;
    }

    console.dir(result, { depth: null });
}