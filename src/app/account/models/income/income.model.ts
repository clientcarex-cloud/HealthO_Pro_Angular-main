export interface Income {
    id: number;
    income_date: string;
    amount: number;
    description: string;
    income_id: string;
    is_authorized: boolean;
    added_on: string;
    last_updated: string;
    income_type: string;
    received_by: number;
    pay_mode: number;
    account_to: number;
    authorized_by: number;
    [key: string]: any; 
}
