import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { NablResponse } from "../model/nablreponse.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class NablEndpoint extends BaseEndpoint {
    
     constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    testApi(){
        const reqBody = JSON.stringify({});
        return this.postDataNotWithSlash({ action: `print_receptionist_report/?lab_staff=40&start_date=2024-06-24&end_date=&client_id=29&template_id=3`, body: reqBody, });
        // return this.postData({ action: "print_receptionist_report", params: "lab_staff=40&start_date=2024-06-24&end_date=&client_id=29&template_id=3"}); 
    }
    // ?b_id=&date=&status_id=&date_range_after=&date_range_before=
    search(
        page_size:any,pageNumber:any ,
        query:string,
        date:any,from_date:any, to_date:any, sort: boolean
    ) {
        let reqParams = `&page_size=${page_size}&page=${pageNumber}&q=${query}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${!sort ? "&sort=added_on" : "&sort=-added_on"}`;   
        return this.getData<NablResponse>({ action: "lab_nabl", params: reqParams});
    }
    
    fetchNextPage(url:any){
        return this.http.get<any>(url);
    }

}
