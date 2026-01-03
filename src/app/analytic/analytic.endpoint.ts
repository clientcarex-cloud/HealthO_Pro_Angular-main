import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class AnalyticEndpoint extends BaseEndpoint {

    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc);
        this.route = "lab";
    }


    getAnalytics(
        page_size:any,pageNumber:any ,
        query:string,
        date:any,from_date:any, to_date:any, sort: boolean
    ) {
        let reqParams = `&page_size=${page_size}&page=${pageNumber}&q=${query}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${!sort ? "&sort=added_on" : "&sort=-added_on"}`;   
        // return this.getData<any>({ action: "lab_nabl", params: reqParams});
        return 
    }
}
