import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { BranchModel } from '../models/branch.model';

import { SearchResult } from 'src/app/shared/base/base.search.result';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { CityModel } from '../models/city.model';

@Injectable({ providedIn: 'root' })
export class BranchService extends BaseSearchService {
    private _branches: BranchModel[] = [];
    private _branches$ = new BehaviorSubject<BranchModel[]>([]);

    constructor() {
        super();
    }

    set branches(branches: BranchModel[]) {
        this._branches = branches;
    }

    override loadData(result: SearchResult) {
        this._branches$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get branches$() { return this._branches$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let branches = this._branches;

        // filter
        branches = branches?.filter(o => this.matches(o, this.searchTerm));
        const total = branches?.length;

        // paginate
        branches = this.getPaginatedData(branches);
        return of({ data: branches, total });
    }

    private matches(branch: BranchModel, term: string) {
        return branch.name.toLowerCase().includes(term.toLowerCase());
    }

    /**
    * add/update/delete
    */
    addBranch(model: BranchModel) {
        model.name = model?.name?.toUpperCase();
        this._branches.push(model);
        this.goToLastPage();
    }

    updateBranch(model: BranchModel, oldName: string) {
        model.name = model?.name?.toUpperCase();
        let branch = this._branches.find(o => o.oldName == oldName);
        if (branch) {
            branch.name = model.name;
            branch.oldName = model.name;
            branch.shortName = model.shortName;
            branch.address = model.address;
            branch.area = model.area;
            branch.pinCode = model.pinCode;
            branch.emailId = model.emailId;
            branch.cPersonName1 = model.cPersonName1;
            branch.cPersonMobileNo1 = model.cPersonMobileNo1;
            branch.cPersonName2 = model.cPersonName2;
            branch.cPersonMobileNo2 = model.cPersonMobileNo2;
            branch.websiteUrl = model.websiteUrl;
            branch.city = model.city;
            branch.tenantId = model.tenantId;
        }
    }

    deleteBranch(name: string) {
        this._branches = this._branches.filter(o => o.name != name);
    }
}