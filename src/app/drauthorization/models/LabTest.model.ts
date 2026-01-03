export interface LabTest {
    LabGlobalTestId: number | null;
    price: string;
    name: string | null;
    status_id: string;
    department: string;
    b_id: number | null;
    short_code: string | null;
    added_on: string;
    phlebotomist: { is_collected: boolean } | null;
}