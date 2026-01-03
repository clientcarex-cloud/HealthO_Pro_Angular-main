import * as Util from "@sharedcommon/base/utils";
import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { ExpenseResponse } from "../models/expense/expenseResponse.model";
import { Expense } from "../models/expense/expense.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class ExpensesEndpoint extends BaseEndpoint {
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "accounts";
    }
    
    //get test details 
    getExpenses(pageNumber:any){
        return this.getData<ExpenseResponse>({ action: "lab_expenses",  params: `&page=${pageNumber}` });
    }

    getPaginatedExpenses( page_size: number | string,
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
       return this.getData<ExpenseResponse>({ action: "lab_expenses", params: reqParams});
   }

    fetchNextPage(url:any){
        return this.http.get<any>(url);
    }

    getPayModeType(){
        return this.getData<any>({action: "lab_pay_mode_types", params:  ``});
    }

    getExpenseType(){
        return this.getData<any>({action: "lab_expense_types", params:  ``});
    }

    getPaidTo_types(){
        return this.getData<any>({action:"lab_paid_to_types", params:  ``});
    }

    getAccount_To(){
        return this.getData<any>({action:"lab_account_to_types", params:  ``, })
    }

    addExpense(model:Expense) {       
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "lab_expenses", body: reqBody });
    }

    addExpenseType(model:{name:string, is_active:boolean}){
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "lab_expense_types", body: reqBody });
    }

    addPaidToType(model:{name:string, is_active:boolean}){
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "lab_paid_to_types", body: reqBody });
    }

    addAccToType(model:{name:string, is_active:boolean}){
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "lab_account_to_types", body: reqBody });
    }

    updateExpense(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `lab_expenses/${model.id}/`, body: reqBody });
    }
}
