import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })


export class AdminEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "super_admin";
    }

    getHealthCareRegistry(){
        return this.http.get(`${this.basePath}/user/healthcare_registry_types/`)
    }

    getAdminDetails(id: any){
        return this.getData({ action: `admin/${id}/` })
    }

    postNumber(model:any){
        const reqBody = JSON.stringify(model);
        const headers = { 'content-type': 'application/json' };
        return this.http.post(`${this.basePath}/user/login/`,reqBody, { 'headers': headers });
    }

    otpForAdmin(model: any){
        const reqBody = JSON.stringify(model);
        return this.postDataWithoutToken({ action: "otp_for_admin/", body: reqBody, });
    }

    adminLogin(model: any){
        const reqBody = JSON.stringify(model);
        return this.postDataWithoutToken({ action: "admin_login/", body: reqBody, });
    }

    postNumberForPassword(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "send_otp_to_set_password", body: reqBody, });
    }

    postPassword(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "set_password", body: reqBody, });
    }

    LoginWithPassword(model:any){
        const reqBody = JSON.stringify(model);
        const headers = { 'content-type': 'application/json' };
        return this.http.post(`${this.basePath}/user/password_login/`,reqBody, { 'headers': headers });
    }

}
