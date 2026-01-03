import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { DoctorsResponse } from "../models/doctorsResponse.model";
import { Doctor } from "../models/doctor.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class DoctorEndpoint extends BaseEndpoint {

    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc);
        this.route = "lab";
    }

    getDoctorLogin(dId: any){
        let reqParams = `doctor_id=${dId}`;
        return this.getData<any>({ action: 'doctor_login', params: reqParams });
    }


    getGenders(pageNumber: any) {
        let reqParams = pageNumber ? `&page=${pageNumber}` : ``;
        return this.getData<any>({ action: "lab_gender", params: reqParams });
    }

    getDepartments() {
        let reqParams = `page_size=all`;
        return this.getData<any>({ action: "lab_departments", params: reqParams });
    }

    getEmploymentTypes() {
        return this.getData<any>({ action: "lab_employment_types", params: "&page_size=all" })
    }

    getShits() {
        return this.getData<any>({ action: "lab_shifts", params: "&page_size=all" });
    }

    getBranches() {
        return this.getData<any>({ action: "lab_branches", params: "&page_size=all" });
    }

    getDoctors() {
        let reqParams = `&page_size=all`;
        return this.getData<DoctorsResponse>({ action: "labdoctors", params: reqParams });
    }

    getSingleDoctor(id: number) {
        return this.getData<DoctorsResponse>({ action: `labdoctors/${id}`, params: `` });
    }

    getAllDoctors() {
        let reqParams = `&page_size=all`
        return this.getData<DoctorsResponse>({ action: "labdoctors", params: reqParams });
    }

    getPaginatedGlobalTests( page_size: number | string,
        pageNumber:any,
        query:string,
        dept:any = ""
        ){
       let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}${dept !== "" ? `&departments=${dept}` : ""}`;
       return this.getData<any>({ action: "lab_global_tests", params: reqParams});
   }

    getPaginatedConsultingDoctors(page_size: number | string,
        pageNumber: any,
        query: string,
        date: any,
        from_date: any,
        to_date: any,
        sort: boolean
    ) {
        let reqParams = `&page_size=${page_size}&page=${pageNumber}&q=${query}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${!sort ? "&sort=name" : "&sort=-name"}`;
        return this.getData<DoctorsResponse>({ action: "lab_get_consulting_doctors", params: reqParams });
    }

    getPaginatedReferralDoctors(
        page_size: number | string,
        pageNumber: any,
        query: string,
        date: any,
        from_date: any,
        to_date: any,
        sort: boolean,
        executive: any
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${!sort ? "&sort=name" : "&sort=-name"}${executive ? executive : ''}`;
        return this.getData<DoctorsResponse>({ action: "lab_get_referral_doctors", params: reqParams });
    }

    searchForDoctor(
        page_size: number | string,
        pageNumber: any,
        query: string,
        mob: any
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&name=${query}` : ""}${mob !== "" ? `&mobile_number=${mob}` : ""}`;
        return this.getData<DoctorsResponse>({ action: "search_for_matching_doctors", params: reqParams });
    }


    getPatientWiseReferralDoctors(
        dId: any,
        page_size: number | string,
        pageNumber: any,
        query: string,
        date: any,
        from_date: any,
        to_date: any,
        sort: boolean,
        executive: any
    ) {
        let reqParams = `d_id=${dId}&page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${!sort ? "&sort=name" : "&sort=-name"}${executive ? executive : ''}`;
        return this.getData<DoctorsResponse>({ action: "patient_wise_doctors", params: reqParams });
    }


    getLabDoctors(query: string){
        return this.getData<any>({ action: "lab_get_referral_doctors", params: `${query !== "" ? `q=${query}` : ""}&page_size=all` });
    }



    
    
    getConsultingDoctorStat(){
        return this.getData<DoctorsResponse>({ action: "lab_consultant_doctor_stats/", });
    }

    getReferralDoctorStat(){
        return this.getData<DoctorsResponse>({ action: "lab_referral_doctor_stats/", });
    }

    getDoctorTypes() {
        return this.getData<DoctorsResponse>({ action: "labdoctors_types" });
    }

    getSpecilizations() {
        let reqParams = `page_size=all`
        return this.getData({ action : 'doctor_specializations', params: reqParams });
    }


    getReferralAmount(id:any, size: any, tests:any){
        let reqParams = `doctor_id=`+ id + `&page_size=` + size + `&tests=` + tests
        return this.getData<any>({ action: "ref_amount_for_doctor", params: reqParams});
    }

    getReferralDoctorPatientCount(doctors: any ,from_date: any, to_date: any){
        let reqParams = `doctors=${doctors}&date_range_after=${from_date}&date_range_before=${to_date}` ;
        return this.getData({ action: 'executive_ref_doctors_stats' , params: reqParams }) ;
    }

    fetchNextPage(url: any) {
        return this.http.get<any>(url);
    }

    // post requests 

    addDoctor(model: Doctor) {
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "labdoctors", body: reqBody });
    }

    postDefaultRefAmount(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "ref_amount_for_doctor", body: reqBody });
    }

    postReferralAmount(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "ref_amount_for_doctor", body: reqBody });
    }


    Post_N_getReferralDoctorAmountReport(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "referral_doctor_report", body: reqBody });
    }

    
    // Post_N_getReferralDoctorPatientCountReport(model:any){
    //     const reqBody = JSON.stringify(model);
    //     return this.postData({ action: `executive_ref_doctors_stats/?date_range_after=${model.start_date}&dat_range_after=${model.end_date}`, body: reqBody });
    // }

    postDocCaseType(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_doctors_consultation_details", body: reqBody });
    }

    postBulk(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "referral_doctor_bulk_edit", body: reqBody });
    }


    postDoctorLogin(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "doctor_login", body : reqBody});
    }

    postSpecialization(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "doctor_specializations", body : reqBody});
    }


    syncDoctor(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "sync_referral_doctor_data", body: reqBody });
    }

    mergeDoctor(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "merging_referral_doctors", body: reqBody });
    }


    updateReferralAmount(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `ref_amount_for_doctor/${model.id}/`, body: reqBody });
    }

    updateDoctor(id: number, model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `labdoctors/${id}/`, body: reqBody });
    }

    // updateReferralAmount(model: any){
    //     const reqBody = JSON.stringify(model);
    //     return this.postData({ action: "ref_amount_for_doctor", body: reqBody });
    // }
}
