export interface Patient {
    id: number;
    name: string;
    age: number;
    dob: string | null;
    attender_name: string;
    mobile_number: string;
    email: string;
    area: string;
    address: string;
    prescription_attach: any; // Change this to the correct type if needed
    mr_no: string;
    visit_id: string;
    added_on: string;
    b_id: number;
    title: number;
    ULabPatientAge: number;
    gender: number;
    referral_doctor: number;
    attender_relationship_title: any; // Change this to the correct type if needed
    department: any; // Change this to the correct type if needed
    created_by: any; // Change this to the correct type if needed
  }