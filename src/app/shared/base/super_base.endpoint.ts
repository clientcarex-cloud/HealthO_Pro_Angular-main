import { HttpClient } from "@angular/common/http";
import { Injector } from "@angular/core";
import { environment } from "src/environments/environment";
import { ApiResponse } from "./base.response";
import { Observable } from "rxjs";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

export abstract class SuperBaseEndpoint {
    public route = "";

    constructor(private injector: Injector, 
        private cookieSrvc: CookieStorageService) {
    }

    public get basePath(): string | undefined {
        return environment.basePath;
    }

    private httpObj?: HttpClient;
    public get http(): HttpClient {
        if (this.httpObj == null || this.httpObj == undefined) {
            this.httpObj = this.injector.get(HttpClient);
        }

        return this.httpObj;
    }

    token(){
        const access = this.cookieSrvc.getAccess("superaccess");
        return access
    }

    getDataModel<T>(params: IEndpointParams) {
        const reqParams = this.setReqParameters(params);
        if (reqParams.params) {
            return this.http.get<T>(`${this.basePath}/${reqParams.action}?${reqParams.params}`);
        }

        return this.http.get<T>(`${this.basePath}/${reqParams.action}`);
    }

    getData<T>(params: IEndpointParams, auth:boolean = true) {
        const reqParams = this.setReqParameters(params);
        let headers ;
        if(!auth){
            headers = { 'content-type': 'application/json' }
        }else{
            headers = { 'content-type': 'application/json' , 'Authorization': `Bearer ${this.token()}` };
        }
        
        if (reqParams.params) {
            return this.http.get<T[]>(`${this.basePath}/${reqParams.action}/?${reqParams.params}`, { 'headers': headers });
        }

        return this.http.get<T[]>(`${this.basePath}/${reqParams.action}`, { 'headers': headers });
    }

    postRequest(params: IEndpointParams) {
        const reqParams = this.setReqParameters(params);
        return this.http.post<ApiResponse>(`${this.basePath}/${reqParams.action}?${reqParams.params}`, {});
    }

    postModelRequest(params: IEndpointParams) {
        const reqParams = this.setReqParameters(params);
        const headers = { 'content-type': 'application/json' , 'Authorization': `Bearer ${this.token()}` };
        return this.http.post<ApiResponse>(`${this.basePath}/${reqParams.action}/?${reqParams.params}`, reqParams.body, { 'headers': headers });
    }

    postData(params: IEndpointParams) {
        const reqParams = this.setReqParameters(params);
        const headers = { 'content-type': 'application/json' , 'Authorization': `Bearer ${this.token()}` };
        return this.http.post<ApiResponse>(`${this.basePath}/${reqParams.action}/`, reqParams.body, { 'headers': headers });
    }

    postDataWithoutToken(params: IEndpointParams) {
        const reqParams = this.setReqParameters(params);
        const headers = { 'content-type': 'application/json' };
        return this.http.post<ApiResponse>(`${this.basePath}/${reqParams.action}`, reqParams.body, { 'headers': headers });
    }

    postDataNotWithSlash(params: IEndpointParams) {
        const reqParams = this.setReqParameters(params);
        const headers = { 'content-type': 'application/json' , 'Authorization': `Bearer ${this.token()}` };
        return this.http.post<ApiResponse>(`${this.basePath}/${reqParams.action}`, reqParams.body, { 'headers': headers });
    }

    postUpdateModelRequest(params: IEndpointParams) {
        const reqParams = this.setReqParameters(params);
        const headers = { 'content-type': 'application/json' , 'Authorization': `Bearer ${this.token()}` };
        return this.http.put<ApiResponse>(`${this.basePath}/${reqParams.action}/?${reqParams.params}`, reqParams.body, { 'headers': headers });
    }

    PutModelRequest(params: IEndpointParams) {
        const reqParams = this.setReqParameters(params);
        const headers = { 'content-type': 'application/json' , 'Authorization': `Bearer ${this.token()}` };
        return this.http.put<ApiResponse>(`${this.basePath}/${reqParams.action}`, reqParams.body, { 'headers': headers });
    }

    postModelRequestHTML(params: IEndpointParams): Observable<any> {
        const reqParams = this.setReqParameters(params);
        const headers = { 'content-type': 'application/json' , 'Authorization': `Bearer ${this.token()}`, 'Accept': 'text/html' };
        
        return this.http.post<any>(`${this.basePath}/${reqParams.action}/?${reqParams.params}`, reqParams.body, { headers })

    }


    deleteData(params: IEndpointParams) {
        const reqParams = this.setReqParameters(params);
        const headers = { 'content-type': 'application/json', 'Authorization': `Bearer ${this.token()}` };
        const options = {
            headers: headers,
            body: reqParams.body // Note: Angular HttpClient requires the body to be included in the options for DELETE requests
        };
        return this.http.delete<ApiResponse>(`${this.basePath}/${reqParams.action}/`, options);
    }
    
    

    private setReqParameters(params: IEndpointParams): IEndpointParams {
        let reqAction = this.route;
        if (params.action) {
            reqAction = `${this.route}/${params.action}`;
        }

        let reqParams = undefined;
        if (params.params) {
            reqParams = params.params;
        }

        return { action: reqAction, params: reqParams, body: params.body }
    }
}

export interface IEndpointParams {
    action?: string | undefined;
    params?: string | undefined;
    body?: string | undefined;
}