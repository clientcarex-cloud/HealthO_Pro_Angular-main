import { Patient } from "./patient.model";

export interface ManagePaymentResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Patient[];
  }