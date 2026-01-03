import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { BranchModel } from "../models/branch.model";
import { of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class BranchEndpoint extends BaseEndpoint {
    constructor(injector: Injector) {
        super(injector);
        this.route = "facility";
    }

    getBranches(tenantId: string) {
        if (!tenantId) {
            const data: BranchModel[] = [];
            return of(data);
        }

        let reqParams = `getActive=${false}&tenantId=${tenantId}`;
        return this.getData<BranchModel>({ params: reqParams });
    }

    getActiveBranches(tenantId: string) {
        let reqParams = `getActive=${true}&tenantId=${tenantId}`;
        return this.getData<BranchModel>({ params: reqParams });
    }

    updateBranchStatus(model: BranchModel) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "status", body: reqBody });
    }

    addBranch(model: Partial<BranchModel>) {
        model.status = true;
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "add", body: reqBody });
    }

    updateBranch(model: Partial<BranchModel>, oldName: string) {
        model.oldName = oldName;
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "update", body: reqBody });
    }

    deleteBranch(model: Partial<BranchModel>) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "delete", body: reqBody });
    }
}