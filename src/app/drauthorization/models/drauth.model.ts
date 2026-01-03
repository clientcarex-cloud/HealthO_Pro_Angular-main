import { LabTest } from "./LabTest.model";
import { Invoice } from "./invoice.model";
import { Patient } from "./patient.model"

export interface DoctorAuthorization {
    id: number;
    lab_dr_authorization: { LabPatientTestID: number | null };
    lab_dr_authorization_remarks: any; // Change this to the correct type if needed
    patient: Patient;
    name: string;
    short_code: string;
    price: string;
    added_on: string;
    b_id: number;
    LabGlobalTestId: number;
    status_id: string;
    department: string;
    [key: string]: any;
}

// [key: string]: any; 