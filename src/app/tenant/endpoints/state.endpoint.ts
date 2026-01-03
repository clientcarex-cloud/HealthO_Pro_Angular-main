import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { StateModel } from "../models/state.model";

@Injectable({ providedIn: 'root' })
export class StateEndpoint extends BaseEndpoint {
    constructor(injector: Injector) {
        super(injector);
        this.route = "state";
    }

    getStates() {
        let reqParams = `getActive=${false}`;
        return this.getData<StateModel>({ params: reqParams });
    }

    getActiveStates() {
        let reqParams = `getActive=${true}`;
        return this.getData<StateModel>({ params: reqParams });
    }

    updateStateStatus(model: StateModel) {        
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "status", body: reqBody });
    }

    addState(name: string, country: any) {
        const model: Partial<StateModel> = { 
            name: name, 
            country: country 
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "add", body: reqBody });
    }

    updateState(name: string, oldName: string, country: any) {
        const model: Partial<StateModel> = { 
            name: name, 
            oldName: oldName,
            country: country 
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "update", body: reqBody });
    }

    deleteState(data: any) {
        const model: Partial<StateModel> = { 
            name: data.name, 
            country: data.country 
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "delete", body: reqBody });
    }
}