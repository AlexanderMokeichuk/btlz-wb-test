import wbApiService from "#services/wb-api.service.js";
import tariffsService from "#services/tariffs.service.js";

async function testWBApi() {
    try {
        console.log("🔍 Fetching tariffs from WB API...");

        const response = await wbApiService.getTariffs();

        console.log("\n✅ Response received:");
        console.log("Next box date:", response.response.data.dtNextBox);
        console.log("Max date:", response.response.data.dtTillMax);
        console.log("Warehouses count:", response.response.data.warehouseList.length);

        console.log("\n📦 First warehouse:");
        console.log(JSON.stringify(response.response.data.warehouseList[0], null, 2));

        const today = new Date().toISOString().split("T")[0];

        console.log(`\n💾 Saving tariffs to DB for date: ${today}...`);
        await tariffsService.upsertTariffs(today, response.response.data.warehouseList);

        console.log("\n📊 Fetching saved tariffs from DB...");
        const savedTariffs = await tariffsService.getTariffsByDate(today);
        console.log(`Found ${savedTariffs.length} tariffs in DB`);

        console.log("\n✅ Test completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    }
}

testWBApi();