import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { DepartmentModel } from '../../models/department/department.model';
import { SearchResult } from 'src/app/shared/base/base.search.result';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';

@Injectable({ providedIn: 'root' })
export class DepartmentService extends BaseSearchService {
    private _depts: DepartmentModel[] = [];
    private _depts$ = new BehaviorSubject<DepartmentModel[]>([]);

    constructor() {
        super();
    }

    set depts(depts: DepartmentModel[]) {
        this._depts = depts;
    }

    override loadData(result: SearchResult) {
        this._depts$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get depts$() { return this._depts$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let depts = this._depts;

        // filter
        depts = depts?.filter(o => this.matches(o, this.searchTerm));
        const total = depts?.length;

        // paginate
        depts = this.getPaginatedData(depts);
        return of({ data: depts, total });
    }

    private matches(dept: DepartmentModel, term: string) {
        let termLower = term?.toLowerCase();
        return dept?.departmentGroup?.description.toLowerCase().includes(termLower)
            || dept?.departmentType?.description.toLowerCase().includes(termLower)
            || dept?.name?.toLowerCase().includes(termLower);
    }

    /**
    * add/update/delete
    */
    addDept(model: DepartmentModel) {
        model.name = model?.name?.toUpperCase();
        this._depts.push(model);
        this.goToLastPage();
    }

    updateDept(model: DepartmentModel, oldName: string) {
        model.name = model?.name?.toUpperCase();
        let dept = this._depts.find(o => o.oldName == oldName);
        if (dept) {
            dept.departmentGroup = model.departmentGroup;
            dept.departmentType = model.departmentType;
            dept.name = model.name;
            dept.oldName = model.name;
            dept.reportHeader = model.reportHeader;
            dept.showReportHeader = model.showReportHeader;
            dept.reportFooter = model.reportFooter;
            dept.showReportHeader = model.showReportHeader;
        }
    }

    deleteDept(name: string) {
        this._depts = this._depts.filter(o => o.name != name);
    }
}