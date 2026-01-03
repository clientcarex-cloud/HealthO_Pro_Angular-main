import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { SMSTransTypeModel } from '../../models/sms/sms-transtype.model';
import { SearchResult } from 'src/app/shared/base/base.search.result';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';

@Injectable({ providedIn: 'root' })
export class SMSTransTypeService extends BaseSearchService {
    private _smsTransTypes: SMSTransTypeModel[] = [];
    private _smsTransTypes$ = new BehaviorSubject<SMSTransTypeModel[]>([]);

    constructor() {
        super();
    }

    set smsTransTypes(smsTransTypes: SMSTransTypeModel[]) {
        this._smsTransTypes = smsTransTypes;
    }

    override loadData(result: SearchResult) {
        this._smsTransTypes$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get smsTransTypes$() { return this._smsTransTypes$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let smsTransTypes = this._smsTransTypes;

        // filter
        smsTransTypes = smsTransTypes?.filter(o => this.matches(o, this.searchTerm));
        const total = smsTransTypes?.length;

        // paginate
        smsTransTypes = this.getPaginatedData(smsTransTypes);
        return of({ data: smsTransTypes, total });
    }

    private matches(smsTransType: SMSTransTypeModel, term: string) {
        return smsTransType?.description?.toLowerCase().includes(term.toLowerCase());
    }

    /**
    * add/update/delete
    */
    addSMSTransType(id: string, description: string) {
        const capsDescription = description.toUpperCase();
        const smsTransType: SMSTransTypeModel = 
        {
            id: id, 
            description: capsDescription, 
            oldDescription: capsDescription, 
            status: true, 
            disabled: false
        };
        this._smsTransTypes.push(smsTransType);
        this.goToLastPage();
    }

    updateSMSTransType(description: string, oldDescription: string) {
        let smsTransType = this._smsTransTypes.find(c => c.oldDescription == oldDescription);
        if (smsTransType) {
            const capsDescription = description.toUpperCase();
            smsTransType.description = capsDescription;
            smsTransType.oldDescription = capsDescription;
        }
    }

    deleteSMSTransType(description: string) {
        this._smsTransTypes = this._smsTransTypes.filter(c => c.description != description);
    }
}