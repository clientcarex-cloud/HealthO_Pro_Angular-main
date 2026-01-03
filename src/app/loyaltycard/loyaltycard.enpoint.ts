import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";

import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class LoyaltyCardEndpoint extends BaseEndpoint {

    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc);
        this.route = "lab";
    }


    getPrevilageCardFor(){
        let reqParams = 'page_size=all';
        return this.getData<any>({ action: "privilege_cards_for", params: reqParams });
    }

    getUsageHistory(
        page_size: number | string,
        pageNumber: any,
        query: string,
        sort: boolean,
        date:any,
        from_date:any,
        to_date:any,
        mem_id: any,
        card_id: any
    ){
        // &q=${query}
        let reqParams = `page_size=${page_size}&page=${pageNumber}&membership=${mem_id}&card_holder=${card_id}`;
        return this.getData<any>({ action: "privilege_usage_history", params: reqParams });
    }

    getCards(
        page_size: number | string,
        pageNumber: any,
        query: string,
        sort: boolean,
        date:any,
        from_date:any,
        to_date:any,
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}&q=${query}${!sort ? "&sort=added_on" : "&sort=-added_on"}&validity_date_range_after=${from_date}&validity_date_range_before=${to_date}`;
        return this.getData<any>({ action: "privilege_cards", params: reqParams });
    }


    getMemberships(
        page_size: number | string,
        pageNumber: any,
        query: string,
        sort: boolean,
        date:any,
        from_date:any,
        to_date:any,
    ) {
        let reqParams = `page_size=${page_size}&page=${pageNumber}&q=${query}${!sort ? "&sort=added_on" : "&sort=-added_on"}&validity_date_range_after=${from_date}&validity_date_range_before=${to_date}`;
        return this.getData<any>({ action: "privilege_card_memberships", params: reqParams });
    }


    getDocConsultingTypes() {
        let reqParams = 'page_size=all';
        return this.getData<any>({ action: "privilege_doctor_consultation_types", params: reqParams });
    }

    getDocAmbulanceTypes() {
        let reqParams = 'page_size=all';
        return this.getData<any>({ action: "privilege_ambulance_types", params: reqParams });
    }


    // post requests 


    postCard(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "privilege_cards", body: reqBody });
    }


    PostnGetCardPrint(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "get_privilege_card", body: reqBody });
    }


    postMembership(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "privilege_card_memberships", body: reqBody });
    }

    postCardHolder(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "privilege_cards_for", body: reqBody });
    }
 
    postRenew(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "privilege_card_renewal", body: reqBody });
    }

    updateMember(id: number, model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `privilege_card_memberships/${id}/`, body: reqBody });
    }

    updateCard(id: number, model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `privilege_cards/${id}/`, body: reqBody });
    }

}
