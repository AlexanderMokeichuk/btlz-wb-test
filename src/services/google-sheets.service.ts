import { google, sheets_v4 } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import env from "#config/env/env.js";
import { WBTariff } from "#types/wb-tariffs.types.js";
import fs from "fs";

class GoogleSheetsService {
    private sheets: sheets_v4.Sheets | undefined;
    private auth: GoogleAuth | undefined;

    constructor() {
        this.initAuth();
    }

    private async initAuth() {
        if (!env.GOOGLE_SERVICE_ACCOUNT_PATH || !fs.existsSync(env.GOOGLE_SERVICE_ACCOUNT_PATH)) {
            console.warn("⚠️ Google credentials not found. Sheets sync disabled.");
            return;
        }

        try {
            const credentials = JSON.parse(fs.readFileSync(env.GOOGLE_SERVICE_ACCOUNT_PATH, "utf-8"));

            this.auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ["https://www.googleapis.com/auth/spreadsheets"],
            });

            this.sheets = google.sheets({ version: "v4", auth: this.auth });
            console.log("✅ Google Sheets service initialized");
        } catch (error) {
            console.error("❌ Failed to initialize Google Sheets:", error);
        }
    }

    /** Синхронизировать тарифы в Google таблицу */
    async syncTariffsToSheet(spreadsheetId: string, tariffs: WBTariff[]): Promise<void> {
        if (!this.sheets) {
            console.warn("⚠️ Google Sheets not initialized. Skipping sync.");
            return;
        }

        try {
            const sheetName = "stocks_coefs";

            const headers = ["ID", "Дата", "Склад", "Срок хранения", "Доставка (база)", "Доставка (литр)", "Хранение (база)", "Хранение (литр)"];

            const rows = tariffs.map((tariff) => [
                tariff.id,
                tariff.date,
                tariff.warehouse_name,
                tariff.box_delivery_and_storage_expr || "",
                tariff.box_delivery_base || 0,
                tariff.box_delivery_liter || 0,
                tariff.box_storage_base || 0,
                tariff.box_storage_liter || 0,
            ]);

            const values = [headers, ...rows];

            await this.sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: `${sheetName}!A:Z`,
            });

            await this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: "RAW",
                requestBody: {
                    values,
                },
            });

            console.log(`✅ Synced ${tariffs.length} tariffs to sheet: ${spreadsheetId}`);
        } catch (error) {
            console.error(`❌ Failed to sync to sheet ${spreadsheetId}:`, error);
            throw error;
        }
    }

    /** Синхронизировать во все таблицы из конфига */
    async syncToAllSheets(tariffs: WBTariff[]): Promise<void> {
        if (!env.GOOGLE_SHEET_IDS) {
            console.warn("⚠️ No Google Sheet IDs configured");
            return;
        }

        const sheetIds = env.GOOGLE_SHEET_IDS.split(",")
            .map((id) => id.trim())
            .filter(Boolean);

        if (sheetIds.length === 0) {
            console.warn("⚠️ No valid Google Sheet IDs found");
            return;
        }

        console.log(`📊 Syncing to ${sheetIds.length} sheet(s)...`);

        for (const sheetId of sheetIds) {
            await this.syncTariffsToSheet(sheetId, tariffs);
        }

        console.log("✅ All sheets synced successfully");
    }
}

export default new GoogleSheetsService();
