import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { IdConfigCategoryModel } from "../models/id-config/idconfig-category.model";
import { IdConfigTypeModel } from "../models/id-config/idconfig-type.model";
import { IdConfigResetModel } from "../models/id-config/idconfig-reset.model";
import { IdConfigModel } from "../models/id-config/idconfig.model";
import { IdConfigSeparatorModel } from "../models/id-config/idconfig-separator.model";
import * as Util from "@sharedcommon/base/utils";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";
@Injectable({ providedIn: 'root' })
export class IdConfigEndpoint extends BaseEndpoint {
    
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    getIdCategories() {
        let reqParams = `getActive=${true}`;
        return this.getData<IdConfigCategoryModel>({ action: "category", params: reqParams });
    }

    getIdTypes() {
        let reqParams = `getActive=${true}`;
        return this.getData<IdConfigTypeModel>({ action: "type", params: reqParams });
    }

    getIdResetTypes() {
        let reqParams = `getActive=${true}`;
        return this.getData<IdConfigResetModel>({ action: "resettype", params: reqParams });
    }

    getIdSeparators() {
        let reqParams = `getActive=${true}`;
        return this.getData<IdConfigSeparatorModel>({ action: "separator", params: reqParams });
    }

    getIdConfigs() {
        let reqParams = `getActive=${false}`;
        return this.getData<IdConfigModel>({ params: reqParams });
    }

    getActiveIdConfigs() {
        let reqParams = `getActive=${true}`;
        return this.getData<IdConfigModel>({});
    }

    addIdConfig(model: IdConfigModel) {
        model.startDate = Util.removeTimeFromDate(model.startDate);
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "add", body: reqBody });
    }

    deleteIdConfig(model: Partial<IdConfigModel>) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "delete", body: reqBody });
    }
}