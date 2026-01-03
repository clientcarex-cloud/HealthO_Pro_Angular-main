import { LabTest } from "./labtest.model";
import { Invoice } from "./invoice.model";

export interface Patient {
    id: number;
    title: {name : string | null};
    name: string;
    lab_tests: LabTest[];
    added_on: string;
    created_by: any; // You can replace 'any' with the appropriate type
    mr_no: string;
    visit_id: string;
    invoice: Invoice;
    [key: string]: any; 
  }
  

  