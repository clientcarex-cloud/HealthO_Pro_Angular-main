import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { SearchResult } from '@sharedcommon/base/base.search.result';
import { Patient } from '../models/patients/patient.model';
import { SortDirection } from '@sharedcommon/directives/sortable.directive';

@Injectable({
  providedIn: 'root'
})


export class PatientsService extends BaseSearchService {

  compare(v1:any, v2:any) {
    return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
  }


  sort(employees: Patient[], column: string, direction: string) {
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

  private _patients: Patient[] = [];
  private _patients$ = new BehaviorSubject<Patient[]>([]);

  constructor() {
    super();
  }

  set patients(patients: Patient[]) {
    this._patients = patients;
  }

  override loadData(result: SearchResult) {
    this._patients$.next(result.data);
    this._total$.next(result.total);
  }

  serviceDestroy() {

            this._search$.unsubscribe();

  }

  get patients$() { return this._patients$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }



  startNum?: number; // first entry or Remove
  endNum?: number; // last entry or remove
  totalLength?: number;
  sortData(data: any, col: any, dir: any):any{
    this.sort(data, col, dir);
  }

   override _search(): Observable<SearchResult> {

    let patients = this._patients;
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

  _searchh(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } =this._state;

      let patients = this._patients;
      patients = this.sort(patients, sortColumn, sortDirection);
      patients = patients?.filter(o => this.matches(o, this.searchTerm));
      patients = patients.slice(
        (page - 1) * pageSize,
        (page - 1) * pageSize + pageSize
      );
      const total = patients?.length;
      return of({ data: patients, total });
 }
  


  private matches(patient: Patient, term: string) {

    if (isNaN(Number(term))) {
      // If the term is not a number, perform the original matching logic
      let termLower = term?.toLowerCase();
     
      return patient?.name?.toLowerCase().includes(termLower)
      || patient.added_on.includes(termLower)
      || patient?.lab_tests?.some(test => test.name?.toLowerCase().includes(termLower))
      || patient?.lab_tests?.some(test => test.short_code?.toLowerCase().includes(termLower));
    } else {
      // If the term is a number, only match against the patient ID
      return patient.mr_no.toString().includes(term) 
      || patient.visit_id.toString().includes(term);
    }
  }



  override onSearchTermUpdate(searchTerm: string | any): void {
    if (typeof searchTerm == "string") {
      this.searchTerm = searchTerm;
      this._search$.next(); // Trigger the search when the term changes
    }
  }


}
