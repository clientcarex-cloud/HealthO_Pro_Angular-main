export interface PatientInvoice {
    id: number;
    total_cost: number;
    total_price: number;
    total_discount: number;
    total_due: number;
    total_paid: number;
    invoice_upload: string | null;
    total_refund: number;
    added_on: string;
    patient: number;
    discountType: string | null;
  }