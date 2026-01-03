import { LabStaffPersonalDetails } from "./personal-details.model";
import { LabStaffIdentificationDetails } from "./identification-details.model";


export interface Staff {
  id: number;
  lab_working_days: any[]; // You might want to replace `any[]` with a more specific type if possible
  is_active: boolean;
  is_superadmin: boolean;
  added_on: string;
  name: string;
  mobile_number: string | number;
  email: string;
  date_of_birth: string | null;
  // b_id: number;
  // CUser: number;
  is_login_access: boolean;
  employement_type:  {
    id: number ;
    name: string;
},
  gender: string | null;
  role: {
    id: number ;
    name: string;
},
  department: {
    id: number ;
    name: string;
},
  shift: string | null;
  branch:  {
    id: number ;
    name: string;
},
  lab_staff_personal_details: LabStaffPersonalDetails;
  lab_staff_identification_details: LabStaffIdentificationDetails;
  [key: string]: any; 
}