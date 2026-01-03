import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { User } from '../models/auth.models';
import { environment } from '../../../environments/environment';
import { AlertService } from 'src/app/shared/service/alert.service';
import { Router } from '@angular/router';
import { CookieStorageService } from './cookie-storage.service';
import { CookieService } from 'ngx-cookie-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({ providedIn: 'root' })
export class AppAuthService {

  private currentUserSubject: BehaviorSubject<User>;
  private refreshingTokenSubject: BehaviorSubject<boolean>;


  constructor(
    private http: HttpClient,
    private router: Router,
    private alertSrvc: AlertService,
    private Cookie: CookieService,
    private modelService: NgbModal,
    private CookieSrvc: CookieStorageService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')!));
    this.refreshingTokenSubject = new BehaviorSubject<boolean>(false);

    if (this.CookieSrvc.getCookieData().refresh) {
      this.startTokenRefresh();
    }

  }

  private startTokenRefresh(): void {
    interval(3 * 60 * 1000) // 3 minutes interval
      .pipe(
        switchMap(() => this.refreshLabSpark_token()),
        catchError(err => {
          // console.error('Error occurred while refreshing token:', err);
          return throwError(err); // Re-throw error to stop interval in case of error
        })
      )
      .subscribe();
  }


  /**
   * current user
   */
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   * setUser
   */

  setUser(model: any) {
    this.currentUserSubject.next(model);
  }

  /**
   * current refreshing token
   */
  public get currentRefreshingTokenValue(): boolean {
    return this.refreshingTokenSubject.value;
  }

  /**
   * show 404 message
   */
  show404StatuseMessage() {
    this.alertSrvc.showWarning("Failed to perform the action, please try again.")
  }


  getTokens(): any {
    return ""
  }

  //REGISTER USER REQUESTS ENDS

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  createUser(userDetails: any): Observable<any> {
    return this.http.post<any>(`${environment.basePath}/user/create/`, userDetails, this.httpOptions)
      .pipe(map(res => {
        this.alertSrvc.showSuccess("OTP Sent Successfull", "")
      }))
  }

  resendOTP(phoneNumber: any): Observable<any> {
    return this.http.post<any>(`${environment.basePath}/user/resend-otp/`, { phone_number: phoneNumber }, this.httpOptions);
  }

  CreaterUserOTP_validate(verificationDetails: any): Observable<any> {
    return this.http.post<any>(`${environment.basePath}/user/otp-login/`, verificationDetails, this.httpOptions)
      .pipe(map(user => {
        this.alertSrvc.showSuccess("Now try sign in", "User Created Successfully");
      }))
  }

  // USER LOGIN FUNCTIONS 
  loginUser(userDetails: any) {
    return this.http.post<any>(`${environment.basePath}/user/login/`, userDetails);
  }

  num: any = "";

  getAccess(): any {
    const access = this.CookieSrvc.getAccess();
    return access;
  }


  validateOTP(otpDetails: any) {
    this.num = otpDetails.phone_number;
    return this.http.post<any>(`${environment.basePath}/user/otp-login/`, otpDetails)
  }

  refreshLabSpark_token(): Observable<User> {
    this.refreshingTokenSubject.next(true);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<User>(`${environment.basePath}/user/token/refresh/`, { refresh: this.CookieSrvc.getRefresh() }, { headers })
      .pipe(map(user => {
        if (user && user.access) {
          this.CookieSrvc.setAccessToken(user.access);
        }
        this.refreshingTokenSubject.next(false);
        return user;
      }), catchError(err => {
        this.refreshingTokenSubject.next(false);
        return throwError(err);
      }));
  }



  /**
   * Logout the user
   */
  logout() {
    // remove user from local storage to log user out
    this.modelService.dismissAll();
    this.CookieSrvc.clearCookieData();
    this.currentUserSubject.next(null!);
    this.router.navigate(['/auth/signin'])

  }



  //HEALTHO GET METHODS

  getUserTypeDatas(): Observable<any> {
    return this.http.get<any>(`${environment.basePath}/user/usertypes/`);
  }


  getRefferalDoctorData(): Observable<any> {
    return this.http.get<any>(`${environment.basePath}/lab/search_doctors/`);
  }

  getTestDetails(): Observable<any> {
    return this.http.get<any>(`${environment.basePath}/lab/lab_global_tests/`);
  }

  getPatients(): Observable<any> {
    return this.http.get<any>(`${environment.basePath}/lab/patients/`);
  }


  getSliders() {
    return this.http.get<any>(`${environment.basePath}/user/login_sliders/`);
  }

}
