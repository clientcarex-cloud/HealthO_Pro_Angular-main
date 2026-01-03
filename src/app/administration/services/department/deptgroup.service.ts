import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { DepartmentGroupModel } from '../../models/department/dept-group.model';
import { SearchResult } from 'src/app/shared/base/base.search.result';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';

@Injectable({ providedIn: 'root' })
export class DepartmentGroupService extends BaseSearchService {
    private _deptGroups: DepartmentGroupModel[] = [];
    private _deptGroups$ = new BehaviorSubject<DepartmentGroupModel[]>([]);

    constructor() {
        super();
    }

    set deptGroups(deptGroups: DepartmentGroupModel[]) {
        this._deptGroups = deptGroups;
    }

    override loadData(result: SearchResult) {
        this._deptGroups$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get deptGroups$() { return this._deptGroups$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let deptGroups = this._deptGroups;

        // filter
        deptGroups = deptGroups?.filter(o => this.matches(o, this.searchTerm));
        const total = deptGroups?.length;

        // paginate
        deptGroups = this.getPaginatedData(deptGroups);
        return of({ data: deptGroups, total });
    }

    private matches(deptGroup: DepartmentGroupModel, term: string) {
        return deptGroup?.description?.toLowerCase().includes(term.toLowerCase());
    }

    /**
    * add/update/delete
    */
    addDeptGroup(id: string, description: string) {
        const capsDescription = description.toUpperCase();
        const deptGroup: DepartmentGroupModel = 
        {
            id: id, 
            description: capsDescription, 
            oldDescription: capsDescription, 
            status: true, 
            disabled: false
        };
        this._deptGroups.push(deptGroup);
        this.goToLastPage();
    }

    updateDeptGroup(description: string, oldDescription: string) {
        let deptGroup = this._deptGroups.find(c => c.oldDescription == oldDescription);
        if (deptGroup) {
            const capsDescription = description.toUpperCase();
            deptGroup.description = capsDescription;
            deptGroup.oldDescription = capsDescription;
        }
    }

    deleteDeptGroup(description: string) {
        this._deptGroups = this._deptGroups.filter(c => c.description != description);
    }
}