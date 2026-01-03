import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class ProEndpoint extends BaseEndpoint {

    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc);
        this.route = "pro_u_data";
    }

    getAliments(){
        let reqParams = `page_size=all`;
        return this.getData<any>({ action: `ailments`, params: reqParams });
    }

    getFoodInTakes(){
        let reqParams = `page_size=all`;
        return this.getData<any>({ action: `food_in_take_time`, params: reqParams });
    }

    getDayTimePeriods(){
        let reqParams = `page_size=all`;
        return this.getData<any>({ action: `day_time_periods`, params: reqParams });
    }

    getTaxTypes(){
        let reqParams = `page_size=all`;
        return this.getData<any>({ action: "tax_types", params: reqParams});
    }

    getSupplierTypes(){
        let reqParams = 'page_size=all';
        return this.getData<any>({ action: "supplier_type", params: reqParams});
    }

    getOperationalTypes(){
        let reqParams = `page_size=all`;
        return this.getData<any>({ action: "item_operation_type", params: reqParams});
    }
    
    getPaymentPolicies(){
        let reqParams = `page_size=all` ;
        return this.getData<any>({ action: "sourcing_type", params: reqParams});
    }

    getTimeCategory(){
        let reqParams = `page_size=all`;
        return this.getData<any>({ action: "time_category", params: reqParams});
    }

    getLeaveTypes(){
        return this.getData({ action: 'leave_types', params: 'page_size=all'})
    }

    getLeaveStatusTypes(){
        return this.getData({ action: 'leave_status', params: 'page_size=all'})
    }

    getReferraRangesGenders(){
        return this.getData<any>({ action: "lab_reports_gender", params: 'page_size=all' });
       }

    getEmploymentTypes(){
        return this.getData<any>({action:"lab_employment_types", params: "page_size=all"})
    }

    getSalaryTypes(){
        return this.getData<any>({action:"salary_payment_modes", params: "page_size=all"})
    }
       
    getSenderTypes(){
        return this.getData<any>({ action: `messaging_send_type` , params: 'page_size=all'});
    }

    getVehicleTypes(){
        return this.getData<any>({ action: `vehicle_types` , params: 'page_size=all'});
    }

    getVisitsTypes(){
        return this.getData<any>({ action: `marketing_visit_types` , params: 'page_size=all'});
    }

    getTargetTypes(){
        return this.getData<any>({ action: `marketing_target_types` , params: 'page_size=all'});
    }

    getVisitsStatues(){
        return this.getData<any>({ action: 'marketing_visit_status' , params: 'page_size=all'});
    }
    

    getFuelTypes(){
        return this.getData<any>({ action: `fuel_types` , params: 'page_size=all'});
    }

    getPaymentsTypes(){
        return this.getData<any>({ action: 'marketing_payment_types' , params: 'page_size=all'});
    }
    
    getValidityTypes(){
        let reqParams = 'page_size=all';
        return this.getData<any>({ action: "time_duration_types", params: reqParams });
    }

    getPrivilegeCardPaymentTypes(){
        let reqParams = 'page_size=all';
        return this.getData<any>({ action: "availability_period", params: reqParams });
    }

    getPrivilegeCardBenefitTypes(){
        let reqParams = 'page_size=all';
        return this.getData<any>({ action: "privilege_card_benefits", params: reqParams });
    }
    
    getDocConsultingTypes() {
        let reqParams = 'page_size=all';
        return this.getData<any>({ action: "privilege_doctor_consultation_types", params: reqParams });
    }

    getDocAmbulanceTypes() {
        let reqParams = 'page_size=all';
        return this.getData<any>({ action: "privilege_ambulance_types", params: reqParams });
    }

    getCardRelations(){
        let reqParams = 'page_size=all';
        return this.getData<any>({ action: "relations", params: reqParams }); 
    }

    getDeptFlowType(){
        let reqParams = `page_size=all`
        return this.getData<any>({ action : `department_flow_type`, params: reqParams})
    }

    getPrintTemplatesTags(id:any){
        let reqParams = `template=${id}&page_size=all`
        return this.getData<any>({ action : `get_template_tags`, params: reqParams})
    }

    getAttenderTitles(){
        let reqParams = `page_size=all`
        return this.getData<any>({action : "lab_patient_attender_titles", params: reqParams});
    }

    getGender() {
        return this.getData<any>({ action: "lab_gender", params: "" });
    }

    getStaffGender() {
        return this.getData<any>({ action: "lab_staff_gender", params: "" });
    }

    getTitle() {
        return this.getData<any>({ action: "lab_patient_titles", params: "&page_size=all" });
    }

    getActions() {
        return this.getData<any>({ action: "ulab_patient_action", params: "" });
    }

    getLabTestStatus() {
        return this.getData<any>({ action: "lab_tests_status", params: "&page_size=all" });
    }

    getPayModes() {
        return this.getData<any>({ action: "ulab_payment_mode_types", params: "" })
    }

    getAges() {
        return this.getData<any>({ action: "ulab_patient_ages", params: "" })
    }

    getDepartment() {
        let reqParams = `&page_size=all`
        return this.getData<any>({ action: "lab_departments", params: reqParams });
    }

    getReportTypes() {
        let reqParams = `&page_size=all`
        return this.getData<any>({ action: "lab_report_types", params: reqParams });
    }

    getMenus() {
        return this.getData<any>({ action: "lab_menus_list", params: "page_size=all" })
    }

    getTestStatus(){
        return this.getData<any>({ action: "lab_tests_status", params: "page_size=all" })
    }

    getPrintTemplates(page_size: number | string,
        pageNumber: any,
        query: string,
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}`;
        return this.getData<any>({ action: "print_templates", params: reqParams });
    }

    getShiftReportsTemplates(page_size: number | string,
        pageNumber: any,
        query: string,
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}`;
        return this.getData<any>({ action: "user_collection_reports_list", params: reqParams });
    }

    getPrintDataTemplates(id: number) {
        return this.getData<any>({ action: `print_data_templates/?q=${id}` });
    }

    getPrintTemplatesTypes() {
        return this.getData<any>({ action: "print_template_types", params: "" });
    }

    getDDashBoardOptions(id:any){
        let reqParams = `lab_staff=${id}&page_size=all`
        return this.getData<any>({ action : 'dashboard_settings', params: reqParams})
    }


    getAllPatientsPagePErmissions(id:any){
        let reqParams = `page_size=all`
        return this.getData<any>({ action: `user_permissions`, params: reqParams });
    }

    getFonts(){
        return this.getData<any>( {action : "lab_fonts", params: `page_size=all` } )
    }




    // post requests



    postDashboardOptions(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `dashboard_settings`, body: reqBody, });
    }


    postTemplateData(model: any) {
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `print_templates`, body: reqBody, });
    }

    PostTemplateData(model: any) {
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `print_data_templates`, body: reqBody, });
    }

    PostTemplateType(model: any) {
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `print_template_types`, body: reqBody, });
    }

    //put requests 

    updateTemplateData(model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `print_templates/${model.id}/`, body: reqBody, });
    }

    UpdateTemplateData(model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `print_data_templates/${model.id}/`, body: reqBody, });
    }

}