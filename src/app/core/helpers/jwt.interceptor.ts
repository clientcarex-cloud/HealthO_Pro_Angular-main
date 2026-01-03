import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/auth.service';
import { AppAuthService } from '../services/appauth.service';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
import { finalize } from 'rxjs/operators';
import { AlertService } from '@sharedcommon/service/alert.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    totalRequests = 0;
    completedRequests = 0;
    isSpinnerVisible = false;
    constructor(
        private authenticationService: AuthenticationService,
        private authService: AppAuthService,
        private spinner: NgxSpinnerService,
        private alertSrvc: AlertService
    ) { }

    private shouldShowSpinner(request: HttpRequest<any>): boolean {
        // Add logic here to determine if the spinner should be shown for this request
        // For example, check the request URL or any other criteria
        return  request.url.includes('patient_id') || request.url.includes('addpatients') || request.url.includes('title')
        
        // request.url.includes('patients_standard_view') || request.url.includes('consulting') || request.url.includes('referral') ||
        //  request.url.includes('print_patient_receipt') || request.url.includes('print_patient_invoice') ||
        // request.url.includes('print_test_report') ||
        // request.url.includes('manage_payments') || request.url.includes('lab-patient-packages') ||
        // request.url.includes('lab_nabl') || request.url.includes('lab_staff') || request.url.includes('lab_departments') || request.url.includes('dashboard') ||
        // request.url.includes('lab_phlebotomists') || request.url.includes('lab_technicians') || request.url.includes('lab_doctor_authorization') ||
        // request.url.includes('lab_expenses') || request.url.includes('lab_incomes') 
        // || request.url.includes('analytics_referral_doctor_details') || request.url.includes('patient_analytics') || request.url.includes('analytics_top_tests') || request.url.includes('business_status_analytics') ||  request.url.includes('analytics_patient_overview') || request.url.includes('analytics_patient_overview')
    }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
     
        // Check if the request URL matches a specific API
        const shouldShowSpinner = this.shouldShowSpinner(request);

        // if (shouldShowSpinner) {
        //     this.spinner.show();
        // }

        this.totalRequests++;

       
            // add authorization header with jwt token if available
            const currentUser = this.authService.currentUserValue;
            if (currentUser && currentUser.token) {

                if(this.authService.currentRefreshingTokenValue){

                    request = request.clone({
                        setHeaders: {
                            "X-Refresh-Token": `${currentUser.refresh}`,
                        },
                    });
                } else {

                    request = request.clone({
                        setHeaders: {
                            "X-Access-Token": `${currentUser.access}`,
                        },
                    });
                }
            }


        return next.handle(request).pipe(
            finalize(() => {
                this.completedRequests++;
                if (this.completedRequests === this.totalRequests) {
                    this.spinner.hide();
                    this.completedRequests = 0;
                    this.totalRequests = 0;
                }
            })
        );

        
    }
}
