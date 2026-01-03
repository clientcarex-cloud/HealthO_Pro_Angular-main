import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { SMSConfigModel } from '../../models/sms/sms-config.model';
import { SearchResult } from 'src/app/shared/base/base.search.result';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';

@Injectable({ providedIn: 'root' })
export class SMSConfigService extends BaseSearchService {
    private _smsConfigs: SMSConfigModel[] = [];
    private _smsConfigs$ = new BehaviorSubject<SMSConfigModel[]>([]);

    constructor() {
        super();
    }

    set smsConfigs(smsConfigs: SMSConfigModel[]) {
        this._smsConfigs = smsConfigs;
    }

    override loadData(result: SearchResult) {
        this._smsConfigs$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get smsConfigs$() { return this._smsConfigs$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let smsConfigs = this._smsConfigs;

        // filter
        smsConfigs = smsConfigs?.filter(o => this.matches(o, this.searchTerm));
        const total = smsConfigs?.length;

        // paginate
        smsConfigs = this.getPaginatedData(smsConfigs);
        return of({ data: smsConfigs, total });
    }

    private matches(smsConfig: SMSConfigModel, term: string) {
        term = term?.toLowerCase();
        return smsConfig?.smsTransType?.description?.toLowerCase().includes(term)
               || smsConfig?.smsCategory?.description?.toLowerCase().includes(term);
    }

    /**
    * add/update/delete
    */
    addSMSConfig(model: SMSConfigModel) {
        model.smsStatus = false, 
        model.wapStatus = false;
        model.disabled = false
        this._smsConfigs.push(model);
        this.goToLastPage();
    }

    updateSMSConfig(model: SMSConfigModel) {
        let smsConfig = this._smsConfigs.find(
            c => c.smsTransType?.description == model.smsTransType?.description 
            && c.smsCategory?.description == model.smsCategory?.description);
        if (smsConfig) {
            smsConfig.smsBody = model.smsBody;
            smsConfig.wapBody = model.wapBody;
            smsConfig.templateId = model.templateId;
            smsConfig.wapSendWithImg = model.wapSendWithImg;
        }
    }

    deleteSMSConfig(model: SMSConfigModel) {
        this._smsConfigs = this._smsConfigs.filter(
            c => c.smsTransType?.description == model.smsTransType?.description 
            && c.smsCategory?.description == model.smsCategory?.description);
    }
}