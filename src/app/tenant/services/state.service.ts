import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { StateModel } from '../models/state.model';

import { SearchResult } from 'src/app/shared/base/base.search.result';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';

@Injectable({ providedIn: 'root' })
export class StateService extends BaseSearchService {
    private _states: StateModel[] = [];
    private _states$ = new BehaviorSubject<StateModel[]>([]);

    constructor() {
        super();
    }

    set states(states: StateModel[]) {
        this._states = states;
    }

    override loadData(result: SearchResult) {
        this._states$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get states$() { return this._states$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let states = this._states;

        // filter
        states = states?.filter(o => this.matches(o, this.searchTerm));
        const total = states?.length;

        // paginate
        states = this.getPaginatedData(states);
        return of({ data: states, total });
    }

    private matches(state: StateModel, term: string) {
        return state.name.toLowerCase().includes(term.toLowerCase());
    }

    /**
    * add/update/delete
    */
    addState(id: string, name: string, country: any) {
        const capsName = name.toUpperCase();
        const obj: StateModel =
        {
            id: id, name: capsName, oldName: capsName,
            country: country, status: true
        };
        this._states.push(obj);
        this.goToLastPage();
    }

    updateState(name: string, oldName: string, country: any) {
        let state = this._states.find(o => o.oldName == oldName);
        if (state) {
            const capsName = name.toUpperCase();
            state.name = capsName;
            state.oldName = capsName;
            state.country = country;
        }
    }

    deleteState(name: string) {
        this._states = this._states.filter(o => o.name != name);
    }
}