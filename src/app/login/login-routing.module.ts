import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { OtpScreenComponent } from './auth/otp-screen/otp-screen.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { LoginAuthGuard } from './login-auth.guard';
import { BusinessListComponent } from './auth/business-list/business-list.component';

const routes: Routes = [
  {
    path: 'signin', loadChildren: () => import('./auth/signin/signin.module').then(m => m.SigninModule),
    canActivate: [LoginAuthGuard],
  },
  {
    path: 'signup', component: SignupComponent,
    canActivate: [LoginAuthGuard],
  },
  {
    path: 'otp',
    canActivate: [LoginAuthGuard],
    children: [
      { path: '', redirectTo: 'verify', pathMatch: 'full' },
      { path: 'verify', component: OtpScreenComponent, canActivate: [LoginAuthGuard] },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
