import { Income } from "./income.model";
export interface IncomeResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Income[];
}