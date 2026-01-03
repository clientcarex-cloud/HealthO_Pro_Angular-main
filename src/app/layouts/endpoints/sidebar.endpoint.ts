import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { environment } from "src/environments/environment";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })
export class SideBarEndPoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "pro_u_data";
    }

    getBID(){
        const currentUser = localStorage.getItem('currentUser');
        const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
        const b_id = currentUserObj ? currentUserObj.b_id : null;
        return b_id;
    }

    getStaffMenuAccess(id: number){
        let reqParams = `lab_staff=${id}`
        return this.getData<any>({action: "lab_menu_access_for_staff", params: reqParams})
    }

}