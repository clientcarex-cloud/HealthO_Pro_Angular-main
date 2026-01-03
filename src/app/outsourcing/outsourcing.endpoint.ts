import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class OutsourcingEndpoint extends BaseEndpoint {

    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    getAdvnacePaymentHistory(
        id: number,
        page_number: any,
        page_size: any,
    ){
        let reqParams = `sourcing_lab=${id}&page_size=${page_size}&page=${page_number}` ;
        return this.getData<any>({ action: "sourcing_lab_payments", params: reqParams});
    }

    getIsStaffRefLab(id: any){
        let reqParams = `lab_staff=${id}` ;
        return this.getData<any>({ action: "get_sourcing_lab_from_lab_staff", params: reqParams});
    }

    getCompanyPartnerShips(query: any, page_size: any){
        let reqParams = `query=${query}&page_size=${page_size}` ;
        return this.getData<any>({ action: "company_work_partnership", params: reqParams});
    }

    getTestReport(sourcing_lab: any, patient_id: any, test_id: any, lh: boolean){
        let reqParams = `sourcing_lab=${sourcing_lab}&patient_id=${patient_id}&test_ids=${test_id}&lh=${lh}`
        return this.getData<any>({ action: "get_print_of_lab_patient_tests", params: reqParams});
    }

    getSourcingPatients(
        sourcing_lab: any,
        query: any,
        page_size: any,
        page_number: any,
        date: any,
        from_date: any,
        to_date: any,
        sort: any
    ){
        let reqParams = `sourcing_lab=${sourcing_lab}&query=${query}&page_size=${page_size}&page=${page_number}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}`
        return this.getData<any>({ action: "get_patient_tests_status_from_lab", params: reqParams });
    }

    getCompanyPatients(
        sourcing_lab: any,
        query: any,
        page_size: any,
        page_number: any,
        date: any,
        from_date: any,
        to_date: any,
        sort: any,
        partner: any = null,
        status: any = null
    ){
        let reqParams = `company=${sourcing_lab}&query=${query}&page_size=${page_size}&page=${page_number}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}${partner ? partner : ''}${status ? status : ''}`
        return this.getData<any>({ action: "get_patients_from_company", params: reqParams });
    }

    getPatients(
        query: any,
        page_size: any, 
        page_number: any, 
        date: any,
        from_date:any,
        to_date:any,
        to_sent: any,
        sort: any
    ){
        let reqParams = `query=${query}&page_size=${page_size}&page=${page_number}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}&to_send=${to_sent}${sort ? "&sort=added_on" : "&sort=-added_on"}`
        return this.getData<any>({ action: "sourcing_lab_test_tracker", params: reqParams });
    }

    getPartnerships(query: any, sourcing_term: any , id: any, page_size: any, page_number: any, is_active: boolean){
        let reqParams = `query=${query}${id ? '&' + sourcing_term + id : ''}&page_size=${page_size}&page=${page_number}&is_active=${is_active}`
        return this.getData<any>({ action: "sourcing_lab_registration", params: reqParams });
    }

    getSpecificSourcingLab(id: any){
        return this.getData<any>({ action: `sourcing_lab_registration/${id}`, params: '' });
    }

    getCompanies(query: any, page_size: any, page_number: any){
        let reqParams = `query=${query}&page_size=${page_size}&page=${page_number}`
        return this.getData<any>({ action: "company", params: reqParams });
    }

    getOrganizations(query: string){
        let reqParams = `query=${query}&page_size=all`
        return this.getData<any>({ action: "sourcing_labs_list", params: reqParams});
    }

    getSourcingDepartments(id: any){
        let reqParams = `b_id=${id}&departments=true&page_size=all`
        return this.getData<any>({ action: "get_sourcing_lab_tests_master", params: reqParams});
    }

    getSourcingTests(id: any, query: any, page_number: any, page_size: any, dept: any){
        let reqParams = `b_id=${id}&query=${query}&page=${page_number}&page_size=${page_size}&${dept !== "" ? `&departments=${dept}` : ""}`
        return this.getData<any>({ action: "get_sourcing_lab_tests_master", params: reqParams});
    }

    getRevisedTests(id: any, query: any, page_number: any, page_size: any, dept: any){
        let reqParams = `sourcing_lab=${id}&query=${query}&page=${page_number}&page_size=${page_size}${dept !== "" ? `&departments=${dept}` : ""}`
        return this.getData<any>({ action: "revised_test_price", params: reqParams});
    }

    getRevisedTestsCompany(id: any, query: any, page_number: any, page_size: any, dept: any){
        let reqParams = `company=${id}&query=${query}&page=${page_number}&page_size=${page_size}${dept !== "" ? `&departments=${dept}` : ""}`
        return this.getData<any>({ action: "company_test_prices", params: reqParams});
    }

    getImportedTests(id: any, sourcing_id: any){
        let reqParams = `b_id=${id}&&${sourcing_id ? 'sourcing_lab='+sourcing_id : ''}&imported=true&page_size=all`
        return this.getData<any>({ action: "get_sourcing_lab_tests_master", params: reqParams});
    }

    getPatientTestFiles(id: any){
        let reqParams = `page_size=all&patient=${id}`
        return this.getData<any>({ action: 'sourcing_reports_upload', params: reqParams })
    }

    postCollab(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "sourcing_lab_registration", body: reqBody });
    }

    postTests(model: any){
        const reqBody = JSON.stringify({});
        return this.postDataNotWithSlash({ action: `create_sourcing_lab_tests/?sourcing_lab=${model.id}&test_ids=${model.tests}`, body: reqBody });
    }

    postBulkPayment(model: any){
        const reqBody = JSON.stringify(model);
        return this.postDataNotWithSlash({ action: `generate_receipt/`, body: reqBody });
    }

    postInvoice(model: any){
        const reqBody = JSON.stringify(model);
        return this.postDataNotWithSlash({ action: `print_company_invoice/`, body: reqBody });
    }

    createSouringTests(model: any){
        const reqBody = JSON.stringify({});
        return this.postDataNotWithSlash({ action: `get_and_create_patient_for_lab/?sourcing_lab=${model.sourcing_lab}&patient_ids=${model.patient_id}`, body: reqBody });
    }

    postRevisedTest(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `revised_test_price`, body: reqBody });
    }

    postCompanyRevisedTest(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `company_test_prices`, body: reqBody });
    }

    postCompany(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `company`, body: reqBody });
    }

    postCompanyPartnership(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `company_work_partnership`, body: reqBody });
    }


    postTestFile(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `sourcing_reports_upload`, body: reqBody });
    }

    postRefLabLoginAccess(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `referral_lab_login_access`, body: reqBody });
    }

    postSyncTests(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `sync_revised_price_for_ref_labs`, body: reqBody });
    }

    postEmail(model: any){
        const reqBody = JSON.stringify(model);
        return this.postDataNotWithSlash({ action: `sending_patients_reports_via_email/`, body: reqBody });
    }

    postSourcingAdvancePayment(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `sourcing_lab_payments`, body: reqBody });
    }

    updateColab(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `sourcing_lab_registration/${model.id}/`, body: reqBody });
    }

    updateCompanyPartnership(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `company_work_partnership/${model.id}/`, body: reqBody });
    }

    updateCompany(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `company/${model.id}/`, body: reqBody });
    }


    updateCollab(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `sourcing_lab_registration/${model.id}/`, body: reqBody });
    }

    updateSourcing(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `sourcing_lab_test_tracker/${model.id}/`, body: reqBody });
    }

    updateRevisedTest(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `revised_test_price/${model.id}/`, body: reqBody });
    }

    updateCompanyRevisedTest(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `company_test_prices/${model.id}/`, body: reqBody });
    }


    deleteCollab(id: any){
        const reqBody = JSON.stringify({});
        return this.deleteData({ action: `sourcing_lab_registration/${id}`, body: reqBody });
    }


}