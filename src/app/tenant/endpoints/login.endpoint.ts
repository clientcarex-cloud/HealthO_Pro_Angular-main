import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { LoginModel } from "../models/login.model";
import { of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class LoginEndpoint extends BaseEndpoint {
    constructor(injector: Injector) {
        super(injector);
        this.route = "login";
    }

    getLogins(branchId: string, dbName: string) {
        if (!branchId || !dbName) {
            const data: LoginModel[] = [];
            return of(data);
        }

        let reqParams = `getActive=${false}&dbName=${dbName}&branchId=${branchId}`;
        return this.getData<LoginModel>({ params: reqParams });
    }

    getActiveLogins(branchId: string, dbName: string) {
        let reqParams = `getActive=${true}&dbName=${dbName}&branchId=${branchId}`;
        return this.getData<LoginModel>({ params: reqParams });
    }

    updateLoginStatus(model: LoginModel) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "status", body: reqBody });
    }

    updateSMSStatus(model: LoginModel) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "smsstatus", body: reqBody });
    }

    addLogin(model: Partial<LoginModel>) {
        model.status = true;
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "add", body: reqBody });
    }

    updateLogin(model: Partial<LoginModel>) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "update", body: reqBody });
    }

    resetPwd(model: Partial<LoginModel>) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "resetpwd", body: reqBody });
    }

    deleteLogin(model: Partial<LoginModel>) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "delete", body: reqBody });
    }
}