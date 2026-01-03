import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { SearchResult } from '@sharedcommon/base/base.search.result';
import { SortDirection } from '@sharedcommon/directives/sortable.directive';
import { Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})


export class ConsultingService extends BaseSearchService {

    compare(v1:any, v2:any) {
        return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
      }

      sort(employees: Doctor[], column: string, direction: string) {
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

      private _doctors: Doctor[] = [];
      private _doctors$ = new BehaviorSubject<Doctor[]>([]);
    
      constructor() {
        super();
      }
    
      set doctors(doctors: Doctor[]) {
        this._doctors = doctors;
      }

      override loadData(result: SearchResult) {
        this._doctors$.next(result.data);
        this._total$.next(result.total);
      }

      serviceDestroy() {
        this._search$.unsubscribe();
}

get doctors$() { return this._doctors$.asObservable(); }
get total$() { return this._total$.asObservable(); }
get loading$() { return this._loading$.asObservable(); }

startNum?: number; // first entry or Remove
endNum?: number; // last entry or remove
totalLength?: number;
sortData(data: any, col: any, dir: any):any{
  this.sort(data, col, dir);
}

override _search(): Observable<SearchResult> {

    
    let doctors = this._doctors;

    const { sortColumn, sortDirection, pageSize, page, searchTerm, endIndex, startIndex } = this._state;

    doctors = this.sort(doctors, sortColumn, sortDirection);
    // filter
    doctors = doctors?.filter(o => this.matches(o, this.searchTerm));
    const total = doctors?.length;
    this.totalLength = doctors?.length;
    // paginate
    doctors = this.getPaginatedData(doctors);

    this.startNum = startIndex;  // get first entry or Remove later
    this.endNum = endIndex;  // get last entry or Remove 
  
    return of({ data: doctors, total });
  }


  private matches(doctor: Doctor, term: string) {

    if (isNaN(Number(term))) {
      // If the term is not a number, perform the original matching logic
      let termLower = term?.toLowerCase();
     
      return doctor?.name?.toLowerCase().includes(termLower)||
      doctor?.added_on?.toString().includes(term);

    } else {
      // If the term is a number, only match against the doctor ID
      return doctor?.added_on?.toString().includes(term);
      
    }
  }

  override onSearchTermUpdate(searchTerm: string | any): void {
    if (typeof searchTerm == "string") {
      this.searchTerm = searchTerm;
      this._search$.next(); // Trigger the search when the term changes
    }

  }


}

