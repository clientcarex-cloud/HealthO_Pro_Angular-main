import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class PrintReportEndpoint extends BaseEndpoint {
    
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "lab";
    }

    postOTP(model:any){
        const reqBody = JSON.stringify(model);
        let reqParams = `?m=${model.mobile_number}&c=${model.client_id}`
        return this.postDataWithoutToken({ action: "otp_for_report/" + reqParams,});
    }


    getPatientReport(model:any){
        let reqParams = `t=${model.test_id}&c=${model.client_id}&lh=${model.lh}`
        return this.getData<any>({ action: "download_test_report", params: reqParams, }, false);
    }

    getPatientReceipt(model:any){
        let reqParams = `p=${model.patient_id}&c=${model.client_id}&r=${model.receipt_id}`
        return this.getData<any>({ action: "download_patient_receipt", params: reqParams, }, false);
    }

    
}
