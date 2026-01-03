import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { SearchResult } from '@sharedcommon/base/base.search.result';
import { SortDirection } from '@sharedcommon/directives/sortable.directive';
// import { Phlebotomist } from '../model/results.model';
import { Result as Phlebotomist } from '../model/results.model';

@Injectable({
    providedIn: 'root'
  })
  
  
  export class PhlebotomistService extends BaseSearchService {
  
    compare(v1:any, v2:any) {
      return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
    }

    sort(Data: Phlebotomist[], column: string, direction: string) {
        const startTime = performance.now();
        if (direction === "") {
          return Data;
        } else {
          const sortedData = [...Data].sort((a, b) => {
            const comparisonResult = a[column] > b[column] ? 1 : a[column] < b[column] ? -1 : 0;
            return direction === "asc" ? comparisonResult : -comparisonResult;
          });
          const endTime = performance.now();

          return sortedData;
        }
      }

      private _phlebotomists: Phlebotomist[] = [];
      private _phlebotomists$ = new BehaviorSubject<Phlebotomist[]>([]);
    
      constructor() {
        super();
      }
    
      set phlebotomists(phlebotomists: Phlebotomist[]) {
        this._phlebotomists = phlebotomists;
      }
    
      override loadData(result: SearchResult) {
        this._phlebotomists$.next(result.data);
        this._total$.next(result.total);
      }
    
      serviceDestroy() {

                this._search$.unsubscribe();

      }

      get phlebotomists$() { return this._phlebotomists$.asObservable(); }
      get total$() { return this._total$.asObservable(); }
      get loading$() { return this._loading$.asObservable(); }
    
      startNum?: number; // first entry or Remove
  endNum?: number; // last entry or remove
  totalLength?: number;
  sortData(data: any, col: any, dir: any):any{
    this.sort(data, col, dir);
  }

   override _search(): Observable<SearchResult> {

    
    let phlebotomists = this._phlebotomists;

    const { sortColumn, sortDirection, pageSize, page, searchTerm, endIndex, startIndex } = this._state;

    phlebotomists = this.sort(phlebotomists, sortColumn, sortDirection);
    // filter
    phlebotomists = phlebotomists?.filter(o => this.matches(o, this.searchTerm));
    const total = phlebotomists?.length;
    this.totalLength = phlebotomists?.length;
    // paginate
    phlebotomists = this.getPaginatedData(phlebotomists);

    this.startNum = startIndex;  // get first entry or Remove later
    this.endNum = endIndex;  // get last entry or Remove 
  
    return of({ data: phlebotomists, total });
  }

  private matches(patient: Phlebotomist, term: string) {

    if (isNaN(Number(term))) {
      // If the term is not a number, perform the original matching logic
      let termLower = term?.toLowerCase();
     
      return patient.patient.name?.toLowerCase().includes(termLower)
      || patient.name?.toLowerCase().includes(termLower)
      || patient.short_code?.toLowerCase().includes(termLower)

     
    } else {
      // If the term is a number, only match against the patient ID
      return patient.added_on?.toLowerCase().includes(term)
    }
  }

}