import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { PatientResponse } from "../models/patients/patient_response.model";
import { environment } from "src/environments/environment";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class PatientEndpoint extends BaseEndpoint {

    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc);
        this.route = "lab";
    }

    getTestWiseCollection(
        page_size: number | string,
        pageNumber: any,
        query: string,
        date: any,
        from_date: any,
        to_date: any,
        action: any,
        ids: any
    ) {
        let idsAction = "";
        if (ids) idsAction = `ids=${ids}&`
        let reqParams = `${idsAction}action=${action}&page_size=${page_size}&page=${pageNumber}${status}${query !== "" ? `&q=${query}` : ""}&date=${date}&start_date=${from_date}&end_date=${to_date}`;
        return this.getData<any>({ action: "test_collection_report", params: reqParams });
    }

    getDepartments() {
        return this.getData<PatientResponse>({ action: "lab_departments", params: "page_size=all" });
    }

    getPaginatedPatients(
        page_size: number | string,
        pageNumber: any,
        status: string,
        dept: any,
        query: string,
        date: any,
        from_date: any,
        to_date: any,
        sort: boolean,
        staff: string = "",
        ptnType: string = ""
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}${status}${query !== "" ? `&q=${query}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}${dept !== "" ? `&departments=${dept}` : ""}${staff && staff != "" ? staff : ""}${ptnType && ptnType != "" ? ptnType : ''}`;

        return this.getData<PatientResponse>({ action: "patients_standard_view", params: reqParams });
    }

    getAppointedPatient(id: any) {
        return this.getData<PatientResponse>({ action: `lab_appointment_for_patient/${id}/` });
    }

    getAppointments(
        page_size: number | string,
        status: any,
        pageNumber: any,
        query: string,
        date: any, sort: boolean
    ) {
        let reqParams = `page_size=${page_size}${status ? status : ''}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}&apt_date=${date}${sort ? "&sort=added_on" : "&sort=-added_on"}`;

        return this.getData<PatientResponse>({ action: "lab_appointment_for_patient", params: reqParams });
    }

    getShiftReport(
        labStaff: number,
        templateId: number,
        reportType: any,
        client: number,
        start_date: any,
        end_date: any,
    ) {
        let reqParams = `${labStaff ? 'lab_staff=' + labStaff : ''}&start_date=${start_date}&end_date=${end_date && end_date !== '' ? end_date : ''}&client_id=${client}${reportType && reportType != "" ? '&report=' + reportType : ''}&template_id=${templateId}`
        const reqBody = JSON.stringify({});
        return this.postModelRequest({ action: "print_receptionist_report", body: reqBody, params: reqParams });
    }

    fetchNextPage(url: any) {
        return this.http.get<any>(url);
    }






    // posts 
    postForAlert(model: any) {
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "send_appointment_reminder_sms", body: reqBody, });
    }

    deleteRecords(ids: any[]) {
        const reqBody = JSON.stringify({ ids: ids });
        return this.postData({ action: "delete_records", body: reqBody });
    }

}
