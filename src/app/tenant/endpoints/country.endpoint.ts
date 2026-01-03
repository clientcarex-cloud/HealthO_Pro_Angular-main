import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
import { CountryModel } from "../models/country.model";

@Injectable({ providedIn: 'root' })
export class CountryEndpoint extends BaseEndpoint {
    constructor(injector: Injector) {
        super(injector);
        this.route = "country";
    }

    getCountries() {
        let reqParams = `getActive=${false}`;
        return this.getData<CountryModel>({ params: reqParams });
    }

    getActiveCountries() {
        let reqParams = `getActive=${true}`;
        return this.getData<CountryModel>({ params: reqParams });
    }

    updateCountryStatus(model: CountryModel) {
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "status", body: reqBody });
    }

    addCountry(name: string) {
        const model: Partial<CountryModel> = { name: name };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "add", body: reqBody });
    }

    updateCountry(name: string, oldName: string) {
        const model: Partial<CountryModel> = {
            name: name,
            oldName: oldName
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "update", body: reqBody });
    }

    deleteCountry(data: any) {
        const model: Partial<CountryModel> = {
            name: data.name,
        };
        const reqBody = JSON.stringify(model);
        return this.postModelRequest({ action: "delete", body: reqBody });
    }
}