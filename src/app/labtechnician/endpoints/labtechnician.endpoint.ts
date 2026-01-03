import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { LabTechnicianResponse } from "../models/labtechnicianResponse.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })


export class LabTechnicianEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    getPatientPastReports(mrNo: any, tId : number){
        let reqParams = `page_size=all&mr_no=${mrNo}&test_id=${tId}` ;
        return this.getData<LabTechnicianResponse>({ action: "print_past_reports", params: reqParams });
    }

    getLabStaff(){
        const currentUser = localStorage.getItem('currentUser');
        const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
        const phone_number = currentUserObj ? currentUserObj.phone_number : null;
        const b_id = currentUserObj ? currentUserObj.b_id : null;
        return this.getData<any>({ action: "lab_staff_access", params: `b_id=${b_id}&mobile_number=${phone_number}`})
    }

    getLabTechnicians(page_size:any,pageNumber:any ,
        status: string,query:string, dept: string,
        date:any,from_date:any, to_date:any,sort: boolean, refTerm: any = '', refDoc: boolean = false, 
        ){
        let reqParams = `&page_size=${page_size}&page=${pageNumber}${status}&q=${query}${dept !== "" ? `&departments=${dept}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${!sort ? "&sort=added_on" : "&sort=-added_on"}${refDoc ? '&ref_doctors=true' : ''}`;   
        if(refTerm && refTerm!=''){
            reqParams+= "&ref_doctor=" + refTerm
        }
        return this.getData<LabTechnicianResponse>({ action: "lab_technicians_list", params: reqParams });
    }

    getSpecificLabTechinican(id: any, api: any = 'lab_technicians'){
        return this.getData<LabTechnicianResponse>({ action: `${api}/${id}/` });
    }

    getSpecificLabTechinicanList(id: any, api: any = 'lab_technicians_list'){
        return this.getData<LabTechnicianResponse>({ action: `${api}/?id=${id}` });
    }

    getLabTechniciansRef(page_size:any,pageNumber:any ,
        status: string,query:string, dept: string,
        date:any,from_date:any, to_date:any,sort: boolean, refTerm: any = '', refDoc: boolean = false, 
        ){
        let reqParams = `&page_size=${'all'}&page=${pageNumber}${status}&q=${query}${dept !== "" ? `&departments=${dept}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${!sort ? "&sort=added_on" : "&sort=-added_on"}${refDoc ? '&ref_doctors=true' : ''}`;   
        if(refTerm && refTerm!=''){
            reqParams+= "&ref_doctor=" + refTerm
        }
        return this.getData<LabTechnicianResponse>({ action: "lab_technicians_list", params: reqParams });
    }


    getULabPatientAges(pageNumber:any){
        let reqParams = pageNumber ? `&page=${pageNumber}` : ``;
        return this.getData<any>({action: `ulab_patient_ages`, params: reqParams})
    }

    getTPAMetaInfo(date:any,from_date:any, to_date:any){
        let reqParams = `page_size=all&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}`
        return this.getData<any>({action: `tpa_meta_info`, params: reqParams})
    }

    getLabReports(id:number){
        let reqParams = `LabPatientTestID=${id}`
        return this.getData<any>({action: `lab_fixed_patient_report_list`, params: reqParams})
    }

    getWordReport(id:number){
        let reqParams = `LabPatientTestID=${id}`
        return this.getData<any>({action: `lab_word_patient_report_list`, params: reqParams})
    }

    updateWordReport(model:any){
        // lab_fixed_patient_report_update
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_word_patient_report_list/${model.id}/`, body: reqBody });
    }

    previewWordReport(model:any){
        // lab_fixed_patient_report_update
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_word_patient_preview_report_list/1/`, body: reqBody });
    }

    postPreviewWordReport(model:any){
        // lab_fixed_patient_report_update
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `lab_word_patient_preview_report_list/`, body: reqBody });
    }


    updateLabTechnicians(model:any){
        // lab_fixed_patient_report_update
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_fixed_patient_report_update/${model.id}/`, body: reqBody });
    }

    getReportParams(model:any) {
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_patient_report_generate", body: reqBody, });
    }

    getwordReportParams(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_patient_test_word_report_generate", body: reqBody, });
    }

    getLabDoctors(query: string, api: string = "lab_get_consulting_doctors"){
        return this.getData<any>({ action: api, params: `${query !== "" ? `q=${query}` : ""}&page_size=all` });
    }

    printReport(model:any, api: any = 'print_test_report'){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: api, body: reqBody, });
    }

    printPreview(model:any){        
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "print_test_preview_report", body: reqBody, });
    }


    // Post Requets 

    postSourcingTechnican(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `lab_technicians`, body: reqBody, });
    }

    postTechnican(model:any, id:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_technicians/${id}/`, body: reqBody, });
    }

    previewTechnican(model:any, id:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `preview_lab_technicians/1/`, body: reqBody, });
    }

    PostPreviewTechnican(model:any, id:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `preview_lab_technicians/`, body: reqBody, });
    }

    PostPhlebotomistReceiveStatus(model: any, id:number){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_phlebotomists/${id}/`,  body: reqBody, });
    }

    deleteTestReport(model: any){
        const reqBody = JSON.stringify(model);
        return this.postDataNotWithSlash({ action: "lab_patient_test_fixed_report_delete", body: reqBody });
    }

}