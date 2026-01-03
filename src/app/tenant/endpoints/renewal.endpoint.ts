import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "@sharedcommon/base/base.endpoint";
import { RenewalModel } from "../models/renewal.model";
import { of } from "rxjs";
import * as Util from "@sharedcommon/base/utils";

@Injectable({ providedIn: 'root' })
export class RenewalEndpoint extends BaseEndpoint {
    constructor(injector: Injector) {
        super(injector);
        this.route = "renewal";
    }

    getRenewals(branchId: string, dbName: string) {
        if (!branchId || !dbName) {
            const data: RenewalModel[] = [];
            return of(data);
        }

        let reqParams = `dbName=${dbName}&branchId=${branchId}`;
        return this.getData<RenewalModel>({ params: reqParams });
    }

    saveRenewal(model: RenewalModel) {
        model.newExpiry = Util.convertLocalDateToUTCIgnoringTimezone(model.newExpiry);
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "save", body: reqBody });
    }

    deleteRenewal(model: RenewalModel) {        
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "delete", body: reqBody });
    }
}