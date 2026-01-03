import { Injectable } from '@angular/core';
// import { getFirebaseBackend } from '../../authUtils';
import { User } from '../models/auth.models';
import { NewUser } from '../models/signup.model';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })

/**
 * Auth-service Component
 */
export class AuthenticationService {

    user!: User;
    currentUserValue: any;

    constructor( private http: HttpClient,) { }

    /**
     * Performs the register
     * @param mobile email
     * @param userType password
     */
    register(mobile: string, userType: string) {
        // return getFirebaseBackend()!.registerUser(email, password).then((response: any) => {
        //     const user = response;
        //     return user;
        // });
    }


    //HealthO

 

      loginUser(userDetails: any): Observable<any> {
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        };

        return this.http.post<any>( environment.basePath + 'login/', userDetails, httpOptions);
      }

    createUser(userDetails: any): Observable<any> {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      };
        return this.http.post<any>( environment.basePath + 'create/', userDetails, httpOptions);
      }

      resendOTP(phoneNumber: string): Observable<any> {
    
        const requestBody = {
          phone_number: phoneNumber
        };

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        };
    
        return this.http.post<any>( environment.basePath + 'resend-otp/', requestBody, httpOptions);
      }

      confirmOTP(verificationDetails:any): Observable<any>{

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          })
        };

        return this.http.post<any>( environment.basePath + 'otp-login/', verificationDetails, httpOptions);
      }

      
    
}

