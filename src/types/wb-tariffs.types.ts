export interface WBTariffsResponse {
    response: {
        data: {
            dtNextBox: string;
            dtTillMax: string;
            warehouseList: WBWarehouse[];
        };
    };
}

export interface WBWarehouse {
    boxDeliveryAndStorageExpr: string;
    boxDeliveryBase: number;
    boxDeliveryLiter: number;
    boxStorageBase: number;
    boxStorageLiter: number;
    warehouseName: string;
}

export interface WBTariff {
    id?: number;
    date: string;
    warehouse_name: string;
    box_delivery_and_storage_expr: string | null;
    box_delivery_base: number | null;
    box_delivery_liter: number | null;
    box_storage_base: number | null;
    box_storage_liter: number | null;
    created_at?: Date;
    updated_at?: Date;
}