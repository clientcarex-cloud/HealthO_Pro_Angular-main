export interface Expense {
    id: number;
    expense_date: string;
    amount: number;
    description: string;
    expense_id: string;
    is_authorized: boolean;
    added_on: string;
    last_updated: string;
    expense_type: string;
    paid_to: number;
    pay_mode: number;
    account_to: number;
    authorized_by: number | null;
    [key: string]: any; 
}
