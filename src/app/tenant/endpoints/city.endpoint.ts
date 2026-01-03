import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CityModel } from "../models/city.model";

@Injectable({ providedIn: 'root' })
export class CityEndpoint extends BaseEndpoint {
    constructor(injector: Injector) {
        super(injector);
        this.route = "city";
    }

    getCities() {
        let reqParams = `getActive=${false}`;
        return this.getData<CityModel>({ params: reqParams });
    }

    getActiveCities() {
        let reqParams = `getActive=${true}`;
        return this.getData<CityModel>({ params: reqParams });
    }

    updateCityStatus(model: CityModel) {        
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "status", body: reqBody });
    }

    addCity(name: string, state: any) {
        const model: Partial<CityModel> = { 
            name: name, 
            state: state 
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "add", body: reqBody });
    }

    updateCity(name: string, oldName: string, state: any) {
        const model: Partial<CityModel> = {
            name: name,
            oldName: oldName,
            state: state
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "update", body: reqBody });
    }

    deleteCity(data: any) {
        const model: Partial<CityModel> = { 
            name: data.name, 
            state: data.state 
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "delete", body: reqBody });
    }
}