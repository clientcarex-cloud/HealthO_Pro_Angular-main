import { LabTechnician } from "./labtechnician.model";

export interface LabTechnicianResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: LabTechnician[];
}