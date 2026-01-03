import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { SearchResult } from '@sharedcommon/base/base.search.result';
import { LabTechnician } from '../models/labtechnician.model';

@Injectable({
    providedIn: 'root'
  })
  
  
export class LabTechnicianService extends BaseSearchService {
  
    compare(v1:any, v2:any) {
        return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
    }

    sort( employees: LabTechnician[],column: string,direction: string): LabTechnician[] {
        if (direction === "") {
          return employees;
        } else {
          return [...employees].sort((a, b) => {
            const res = this.compare(a[column], b[column]);
            return direction === "asc" ? res : -res;
          });
        }
      }

      private _techs: LabTechnician[] = [];
      private _techs$ = new BehaviorSubject<LabTechnician[]>([]);

      constructor(){
          super();
      }

      set techs(techs: LabTechnician[]){
        this._techs = techs
      }

      override loadData(result: SearchResult) {
        this._techs$.next(result.data);
        this._total$.next(result.total);
      }
    
      serviceDestroy() {
      }
    
      get techs$() { return this._techs$.asObservable(); }
      get total$() { return this._total$.asObservable(); }
      get loading$() { return this._loading$.asObservable(); }
    

      startNum?: number; // first entry or Remove
      endNum?: number; // last entry or remove
      totalLength?: number;



      override _search(): Observable<SearchResult> {
        // console.trace('Calling _search');
        
        let patients = this._techs;

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



      private matches(tech: LabTechnician, term: string) {

        if (isNaN(Number(term))) {
          // If the term is not a number, perform the original matching logic
          let termLower = term?.toLowerCase();
         
          return tech?.LabPatientTestID?.patient?.name.toLowerCase().includes(termLower)
          || tech.LabPatientTestID?.name.toLowerCase().includes(termLower)
        } else {
          // If the term is a number, only match against the tech ID
          return tech.LabPatientTestID?.patient?.mr_no.toString().includes(term) 
          || tech.LabPatientTestID?.patient?.visit_id.toString().includes(term);
        }
      }

      override onSearchTermUpdate(searchTerm: string | any): void {
        if (typeof searchTerm == "string") {
          this.searchTerm = searchTerm;
          this._search$.next(); // Trigger the search when the term changes
        }
      }

}