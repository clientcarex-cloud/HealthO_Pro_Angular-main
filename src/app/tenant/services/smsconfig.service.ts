import { BehaviorSubject, Observable, of } from 'rxjs';
import { SMSPurchaseModel } from '../models/sms/smspurchase.model';

import { SearchResult } from '@sharedcommon/base/base.search.result';
import { BaseSearchService } from '@sharedcommon/base/base.search.service';
import { SMSSummaryModel } from '../models/sms/smssummary.model';


export class SMSConfigService extends BaseSearchService {
    private _smsPurchases: SMSPurchaseModel[] = [];
    private _smsPurchases$ = new BehaviorSubject<SMSPurchaseModel[]>([]);

    constructor() {
        super();
    }

    set smsPurchase(smsPurchases: SMSPurchaseModel[]) {
        this._smsPurchases = smsPurchases;
    }

    override loadData(result: SearchResult) {
        this._smsPurchases$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get smsPurchases$() { return this._smsPurchases$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let smsPurchases = this._smsPurchases;

        // filter
        smsPurchases = smsPurchases?.filter(o => this.matches(o, this.searchTerm));
        const total = smsPurchases?.length;

        // paginate
        smsPurchases = this.getPaginatedData(smsPurchases);
        return of({ data: smsPurchases, total });
    }

    private matches(smsPurchase: SMSPurchaseModel, term: string) {
        return smsPurchase.remarks.toLowerCase().includes(term.toLowerCase());
    }

    /**
   * sms purchase - add/update/delete
   */
    addSMSPurchases(model: SMSPurchaseModel) {
        this._smsPurchases.push(model);
        this.goToLastPage();
    }

    deleteSMSPurchases(smsPurchaseId: string) {
        this._smsPurchases = this._smsPurchases.filter(o => o.id != smsPurchaseId);
    }

    // sms balance
    smsSummary!: SMSSummaryModel;
    setSMSSummary(smsSummary: SMSSummaryModel) {
        this.smsSummary = smsSummary;
    }
}