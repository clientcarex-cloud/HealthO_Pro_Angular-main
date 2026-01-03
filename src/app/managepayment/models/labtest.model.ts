export interface LabTest {
    id: number;
    name: string | null;
    short_code: string | null;
    price: string;
    added_on: string;
    b_id: number | null;
    patient: number;
    LabGlobalTestId: number | null;
    status_id: number | null;
    department: number | null;
  }