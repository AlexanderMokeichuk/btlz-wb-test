import wbApiService from "#services/wb-api.service.js";
import tariffsService from "#services/tariffs.service.js";

export async function updateTariffsJob() {
    try {
        const today = new Date().toISOString().split("T")[0];

        console.log(`[${new Date().toISOString()}] Starting tariffs update for ${today}`);

        const response = await wbApiService.getTariffs(today);
        const warehouses = response.response.data.warehouseList;

        await tariffsService.upsertTariffs(today, warehouses);

        console.log(`[${new Date().toISOString()}] Tariffs updated successfully: ${warehouses.length} warehouses`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Failed to update tariffs:`, error);
        throw error;
    }
}