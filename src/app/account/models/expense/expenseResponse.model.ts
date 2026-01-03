import { Expense } from "./expense.model";

export interface ExpenseResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Expense[];
}