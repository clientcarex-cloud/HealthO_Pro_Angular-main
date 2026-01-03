import { LabTest } from "./labtest.model";
import { PatientInvoice } from "./patientInvoice.model";


export interface Patient {
    id: number;
    lab_tests: LabTest[];
    patient_invoice: PatientInvoice;
    title: string;
    name: string;
    age: number;
    gender: string;
    attender_name: string;
    attender_relationship_title: string;
    mobile_number: string;
    email: string;
    area: string;
    address: string;
    prescription_attach: string | null;
    mr_no: string;
    visit_id: string;
    added_on: string;
    b_id: number;
    referral_doctor: string | null;
    department: string | null;
    created_by: string | null;
    [key: string]: any; 
  }