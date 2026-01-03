import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { SearchResult } from '@sharedcommon/base/base.search.result';
import { Patient } from '../models/patient.model';
import { SortDirection } from '@sharedcommon/directives/sortable.directive';

@Injectable({
    providedIn: 'root'
  })
  
  
export class ManagePaymentsService extends BaseSearchService {

    compare(v1:any, v2:any) {
        return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
      }
    
      sort( employees: Patient[],column: string,direction: string): Patient[] {
        if (direction === "") {
          return employees;
        } else {
          return [...employees].sort((a, b) => {
            const res = this.compare(a[column], b[column]);
            return direction === "asc" ? res : -res;
          });
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
    
      viewPatientsList: Patient[] =[];

      override loadData(result: SearchResult) {
        this._patients$.next(result.data);
        this.viewPatientsList = result.data;

        this._total$.next(result.total);
      }

      getTotalCost(patients: Patient[] = this.viewPatientsList ): number {
        return patients.reduce((total, patient) => {
          if (patient.patient_invoice && patient.patient_invoice.total_cost) {
            return total + patient.patient_invoice.total_cost;
          } else {
            return total;
          }
        }, 0);
      }

      getTotalDiscount(patients: Patient[] = this.viewPatientsList ): number {
        return patients.reduce((total, patient) => {
          if (patient.patient_invoice && patient.patient_invoice.total_discount) {
            return total + patient.patient_invoice.total_discount;
          } else {
            return total;
          }
        }, 0);
      }

      getTotalPaid(patients: Patient[] = this.viewPatientsList ): number {
        return patients.reduce((total, patient) => {
          if (patient.patient_invoice && patient.patient_invoice.total_paid) {
            return total + patient.patient_invoice.total_paid;
          } else {
            return total;
          }
        }, 0);
      }

      getTotalRefund(patients: Patient[] = this.viewPatientsList ): number {
        return patients.reduce((total, patient) => {
          if (patient.patient_invoice && patient.patient_invoice.total_refund) {
            return total + patient.patient_invoice.total_refund;
          } else {
            return total;
          }
        }, 0);
      }

      getTotalDue(patients: Patient[] = this.viewPatientsList ): number {
        return patients.reduce((total, patient) => {
          if (patient.patient_invoice && patient.patient_invoice.total_due) {
            return total + patient.patient_invoice.total_due;
          } else {
            return total;
          }
        }, 0);
      }

      getTotalAmount(patients: Patient[] = this.viewPatientsList ): number {
        return this.getTotalCost() - this.getTotalDiscount();
      }
    
      serviceDestroy() {
      }
    
      get patients$() { return this._patients$.asObservable(); }
      get total$() { return this._total$.asObservable(); }
      get loading$() { return this._loading$.asObservable(); }
    
    
      //   override _search(): Observable<SearchResult> {
      //     let patients = this._patients;
    
      //     // Apply search filter
      //     if (this.searchTerm) {
      //         const term = this.searchTerm.toLowerCase();
      //         patients = patients.filter(patient =>
      //             patient.name.toLowerCase().includes(term)
      //             || patient.added_on.includes(term)
      //             || patient.id.toString().includes(term)
      //             // Add more fields for searching if needed
      //         );
      //     }
    
      //     const total = patients.length;
    
      //     // Paginate the results
      //     patients = this.getPaginatedData(patients);
    
      //     return of({ data: patients, total });
      // }
    
      startNum?: number; // first entry or Remove
      endNum?: number; // last entry or remove
      totalLength?: number;
      pageNumber:number = 1;

      sortData(data: any, col: any, dir: any):any{
        this.sort(data, col, dir);
      }

      override _search(): Observable<SearchResult> {

        let patients = this._patients;
        const { sortColumn, sortDirection, pageSize, page, searchTerm, endIndex, startIndex } = this._state;
    
        patients = this.sort(patients, sortColumn, sortDirection);
        // filter
        patients = patients?.filter(o => this.matches(o, this.searchTerm))
        const total = patients?.length;
        this.totalLength = patients?.length;
        // paginate
        patients = this.getPaginatedData(patients);
    
        this.startNum = startIndex;  // get first entry or Remove later
        this.endNum = endIndex;  // get last entry or Remove 
      
        return of({ data: patients, total });
      }
    
    
      private matches(patient: Patient, term: string) {
        if (isNaN(Number(term))) {
          // If the term is not a number, perform the original matching logic
          let termLower = term?.toLowerCase();
          return patient?.name?.toLowerCase().includes(termLower)
            || patient.added_on.includes(termLower);
        } else {
          // If the term is a number, only match against the patient ID
          return patient.id.toString().includes(term);
        }
      }
    
    
    
      override onSearchTermUpdate(searchTerm: string | any): void {
        if (typeof searchTerm == "string") {
          this.searchTerm = searchTerm;
          this._search$.next(); // Trigger the search when the term changes
        }
      }


}  