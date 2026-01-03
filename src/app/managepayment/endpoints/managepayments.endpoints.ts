import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { ManagePaymentResponse } from "../models/managepaymnt_reponse.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class ManagePaymentEndpoint extends BaseEndpoint {

    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    getBid(){
        const currentUser = localStorage.getItem('currentUser');
        const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
        const b_id = currentUserObj ? currentUserObj.b_id : null;
        return b_id
    }

    getPaymentss(pageNumber:any) {
        return this.getData<ManagePaymentResponse>({ action: "manage_payments", params: `page=${pageNumber}`});
    }

    getPayments(pageNumber:any) {
        let reqParams = pageNumber === null ? `` : `page=${pageNumber}`
        return this.getData<ManagePaymentResponse>({ action: "manage_payments", params: reqParams});
    }

    getPaginatedPayments( page_size: number | string,
        pageNumber:any,
        query:string,
        date:any,
        from_date:any,
        to_date:any, status:string , 
        staff: any,
        sort: boolean 
        ){
       let reqParams = `${status}&page_size=${page_size}&page=${pageNumber}&q=${query}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${staff && staff != "" ?  "&lab_staff=" + staff : ""}${sort ? "&sort=added_on" : "&sort=-added_on"}`;
       return this.getData<ManagePaymentResponse>({ action: "manage_payments", params: reqParams});
   }
    
    fetchNextPage(url:any){
        return this.http.get<any>(url);
    }

}