import cron from "node-cron";
import { updateTariffsJob } from "#jobs/update-tariffs.job.js";

console.log("🚀 Application started");
console.log("⏰ Scheduler initialized");

console.log("🔄 Running initial tariffs update...");
updateTariffsJob()
    .then(() => {
        console.log("✅ Initial update completed");
    })
    .catch((error) => {
        console.error("❌ Initial update failed:", error);
    });

cron.schedule("0 * * * *", async () => {
    console.log("\n⏰ Scheduled task triggered");
    await updateTariffsJob();
});

console.log("📋 Cron job scheduled: Every hour at minute 0");
console.log("🔄 Next runs: XX:00, XX:00, XX:00...");

process.on("SIGINT", () => {
    console.log("\n👋 Shutting down gracefully...");
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("\n👋 Shutting down gracefully...");
    process.exit(0);
});
