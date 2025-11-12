import axios from "axios";
import env from "#config/env/env.js";
import { WBTariffsResponse } from "#types/wb-tariffs.types.js";

class WBApiService {
    private readonly apiUrl: string;
    private readonly apiToken: string;

    constructor() {
        this.apiUrl = env.WB_API_URL;
        this.apiToken = env.WB_API_TOKEN;
    }

    /**
     * Получить тарифы для коробов от WB API
     * @param date - дата в формате YYYY-MM-DD (по умолчанию - сегодня)
     */
    async getTariffs(date?: string): Promise<WBTariffsResponse> {
        const targetDate = date || new Date().toISOString().split("T")[0];

        try {
            const response = await axios.get<WBTariffsResponse>(this.apiUrl, {
                headers: {
                    Authorization: this.apiToken,
                },
                params: {
                    date: targetDate,
                },
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("WB API Error:", {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                });
                throw new Error(`Failed to fetch WB tariffs: ${error.message}`);
            }
            throw error;
        }
    }
}

export default new WBApiService();