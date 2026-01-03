import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "@sharedcommon/base/base.endpoint";
import { ConfigModel } from "../models/config.model";
import { of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ConfigEndpoint extends BaseEndpoint {
    constructor(injector: Injector) {
        super(injector);
        this.route = "config";
    }

    getConfig(branchId: string, dbName: string) {
        if(!branchId || !dbName) {
            const data: Partial<ConfigModel> = {
                userLogins: 0,
                labLogins: 0,
                patientLogin: false
            };
            return of(data);
        }

        let reqParams = `dbName=${dbName}&branchId=${branchId}`;
        return this.getDataModel<ConfigModel>({ params: reqParams });
    }

    saveConfig(model: Partial<ConfigModel>) {     
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "save", body: reqBody });
    }
}