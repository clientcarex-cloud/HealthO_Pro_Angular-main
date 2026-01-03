import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
// import { ExpenseResponse } from "../models/expense/expenseResponse.model";
import { DoctorAuthorization } from "../models/drauth.model";
import { DrAuthResponse } from "../models/drauthResponse.model";
import { LabPatientTestResult } from "../models/lab_patient_test.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })


export class DrAuthsEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    getDrAuth(page_size:any,pageNumber:any ,
        status: string,query:string,
        date:any,from_date:any, to_date:any, sort: boolean
        ){
       let reqParams = `&page_size=${page_size}&page=${pageNumber}${status}&q=${query}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}`;   
        return this.getData<DrAuthResponse>({ action: "lab_doctor_authorization", params: reqParams});
    }

    getLabReports(id:number){
        let reqParams = `LabPatientTestID=${id}&page_size=all`
        return this.getData<any>({action: `lab_fixed_patient_report_list`, params: reqParams})
    }

    getLabWordReports(id:number){
        let reqParams = `LabPatientTestID=${id}`
        return this.getData<any>({action: `lab_word_patient_report_list`, params: reqParams})
    }

    getStaffID(){
        const labStaffUser = localStorage.getItem('labStaff');
        const labStaffObj = labStaffUser ? JSON.parse(labStaffUser) : null;
        const id = labStaffObj ? labStaffObj.labStaff_id : null;
        return id;
    }
    //POST REQUESTS

    postAuthorization(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_doctor_authorization_approval", body: reqBody });
    }

    postTechnican(model:any, id:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_technicians/${id}/`, body: reqBody, });
    }
    // postReportStatus(){
    //     let reqParams = ""
    //     return this.postModelRequest<any>({action: "generate_test_report", bod})
    // }

}