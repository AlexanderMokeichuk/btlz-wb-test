import tariffsService from "#services/tariffs.service.js";
import googleSheetsService from "#services/google-sheets.service.js";

export async function syncSheetsJob() {
    try {
        console.log(`[${new Date().toISOString()}] 📊 Starting Google Sheets sync...`);

        const tariffs = await tariffsService.getAllTariffsSortedByCoefficient();

        if (tariffs.length === 0) {
            console.log(`[${new Date().toISOString()}] ⚠️ No tariffs to sync`);
            return;
        }

        await googleSheetsService.syncToAllSheets(tariffs);

        console.log(`[${new Date().toISOString()}] ✅ Google Sheets sync completed`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Failed to sync sheets:`, error);
        throw error;
    }
}