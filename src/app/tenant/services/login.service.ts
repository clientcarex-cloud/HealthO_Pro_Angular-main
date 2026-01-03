import { BehaviorSubject, Observable, of } from 'rxjs';
import { SearchResult } from 'src/app/shared/base/base.search.result';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { LoginModel } from '../models/login.model';

export class LoginService extends BaseSearchService {
    private _logins: LoginModel[] = [];
    private _logins$ = new BehaviorSubject<LoginModel[]>([]);

    constructor() {
        super();
    }

    set logins(logins: LoginModel[]) {
        this._logins = logins;
    }

    override loadData(result: SearchResult) {
        this._logins$.next(result.data);
        this._total$.next(result.total);
    }

    serviceDestroy() {
    }

    get logins$() { return this._logins$.asObservable(); }
    get total$() { return this._total$.asObservable(); }
    get loading$() { return this._loading$.asObservable(); }

    override _search(): Observable<SearchResult> {
        let logins = this._logins;

        // filter
        logins = logins?.filter(o => this.matches(o, this.searchTerm));
        const total = logins?.length;

        // paginate
        logins = this.getPaginatedData(logins);
        return of({ data: logins, total });
    }

    private matches(login: LoginModel, term: string) {
        return login.userName.toLowerCase().includes(term.toLowerCase());
    }

    /**
   * add/update/delete
   */
    addLogin(model: LoginModel) {
        model.userName = model?.userName?.toUpperCase();
        this._logins.push(model);
        this.goToLastPage();
    }

    updateLogin(model: LoginModel) {
        let login = this._logins.find(o => o.userName == model.userName);
        if (login) {
            login.userName = model.userName;
            login.userPwd = model.userPwd;
            login.branchId = model.branchId;
            login.dbName = model.dbName;
            login.mobileNo = model.mobileNo;
            login.sendSMS = model.sendSMS;            
        }
    }

    deleteLogin(userName: string) {
        this._logins = this._logins.filter(o => o.userName != userName);
    }
}