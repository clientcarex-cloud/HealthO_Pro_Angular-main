import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { Subject } from 'rxjs';
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class DashboardEndpoint extends BaseEndpoint {

    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc);
        this.route = "lab";
    }

    // Subject to notify components
    private rangeChangedSubject = new Subject<void>();

    // Observable to subscribe to in components
    rangeChanged$ = this.rangeChangedSubject.asObservable();

    returnBid() {
        const currentUser = localStorage.getItem('currentUser');
        const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
        const b_id = currentUserObj ? currentUserObj.b_id : null;
        return b_id
    }

    date: string = "";
    status_id: string = "";
    from_date: string = "";
    to_date: string = "";

    doctorData!: any;

    range(
        b_id: number = this.returnBid(),
        date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "",
        pageNum: number = 1
    ): { b_id: number, date: string, status_id: string, from_date: string, to_date: string, pageNum: number } {
        if (from_date !== "" && to_date !== "") {
            date = "";
        } else {
            from_date = "";
            to_date = "";
        }

        this.getReferralDoctorAnalytics(1).subscribe((data: any) => {
            this.doctorData = data.results
        })

        return { b_id, date, status_id, from_date, to_date, pageNum };
    }

    getPtnAnalyticss(year: any, month: any, date: any) {

        let validMonth = `${month !== 'all' ? `${year}-${month}` : ""}`;
        let validDate = ""
        if (validMonth === "") {
            validDate = ""
        } else {
            validDate = `${date !== 'all' ? `${year}-${month}-${date}` : ""}`
        }
        let reqParams = `year=${year}&month=${validMonth}&date=${validDate}`
        return this.getData<any>({ action: "patient_analytics", params: reqParams });
    }

    getPtnAnalytics(
        date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "") {
       
        return this.getData<any>({ action: "patient_analytics", params: `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}` });
    }

    getReferralDoctorAnalytics(pageNumber: any = 1, date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "",) {
        let reqParams = pageNumber ? `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}` : `&date=${date}&date_range_after=${this.from_date}&date_range_before=${to_date}`;
        return this.getData<any>({ action: "analytics_referral_doctor_details", params: reqParams });
    }

    getTopLabTests(date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "",) {
        return this.getData<any>({ action: "analytics_top_tests", params: `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}` });
    }

    getBusinessAnalytics(date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "",) {
        return this.getData<any>({ action: "business_status_analytics", params: `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}` })
    }

    getPatientsOverview(date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "",) {
        return this.getData<any>({ action: "analytics_patient_overview", params: `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}` })
    }

    getDepartment(date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "",) {
        return this.getData<any>({ action: "department_analytics", params: `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}` })
    }

    getPayModes(date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "",) {
        return this.getData<any>({ action: "paymode_analytics", params: `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}` })
    }

    getPhlebotomists(date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "",) {
        return this.getData<any>({ action: "phlebotomist_analytics", params: `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}` })
    }

    getTechnicians(date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "",) {
        return this.getData<any>({ action: "technicians_analytics", params: `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}` })
    }

    getRecepsOverview(date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "",) {
        return this.getData<any>({ action: "patient_registration_overview", params: `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}` })
    }

    getDocAuthorization(
        date: string = "",
        status_id: string = "",
        from_date: string = "",
        to_date: string = "",) {
        return this.getData<any>({ action: "doctor_authorization_analytics", params: `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}` })
    }

    getStaffMenuAccess(id: number) {
        let reqParams = `lab_staff=${id}`
        return this.getData<any>({ action: "lab_menu_access_for_staff", params: reqParams })
    }



    getPaymentCollections(
        date: string = "",
        from_date: string = "",
        to_date: string = "",
    ){
        let reqParams = `date=${date}&date_range_after=${from_date}&date_range_before=${to_date}`
        return this.getData<any>({ action: "daywise_collections", params: reqParams })
    }
}