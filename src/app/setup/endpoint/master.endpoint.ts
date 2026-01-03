import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { Result } from "../models/result.model";
import { Test } from "../models/master/test.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class MasterEndpoint extends BaseEndpoint {
    
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    getPharmacyDisTax(){
        let reqParams = `page_size=all`
        return this.getData<Result<Test>>({ action: "pharmacy_pricing_configs", params: reqParams});
    }

    getTestFontSizes(){
        let reqParams = `&page_size=all`
        return this.getData<Result<Test>>({ action: "report_font_sizes", params: reqParams});
    }

    getMessagesAdded(){
        let reqParams = `&page_size=all`
        return this.getData<Result<Test>>({ action: "client_wise_templates", params: reqParams});
    }

    getPhlebotomistSetting(){
        let reqParams = `&page_size=all`
        return this.getData<Result<Test>>({ action: "print_report_settings", params: reqParams});
    }

    getManualDateTimeSetting(){
        let reqParams = `&page_size=all`
        return this.getData<Result<Test>>({ action: "other_business_settings", params: reqParams});
    }

    getTests() {
        let reqParams = `&page_size=all`
        return this.getData<Result<Test>>({ action: "lab_global_tests", params: reqParams});
    }

    getPaginatedGlobalTests( page_size: number | string,
        pageNumber:any,
        query:string,
        dept: any,
        ){
       let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}${dept !== "" ? `&departments=${dept}` : ""}`;
       return this.getData<Result<Test>>({ action: "lab_global_tests", params: reqParams});
   }

   getLabTestWithSouring( page_size: number | string,
    pageNumber:any,
    query:string,
    dept: any,
    sourcing: any = null
    ){
   let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}${dept !== "" ? `&departments=${dept}` : ""}${sourcing ? sourcing : ''}`;
   return this.getData<Result<Test>>({ action: "lab_global_tests", params: reqParams});
}

   getTest(id: any){
    return this.getData<Result<Test>>({ action: `lab_global_tests/${id}/`});
   }

    getReportTemplates(){
        let reqParams = `page_size=all`
        return this.getData<Result<any>>({ action: "lab_reports_templates", params: reqParams});
    }

    getGlobalTestReports(id:any){
        let reqParams = `global_test_id=${id}&page_size=all`
        return this.getData<Result<any>>({ action: "lab_reports_templates", params: reqParams});
    }


    getGlobalTestReportsWithDepartment(id:any){
        let reqParams = `departments=${id}&page_size=all`
        return this.getData<Result<any>>({ action: "lab_reports_templates", params: reqParams});
    }


    getReportData(id:any, global:any){
        let reqParams = `global_test_id=${global}&page_size=all`
        return this.getData<Result<any>>({ action: `lab_reports_templates/${id}`, params: reqParams});
    }

    

    getReportTypes(){
        // lab_report_types
        let reqParams = "&page_size=all";
        return this.getData<Result<Test>>({ action: "lab_report_types", params: reqParams});
    }

    getFixedReports(){
        // lab_fixed_report_templates
        let reqParams = "page_size=all"
        return this.getData<Result<Test>>({ action: "lab_fixed_parameters_report_templates", params: reqParams});
    }

    getDicountType(){
      let reqParams = `&page_size=all`
        return this.getData<Result<Test>>({ action: "lab_discount_types", params: reqParams});
    }

    getStaffRoles(){
        return this.getData<any>({action: "lab_staff_role",params:`&page_size=all`});
    }

    getStaffRoleMenuAccessList(id: number){
        let reqParams = `&lab_staff_role=${id}`
        return this.getData<any>({action:`lab_staff_role_permissions`, params: reqParams})
    }

    getWordReport(){
        return this.getData<any>({action: `lab_word_report_templates`, params:"page_size=all"})
    }

    getDepartments(){
        return this.getData<any>({ action : 'lab_departments', params:"page_size=all"})
    }

    getDDashBoardOptions(id:any, c_id:any){
        let reqParams = `lab_staff=${id}&client_id=${c_id}&page_size=all`
        return this.getData<any>({ action : 'dashboard_settings', params: reqParams})
    }


    getLetterHeadSetting(c_id:any){
        let reqParams = `client_id=${c_id}&page_size=all`
        return this.getData<any>({ action : 'letterhead_settings', params: reqParams})
    }


    getSourcingLabLetterhead(c_id:any){
        let reqParams = `sourcing_lab=${c_id}&page_size=all`
        return this.getData<any>({ action : 'sourcing_lab_letterheads', params: reqParams})
    }

    getBusinessDiscountSetting(){
        let reqParams = `page_size=all`
        return this.getData<any>({ action : 'business_discount_settings', params: reqParams})
    }


    getBusinessMinimumPaidAmount(){
        let reqParams = `page_size=all`
        return this.getData<any>({ action : 'business_paid_amount_settings', params: reqParams})
    }


    getPNDTDetails(){
        let reqParams = `page_size=all`
        return this.getData<any>({ action : 'business_pndt_details', params: reqParams})
    }

    getPrintDueReports(){
        let reqParams = `page_size=all`
        return this.getData<any>({ action : 'business_print_due_reports', params: reqParams})
    }


    getMessagesDetails(id:any){
        let reqParams = `client=${id}&page_size=all`
        return this.getData<any>({ action: "business_message_settings", params: reqParams})
    }

    getRefDocSettings(id: any){
        let reqParams = `client=${id}&page_size=all`
        return this.getData<any>({ action: "business_referral_doctor_settings", params: reqParams})
    }

    getDefaultConsultingDoctors(flow: any = null){
        let reqParams = `page_size=all&${flow ? 'flow_type='+flow : ''}`
        return this.getData<any>({ action: "default_consulting_doctor", params: reqParams })
    }

    getMessageStats(
        c_id: any,
        date:any,
        from_date:any,
        to_date:any,
        api: any
    ){
        let reqParams = `client=${c_id}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}`;
        return this.getData<any>({ action: api, params: reqParams});
    }

    getDefaultParamters( 
        test_id: any,
        page_size: number | string,
        pageNumber:any,
        query:string
        ){
       let reqParams = `test=${test_id}&page_size=${page_size}&page=${pageNumber}${query !== "" ? `&parameter=${query}` : ""}`;
       return this.getData<Result<Test>>({ action: "default_parameters", params: reqParams});
   }


   getEmailCredentials(){
    let reqParams = `page_size=all`;
    return this.getData<any>({ action: 'client_email_details', params: reqParams});
   }




    // getwordReports

    // post requests

    postNormalRanges(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `lab_fixed_parameters_normal_ranges`, body: reqBody });
    }

    PostDefaultParamters(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `default_parameters`, body: reqBody });
    }

    PostLetterHeadSetting(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `letterhead_settings/`, body: reqBody });
    }

    postStaffRole(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `lab_staff_role/?`, body: reqBody });
    }

    postTest(model: any){
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "lab_global_tests", body: reqBody });
    }

    postReportTemplate(model:any){
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "lab_reports_templates", body: reqBody });
    }

    postfixedReport(model:any){
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "lab_reports_templates", body: reqBody });
    }

    postDepartment(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_departments", body: reqBody });
    }


    postBusinessDiscountSetting(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "business_discount_settings", body: reqBody });
    }

    
    postMinimumPAidAmountSetting(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "business_paid_amount_settings", body: reqBody });
    }


        
    postDuePrintSetting(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "business_print_due_reports", body: reqBody });
    }

    postPNDTDetails(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "business_pndt_details", body: reqBody });
    }


    // updateDepartment(model: any){
    //     const reqBody = JSON.stringify(model);
    //     return this.postData({ action: "lab_departments", body: reqBody });
    // }
    postFixedReportParameters(model:any){
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "lab_fixed_parameters_report_templates", body: reqBody });
    }


    updateBusinessDiscountSetting(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `business_discount_settings/${model.id}/`, body: reqBody });
    }


    updateMinimumPaidAmountSetting(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `business_paid_amount_settings/${model.id}/`, body: reqBody });
    }


    updateFixedParameterOrdering(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_fixed_parameters_report_templates/${model.id}/`, body: reqBody });
    }

    updateReports(model:any,id: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action : `lab_reports_templates/${id}/`, body: reqBody})
    }
        
    postDiscount(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_discount_types", body: reqBody });
    }

    postWordReport(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_word_report_templates", body: reqBody });
    }

    postDepartmentDoctorLabTechnician(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "defaults_for_departments", body: reqBody });
    }

    // UPDATE REQUESTS

    updatePharmacyDiscountTax(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `pharmacy_pricing_configs/${model.id}/`, body: reqBody });
    }

    updateDepartmentDoctorLabTechnician(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `defaults_for_departments/${model.id}/`, body: reqBody });
    }
    
    updatePNDTDetails(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `business_pndt_details/${model.id}/`, body: reqBody });
    }

    updateWordReport(model:any){
        // lab_fixed_patient_report_update
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_word_report_templates/${model.id}/`, body: reqBody });
    }

    updateStaffRole(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_staff_role/${model.id}/`, body: reqBody });
    }

    updateStaffRolePermissions(id:number, model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `lab_staff_role_permissions/?&lab_staff_role=${id}`, body: reqBody });
    }

    updateDepartment(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_departments/${model.id}/`, body: reqBody });
    }


    UpdateDiscount(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_discount_types/${model.id}/`, body: reqBody });
    }

    updateTest(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_global_tests/${model.id}/`, body: reqBody });
    }

    updateReportDefault(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_reports_templates/${model.id}/`, body: reqBody });
    }


    UpdateLetterHeadSetting(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `letterhead_settings/${model.id}/?client_id=${model.client}`, body: reqBody });
    }

    UpdateSourcingLetterHeadSetting(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `sourcing_lab_letterheads/${model.id}/`, body: reqBody });
    }

    updateDuePrintSetting(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `business_print_due_reports/${model.id}/`, body: reqBody });
    }


    updateMessagesStatus(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `business_message_settings/${model.id}/?client=${model.client}`, body: reqBody });
    }




    deleteFixedParamter(model:any){
        const reqBody = JSON.stringify(model);
        return this.deleteData({ action: `lab_fixed_parameters_report_templates/${model.id}`, body: reqBody });
    }


    // postNormalRanges(model: any){
    //     const reqBody = JSON.stringify(model);
    //     return this.postData({ action: `lab_fixed_parameters_normal_ranges`, body: reqBody });
    // }

    deleteNormalRanges(id:any){
        const reqBody = JSON.stringify({});
        return this.deleteData({ action: `lab_fixed_parameters_normal_ranges/${id}`, body: reqBody });
    }











    // print templates 
    getPrintTemplates(page_size: number | string,
        pageNumber: any,
        query: string, type: any = null
    ){
        let reqParams = `${type && type!== '' ? 'type=' + type.id : ''}&page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}`;
        return this.getData<any>({ action: "print_templates", params: reqParams });
    }

    getPrintDataTemplates(id: number) {
        return this.getData<any>({ action: `print_data_templates/?q=${id}` });
    }

    getPrintTemplatesTypes() {
        return this.getData<any>({ action: "print_template_types", params: "" });
    }

    // post requests
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


    postDashboardOptions(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `dashboard_settings`, body: reqBody, });
    }

    PostDefaultDoctors(model: any) {
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `default_consulting_doctor`, body: reqBody, });
    }


    postPreviewForHeader(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `replace_header_content`, body: reqBody, });
    }



    //put requests 

    updateDefaultDoctors(model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `default_consulting_doctor/${model.id}/`, body: reqBody, });
    }
    

    updateTemplateData(model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `print_templates/${model.id}/`, body: reqBody, });
    }

    UpdateTemplateData(model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `print_data_templates/${model.id}/`, body: reqBody, });
    }

    UpdateDashboardOptions(model:any, id: any, c_id:any){
        const reqBody = JSON.stringify(model);
        let reqParams = `lab_staff=${id}`
        return this.PutModelRequest({ action: `dashboard_settings/${model.id}/?${reqParams}`, body: reqBody, });
    }

    updateRefSetting(model:any){
        const reqBody = JSON.stringify(model);
        let reqParams = `client=${model.client}`
        return this.PutModelRequest({ action: `business_referral_doctor_settings/${model.id}/?${reqParams}`, body: reqBody, });
    }

    updateDefaultParam(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `default_parameters/${model.id}/`, body: reqBody, });
    }

    updatePhlebotomistBarcodeSettings(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `print_report_settings/${model.id}/`, body: reqBody, });
    }

    updateMessageTemplates(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `client_wise_templates/${model.id}/`, body: reqBody, });
    }


    updateManualDateTime(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `other_business_settings/${model.id}/`, body: reqBody, });
    }

    updateEmailCredentials(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `client_email_details/${model.id}/`, body: reqBody, });
    }

    updateTestRepotFontSize(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `report_font_sizes/${model.id}/`, body: reqBody, });
    }
    
}
