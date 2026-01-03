import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { CityModel } from '../models/city.model';

import { SearchResult } from 'src/app/shared/base/base.search.result';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';

@Injectable({ providedIn: 'root' })
export class CityService extends BaseSearchService {
    private _cities: CityModel[] = [];
    private _cities$ = new BehaviorSubject<CityModel[]>([]);

    constructor() {
        super();
    }

    set cities(cities: CityModel[]) {
        this._cities = cities;
    }

    override loadData(result: SearchResult) {
        this._cities$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get cities$() { return this._cities$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let cities = this._cities;

        // filter
        cities = cities?.filter(o => this.matches(o, this.searchTerm));
        const total = cities?.length;

        // paginate
        cities = this.getPaginatedData(cities);
        return of({ data: cities, total });
    }

    private matches(state: CityModel, term: string) {
        return state.name.toLowerCase().includes(term.toLowerCase());
    }

    /**
    * add/update/delete
    */
    addCity(id: string, name: string, state: any) {
        const capsName = name.toUpperCase();
        const obj: CityModel =
        {
            id: id, 
            name: capsName, 
            oldName: capsName,
            state: state, 
            status: true
        };
        this._cities.push(obj);
        this.goToLastPage();
    }

    updateCity(name: string, oldName: string, state: any) {
        let city = this._cities.find(o => o.oldName == oldName);
        if (city) {
            const capsName = name.toUpperCase();
            city.name = capsName;
            city.oldName = capsName;
            city.state = state;
        }
    }

    deleteCity(name: string) {
        this._cities = this._cities.filter(o => o.name != name);
    }
}