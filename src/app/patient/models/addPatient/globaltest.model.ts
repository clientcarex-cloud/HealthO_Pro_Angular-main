export interface GlobalTestModel {
  count: number;
  next: string | null;
  previous: string | null;
  results: GlobalTest[];
}

export interface GlobalTest {
  id: number;
  name: string;
  price: string;
  short_code: string;
  is_outsourcing: boolean;
  inventory_cost: number | null;
  total_cost: number | null;
  is_active: boolean;
  is_accreditation: boolean;
  target_tat: string | null;
  added_on: string;
  last_updated: string;
  b_id: number;
  department: number;
}
