import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { Result } from "../model/result.model";
import { Staff } from "../model/staff.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class StaffEndpoint extends BaseEndpoint {
    
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    pageQuardAuth(staff: any, menu: any){
        let reqParams = `lab_staff=${staff}&menu=${menu}`;
        return this.getData<any>({ action: "lab_staff_page_guard", params: reqParams });
    }

    getExecutiveReports(staffs: any, date: any, from_date: any, to_date: any){
        let reqParams = `lab_staff=${staffs}&date=${date}&from_date=${from_date}&to_date=${to_date}`
        return this.getData({action: 'executive_stats', params: reqParams})
    }

    getShiftReportsTemplates(page_size: number | string,
        pageNumber: any,
        query: string,
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}`;
        return this.getData<any>({ action: "user_collection_reports_list", params: reqParams });
    }

    getStaffPrintControls(id: any){
        let reqParams = `lab_staff_id=${id}&page_size=all`
        return this.getData<any>( {action : "lab_staff_print_settings", params: reqParams } ) 
    }


    getActivityLogs(model:any){
        // &date=${model.date}&date_range_after=${model.from_date}&date_range_before=${model.to_date}
        let reqParams = `lab_staff=${model.lab_staff_id}&page_size=${model.page_size}&page_number=${model.page_number}&operation=${model.operation}&sort=-added_on&date=${model.date}&date_range_after=${model.from_date}&date_range_before=${model.to_date}`
        return this.getData<any>( {action : "activity_logs", params: reqParams } ) 
    }

    getPatientActivityLogs(model:any){
        // &date=${model.date}&date_range_after=${model.from_date}&date_range_before=${model.to_date}
        let reqParams = `patient=${model.patient_id}&page_size=all`
        return this.getData<any>( {action : "activity_logs", params: reqParams } ) 
    }
    
    getGenders(pageNumber:any) {
        let reqParams = pageNumber ? `&page=${pageNumber}` : ``;
        return this.getData<Result>({ action: "lab_gender", params: reqParams});
    }

    getDepartments() {
        let reqParams = `page_size=all`;
        return this.getData<Result>({ action: "lab_departments", params: reqParams});
    }


    getPaginatedStaff(
        page_size: number | string,
         pageNumber:any,
         query:string,
         sort: boolean,
         role: any = null
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}${!sort ? "&sort=added_on" : "&sort=-added_on"}${role ? role : ''}`;
        return this.getData<Result>({ action: "labstaff", params: reqParams});
    }


    getUserCollectionsStaff(
        page_size: number | string,
        pageNumber:any,
        query:string,
        date:any,
        from_date:any,
        to_date:any,
    
        ){
       let reqParams = `page_size=${page_size}&page=${pageNumber}${status}${query !== "" ? `&q=${query}` : ""}&date=${date}&start_date=${from_date}&end_date=${to_date}`;
       return this.getData<Result>({ action: "user_collections", params: reqParams});
        }

    getStaff(pageNumber:any) {
        let reqParams = pageNumber ? `&page=${pageNumber}` : ``;
        return this.getData<Result>({ action: "labstaff", params: reqParams});
    }

    getAllStaff(){
        return this.getData<Result>({ action: "labstaff",params:`page_size=all`});
    }

    getSingleStaff(id:any) {
        return this.getData<Result>({ action: `labstaff/${id}/`, params: ``});
    }

    getMenus(){
        let reqParams = `page_size=all`;
        return this.getData<any>({action: "lab_menus_list",params: reqParams});
    }

    getStaffRoles(){
        return this.getData<any>({action: "lab_staff_role", params:`page_size=all`});
    }

    // getEmploymentTypes(){
    //     return this.getData<any>({action:"lab_employment_types", params: "page_size=all"})
    // }

    getShits(){
        return this.getData<any>({action : "lab_shifts", params: "page_size=all"});
    }

    getBranches(){
        return this.getData<any>({action: "lab_branches", params: "page_size=all"});
    }

    getStaffMenuAccess(id: number){
        let reqParams = `lab_staff=${id}`
        return this.getData<any>({action: "lab_menu_access_for_staff", params: reqParams})
    }

    getDepartmentsToCopy(id:any){
        let reqParams = `client_id=${id}&page_size=all`
        return this.getData<any>({ action: `lab_departments_list_to_copy`, params: reqParams });
    }

    getCopyBizData(id: any){
        let reqParams = `client_id=${id}&page_size=all`
        return this.getData<any>({ action: `copy_biz_data`, params: reqParams });
    }



    getStaffPatientsPermissions(id:any){
        let reqParams = `lab_staff=${id}&page_size=all`
        return this.getData<any>({ action: `user_permissions_access`, params: reqParams });
    }
    
    // post requests

    postDepartmentsForCopy(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `copy_biz_data`, body: reqBody, });
    }

    toggleAccess(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_staff_login_access_action", body: reqBody });
    }

    postStaff(model: any){
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "labstaff", body: reqBody });
    }

    postStaffPermissions(model:any){
        const reqBody = JSON.stringify(model);
        return this.postDataNotWithSlash({ action: `lab_menu_access_for_staff/`, body: reqBody });
    }

    postStaffUSerPermission(model:any){
        const reqBody = JSON.stringify(model);
        return this.postDataNotWithSlash({ action: `user_permissions_access/`, body: reqBody });
    }

    updateStaff(id:number,model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `labstaff/${id}/`, body: reqBody });
    }

    updateStaffPermissions(id:number , model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_menu_access_for_staff/${id}/`, body: reqBody });
    }


    
    UpdateDepartmentsForCopy(model: any, id:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `copy_biz_data/${id}/?client_id=${model.client}`, body: reqBody, });
    }

    updateStaffUserPermissionForAccess(model:any, id: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `user_permissions_access/${id}/`, body: reqBody, });
    }

    updatePrintControls(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_staff_print_settings/${model.id}/?lab_staff_id=${model.lab_staff}`, body: reqBody, });
    }

}
