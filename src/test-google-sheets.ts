import tariffsService from "#services/tariffs.service.js";
import googleSheetsService from "#services/google-sheets.service.js";

async function testGoogleSheets() {
    try {
        console.log("📊 Testing Google Sheets sync...");

        const tariffs = await tariffsService.getAllTariffsSortedByCoefficient();
        console.log(`Found ${tariffs.length} tariffs in DB`);

        if (tariffs.length === 0) {
            console.log("⚠️ No tariffs in DB. Run test-wb-api.ts first!");
            process.exit(1);
        }

        await googleSheetsService.syncToAllSheets(tariffs);

        console.log("✅ Test completed! Check your Google Sheet:");
        console.log("https://docs.google.com/spreadsheets/d/1snsyG4WJKJLDdc4-mAwArXDsPcgQrn6ZAOV6-EBEHco/edit");

        process.exit(0);
    } catch (error) {
        console.error("❌ Test failed:", error);
        process.exit(1);
    }
}

testGoogleSheets();
