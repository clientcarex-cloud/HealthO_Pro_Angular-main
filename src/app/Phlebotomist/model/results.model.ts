import { Patient } from "./patient.model";
import { Phlebotomist } from "./phlebotomist.model";

export interface Result{
    id: number;
    patient: Patient;
    phlebotomist: Phlebotomist;
    name: string;
    short_code: string;
    price: string;
    added_on: string;
    b_id: number;
    LabGlobalTestId: number;
    status_id: string;
    department: string;  
    [key: string]: any; 
  }
