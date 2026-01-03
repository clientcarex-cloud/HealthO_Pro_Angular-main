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
    prescription_attach: string | null;
    mr_no: string;
    visit_id: string;
    added_on: string;
    b_id: number;
    title: number;
    gender: number;
    referral_doctor: number;
    attender_relationship_title: string | null;
    department: number;
    created_by: string;
}