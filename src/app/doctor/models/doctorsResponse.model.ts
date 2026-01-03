import { Doctor } from "./doctor.model";

export interface DoctorsResponse {
    count: number;
    next: null | string;
    previous: null | string;
    results: Doctor[];
  }