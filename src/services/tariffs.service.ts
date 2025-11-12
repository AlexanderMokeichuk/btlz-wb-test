import knex from "#postgres/knex.js";
import { WBTariff, WBWarehouse } from "#types/wb-tariffs.types.js";

class TariffsService {
    /**
     * Сохранить или обновить тарифы за определенную дату
     */
    async upsertTariffs(date: string, warehouses: WBWarehouse[]): Promise<void> {
        const tariffs: Omit<WBTariff, "id" | "created_at" | "updated_at">[] = warehouses.map(
            (warehouse) => ({
                date,
                warehouse_name: warehouse.warehouseName,
                box_delivery_and_storage_expr: warehouse.boxDeliveryAndStorageExpr || null,
                box_delivery_base: warehouse.boxDeliveryBase || null,
                box_delivery_liter: warehouse.boxDeliveryLiter || null,
                box_storage_base: warehouse.boxStorageBase || null,
                box_storage_liter: warehouse.boxStorageLiter || null,
            })
        );

        await knex.transaction(async (trx) => {
            for (const tariff of tariffs) {
                await trx("wb_tariffs")
                    .insert({
                        ...tariff,
                        created_at: trx.fn.now(),
                        updated_at: trx.fn.now(),
                    })
                    .onConflict(["date", "warehouse_name"])
                    .merge({
                        box_delivery_and_storage_expr: tariff.box_delivery_and_storage_expr,
                        box_delivery_base: tariff.box_delivery_base,
                        box_delivery_liter: tariff.box_delivery_liter,
                        box_storage_base: tariff.box_storage_base,
                        box_storage_liter: tariff.box_storage_liter,
                        updated_at: trx.fn.now(),
                    });
            }
        });

        console.log(`✅ Upserted ${tariffs.length} tariffs for date: ${date}`);
    }

    /**
     * Получить тарифы за определенную дату
     */
    async getTariffsByDate(date: string): Promise<WBTariff[]> {
        return knex("wb_tariffs").where({ date }).orderBy("warehouse_name");
    }

    /**
     * Получить все тарифы, отсортированные по коэффициенту
     * (для Google Sheets)
     */
    async getAllTariffsSortedByCoefficient(): Promise<WBTariff[]> {
        return knex("wb_tariffs")
            .select("*")
            .orderBy([
                { column: "box_delivery_base", order: "asc" },
                { column: "box_storage_base", order: "asc" },
            ]);
    }
}

export default new TariffsService();