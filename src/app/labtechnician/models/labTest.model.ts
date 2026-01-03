import { Patient } from "./patient.model";

export interface LabPatientTestID {
    id: number;
    patient: Patient;
    name: string;
    short_code: string;
    price: string;
    added_on: string;
    b_id: number;
    LabGlobalTestId: number;
    status_id: number | string;
    department: number;
    
}