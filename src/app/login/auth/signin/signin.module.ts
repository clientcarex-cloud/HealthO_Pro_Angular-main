import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@sharedcommon/shared.module';
import { SigninRoutingModule } from './signin-routing.module';
import { BasicComponent } from './basic/basic.component';
import { CoverComponent } from './cover/cover.component';
import { CarouselComponent } from '../carousel/carousel.component'; // Import CarouselComponent from its correct path
import { DwnldComponent } from '../dwnld/dwnld.component';
import { AuthFooterComponent } from '../auth-footer/auth-footer.component';
import { ForgotPasswordComponent } from 'src/app/layouts/forgot-password/forgot-password.component';
import { SuperloginComponent } from '../superlogin/superlogin.component';
import { NgOtpInputModule } from 'ng-otp-input';
// import { LoadingComponent } from '../loading/loading.component';

@NgModule({
  declarations: [
    BasicComponent,
    CoverComponent,
    CarouselComponent,
    DwnldComponent,
    AuthFooterComponent,
    SuperloginComponent,
  ],
  imports: [
    CommonModule,
    NgbCarouselModule,
    ReactiveFormsModule,
    FormsModule,
    SigninRoutingModule,
    SharedModule,
    ForgotPasswordComponent,
    NgOtpInputModule,
  ],
  exports: [CarouselComponent, DwnldComponent, AuthFooterComponent], // Export CarouselComponent for use in other modules
})
export class SigninModule { }
