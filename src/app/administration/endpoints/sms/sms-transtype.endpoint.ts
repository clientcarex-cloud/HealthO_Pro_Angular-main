import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { SMSTransTypeModel } from "../../models/sms/sms-transtype.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";
@Injectable({ providedIn: 'root' })
export class SMSTransTypeEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    getSMSTransTypes() {
        let reqParams = `getActive=${false}`;
        return this.getData<SMSTransTypeModel>({ params: reqParams });
    }

    getActiveSMSTransTypes() {
        let reqParams = `getActive=${true}`;
        return this.getData<SMSTransTypeModel>({ params: reqParams });
    }

    updateSMSTransTypeStatus(model: SMSTransTypeModel) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "status", body: reqBody });
    }

    addSMSTransType(description: string) {
        const model: Partial<SMSTransTypeModel> = { description: description };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "add", body: reqBody });
    }

    updateSMSTransType(description: string, oldDescription: string) {
        const model: Partial<SMSTransTypeModel> = {
            description: description,
            oldDescription: oldDescription
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "update", body: reqBody });
    }

    deleteSMSTransType(data: any) {
        const model: Partial<SMSTransTypeModel> = {
            description: data.description,
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "delete", body: reqBody });
    }
}