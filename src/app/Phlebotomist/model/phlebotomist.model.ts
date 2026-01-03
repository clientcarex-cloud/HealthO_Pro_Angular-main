export interface Phlebotomist {
    id: number;
    added_on: string;
    is_received: boolean;
    received_at: string;
    is_collected: boolean | null;
    collected_at: string;
    LabPatientTestID: number;
    received_by: string | number;
    collected_by: string | null | number;
    assession_number?: any;
}