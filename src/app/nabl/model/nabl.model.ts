import { Patient } from "./patient.model";
import { Phlebotomist } from "./phlebotomist.model";
import { LabTechnician } from "./labtechnician.model";

export interface Nabl {
    id: number;
    name: string;
    department: string;
    status_id: string;
    added_on: string;
    patient: Patient;
    phlebotomist: Phlebotomist; // You might want to define a proper interface for phlebotomist
    labtechnician: LabTechnician; // You might want to define a proper interface for labtechnician
    result: any; // You might want to define a proper interface for result
    [key: string]: any; 
  }