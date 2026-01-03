import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { SearchResult } from '@sharedcommon/base/base.search.result';
import { Nabl } from '../model/nabl.model';
import { SortDirection } from '@sharedcommon/directives/sortable.directive';

@Injectable({
  providedIn: 'root'
})


export class NablService extends BaseSearchService {

  compare(v1:any, v2:any) {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
  }

  sort(employees: Nabl[], column: string, direction: string) {
    const startTime = performance.now();
    if (direction === "") {
      return employees;
    } else {
      const sortedEmployees = [...employees].sort((a, b) => {
        const comparisonResult = a[column] > b[column] ? 1 : a[column] < b[column] ? -1 : 0;
        return direction === "asc" ? comparisonResult : -comparisonResult;
      });
      const endTime = performance.now();

      return sortedEmployees;
    }
  }

  private _nabls: Nabl[] = [];
  private _nabls$ = new BehaviorSubject<Nabl[]>([]);

  constructor() {
    super();
  }

  set nabls(nabls: Nabl[]) {
    this._nabls = nabls;
  }

  override loadData(result: SearchResult) {
    this._nabls$.next(result.data);
    this._total$.next(result.total);
  }

  get nabls$() { return this._nabls$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }

  startNum?: number; // first entry or Remove
  endNum?: number; // last entry or remove
  totalLength?: number;

  sortData(data: any, col: any, dir: any):any{
    this.sort(data, col, dir);
  }

  override _search(): Observable<SearchResult> {

    
    let nabls = this._nabls;

    const { sortColumn, sortDirection, pageSize, page, searchTerm, endIndex, startIndex } = this._state;

    nabls = this.sort(nabls, sortColumn, sortDirection);
    // filter
    nabls = nabls?.filter(o => this.matches(o, this.searchTerm));
    const total = nabls?.length;
    this.totalLength = nabls?.length;
    // paginate
    nabls = this.getPaginatedData(nabls);

    this.startNum = startIndex;  // get first entry or Remove later
    this.endNum = endIndex;  // get last entry or Remove 
  
    return of({ data: nabls, total });
  }

  private matches(nabl: Nabl, term: string) {

    if (isNaN(Number(term))) {
      // If the term is not a number, perform the original matching logic
      let termLower = term?.toLowerCase();
     
      return nabl?.name?.toLowerCase().includes(termLower)
      || nabl.patient.name?.toLowerCase().includes(termLower)
      || nabl.status_id?.toLowerCase().includes(termLower)
      // || nabl?.lab_tests?.some((test:any) => test.name?.toLowerCase().includes(termLower));
    } else {
      // If the term is a number, only match against the nabl ID
      return nabl.id.toString().includes(term) 
    }
  }



  override onSearchTermUpdate(searchTerm: string | any): void {
    if (typeof searchTerm == "string") {
      this.searchTerm = searchTerm;
      this._search$.next(); // Trigger the search when the term changes
    }
  }

}
