import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { SearchResult } from '@sharedcommon/base/base.search.result';
// import { incomes} from '../models/incomes/incomesmodel';
import { Income } from '../models/income/income.model';
import { IncomeResponse } from '../models/income/incomeResponse.model';
import { SortDirection } from '@sharedcommon/directives/sortable.directive';

@Injectable({
  providedIn: 'root'
})


export class IncomesService  extends BaseSearchService {

    compare(v1:any, v2:any) {
        return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
    }

    sort( employees: Income[],column: string,direction: string): Income[] {
        if (direction === "") {
          return employees;
        } else {
          return [...employees].sort((a, b) => {
            const res = this.compare(a[column], b[column]);
            return direction === "asc" ? res : -res;
          });
        }
      }

      
      private _incomes: Income[] = [];
      private _incomes$ = new BehaviorSubject<Income[]>([]);

      constructor(){
          super();
      }

      set incomes(incomes: Income[]){
        this._incomes = incomes
      }

      override loadData(result: SearchResult) {
        this._incomes$.next(result.data);
        this._total$.next(result.total);
      }
    
      serviceDestroy() {
      }
    
      get incomes$() { return this._incomes$.asObservable(); }
      get total$() { return this._total$.asObservable(); }
      get loading$() { return this._loading$.asObservable(); }
    

      startNum?: number; // first entry or Remove
      endNum?: number; // last entry or remove
      totalLength?: number;
      override _search(): Observable<SearchResult> {
        let incomes = this._incomes;
        const { sortColumn, sortDirection } = this._state;
    
        incomes = this.sort(incomes, sortColumn, sortDirection);
        // filter
        incomes = incomes?.filter(o => this.matches(o, this.searchTerm));
        const total = incomes?.length;
        this.totalLength = incomes?.length;
        // paginate
        incomes = this.getPaginatedData(incomes);
    
        this.startNum = incomes[0]?.id;  // get first entry or Remove later
        this.endNum = incomes[incomes.length - 1]?.id;  // get last entry or Remove 
    
        return of({ data: incomes, total });
      }

      private matches(income: Income, term: string) {
        if (isNaN(Number(term))) {
          // If the term is not a number, perform the original matching logic
          let termLower = term?.toLowerCase();
          return income.added_on.includes(termLower)
          || income?.description?.toLowerCase().includes(termLower);
        } else {
          // If the term is a number, only match against the income ID
          return income.id.toString().includes(term);
        }
      }

      override onSearchTermUpdate(searchTerm: string | any): void {
        if (typeof searchTerm == "string") {
          this.searchTerm = searchTerm;
          this._search$.next(); // Trigger the search when the term changes
          if(this.searchTerm === ''){
            this.searchTerm = this.getFormattedDate();
            this._search$.next();
          }
        }
      }

      getFormattedDate(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    }