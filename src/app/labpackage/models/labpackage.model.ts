export interface LabPackage {
    id: number;
    name: string;
    description: string;
    offer_price: number;
    total_amount: number;
    total_discount: number;
    is_disc_percentage: boolean;
    added_on: string;
    is_active: boolean;
    b_id: number;
    lab_tests: number[];
  }
  