import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { PhlebotomistResponse } from "../model/phlebotomistResponse.model";
import { Phlebotomist } from "../model/phlebotomist.model";
import { Result } from "../model/results.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class PhlebotomistEndpoint extends BaseEndpoint {
    
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }
    
    getBID(){
        const currentUser = localStorage.getItem('currentUser');
        const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
        const phone_number = currentUserObj ? currentUserObj.phone_number : null;
        const b_id = currentUserObj ? currentUserObj.b_id : null;
        return b_id
    }


    getPhlebotomistOptions(){
        let reqParams = "page_size=all"
        return this.getData<PhlebotomistResponse>({ action: "prints_control", params: reqParams});
    }

    getPhlebotomists(
        page_size:any,pageNumber:any ,
        status: string,query:string,dept: string,
        date:any,from_date:any, to_date:any, sort: boolean
        ){
       let reqParams = `&page_size=${page_size}&page=${pageNumber}${status}&q=${query}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${!sort ? "&sort=added_on" : "&sort=-added_on"}${dept !== "" ? `&departments=${dept}` : ""}`;   
        return this.getData<PhlebotomistResponse>({ action: "lab_phlebotomists_list", params: reqParams});
    }

    getPhlebotomistsSampleWise(
        page_size:any,pageNumber:any ,
        status: string,query:string,dept: string,
        date:any,from_date:any, to_date:any, sort: boolean
        ){
       let reqParams = `&page_size=${page_size}&page=${pageNumber}${status}&q=${query}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${!sort ? "&sort=added_on" : "&sort=-added_on"}${dept !== "" ? `&departments=${dept}` : ""}`;   
        return this.getData<PhlebotomistResponse>({ action: "phlebotomists_list", params: reqParams});
    }

    getLabStaff(){
        const currentUser = localStorage.getItem('currentUser');
        const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
        const phone_number = currentUserObj ? currentUserObj.phone_number : null;
        const b_id = currentUserObj ? currentUserObj.b_id : null;
        return this.getData<any>({ action: "lab_staff_access", params: `&mobile_number=${phone_number}`})
    }


    PostPhlebotomist(model: Phlebotomist){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `lab_phlebotomists`,  body: reqBody, });
    }

    
    PostBarcodePDF(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `generate_barcode_pdf`,  body: reqBody, });
    }
    

    putOptions(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `prints_control/${model.id}/`,  body: reqBody, });
    }
    
    fetchNextPage(url:any){
        return this.http.get<any>(url);
    }

}
