export interface LabTest {
    LabGlobalTestId: number;
    price: string;
    name: string;
    status_id: string;
    department: string;
    b_id: number;
    short_code: string;
    phlebotomist:{
      is_collected : boolean;
      assession_number: any;
    }
  }
  