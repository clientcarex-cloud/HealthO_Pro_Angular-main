import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { SearchResult } from '@sharedcommon/base/base.search.result';

import { DoctorAuthorization } from '../models/drauth.model';
import { Patient } from '../models/patient.model';
// import {}
export class DrAuthsService  extends BaseSearchService {

    compare(v1:any, v2:any) {
        return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
    }

    sort( employees: DoctorAuthorization[],column: string,direction: string): DoctorAuthorization[] {
        if (direction === "") {
          return employees;
        } else {
          return [...employees].sort((a, b) => {
            const res = this.compare(a[column], b[column]);
            return direction === "asc" ? res : -res;
          });
        }}

        private _drauths: DoctorAuthorization[] = [];
        private _drauths$ = new BehaviorSubject<DoctorAuthorization[]>([]);
  
        constructor(){
            super();
        }
  
        set drauths(drauths: DoctorAuthorization[]){
          this._drauths = drauths
        }

        
      override loadData(result: SearchResult) {
        this._drauths$.next(result.data);
        this._total$.next(result.total);
      }

      serviceDestroy() {
    }
  
    get drauths$() { return this._drauths$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }
  

    startNum?: number; // first entry or Remove
    endNum?: number; // last entry or remove
    totalLength!: number;
    override _search(): Observable<SearchResult> {
      
      let patients = this._drauths;

      const { sortColumn, sortDirection, pageSize, page, searchTerm, endIndex, startIndex } = this._state;

      patients = this.sort(patients, sortColumn, sortDirection);
      // filter
      patients = patients?.filter(o => this.matches(o, this.searchTerm));
      const total = patients?.length;
      this.totalLength = patients?.length;
      // paginate
      patients = this.getPaginatedData(patients);

      this.startNum = startIndex;  // get first entry or Remove later
      this.endNum = endIndex;  // get last entry or Remove 
    
      return of({ data: patients, total });
    }


    private matches(pnt: DoctorAuthorization, term: string) {

      if (isNaN(Number(term))) {
        // If the term is not a number, perform the original matching logic
        let termLower = term?.toLowerCase();
       
        return pnt.patient?.name?.toLowerCase().includes(termLower)
        || pnt.department?.toLowerCase().includes(termLower)
        || pnt.name?.toLowerCase().includes(termLower)
        || pnt.patient?.added_on.includes(termLower) || pnt.name?.toLowerCase().includes(termLower)
      } else {
        // If the term is a number, only match against the patient ID
        return pnt?.patient.mr_no?.toString().includes(term) 
        || pnt?.patient?.visit_id.toString().includes(term);
      }
    }

      override onSearchTermUpdate(searchTerm: string | any): void {
        if (typeof searchTerm == "string") {
          this.searchTerm = searchTerm;
          this._search$.next(); // Trigger the search when the term changes
        }
      }
        
      }


