import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SearchResult } from 'src/app/shared/base/base.search.result';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { IdConfigModel } from '../models/id-config/idconfig.model';

@Injectable({ providedIn: 'root' })
export class IdConfigService extends BaseSearchService {
    private _idConfigs: IdConfigModel[] = [];
    private _idConfigs$ = new BehaviorSubject<IdConfigModel[]>([]);

    constructor() {
        super();
    }

    set idConfigs(idConfigs: IdConfigModel[]) {
        this._idConfigs = idConfigs;
    }

    override loadData(result: SearchResult) {
        this._idConfigs$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get idConfigs$() { return this._idConfigs$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let idConfigs = this._idConfigs;

        // filter
        idConfigs = idConfigs?.filter(o => this.matches(o, this.searchTerm));
        const total = idConfigs?.length;

        // paginate
        idConfigs = this.getPaginatedData(idConfigs);
        return of({ data: idConfigs, total });
    }

    private matches(idConfig: IdConfigModel, term: string) {
        let termLower = term?.toLowerCase();
        return idConfig?.category?.description?.toLowerCase().includes(termLower) 
        || idConfig?.type?.description?.toLowerCase().includes(termLower)
        || idConfig?.reset?.description?.toLowerCase().includes(termLower)
        || idConfig?.preview?.toLowerCase().includes(termLower);
    }

    /**
    * add/update/delete
    */
    addIdConfig(model: IdConfigModel) {
        model.prefix = model?.prefix?.toUpperCase();
        this._idConfigs.push(model);
        this.goToLastPage();
    }

    deleteIdConfig(prefix: string) {
        this._idConfigs = this._idConfigs.filter(o => o.prefix != prefix);
    }
}