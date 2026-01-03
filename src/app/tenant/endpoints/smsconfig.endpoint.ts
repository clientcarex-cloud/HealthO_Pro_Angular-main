import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "@sharedcommon/base/base.endpoint";
import { SMSConfigModel } from "../models/sms/smsconfig.model";
import { of, Observable, forkJoin } from "rxjs";
import { SMSProviderModel } from "../models/sms/smsprovider.model";
import { SMSSummaryModel } from "../models/sms/smssummary.model";
import { SMSPurchaseModel } from "../models/sms/smspurchase.model";

@Injectable({ providedIn: 'root' })
export class SMSConfigEndpoint extends BaseEndpoint {
    constructor(injector: Injector) {
        super(injector);
        this.route = "smsconfig";
    }

    getSMSProviders(branchId: string, dbName: string) {
        if (!branchId || !dbName) {
            const data: SMSProviderModel[] = [];
            return of(data);
        }

        let reqParams = `dbName=${dbName}&branchId=${branchId}`;
        return this.getData<SMSProviderModel>({ action: "smsprovider", params: reqParams });
    }

    // sms config
    getConfig(branchId: string, dbName: string) {
        if (!branchId || !dbName) {
            const data: Partial<SMSConfigModel> = {};
            return of(data);
        }

        let reqParams = `dbName=${dbName}&branchId=${branchId}`;
        return this.getDataModel<SMSConfigModel>({ params: reqParams });
    }

    saveConfig(model: Partial<SMSConfigModel>) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "save", body: reqBody });
    }

    // sms summary
    getSMSSummary(branchId: string, dbName: string) {
        if (!branchId || !dbName) {
            const data: SMSSummaryModel = {
                total: 0,
                used: 0,
                balance: 0
            };
            return of(data);
        }

        let reqParams = `dbName=${dbName}&branchId=${branchId}`;
        return this.getDataModel<SMSSummaryModel>({ action: "smssummary", params: reqParams });
    }

    // sms purchase
    getSMSPurchase(branchId: string, dbName: string) {
        if (!branchId || !dbName) {
            const data: SMSPurchaseModel[] = [];
            return of(data);
        }

        let reqParams = `dbName=${dbName}&branchId=${branchId}`;
        return this.getData<SMSPurchaseModel>({ action: "smspurchase", params: reqParams });
    }

    saveSMSPurchase(model: SMSPurchaseModel) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "addsms", body: reqBody });
    }

    // get init data
    getSMSInitData(branchId: string, dbName: string): Observable<any[]> {
        let purchases = this.getSMSPurchase(branchId, dbName);
        let providers = this.getSMSProviders(branchId, dbName);
        let smsConfig = this.getConfig(branchId, dbName);
        let smsSummary = this.getSMSSummary(branchId, dbName);
        return forkJoin([
            providers, 
            smsConfig,
            smsSummary,
            purchases,
        ]);
    }
}