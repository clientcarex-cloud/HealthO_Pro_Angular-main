export interface Patient {
    id: number;
    b_id: number;
    mr_no: string;
    visit_id: string;
    name: string;
    age: number;
    dob: string | null;
    attender_name: string;
    mobile_number: string;
    email: string;
    area: string;
    address: string;
    prescription_attach: string | null;
    added_on: string;
    title: number;
    gender: number;
    referral_doctor: number;
    attender_relationship_title: string | null;
    department: number;
    created_by: number;

}

