import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/auth.models';
import { NewUser } from '../models/signup.model';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AlertService } from '@sharedcommon/service/alert.service';


@Injectable({ providedIn: 'root' })
export class UserProfileService {
    constructor(private http: HttpClient, private alertsrvc: AlertService) { }
    /***
     * Get All User
     */
    getAll() {
        return this.http.get<User[]>(`api/users`);
    }

    /***
     * Facked User Register
     */

    register(user: User) {
        return this.http.post(`/users/create`, NewUser);
    }

    private baseUrl = 'https://labspark.azurewebsites.net/user/';
    
    httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      };

    loginUser(userDetails: any): Observable<any> {
      return this.http.post<any>(this.baseUrl + 'login/', userDetails, this.httpOptions)
      .pipe(map(user => {
      }))
    }

    createUser(userDetails: any): Observable<any> {
        return this.http.post<any>(this.baseUrl + 'create/', userDetails, this.httpOptions);
    }

      resendOTP(phoneNumber: string): Observable<any> {
        const requestBody = {
          phone_number: phoneNumber
        };
        return this.http.post<any>(this.baseUrl + 'resend-otp/', requestBody, this.httpOptions);
      }

      confirmOTP(verificationDetails:any): Observable<any>{
        return this.http.post<any>(this.baseUrl + 'otp-login/', verificationDetails, this.httpOptions);
      }
}
