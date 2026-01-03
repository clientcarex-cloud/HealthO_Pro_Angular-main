export interface Invoice {
  total_cost: number | null;
  total_price: number | null;
  total_discount: number | null;
  total_due: number | null;
  total_paid: number | null;
  total_refund: number | null;
  patient: number | null;
  discountType: any; // You can replace 'any' with a more specific type if the discountType has a defined structure
}
