import { Injectable, Injector } from "@angular/core";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";
import { SuperBaseEndpoint } from "@sharedcommon/base/super_base.endpoint";

@Injectable({ providedIn: 'root' })


export class ClientEndpoint extends SuperBaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "super_admin";
    }


    getWAToken(bId: any){
        let reqParams = `b_id=${bId}`;   
        return this.getData<any>({ action: "business_whatsapp_configuration", params: reqParams});
    }

    getDeleteOragnizations(action: any){
        let reqParams = `page_size=all&action=${action}`;
        return this.getData<any>({ action: "delete_business_account", params: reqParams});
    }

    getClientsData(
        page_size:any,
        pageNumber:any ,
        query:string,
        date:any,
        from_date:any,
        to_date:any,
        sort: boolean
        ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}&q=${query}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}`;   
        return this.getData<any>({ action: "businessprofiles", params: reqParams});
    }

    getDeleteOrgs(
        page_size:any,
        pageNumber:any ,
        query:string,
        date:any,
        from_date:any,
        to_date:any,
        sort: boolean
        ){
        let reqParams = `action=view&page_size=${page_size}&page=${pageNumber}&q=${query}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}`;   
        return this.getData<any>({ action: "delete_business_account", params: reqParams});
    }

    getPlans(
        page_size:any,
        pageNumber:any ,
        query:string,
        date:any,
        from_date:any,
        to_date:any,
        sort: boolean
        ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}&q=${query}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${sort ? "&sort=added_on" : "&sort=-added_on"}`;   
        return this.getData<any>({ action: "business_subscription_plans", params: reqParams});
    }

    getOrg(id: any){
        return this.getData<any>({ action: `businessprofiles/${id}/`});
    };

    getGlobalMessagingSettings(){
        return this.getData<any>({ action: "global_messaging_settings"});
    }

    getMessagingCredits(bId: any){
        let reqParams = `b_id=${bId}`;   
        return this.getData<any>({ action: "add_message_credits", params: reqParams});
    }

    getAllMenus(){
        let reqParams = `page_size=all`;   
        return this.getData<any>({ action: "lab_menus_list", params: reqParams});
    }

    getMenus(bId: any){
        let reqParams = `b_id=${bId}&page_size=all`;   
        return this.getData<any>({ action: "business_modules", params: reqParams});
    }

    getSubsType(){
        let reqParams = `page_size=all`;   
        return this.getData<any>({ action: "business_subscription_type", params: reqParams});
    }

    getCalsType(){
        let reqParams = `page_size=all`;   
        return this.getData<any>({ action: "business_bill_calc_type", params: reqParams});
    }

    getBusinessPlan(b_id: any){
        let reqParams = `b_id=${b_id}&page_size=all`;   
        return this.getData<any>({ action: "business_plans_purchased", params: reqParams});
    }

    //POST REQUESTS

    postCredits(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `add_message_credits/?b_id=${model.b_id}`, body: reqBody });
    }

    postToggleOnOff(id: any){
        const reqBody = JSON.stringify({});
        return this.postDataNotWithSlash({ action: `business_login_access_control/?b_id=${id}`, body: reqBody });
    }

    postPlan(model: any){
        const reqBody = JSON.stringify(model);
        return this.postDataNotWithSlash({ action: `business_subscription_plans/`, body: reqBody });
    }

    postBusinessPlan(model: any){
        const reqBody = JSON.stringify(model);
        return this.postDataNotWithSlash({ action: `business_plans_purchased/`, body: reqBody });
    }

    postWhatsAppToken(model: any, bId: any){
        const reqBody = JSON.stringify(model);
        return this.postDataNotWithSlash({ action: `business_whatsapp_configuration/?b_id=${bId}`, body: reqBody });
    }

    postOrganizationForDelete(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "delete_business_account", body : reqBody });
    }

    updateWhatsAppToken(model: any, bId:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `business_whatsapp_configuration/${model.id}/?b_id=${bId}`, body: reqBody });
    }

    updatePlan(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `business_subscription_plans/${model.id}/`, body: reqBody });
    }


    updateBusinessMessaginSettings(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `global_business_settings/${model.id}/`, body: reqBody });
    }

    updateGlobalMessaginSettings(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `global_messaging_settings/${model.id}/`, body: reqBody });
    }

    updateBusinessModules(model: any, id: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `business_modules/${id}/`, body: reqBody });
    }

    updateOrganizationDetails(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `businessprofiles/${model.id}/`, body: reqBody });
    }

    updateSubscriptionStatus(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `business_subscription_status/${model.id}/`, body: reqBody });
    }


    updateMultipleBranches(model: any, b_id: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `business_controls/${model.id}/?b_id=${b_id}`, body: reqBody });
    }

}