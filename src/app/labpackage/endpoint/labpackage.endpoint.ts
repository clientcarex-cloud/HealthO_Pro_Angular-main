import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";
import { LabPackage } from "../models/labpackage.model";
import { GlobalTestModel } from "../models/globaltest.model";

@Injectable({ providedIn: 'root' })


export class LabPackageEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    returnBid(){
        const currentUser = localStorage.getItem('currentUser');
        const currentUserObj = currentUser ? JSON.parse(currentUser) : null;
        const b_id = currentUserObj ? currentUserObj.b_id : null;
    return b_id
    }


    getGlobalTests(pageNumber:any) {
        let reqParams = pageNumber ? `&page_size=all` : ``;
        return this.getData<GlobalTestModel>({ action: "lab_global_tests", params: reqParams});
    }

    addLabPackage(model:LabPackage) {
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_global_packages", body: reqBody });
    }

    getLabPackages(pageNumber:any){
        let reqParams = pageNumber ? `&page=${pageNumber}` : ``;
        return this.getData<any>({ action: "lab_global_packages", params:reqParams});
    }

    getPaginatedPackages(
        page_size: number | string,
        pageNumber:any,
        query:string,
        sort: boolean
        ){
       let reqParams = `q=${query.toLowerCase()}&page_size=${page_size}&page=${pageNumber}${!sort ? "&sort=added_on" : "&sort=-added_on"}`;
       return this.getData<any>({ action: "lab_global_packages", params: reqParams});
   }

    getTestsSearchResults(search:string){
        let reqParams = `page_size=all&q=${search}`;
        return this.getData<GlobalTestModel>({ action: "lab_global_tests", params: reqParams });
    }

    updateLabpackage(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_global_packages/${model.id}/?`, body: reqBody });
    }

}