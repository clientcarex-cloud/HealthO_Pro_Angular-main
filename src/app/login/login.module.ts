import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@sharedcommon/shared.module';
import { LoginRoutingModule } from './login-routing.module';
import { SigninModule } from "./auth/signin/signin.module"; // Import SigninModule
import { SignupComponent } from './auth/signup/signup.component';
import { UserProfileService } from '../core/services/user.service';
import { OtpScreenComponent } from './auth/otp-screen/otp-screen.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { BusinessListComponent } from './auth/business-list/business-list.component';
import { LoadingComponent } from './auth/loading/loading.component';

// import { ForgotPasswordComponent } from '../layouts/forgot-password/forgot-password.component';
// import { LayoutsModule } from '../layouts/layouts.module';


@NgModule({
  declarations: [
    SignupComponent,
    OtpScreenComponent,
    BusinessListComponent,
    LoadingComponent,

  ],
  imports: [
    NgbCarouselModule,
    
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoginRoutingModule,
    SigninModule, // Include SigninModule here
    SharedModule,
    NgOtpInputModule,
  ],
  exports: [
    SigninModule, // Export SigninModule if needed
  ],
  providers: [
    UserProfileService,
  ],
})
export class LoginModule { }
