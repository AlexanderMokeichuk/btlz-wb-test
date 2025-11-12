import cron from "node-cron";
import { updateTariffsJob } from "#jobs/update-tariffs.job.js";
import { syncSheetsJob } from "#jobs/sync-sheets.job.js";

console.log("🚀 Application started");
console.log("⏰ Scheduler initialized");

console.log("🔄 Running initial update...");
Promise.all([updateTariffsJob(), syncSheetsJob()])
    .then(() => {
        console.log("✅ Initial update completed");
    })
    .catch((error) => {
        console.error("❌ Initial update failed:", error);
    });

cron.schedule("0 * * * *", async () => {
    console.log("\n⏰ Hourly task: Update tariffs");
    await updateTariffsJob();
});

cron.schedule("5 * * * *", async () => {
    console.log("\n⏰ Hourly task: Sync Google Sheets");
    await syncSheetsJob();
});

console.log("📋 Cron jobs scheduled:");
console.log("  - Update tariffs: Every hour at XX:00");
console.log("  - Sync Google Sheets: Every hour at XX:05");

process.on("SIGINT", () => {
    console.log("\n👋 Shutting down gracefully...");
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("\n👋 Shutting down gracefully...");
    process.exit(0);
});
