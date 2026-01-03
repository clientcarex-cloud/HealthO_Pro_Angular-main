import { Staff } from "./staff.model"; 

export interface Result {
    count: number;
    next: string | null;
    previous: string | null;
    results: Staff[];
  }