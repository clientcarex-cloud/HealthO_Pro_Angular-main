// import { Injectable, PipeTransform } from '@angular/core';
// import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

// import { TenantModel } from '../models/tenant.model';
// import { DecimalPipe } from '@angular/common';
// import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
// import { SortColumn, SortDirection } from '../directives/tenant-sortable.directive';

// import { BaseService } from 'src/app/shared/base/service.endpoint';

// interface SearchResult {
//     tenants: TenantModel[];
//     total: number;
// }

// interface State {
//     page: number;
//     pageSize: number;
//     searchTerm: string;
//     // sortColumn: SortColumn;
//     // sortDirection: SortDirection;
//     startIndex: number;
//     endIndex: number;
//     totalRecords: number;
// }

// // const compare = (v1: string | number | boolean, v2: string | number | boolean) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

// // function sort(tenants: TenantModel[], column: SortColumn, direction: string): TenantModel[] {
// //     if (direction === '' || column === '') {
// //         return tenants;
// //     } else {
// //         return [...tenants].sort((a, b) => {
// //             const res = compare(a[column], b[column]);
// //             return direction === 'asc' ? res : -res;
// //         });
// //     }
// // }

// function matches(tenant: TenantModel, term: string, pipe: PipeTransform) {
//     return tenant.identifier.toLowerCase().includes(term.toLowerCase());
// }

// @Injectable({ providedIn: 'root' })
// export class TenantService extends BaseService {
//     private _tenants: TenantModel[] = [];
//     private _loading$ = new BehaviorSubject<boolean>(true);
//     private _search$ = new Subject<void>();
//     private _tenants$ = new BehaviorSubject<TenantModel[]>([]);
//     private _total$ = new BehaviorSubject<number>(0);

//     private _state: State = {
//         page: 1,
//         pageSize: 5,
//         searchTerm: '',
//         // sortColumn: '',
//         // sortDirection: '',
//         startIndex: 0,
//         endIndex: 4,
//         totalRecords: 0
//     };

//     constructor(
//         private pipe: DecimalPipe) {
//         super();
//         this._search$.pipe(
//             tap(() => this._loading$.next(true)),
//             debounceTime(200),
//             switchMap(() => this._search()),
//             delay(200),
//             tap(() => this._loading$.next(false))
//         ).subscribe(result => {
//             this._tenants$.next(result.tenants);
//             this._total$.next(result.total);
//         });

//         this._search$.next();
//     }

//     set tenants(tenants: TenantModel[]) {
//         this. _tenants = tenants;
//     }

//     addTenant(identifier: string, name: string) {
//         const tenant: TenantModel = 
//         { id:"", identifier: identifier, name: name, status: true };
//         this. _tenants.push(tenant);

//         setTimeout(() => {
//             this.page = this.totalPages
//         }, 500);
//     }

//     updateTenant(identifier: string, name: string) {
//         let tenant = this. _tenants.find(t => t.identifier == identifier);
//         if(tenant){
//             tenant.name = name;
//         }
//     }

//     deleteTenant(identifier: string) {
//         this. _tenants = this. _tenants.filter(t => t.identifier != identifier);
//     }

//     get tenants$() { return this._tenants$.asObservable(); }
//     get total$() { return this._total$.asObservable(); }
//     get loading$() { return this._loading$.asObservable(); }
//     get page() { return this._state.page; }
//     get pageSize() { return this._state.pageSize; }
//     get searchTerm() { return this._state.searchTerm; }
//     get startIndex() { return this._state.startIndex; }
//     get endIndex() { return this._state.endIndex; }
//     get totalRecords() { return this._state.totalRecords; }
//     get totalPages() { return Math.ceil(this._state.totalRecords / this._state.pageSize); }

//     set page(page: number) { this._set({ page }); }
//     set pageSize(pageSize: number) { this._set({ pageSize }); }
//     set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
//     //set sortColumn(sortColumn: SortColumn) { this._set({ sortColumn }); }
//     //set sortDirection(sortDirection: SortDirection) { this._set({ sortDirection }); }
//     set startIndex(startIndex: number) { this._set({ startIndex }); }
//     set endIndex(endIndex: number) { this._set({ endIndex }); }
//     set totalRecords(totalRecords: number) { this._set({ totalRecords }); }

//     private _set(patch: Partial<State>) {
//         Object.assign(this._state, patch);
//         this._search$.next();
//     }

//     private _search(): Observable<SearchResult> {
//         //const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

//         // 1. sort
//         let tenants = this.tenants; // sort(this._tenants, sortColumn, sortDirection);

//         // 2. filter
//         tenants = tenants.filter(tenant => matches(tenant, this.searchTerm, this.pipe));
//         const total = tenants.length;

//         // 3. paginate
//         this.totalRecords = tenants.length;
//         this._state.startIndex = (this.page - 1) * this.pageSize + 1;
//         this._state.endIndex = (this.page - 1) * this.pageSize + this.pageSize;
//         if (this.endIndex > this.totalRecords) {
//             this.endIndex = this.totalRecords;
//         }
//         tenants = tenants.slice(this._state.startIndex - 1, this._state.endIndex);
//         return of({ tenants, total });
//     }
// }