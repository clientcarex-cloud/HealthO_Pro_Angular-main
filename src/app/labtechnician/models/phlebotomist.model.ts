export interface Phlebotomist{
    id: number;
    added_on: string;
    is_received: boolean;
    received_at: string | null;
    is_collected: boolean;
    assession_number: string;
    collected_at: string;
    LabPatientTestID: number;
    received_by: string;
    collected_by: string;
  }