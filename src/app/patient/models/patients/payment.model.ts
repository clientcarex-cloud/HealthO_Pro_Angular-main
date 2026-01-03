export interface Payment {
    patient?: number;
    patient_id?: number;
    b_id: number;
    pay_mode?: number;
    remarks?: string;
    paid_amount?: number;
    discount_type?: any; // Uncomment if needed
    discount_amt?: number;
}
