import * as Util from "@sharedcommon/base/utils";
import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class BusinessEndpoint extends BaseEndpoint {
    
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    getBusinessProfiles(id:number){
        const currentUser = localStorage.getItem('currentUser');
        const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
        const phone_number = currentUserObj ? currentUserObj.phone_number : null;
        return this.getData<any>({ action: "lab_staff_access", params: `b_id=${id}&mobile_number=${phone_number}`})
    }

    getLabStaff(){
        const currentUser = localStorage.getItem('currentUser');
        const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
        const phone_number = currentUserObj ? currentUserObj.phone_number : null;
        const b_id = currentUserObj ? currentUserObj.b_id : null;
        return this.getData<any>({ action: "lab_staff_access", params: `b_id=${b_id}&mobile_number=${phone_number}`})
    }


}