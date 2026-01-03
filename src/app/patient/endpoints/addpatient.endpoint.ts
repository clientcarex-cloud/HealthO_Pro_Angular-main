import * as Util from "@sharedcommon/base/utils";
import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { AddPatientsModel } from "../models/addPatient/addpatient.model";
import { GlobalTestModel } from "../models/addPatient/globaltest.model";
import { DoctorModel } from "../models/addPatient/doctor.model";

import { PatientResponse } from "../models/patients/patient_response.model";
import { Payment } from "../models/patients/payment.model";
import { Observable } from "rxjs";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })


export class AddPatientEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }




    //get test details 
    getGlobalTests(pageNumber: any){
        let reqParams = pageNumber ? `&page=${pageNumber}` : ``;
        return this.getData<GlobalTestModel>({ action: "lab_global_tests", params: reqParams });
    }

    getTestsSearchResults(search:string){
        let reqParams = `&page_size=all&q=${search}`;
        return this.getData<GlobalTestModel>({ action: "lab_global_tests", params: reqParams });
    }


    getTestsMasterSearch(search:string, showRefLab: boolean ){
        let reqParams = `page_size=all&q=${search}&show_ref_lab=${showRefLab}`;
        return this.getData<GlobalTestModel>({ action: "tests_master_search", params: reqParams });
    }

    //get doctors
    getDoctors(pageNumber: any){
        let reqParams = pageNumber ? `&page=${pageNumber}` : ``;
        return this.getData<any>({ action: "labdoctors", params: reqParams });
    }


    getLabDoctors(query: string, api: string = "lab_get_referral_doctors"){
        return this.getData<any>({ action: api, params: `${query !== "" ? `q=${query}` : ""}&page_size=all` });
    }

    getAllDoctors(){
        let reqParams = `&page_size=all`;
        return this.getData<any>({ action: "labdoctors", params: reqParams });
    }



    getReceipt(model: Payment){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "generate_receipt", body: reqBody });
    }

    getInvoice(model: Payment){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "print_patient_invoice", body: reqBody });
    }

    getRefundList(id:any){
        return this.getData({action: "lab_patient_get_refund", params: `&patient=${id}`})
    }

    getReceipt_test(model: Payment){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_patient_receipt_payments", body: reqBody });
    }

    getLabStaff(){
        const currentUser = localStorage.getItem('currentUser');
        const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
        const phone_number = currentUserObj ? currentUserObj.phone_number : null;
        return this.getData<any>({ action: "lab_staff_access", params: `&mobile_number=${phone_number}`})
    }

    getSupport(){
        return this.http.get<any>(`${this.basePath}/user/support_info_tutorials/`)
    }

    getDiscountTypes(){
        let reqParams = `page_size=all`
        return this.getData<any>({action : "lab_discount_types", params: reqParams});
    }



    getPatients() {
        return this.getData<PatientResponse>({ action: "patients_standard_view", params: ``});
    }

    getPatientDetails(id:number){
        return this.getData<PatientResponse>({ action: "patients_standard_view", params: `id=${id}`});
    }

    getPaymentHistory(id:number){
        let reqParams = `patient=${id}&page_size=all`
        return this.getData<PatientResponse>({ action: "lab_patient_receipts", params: reqParams});
    }

    getRefundHistory(id:number){
        let reqParams = `patient=${id}&page_size=all`
        return this.getData<PatientResponse>({ action: "lab_patient_get_refund", params: reqParams});
    }



    getPatientPrintReport(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "print_patient_receipt", body: reqBody, });
    }

    getPatientALLPrintInvoice(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "print_patient_consolidated_bill", body: reqBody, });
    }

    getPatientPrintInvoice(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "print_patient_invoice", body: reqBody, });
    }

    getRefundMaxList(model : any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "patient_max_refund_limit", body: reqBody, });
    }

    getPNDTReport(id:any){
        let reqParams = `patient_id=${id}`
        return this.getData<PatientResponse>({ action: "patient_pndt", params: reqParams});
    }

    getPrevCardDisc(id:any, t_ids: any, p_ids: any, type: any){
        // &packages=${p_ids} //if packages are included use this param 
        let reqParams = `membership_id=${id}&tests=${t_ids}&privilege_discount=${type}`
        return this.getData<PatientResponse>({ action: "calculate_privilege_card_discount", params: reqParams});
    }


    getDocAvail(id: any, date: any){
        let reqParams = `doctor_id=${id}&date=${date}&page_size=all`
        return this.getData<PatientResponse>({ action: "lab_doctors_availability", params: reqParams});
    }

    // POST REQUESTS 


    postReferalLabForCheck(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "check_payment_for_referrals", body: reqBody, });
    }

    addPatient(model:AddPatientsModel) {
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "patient", body: reqBody, });
    }


    cancelTest(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_patient_tests/${model.id}/`, body: reqBody, });
    }

    postPNDT(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "patient_pndt", body: reqBody, });
    }    


    postAndGetMultiPrint(test_ids: any, c_id: any, p_id: any, lh: any, download: boolean){
        const reqBody = JSON.stringify({});
        return this.postDataNotWithSlash({ action: `print_patient_test_report/?test_ids=${test_ids}&client_id=${c_id}&patient_id=${p_id}${lh}&download=${download}`, body: reqBody, });
    }


    PostReportsToWhatsApp(test_ids: any, c_id: any, lh: any){
        const reqBody = JSON.stringify({});
        return this.postDataNotWithSlash({ action: `send_test_report_whatsapp/?test_ids=${test_ids}&client_id=${c_id}${lh}`, body: reqBody, });
    }


    PostReportsToEmail(test_ids: any, c_id: any, lh: any){
        const reqBody = JSON.stringify({});
        return this.postDataNotWithSlash({ action: `sending_patients_reports_via_email/?test_ids=${test_ids}&client_id=${c_id}${lh}`, body: reqBody, });
    }
    

    putPNDT(model:any, id:number){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `patient_pndt/${id}/`, body: reqBody, });
    }    



    printPNDT(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "print_patient_pndt", body: reqBody, });
    }

    print_test_report(model:any) {
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "print_test_report", body: reqBody, });
    }

    postRefund(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_patient_refunds", body: reqBody, });
    }

    PostAndGetPatientRefundSlip(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "print_patient_refund", body: reqBody, });
    }

    postNPrintQuotation(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "print_quotation", body: reqBody, });
    }

    postAppointMent(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_appointment_for_patient", body: reqBody, });
    }

    updateAppointMent(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_appointment_for_patient/${model.id}/`, body: reqBody, });
    }

    updatePatient(model:any, id:any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `patient/${id}/`, body: reqBody, });
    }

    updateReceipt(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action : `generate_receipt/${model.id}/`, body: reqBody });
    }
}
