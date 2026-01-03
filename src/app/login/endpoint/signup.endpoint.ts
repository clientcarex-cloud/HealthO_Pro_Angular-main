import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })


export class SignUpEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "user";
    }



    createUser(model: any){
        const reqBody = JSON.stringify(model);
        return this.postDataWithoutToken({ action: `create/`, body: reqBody });
    }

    getActivityLogs(model:any){
        return this.getData<any>( {action : "activity_logs", params: `user=15&page_size=50&operation=${model.operation}` } ) 
    }

    //get test details 
    getCountries(){
        return this.http.get(`${this.basePath}/user/country/?page_size=all`)
    }

    getStates(){
        // return this.getData<any>({ action: "state", });
        return this.http.get(`${this.basePath}/user/state/?page_size=all`)
    }

    getCities(){
        // return this.getData<any>({ action: "city"});
        return this.http.get(`${this.basePath}/user/city/?page_size=all`)
    }

    getHealthCareRegistry(){
        // return this.getData<any>({action:"healthcare_registry_types"});
        return this.http.get(`${this.basePath}/user/healthcare_registry_types/?page_size=all`)
    }

    getBusinessProfile(id: number){
        return this.getData<any>( {action : "businessprofiles", params: `client_id=${id}&page_size=all` } )
    }



    postBusinessAdress(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `business_addresses`, body: reqBody },);
    }
    
    updateBusinessProfile(model:any, id:number){
        // return this.PutModelRequest({ action: `businessprofiles/${id}/`, body: JSON.stringify(model)});
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `businessprofiles/${id}/`, body: reqBody },);
    }

    updateBusinessAdress(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `business_addresses/${model.id}/`, body: reqBody },);
    }


    deleteBusinessAddress(model:any){
        const reqBody = JSON.stringify(model);
        return this.deleteData({ action: `business_addresses/${model.id}`, body: reqBody });
    }

}
