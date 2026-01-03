import * as Util from "@sharedcommon/base/utils";
import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })


export class LoginEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "user";
    }

    //get test details 
    getCountries(){
        return this.http.get(`${this.basePath}/user/country/`)
    }

    getStates(){
        // return this.getData<any>({ action: "state", });
        return this.http.get(`${this.basePath}/user/state/`)
    }

    getCities(){
        // return this.getData<any>({ action: "city"});
        return this.http.get(`${this.basePath}/user/city/`)
    }

    getHealthCareRegistry(){
        // return this.getData<any>({action:"healthcare_registry_types"});
        return this.http.get(`${this.basePath}/user/healthcare_registry_types/`)
    }

    getBusinessProfiles(id:number){
        const currentUser = localStorage.getItem('currentUser');
        const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
        const phone_number = currentUserObj ? currentUserObj.phone_number : null;
        return this.getData<any>({ action: "lab_staff_access", params: `&mobile_number=${phone_number}`})
    }

    postNumber(model:any){
        const reqBody = JSON.stringify(model);
        const headers = { 'content-type': 'application/json' };

        return this.http.post(`${this.basePath}/user/login/`,reqBody, { 'headers': headers });
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
