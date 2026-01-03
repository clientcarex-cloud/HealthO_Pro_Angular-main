import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";

import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class MarketExecutiveEndpoint extends BaseEndpoint {

    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc);
        this.route = "lab";
    }

    getVisit(
        page_size: number | string,
        pageNumber: any,
        query: string,
        sort: boolean,
        date:any,
        from_date:any,
        to_date:any,
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}${status}${query !== "" ? `&q=${query}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}`;
        return this.getData<any>({ action: "marketing_visits", params: reqParams });
    }

    getLeaves(
        page_size: number | string,
        pageNumber: any,
        query: string,
        sort: boolean,
        date:any,
        from_date:any,
        to_date:any,
        staffQuery: any
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}${staffQuery ? staffQuery : ''}`;
        return this.getData<any>({ action: "staff_leave_request", params: reqParams });
    }

    getLeavesStats(
        page_size: number | string,
        pageNumber: any,
        query: string,
        sort: boolean,
        date:any,
        from_date:any,
        to_date:any,
        staffQuery: any
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${staffQuery ? staffQuery : ''}`;
        return this.getData<any>({ action: "leaves_stats", params: reqParams });
    }

    getLeavePolicy() {
        // let reqParams = `page_size=${page_size}&page=${pageNumber}${status}${query !== "" ? `&q=${query}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}${staffQuery ? staffQuery : ''}`;
        return this.getData<any>({ action: "leave_policy" });
    }

    getAttendance(
        page_size: number | string,
        pageNumber: any,
        query: string,
        sort: boolean,
        date:any,
        staffQuery: any
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}${status}${query !== "" ? `&q=${query}` : ""}&date=${date}${sort ? "&sort=added_on" : "&sort=-added_on"}${staffQuery ? staffQuery : ''}`;
        return this.getData<any>({ action: "attendance_details", params: reqParams });
    }

    getPayroll(
        page_size: number | string,
        pageNumber: any,
        query: string,
        sort: boolean,
        staffQuery: any
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}${status}${query !== "" ? `&q=${query}` : ""}${sort ? "&sort=added_on" : "&sort=-added_on"}${staffQuery ? staffQuery : ''}`;
        return this.getData<any>({ action: "lab_staff_payroll_details", params: reqParams });
    }

    getVisitByExecutive(
        page_size: number | string,
        pageNumber: any,
        query: string,
        sort: boolean,
        date:any,
        from_date:any,
        to_date:any,
        staff: any
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}${status}${query !== "" ? `&q=${query}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}${staff ? staff : ''}`;
        return this.getData<any>({ action: "marketing_visits_by_lab_staff", params: reqParams });
    }


    getTargets(
        page_size: number | string,
        pageNumber: any,
        query: string,
        sort: boolean,
        date:any,
        from_date:any,
        to_date:any,
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}${status}${query !== "" ? `&q=${query}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}`;
        return this.getData<any>({ action: "marketing_executive_targets", params: reqParams });
    }

    getExecutiveTargets(
        page_size: number | string,
        pageNumber: any,
        query: string,
        sort: boolean,
        date:any,
        from_date:any,
        to_date:any,
        staff: any
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}${status}${query !== "" ? `&q=${query}` : ""}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}${staff ? staff : ''}`;
        return this.getData<any>({ action: "marketing_targets_by_lab_staff", params: reqParams });
    }

    getDocAmbulanceTypes() {
        let reqParams = 'page_size=all';
        return this.getData<any>({ action: "privilege_ambulance_types", params: reqParams });
    }

    getDistanceFromRouteAPI(coords: any){
        return this.getDistance<any>({ action: coords })
    }

    getStaffLocation(id: any){
        let reqParams = `lab_staff=${id}&page_size=all`;
        return this.getData<any>({ action: "marketing_executive_location", params: reqParams });
    }


    // post requests 


    postVisit(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: 'marketing_visits', body: reqBody });
    }

    postLocation(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: 'marketing_executive_location', body: reqBody });
    }

    postAttendance(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: 'lab_staff_attendance', body: reqBody });
    }

    postTarget(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: 'marketing_executive_targets', body: reqBody });
    }

    postLeave(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: 'staff_leave_request', body: reqBody });
    }

    postPayroll(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: 'lab_staff_pay_roll', body: reqBody });
    }

    updatePayroll(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_staff_pay_roll/${model.id}/`, body: reqBody });
    }

    updateLeave(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `staff_leave_request/${model.id}/`, body: reqBody });
    }

    updateTarget(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `marketing_executive_targets/${model.id}/`, body: reqBody });
    }

    updateAttendace(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_staff_attendance/${model.id}/`, body: reqBody });
    }

    updateVisit(model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `marketing_visits/${model.id}/`, body: reqBody });
    }

    updateCard(id: number, model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `privilege_cards/${id}/`, body: reqBody });
    }

    updateLeavePolicy(model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `leave_policy/${model.id}/`, body: reqBody });
    }

    updateLocation(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `marketing_executive_location/${model.id}/`, body: reqBody });
    }

}
