import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "@sharedcommon/base/base.endpoint";
import { WAPConfigModel } from "../models/wap/wapconfig.model";
import { of } from "rxjs";
import { WAPSummaryModel } from "../models/wap/wapsummary.model";
import { WAPPurchaseModel } from "../models/wap/wappurchase.model";

@Injectable({ providedIn: 'root' })
export class WAPConfigEndpoint extends BaseEndpoint {
    constructor(injector: Injector) {
        super(injector);
        this.route = "wapconfig";
    }

    // wap config
    getConfig(branchId: string, dbName: string) {
        if (!branchId || !dbName) {
            const data: Partial<WAPConfigModel> = {};
            return of(data);
        }

        let reqParams = `dbName=${dbName}&branchId=${branchId}`;
        return this.getDataModel<WAPConfigModel>({ params: reqParams });
    }

    saveConfig(model: Partial<WAPConfigModel>) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "save", body: reqBody });
    }

    // wap summary
    getWAPSummary(branchId: string, dbName: string) {
        if (!branchId || !dbName) {
            const data: WAPSummaryModel = {
                total: 0,
                used: 0,
                balance: 0
            };
            return of(data);
        }

        let reqParams = `dbName=${dbName}&branchId=${branchId}`;
        return this.getDataModel<WAPSummaryModel>({ action: "wapsummary", params: reqParams });
    }

    // wap purchase
    getWAPPurchase(branchId: string, dbName: string) {
        if (!branchId || !dbName) {
            const data: WAPPurchaseModel[] = [];
            return of(data);
        }

        let reqParams = `dbName=${dbName}&branchId=${branchId}`;
        return this.getData<WAPPurchaseModel>({ action: "wappurchase", params: reqParams });
    }

    saveWAPPurchase(model: WAPPurchaseModel) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "addwap", body: reqBody });
    }
}