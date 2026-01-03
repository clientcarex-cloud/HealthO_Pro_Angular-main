import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class AnnoucementEndpoint extends BaseEndpoint {
    
     constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    getBulkSent(
        page_size: number | string,
        pageNumber: any,
        query: string,
        date: any,
        from_date: any,
        to_date: any,
        msg_type: any 
    ) {
        let reqParams = `&page_size=${page_size}&page=${pageNumber}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}&template__messaging_service_types=${msg_type}`;
        return this.getData<any>({ action: "campaign_history", params: reqParams });
    }

    gettemplates(id: any){
        return this.getData<any>({ action: `bulk_messaging_templates` , params: `type=${id}&page_size=all`});
    }


    getStats(c_id: any, type: any){
        return this.getData<any>({ action:"bulk_messaging_stats", params: `client=${c_id}&type=${type}&page_size=all`});
    }

    getBulkStatsWhatsApp(c_id: any){
        return this.getData<any>({ action: `bulk_business_whatsapp_stats` , params: `client=${c_id}&page_size=all`});
    }

    getHistory(
        page_size: any, page_number: any, type: any
    ){
        return this.getData<any>({ action: `bulk_messaging_history` , params: `${type && type!="" ? 'type='+ type : ''}&page_size=${page_size}&page_number=${page_number}`});
    }


    // post urls 

    postMessage(model:any, api: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: api, body: reqBody, });
    }

    postSaveTemplate(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `bulk_messaging_templates`, body: reqBody, });
    }



    updateGroupName(model:any, id: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `group_edit/${id}/`, body: reqBody, });
    }


}


