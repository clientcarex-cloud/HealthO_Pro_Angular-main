import { LabPatientTestResult } from "./lab_patient_test.model";

export interface LabPatientTest {
    count: number;
    next: string | null;
    previous: string | null;
    results: LabPatientTestResult[];
  }