import { Patient } from "./patient.model";
import { LabPatientTestID } from "./labTest.model";
import { Phlebotomist } from "src/app/Phlebotomist/model/phlebotomist.model";

export interface LabTechnician {
    id: number;
    LabPatientTestID: LabPatientTestID;
    is_word_report: boolean;
    is_completed: boolean;
    completed_at: string;
    is_passKey_used: boolean;
    added_on: string;
    report_created_by: number;
    phlebotomist:Phlebotomist
    access: number[];
    is_authorized: boolean;
    [key: string]: any; 
}
