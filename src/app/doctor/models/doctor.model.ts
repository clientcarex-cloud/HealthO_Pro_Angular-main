export interface Doctor {
    id: number;
    name: string;
    patients_received: number;
    patients_paid: number;
    mobile_number: string;
    email?: string;
    license_number?: string | null;
    geo_area?: string;
    added_on?: string;
    last_updated?: string;
    b_id?: number;
    pro_user_id?: number;
    doctor_type_id?: number | null;
    specialization?: number;
    gender: any;
    department: any;
    [key: string]: any; 
  }