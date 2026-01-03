// import { Phlebotomist } from "./results.model";
import { Result } from "./results.model";
import { Phlebotomist } from "./phlebotomist.model";
import { Patient } from "./patient.model";

export interface PhlebotomistResponse {
    count: number;
    next: null | string;
    previous: null | string;
    results: Result[];
  }