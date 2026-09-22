import { getCompanyReport } from "./sectors";

async function main() {
    console.log("Mengambil data dari Sectors API...");

    const data = await getCompanyReport("BBCA");

    console.log("Data Sectors berhasil diterima:");
    console.dir(data, { depth: null });
}

main().catch((error) => {
    console.error("Gagal mengambil data Sectors:");
    console.error(error);
    process.exit(1);
});