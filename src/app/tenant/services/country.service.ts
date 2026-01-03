import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { CountryModel } from '../models/country.model';
import { SearchResult } from 'src/app/shared/base/base.search.result';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';

@Injectable({ providedIn: 'root' })
export class CountryService extends BaseSearchService {
    private _countries: CountryModel[] = [];
    private _countries$ = new BehaviorSubject<CountryModel[]>([]);

    constructor() {
        super();
    }

    set countries(countries: CountryModel[]) {
        this._countries = countries;
    }

    override loadData(result: SearchResult) {
        this._countries$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get countries$() { return this._countries$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let countries = this._countries;

        // filter
        countries = countries?.filter(o => this.matches(o, this.searchTerm));
        const total = countries?.length;

        // paginate
        countries = this.getPaginatedData(countries);
        return of({ data: countries, total });
    }

    private matches(country: CountryModel, term: string) {
        return country.name.toLowerCase().includes(term.toLowerCase());
    }

    /**
    * add/update/delete
    */
    addCountry(id: string, name: string) {
        const capsName = name.toUpperCase();
        const country: CountryModel = 
            { id: id, name: capsName, oldName: capsName, status: true, disabled: true };
        this._countries.push(country);
        this.goToLastPage();
    }

    updateCountry(name: string, oldName: string) {
        let country = this._countries.find(c => c.oldName == oldName);
        if (country) {
            const capsName = name.toUpperCase();
            country.name = capsName;
            country.oldName = capsName;
        }
    }

    deleteCountry(name: string) {
        this._countries = this._countries.filter(c => c.name != name);
    }
}