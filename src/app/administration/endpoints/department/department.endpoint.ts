import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { DepartmentModel } from "../../models/department/department.model";
import { DepartmentTypeModel } from "../../models/department/dept-type.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })
export class DepartmentEndpoint extends BaseEndpoint {
    
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    /** department types **/
    getDeptTypes() {
        let reqParams = `getActive=${true}`;
        return this.getData<DepartmentTypeModel>({ action: "patients", params: reqParams });
    }

    getDeparments() {
        let reqParams = `getActive=${false}`;
        return this.getData<DepartmentModel>({ params: reqParams });
    }

    getActiveDeparments() {
        let reqParams = `getActive=${true}`;
        return this.getData<DepartmentModel>({ params: reqParams });
    }

    updateDeparmentStatus(model: DepartmentModel) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "status", body: reqBody });
    }

    addDeparment(model: Partial<DepartmentModel>) {
        model.status = true;
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "add", body: reqBody });
    }

    updateDeparment(model: Partial<DepartmentModel>, oldName: string) {
        model.oldName = oldName;
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "update", body: reqBody });
    }

    deleteDeparment(model: Partial<DepartmentModel>) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "delete", body: reqBody });
    }
}