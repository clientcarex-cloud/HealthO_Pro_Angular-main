import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { environment } from "src/environments/environment";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })
export class TopbarEndPoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    getActiveDeparments() {
        let reqParams = `users`;
        return this.getData<any>({ params: reqParams });
    }

    getSearchResults(search:string){
        let reqParams = `q=${search}`
        return this.getData<any>({ action: "master_search", params: reqParams})
    }


    getUsers(pageNumber:any){
        let reqParams = pageNumber ? `?page=${pageNumber}` : "";
        return this.http.get(`${this.basePath}/user/users/${reqParams}`);
    }

    getSubscriptionHistory(){
        return this.getData<any>({ action: "b_subscription_billing_invoice_of_client", params: "page_size=all"})
    }


    getOverviewDetails(){
        return this.getData<any>({ action: "b_subscription_details_of_client", params: "page_size=all"})
    }

    getBusinessPlanCalculation(){
        return this.getData<any>({ action: "business_plan_calculation", params: "page_size=all"})
    }

    getInvoiceBillOFClient(id:any){
        const reqBody = JSON.stringify({});
        return this.postDataNotWithSlash({ action: `generate_billing_invoice_of_client/?b_id=${id}`, body: reqBody });
    }


    getBusinessSubscriptionPlanPurchase(page_size: any){
        let reqParams = `page_size=${page_size}`
        return this.getData({ action: `business_subscription_plans_purchased`, params: reqParams});
    }


    postSubscription(id : any){
        const reqBody = JSON.stringify({});
        return this.postDataNotWithSlash({ action: `business_subscription_plans_purchased/?b_id=${id}`, body: reqBody });
    }

    
    updateDefaultBranch(model : any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_staff_default_branch/${model.id}/`, body: reqBody });
    }
}