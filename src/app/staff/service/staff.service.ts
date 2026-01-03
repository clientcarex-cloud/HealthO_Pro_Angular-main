import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { SearchResult } from '@sharedcommon/base/base.search.result';
import { LabStaffIdentificationDetails } from '../model/identification-details.model';
import { Staff } from '../model/staff.model';
import { LabStaffPersonalDetails } from '../model/personal-details.model';
import { SortDirection } from '@sharedcommon/directives/sortable.directive';

@Injectable({
  providedIn: 'root'
})


export class StaffService extends BaseSearchService {

  compare(v1:any, v2:any) {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
  }

  sort(employees: Staff[], column: string, direction: string) {
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

  private _staffs: Staff[] = [];
  private _staffs$ = new BehaviorSubject<Staff[]>([]);

  constructor() {
    super();
  }

  set staffs(staffs: Staff[]) {
    this._staffs = staffs;
  }

  override loadData(result: SearchResult) {
    this._staffs$.next(result.data);
    this._total$.next(result.total);
  }

  serviceDestroy() {
            //this._loading$.unsubscribe();
            this._search$.unsubscribe();

  }

  get staffs$() { return this._staffs$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }

  startNum?: number; // first entry or Remove
  endNum?: number; // last entry or remove
  totalLength?: number;
  sortData(data: any, col: any, dir: any):any{
    this.sort(data, col, dir);
  }

   override _search(): Observable<SearchResult> {
    
    let staffs = this._staffs;
    const { sortColumn, sortDirection, pageSize, page, searchTerm, endIndex, startIndex } = this._state;

    staffs = this.sort(staffs, sortColumn, sortDirection);
    // filter
    staffs = staffs?.filter(o => this.matches(o, this.searchTerm));

    const total = staffs?.length;
    this.totalLength = staffs?.length;

    // paginate
    staffs = this.getPaginatedData(staffs);

    this.startNum = startIndex;  // get first entry or Remove later
    this.endNum = endIndex;  // get last entry or Remove 
  
    return of({ data: staffs, total });
  }


  private matches(staff: Staff, term: string) {

    if (isNaN(Number(term))) {
      // If the term is not a number, perform the original matching logic
      let termLower = term?.toLowerCase();
      return staff?.name?.toLowerCase().includes(termLower)
    } else {
      // If the term is a number, only match against the staff ID
      return staff?.mobile_number?.toString().includes(term) 
    }
  }



  override onSearchTermUpdate(searchTerm: string | any): void {
    if (typeof searchTerm == "string") {
      this.searchTerm = searchTerm;
      this._search$.next(); // Trigger the search when the term changes
    }

}
}