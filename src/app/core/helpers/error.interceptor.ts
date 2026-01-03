import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take, } from 'rxjs/operators';
import { AppAuthService } from '../services/appauth.service';
import { Router } from '@angular/router';
import { AlertService } from '@sharedcommon/service/alert.service';
import { CookieStorageService } from '../services/cookie-storage.service';

@Injectable()

export class ErrorInterceptor implements HttpInterceptor {

    private isRefreshingToken: boolean = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        private authService: AppAuthService,
        private router: Router, 
        private alertSrvc: AlertService,
        private cookieSrvc: CookieStorageService
        ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(catchError(err => {
           
            if (err.status === 401 && !request.url.includes('token/refresh')) {
                return this.handle401Error(request, next);
            } else if (err.status === 403) {
                return this.handle403Error(request, next);
            }else if (err.status === 401 && !request.url.includes('token/refresh')) {
                return this.handle401Error(request, next);
            } else if (err.status === 404) {
                // this.authService.show404StatuseMessage();
            } else if (err && [400].includes(err.status)) {
                console.log("Refresh token expired too.");
                // this.logout(); // or handle the expired token as needed
            }else if (err && [503].includes(err.status)) {
                this.alertSrvc.showError("Application Error");
                this.logout();
            }
     
            return throwError(err);
        }));
    }

    private handle403Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshingToken) {
            this.isRefreshingToken = true;
            this.refreshTokenSubject.next(null);
    
            return this.authService.refreshLabSpark_token().pipe(
                switchMap((response: any) => {
                    this.isRefreshingToken = false;
                    this.refreshTokenSubject.next(response.access);
                    return next.handle(this.addToken(request, response.access));
                }),
                catchError((err) => {
                    this.isRefreshingToken = false;
                    this.logout();
                    // Handle the error here, for example, by logging out the user
                    // or redirecting to the login page
                    console.error('Token refresh failed:', err);
                    return throwError(err);
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap((token) => {
                    return next.handle(this.addToken(request, token));
                })
            );
        }
    }
    
    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshingToken) {
            this.isRefreshingToken = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshLabSpark_token().pipe(
                switchMap((response: any) => {
                    this.isRefreshingToken = false;
                    this.refreshTokenSubject.next(response.access);

                    return next.handle(this.addToken(request, response.access));
                }),
                catchError((err) => {
                    this.isRefreshingToken = false;
                    return throwError(err);
                })
            );
        } else {

            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap((token) => {
                    return next.handle(this.addToken(request, token));
                })
            );
        }
    }
    

    private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    private logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/signin']);
    }
}
