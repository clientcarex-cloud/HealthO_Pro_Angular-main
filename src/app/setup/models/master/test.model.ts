export interface Test {
    id: number;
    name: string;
    price: string | number;
    short_code: string;
    is_outsourcing: boolean;
    inventory_cost: number | null;
    total_cost: number | null;
    is_active: boolean;
    is_accreditation: boolean;
    target_tat: string | null;
    added_on: string;
    last_updated: string;
    sample: string | null;
    clinical_information: string | null;
    b_id: number;
    department: any;
    methodology: string | null;
    [key: string]: any; 
  }