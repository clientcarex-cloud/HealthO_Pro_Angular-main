import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { debounceTime, delay, switchMap, tap } from "rxjs/operators";
import { SearchResult } from "./base.search.result";
import { State } from "./base.state";
import { SortDirection } from "@sharedcommon/directives/sortable.directive";

export abstract class BaseSearchService {
    protected _loading$ = new BehaviorSubject<boolean>(true);
    protected _search$ = new Subject<void>();
    protected _total$ = new BehaviorSubject<number>(0);

    protected _state: State = {
        page: 1,
        pageSize: 10,
        searchTerm: '',
        startIndex: 0,
        endIndex: 4,
        totalRecords: 0,
        sortColumn: "",
        sortDirection: "",
        startDate: "",
        endDate: ""
    };

    protected loadData(result: SearchResult) {
    }

    protected _search(): Observable<SearchResult> {
        return of({ data: [], total: 0 });
    }

    constructor() {
        this._search$.pipe(
            tap(() => this._loading$.next(true)),
            debounceTime(200),
            switchMap(() => this._search()),
            delay(200),
            tap(() => this._loading$.next(false))
        ).subscribe(result => {
            this.loadData(result);
        });

        this._search$.next();
    }

    /**
    * base service destroy
    */
    baseServiceDestroy() {
        this._search$.unsubscribe();
    }

    protected _set(patch: Partial<State>) {
        Object.assign(this._state, patch);
        this._search$.next();
    }

    /**
    * paignation get methods
    */
    get page() { return this._state.page; }
    get pageSize() { return this._state.pageSize; }
    get searchTerm() { return this._state.searchTerm; }
    get startIndex() { return this._state.startIndex; }
    get endIndex() { return this._state.endIndex; }
    get totalRecords() { return this._state.totalRecords; }
    get totalPages() { return Math.ceil(this._state.totalRecords / this._state.pageSize); }

    /**
    * paignation set methods
    */
    set page(page: number) { this._set({ page }); }
    set pageSize(pageSize: number) { this._set({ pageSize }); }
    set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
    set startIndex(startIndex: number) { this._set({ startIndex }); }
    set endIndex(endIndex: number) { this._set({ endIndex }); }
    set totalRecords(totalRecords: number) { this._set({ totalRecords }); }
    set sortColumn(sortColumn: string) { this._set({ sortColumn });}
    set sortDirection(sortDirection: SortDirection) { this._set({ sortDirection });}


    getPaginatedData(data: any[]): any[] {
        if (!data)
            return [];

        this.totalRecords = data.length;
        this._state.startIndex = (this.page - 1) * this.pageSize + 1;
        this._state.endIndex = (this.page - 1) * this.pageSize + this.pageSize;
        if (this.endIndex > this.totalRecords) {
            this.endIndex = this.totalRecords;
        }

        let paginatedData = data.slice(this._state.startIndex - 1, this._state.endIndex);
        return paginatedData;
    }

    goToLastPage(delay: number = 500): void {
        setTimeout(() => {
            this.page = this.totalPages
        }, delay);
    }

    /**
        Search Term
     */
    onSearchTermUpdate(searchTerm: string): void {
        this.searchTerm = searchTerm;
    }
}