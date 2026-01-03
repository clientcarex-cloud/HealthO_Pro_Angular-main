import { Nabl } from "./nabl.model";

export interface NablResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Nabl[];
  }