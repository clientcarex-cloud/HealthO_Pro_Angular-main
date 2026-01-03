import { BehaviorSubject, Observable, of } from 'rxjs';
import { WAPPurchaseModel } from '../models/wap/wappurchase.model';

import { SearchResult } from '@sharedcommon/base/base.search.result';
import { BaseSearchService } from '@sharedcommon/base/base.search.service';
import { WAPSummaryModel } from '../models/wap/wapsummary.model';


export class WAPConfigService extends BaseSearchService {
    private _wapPurchases: WAPPurchaseModel[] = [];
    private _wapPurchases$ = new BehaviorSubject<WAPPurchaseModel[]>([]);

    constructor() {
        super();
    }

    set wapPurchase(wapPurchases: WAPPurchaseModel[]) {
        this._wapPurchases = wapPurchases;
    }

    override loadData(result: SearchResult) {
        this._wapPurchases$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get wapPurchases$() { return this._wapPurchases$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let wapPurchases = this._wapPurchases;

        // filter
        wapPurchases = wapPurchases?.filter(o => this.matches(o, this.searchTerm));
        const total = wapPurchases?.length;

        // paginate
        wapPurchases = this.getPaginatedData(wapPurchases);
        return of({ data: wapPurchases, total });
    }

    private matches(wapPurchase: WAPPurchaseModel, term: string) {
        return wapPurchase.remarks.toLowerCase().includes(term.toLowerCase());
    }

    /**
   * wap purchase - add/update/delete
   */
    addWAPPurchases(model: WAPPurchaseModel) {
        this._wapPurchases.push(model);
        this.goToLastPage();
    }

    deleteWAPPurchases(wapPurchaseId: string) {
        this._wapPurchases = this._wapPurchases.filter(o => o.id != wapPurchaseId);
    }

    // wap balance
    wapSummary!: WAPSummaryModel;
    setWAPSummary(wapSummary: WAPSummaryModel) {
        this.wapSummary = wapSummary;
    }
}