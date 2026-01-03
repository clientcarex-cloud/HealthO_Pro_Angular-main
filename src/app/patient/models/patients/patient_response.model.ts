import { Patient } from "./patient.model";

export interface PatientResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Patient[];
  }
  