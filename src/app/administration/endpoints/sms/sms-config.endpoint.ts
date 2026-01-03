import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { SMSConfigModel } from "../../models/sms/sms-config.model";
import { SMSTransTypeModel } from "../../models/sms/sms-transtype.model";
import { SMSCategoryModel } from "../../models/sms/sms-category.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";
@Injectable({ providedIn: 'root' })
export class SMSConfigEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    /** sms transaction types **/
    getSMSTransactionTypes() {
        let reqParams = `getActive=${true}`;
        return this.getData<SMSTransTypeModel>({ action: "transtype", params: reqParams });
    }

    /** sms categories **/
    getSMSCategories() {
        let reqParams = `getActive=${true}`;
        return this.getData<SMSCategoryModel>({ action: "category", params: reqParams });
    }

    getSMSConfigs() {
        let reqParams = `getActive=${false}`;
        return this.getData<SMSConfigModel>({ params: reqParams });
    }

    getActiveSMSConfigs() {
        let reqParams = `getActive=${true}`;
        return this.getData<SMSConfigModel>({ params: reqParams });
    }

    updateSMSSendStatus(model: SMSConfigModel) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "smsstatus", body: reqBody });
    }

    updateWAPSendStatus(model: SMSConfigModel) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "wapstatus", body: reqBody });
    }

    addSMSConfig(model: Partial<SMSConfigModel>) {        
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "add", body: reqBody });
    }

    updateSMSConfig(model: Partial<SMSConfigModel>) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "update", body: reqBody });
    }

    deleteSMSConfig(model: Partial<SMSConfigModel>) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "delete", body: reqBody });
    }
}