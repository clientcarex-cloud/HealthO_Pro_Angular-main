import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class PharmacyEndpoint extends BaseEndpoint {
    
    constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "pro_pharmacy";
    }

    getPatientStocks(query: any){
        let reqParams = `page_size=all&q=${query}&operation_type=1`;
        return this.getData<any>({ action: "stock_list", params: reqParams});
    }

    getStocks(
        page_size: number | string,
        pageNumber:any,
        query:string,
        category: any,
        operation: any
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}&category=${category}&operation_type=${operation}&sort=name`;
        return this.getData<any>({ action: "stock_list", params: reqParams});
    }

    getMedicines(
        page_size: number | string,
        pageNumber:any,
        query:string,
        category: any,
        operation: any
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}&category=${category}&operation_type=${operation}&sort=name`;
        return this.getData<any>({ action: "pharma_items", params: reqParams});
    }

    getSuppliers(
        page_size: number | string,
        pageNumber:any,
        query:string,
        type: any,
        sort: boolean 
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}&supplier_type=${type}&sort=${sort ? '' : '-'}name`;
        return this.getData<any>({ action: "manufacturer", params: reqParams});
    }

    getPharmaStock(
        page_size: number | string,
        pageNumber:any,
        query:string,
        from_date: any,
        to_date: any,
        type: any,
        sort: boolean 
    ){
        let reqParams = `page_size=${page_size}&page=${pageNumber}${query !== "" ? `&q=${query}` : ""}&start_date=${from_date}&end_date=${to_date}&supplier_type=${type}&sort=${sort ? '' : '-'}added_on`;
        return this.getData<any>({ action: "pharma_stock", params: reqParams});
    }

    getCategory(){
        let reqParams = `page_size=all`;
        return this.getData<any>({ action: "categories", params: reqParams});
    }


    // posts 

    postInvoice(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `pharma_stock`, body: reqBody, });
    }

    postSupplier(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `manufacturer`, body: reqBody, });
    }
    
    postMedicine(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `pharma_items`, body: reqBody, });
    }

    postCategory(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `categories`, body: reqBody, });
    }

    // puts 

    updateMedicine(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `pharma_items/${model.id}/`, body: reqBody, });
    }

    updateStock(model: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `pharma_stock/${model.id}/`, body: reqBody, });
    }
}