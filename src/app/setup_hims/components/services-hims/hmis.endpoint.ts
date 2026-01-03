import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class HIMSSetupEndpoint extends BaseEndpoint {
    
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "pro_hospital";
    }

    getPackages(
        page_size: number | string,
        pageNumber:any,
        query:string,
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}`;
        return this.getData<any>({ action: "global_package", params: reqParams});
    }


    getAllSearches(query: any){
        let reqParams = `q=${query}&page_size=all`;
        return this.getData<any>({ action: "ip_master_search", params: reqParams});
    }


    getRoomTypes(){
        let reqParams = `page_size=all`;
        return this.getData<any>({ action: "room_type", params: reqParams});
    }

    getFloors(){
        let reqParams = `page_size=all`;
        return this.getData<any>({ action: "floor", params: reqParams});
    }

    getRooms(
        page_size: number | string,
        pageNumber:any,
        query:string,
        floor: any,
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}${floor !== "" ? `&floor=${floor}` : ""}`;
        return this.getData<any>({ action: "global_room", params: reqParams});
    }

    getServices(
        page_size: number | string,
        pageNumber:any,
        query:string,
        dept: any,
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}${dept !== "" ? `&departments=${dept}` : ""}`;
        return this.getData<any>({ action: "global_services", params: reqParams});
    }


    // posts 

    postRoom(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `global_room`, body: reqBody, });
    }

    PostHIMSService(model: any) {
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `global_services`, body: reqBody, });
    }

    postRoomType(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "room_type", body: reqBody }) ;
    }

    postFloor(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "floor", body: reqBody }) ;
    }

    postPackage(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `global_package`, body: reqBody, });
    }

    // puts 

    updatePackage(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `global_package/${model.id}/`, body: reqBody, });
    }

    updateHIMSService(model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `global_services/${model.id}/`, body: reqBody, });
    }

    updateRoom(model: any) {
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `global_room/${model.id}/`, body: reqBody, });
    }

    cancelDoctorConsultations(model:any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `patient_consultations/${model.id}/`, body: reqBody, });
    }

}