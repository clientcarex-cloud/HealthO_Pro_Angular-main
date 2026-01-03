import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { TenantModel } from "../models/tenant.model";

@Injectable({ providedIn: 'root' })
export class TenantEndpoint extends BaseEndpoint {
    constructor(injector: Injector) {
        super(injector);
        this.route = "users";
    }

    getTenants() {
        return this.getData<TenantModel>({});
    }

    updateTenantStatus(identifier: string, status: boolean) {
        let reqParams = `identifier=${identifier}&status=${status}`;
        return this.postRequest({ action: "status", params: reqParams });
    }

    addTenant(identifier: string, name: string, dbName: string) {
        let reqParams = `identifier=${identifier}&name=${name}&dbName=${dbName}`;
        return this.postRequest({ action: "add", params: reqParams });
    }

    updateTenant(identifier: string, name: string, dbName: string) {
        let reqParams = `identifier=${identifier}&name=${name}&dbName=${dbName}`;
        return this.postRequest({ action: "update", params: reqParams });
    }

    deleteTenant(identifier: string) {
        let reqParams = `identifier=${identifier}`;
        return this.postRequest({ action: "delete", params: reqParams });
    }
}