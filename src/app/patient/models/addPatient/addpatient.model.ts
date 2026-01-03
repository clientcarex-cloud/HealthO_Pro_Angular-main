import { LabTest } from "./labtest.model";

export interface AddPatientsModel {
    title: number;
    // b_id: number;
    name: string;
    age?: number;
    dob?: string | Date;
    gender: string;
    ULabPatientAge?: number | null;
    attender_name: string;
    attender_relationship_title: number | null;
    mobile_number: string;
    email?: string;
    area?: string;
    address?: string;
    mr_no?: string;
    visit_id?: string;
    referral_doctor?: any;
    referral_doctors?: any;
    lab_discount_type_id: number;
    department? : number;
    paid_amount?: number;
    pay_mode_id: number;
    discount_amt?: number;
    is_percentage_discount?: boolean;
    lab_tests?: LabTest;
    home_service?: {
        is_required: boolean,
        added_on: string | Date,
        patient: string | null | number,
    },
    created_by?: any;
    lab_packages?: any ;
}

        
