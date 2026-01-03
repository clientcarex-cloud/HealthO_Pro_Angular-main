import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class HospitalEndpoint extends BaseEndpoint {

    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc);
        this.route = "pro_hospital";
    }

    getPrescriptions( 
        page_size: number | string,
        pageNumber:any,
        status: string,
        dept: any,
        query:string,
        date:any,
        from_date:any,
        to_date:any,
        sort: boolean,
        staff: string = "",
        ptnType: string = ""
        ){
       let reqParams = `page_size=${page_size}&page=${pageNumber}${status}${query !== "" ? `&q=${query}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}${dept !== "" ? `&departments=${dept}` : ""}${staff && staff != "" ?  staff : ""}${ptnType && ptnType != "" ? ptnType : ''}`;

       return this.getData<any>({ action: "get_prescription_patients", params: reqParams});
   }
   
    getCaseTypes(){
        let reqParams = `page_size=all`;
        return this.getData<any>({ action: "case_type", params: reqParams });
    }

    getPatientPrescription(ptnId: any, docId: any){
        let reqParams = `page_size=all&patient=${ptnId}&doctor_consultation=${docId}`;
        return this.getData<any>({ action: "patient_prescription", params: reqParams });
    }

    // posts 

    postCaseType(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "case_type", body: reqBody });
    }

    postPrescription(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: 'patient_prescription', body: reqBody })
    }

    postPrintPrescription(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: 'print_patient_prescription', body: reqBody })
    }


    updatePrescription(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `patient_prescription/${model.id}/`, body: reqBody })
    }

    updatePatientRoomBooking(model: any){
        const reqBody = JSON.stringify(model) ;
        return this.PutModelRequest({ action: `patient_room_booking/${model.id}/`, body: reqBody });
    }

}