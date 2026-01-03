import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { SearchResult } from '@sharedcommon/base/base.search.result';
import { Expense } from '../models/expense/expense.model';
import { SortDirection } from '@sharedcommon/directives/sortable.directive';

@Injectable({
  providedIn: 'root'
})


export class ExpensesService  extends BaseSearchService {

    compare(v1:any, v2:any) {
        return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
    }

    sort( employees: Expense[],column: string,direction: string): Expense[] {
        if (direction === "") {
          return employees;
        } else {
          return [...employees].sort((a, b) => {
            const res = this.compare(a[column], b[column]);
            return direction === "asc" ? res : -res;
          });
        }
      }

      
      private _expenses: Expense[] = [];
      private _expenses$ = new BehaviorSubject<Expense[]>([]);

      constructor(){
          super();
      }

      set expenses(expenses: Expense[]){
        this._expenses = expenses
      }

      override loadData(result: SearchResult) {
        this._expenses$.next(result.data);
        this._total$.next(result.total);
      }
    
      serviceDestroy() {
      }
    
      get expenses$() { return this._expenses$.asObservable(); }
      get total$() { return this._total$.asObservable(); }
      get loading$() { return this._loading$.asObservable(); }
    

      startNum?: number; // first entry or Remove
      endNum?: number; // last entry or remove
      totalLength?:number;
      override _search(): Observable<SearchResult> {
        let expenses = this._expenses;
        const { sortColumn, sortDirection } = this._state;
    
        expenses = this.sort(expenses, sortColumn, sortDirection);
        // filter
        expenses = expenses?.filter(o => this.matches(o, this.searchTerm));
        const total = expenses?.length;
        this.totalLength = expenses?.length;
        // paginate
        expenses = this.getPaginatedData(expenses);
    
        this.startNum = expenses[0]?.id;  // get first entry or Remove later
        this.endNum = expenses[expenses.length - 1]?.id;  // get last entry or Remove 
    
        return of({ data: expenses, total });
      }

      private matches(expense: Expense, term: string) {
        if (isNaN(Number(term))) {
          // If the term is not a number, perform the original matching logic
          let termLower = term?.toLowerCase();
          return expense.added_on.includes(termLower)
          || expense?.expense_type?.toLowerCase().includes(termLower);
        } else {
          // If the term is a number, only match against the income ID
          return expense.id.toString().includes(term);
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