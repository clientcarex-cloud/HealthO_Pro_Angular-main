import { BehaviorSubject, Observable, of } from 'rxjs';
import { SearchResult } from 'src/app/shared/base/base.search.result';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { RenewalModel } from '../models/renewal.model';

export class RenewalService extends BaseSearchService {
    private _renewals: RenewalModel[] = [];
    private _renewals$ = new BehaviorSubject<RenewalModel[]>([]);

    constructor() {
        super();
    }

    set renewals(renewals: RenewalModel[]) {
        this._renewals = renewals;
    }

    override loadData(result: SearchResult) {
        this._renewals$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get renewals$() { return this._renewals$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let renewals = this._renewals;

        // filter
        renewals = renewals?.filter(o => this.matches(o, this.searchTerm));
        const total = renewals?.length;

        // paginate
        renewals = this.getPaginatedData(renewals);
        return of({ data: renewals, total });
    }

    private matches(renewals: RenewalModel, term: string) {
        return renewals.remarks.toLowerCase().includes(term.toLowerCase());
    }

    /**
   * add/update/delete
   */
    addRenewal(model: RenewalModel) {
        this._renewals.push(model);
        this.goToLastPage();
    }

    deleteRenewal(extendedDate: string) {
        this._renewals = this._renewals.filter(o => o.extendedDate != extendedDate);
    }
}