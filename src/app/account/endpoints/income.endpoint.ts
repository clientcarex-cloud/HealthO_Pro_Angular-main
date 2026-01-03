import * as Util from "@sharedcommon/base/utils";
import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
// import { AddPatientsModel } from "../models/addPatient/addpatient.model";
// import { GlobalTestModel } from "../models/addPatient/globaltest.model";
// import { DoctorModel } from "../models/addPatient/doctor.model";
import { IncomeResponse } from "../models/income/incomeResponse.model";
import { Income } from "../models/income/income.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class IncomeEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "accounts";
    }

    
    //get test details 
    getIncome(pageNumber:any){
        let reqParams = ``;
        return this.getData<IncomeResponse>({ action: "lab_incomes", params: `&page=${pageNumber}` });
    }

    getPaginatedIncomes( page_size: number | string,
        pageNumber:any,
        query:string,
        date:any,
        from_date:any,
        to_date:any,
        sort: boolean,
        staff: any
        ){
            // labstaff=${staff}&
       let reqParams = `page_size=${page_size}&page=${pageNumber}&q=${query}&date=${date}&date_range_after=${from_date}&date_range_before=${to_date}${!sort ? "&sort=added_on" : "&sort=-added_on"}`;
       return this.getData<IncomeResponse>({ action: "lab_incomes", params: reqParams});
   }

   getStaffs(){
    return this.getData<IncomeResponse>({ action: "labstaff", params: "page_size=all"});
   }

    getPayModeType(){
        return this.getData<any>({action: "lab_pay_mode_types", params:  ``});
    }

    getIncomeType(){
        return this.getData<any>({action: "lab_income_types", params:  ``});
    }

    
    getExpenseType(){
        return this.getData<any>({action: "lab_expense_types", params: ""});
    }

    getPaidTo_types(){
        return this.getData<any>({action:"lab_paid_to_types", params:""});
    }

    getAccount_To(){
        return this.getData<any>({action:"lab_account_to_types", params:""})
    }

    getReceivedFrom(){
        return this.getData({action: "lab_incomes_from_account", params: "page_size=all"});
    }

    addIncomeType(model:{name:string, is_active:boolean}){
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "lab_income_types", body: reqBody });
    }

    addIncome(model:Income) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "lab_incomes", body: reqBody });
    }

    postReceivedFrom(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: "lab_incomes_from_account", body: reqBody });
    }

    updateIncome(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_incomes/${model.id}/`, body: reqBody });
    }


}
