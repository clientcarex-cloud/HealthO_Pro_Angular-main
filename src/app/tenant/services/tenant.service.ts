import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { TenantModel } from '../models/tenant.model';
import { DecimalPipe } from '@angular/common';

import { SearchResult } from '@sharedcommon/base/base.search.result';
import { BaseSearchService } from '@sharedcommon/base/base.search.service';

@Injectable({ providedIn: 'root' })
export class TenantService extends BaseSearchService {
    private _tenants: TenantModel[] = [];
    private _tenants$ = new BehaviorSubject<TenantModel[]>([]);

    constructor(private pipe: DecimalPipe) {
        super();
    }

    set tenants(tenants: TenantModel[]) {
        this._tenants = tenants;
    }

    override loadData(result: SearchResult) {
        this._tenants$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {

    }

    get tenants$() { return this._tenants$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let tenants = this._tenants;

        // filter
        tenants = tenants?.filter(tenant => this.matches(tenant, this.searchTerm, this.pipe));
        const total = tenants?.length;

        // paginate
        tenants = this.getPaginatedData(tenants);
        return of({ data: tenants, total });
    }

    private matches(tenant: TenantModel, term: string, pipe: PipeTransform) {
        return tenant.identifier.toLowerCase().includes(term.toLowerCase());
    }

    /**
    * add/update/delete
    */
    addTenant(identifier: string, name: string, dbName: string) {        
        const tenant: TenantModel =
            { id: "", identifier: identifier, name: name, dbName: dbName, status: true };
        this._tenants.push(tenant);
        this.goToLastPage();
    }

    updateTenant(identifier: string, name: string, dbName: string) {
        let tenant = this._tenants.find(t => t.identifier == identifier);
        if (tenant) {
            tenant.name = name;
            tenant.dbName = dbName;
        }
    }

    deleteTenant(identifier: string) {
        this._tenants = this._tenants.filter(t => t.identifier != identifier);
    }
}