import { DoctorAuthorization } from "./drauth.model";

export interface DrAuthResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: DoctorAuthorization[];
}