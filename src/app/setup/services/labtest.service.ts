import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { SearchResult } from '@sharedcommon/base/base.search.result';
import { Test } from '../models/master/test.model';
import { SortDirection } from '@sharedcommon/directives/sortable.directive';

@Injectable({
  providedIn: 'root'
})


export class GlobalTestService extends BaseSearchService {

  compare(v1:any, v2:any) {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
  }

  sort(employees: Test[], column: string, direction: string) {
    const startTime = performance.now();
    if (direction === "") {
      return employees;
    } else {
      const sortedEmployees = [...employees].sort((a, b) => {
        const comparisonResult = a[column] > b[column] ? 1 : a[column] < b[column] ? -1 : 0;
        return direction === "asc" ? comparisonResult : -comparisonResult;
      });
      const endTime = performance.now();
      const sortingTime = endTime - startTime;

      return sortedEmployees;
    }
  }

  private _tests: Test[] = [];
  private _tests$ = new BehaviorSubject<Test[]>([]);

  constructor() {
    super();
  }

  set tests(tests: Test[]) {
    this._tests = tests;
  }

  override loadData(result: SearchResult) {
    this._tests$.next(result.data);
    this._total$.next(result.total);
  }

  serviceDestroy() {

            this._search$.unsubscribe();

  }

  get tests$() { return this._tests$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }


  //   override _search(): Observable<SearchResult> {
  //     let tests = this._tests;

  //     // Apply search filter
  //     if (this.searchTerm) {
  //         const term = this.searchTerm.toLowerCase();
  //         tests = tests.filter(test =>
  //             test.name.toLowerCase().includes(term)
  //             || test.added_on.includes(term)
  //             || test.id.toString().includes(term)
  //             // Add more fields for searching if needed
  //         );
  //     }

  //     const total = tests.length;

  //     // Paginate the results
  //     tests = this.getPaginatedData(tests);

  //     return of({ data: tests, total });
  // }

  startNum?: number; // first entry or Remove
  endNum?: number; // last entry or remove
  totalLength?: number;
  sortData(data: any, col: any, dir: any):any{
    this.sort(data, col, dir);
  }

   override _search(): Observable<SearchResult> {
    
    let tests = this._tests;

    const { sortColumn, sortDirection, pageSize, page, searchTerm, endIndex, startIndex } = this._state;

    tests = this.sort(tests, sortColumn, sortDirection);
    // filter
    tests = tests?.filter(o => this.matches(o, this.searchTerm));
    const total = tests?.length;
    this.totalLength = tests?.length;
    // paginate
    tests = this.getPaginatedData(tests);

    this.startNum = startIndex;  // get first entry or Remove later
    this.endNum = endIndex;  // get last entry or Remove 
  
    return of({ data: tests, total });
  }

  _searchh(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } =
      this._state;

      let tests = this._tests;
      tests = this.sort(tests, sortColumn, sortDirection);
      tests = tests?.filter(o => this.matches(o, this.searchTerm));
      tests = tests.slice(
        (page - 1) * pageSize,
        (page - 1) * pageSize + pageSize
      );
      const total = tests?.length;
      return of({ data: tests, total });
  }
  


  private matches(test: Test, term: string) {

    if (isNaN(Number(term))) {
      // If the term is not a number, perform the original matching logic
      let termLower = term?.toLowerCase();
     
      return test?.name?.toLowerCase().includes(termLower)
      || test.department?.toLowerCase().includes(termLower)
      || test.short_code?.toLowerCase().includes(termLower)
   
    } else {
      // If the term is a number, only match against the test ID
      return test.price.toString().includes(term) 
    }
  }



  override onSearchTermUpdate(searchTerm: string | any): void {
    if (typeof searchTerm == "string") {
      this.searchTerm = searchTerm;
      this._search$.next(); // Trigger the search when the term changes
    }
  }


}
