import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { DepartmentGroupModel } from "../../models/department/dept-group.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class DepartmentGroupEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    getDeptGroups() {
        let reqParams = `getActive=${false}`;
        return this.getData<DepartmentGroupModel>({ params: reqParams });
    }

    getActiveDeptGroups() {
        let reqParams = `getActive=${true}`;
        return this.getData<DepartmentGroupModel>({ params: reqParams });
    }

    updateDeptGroupStatus(model: DepartmentGroupModel) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "status", body: reqBody });
    }

    addDeptGroup(description: string) {
        const model: Partial<DepartmentGroupModel> = { description: description };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "add", body: reqBody });
    }

    updateDeptGroup(description: string, oldDescription: string) {
        const model: Partial<DepartmentGroupModel> = {
            description: description,
            oldDescription: oldDescription
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "update", body: reqBody });
    }

    deleteDeptGroup(data: any) {
        const model: Partial<DepartmentGroupModel> = {
            description: data.description,
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "delete", body: reqBody });
    }
}