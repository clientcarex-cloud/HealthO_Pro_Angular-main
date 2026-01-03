import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layouts/layout.component';
import { SubscriptionComponent } from './subscription/subscription.component';
// Auth
import { AuthGuard } from './core/guards/auth.guard';

import { PatientOverviewComponent } from './patient-overview/patient-overview.component';
import { PrintReportComponent } from './print-report/print-report.component';
import { DownloadPatientReceiptComponent } from './download-patient-receipt/download-patient-receipt.component';
import { NoacessComponent } from './noacess/components/noacess.component';
import { TestpageSecondComponent } from './testpage-second/testpage-second.component';
import { SuperAdminAuthGuard } from './core/guards/superadmin.quard';


const routes: Routes = [
  // { path: 'signin', component: CoverComponent },
  {
    path: '',
    redirectTo: 'dashboard', 
    pathMatch: 'full'
  },
  {
    path: '', component: LayoutComponent, children: [
      { path: '', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'patient', loadChildren: () => import('./patient/patient.module').then(m => m.PatientModule) },
      { path: 'phlebotomist', loadChildren: () => import('./Phlebotomist/phlebotomist.module').then(m => m.PhlebotomistModule) },
      { path: 'labtechnican', loadChildren: () => import('./labtechnician/labtechnician.module').then(m => m.LabtechnicianModule) },
      { path: 'drauthorization', loadChildren: () => import('./drauthorization/drauthorization.module').then(m => m.DrauthorizationModule) },
      { path: 'radiology', loadChildren: () => import('./radiology/radiology.module').then(m => m.RadiologyModule) },
      { path: 'analytic', loadChildren: () => import('./analytic/analytic.module').then(m => m.AnalyticModule) },
      { path: 'message', loadChildren: () => import('./message/message.module').then(m => m.MessageModule) },
      { path: 'managepayment', loadChildren: () => import('./managepayment/managepayment.module').then(m => m.ManagepaymentModule) },
      { path: 'doctor', loadChildren: () => import('./doctor/doctor.module').then(m => m.DoctorModule) },
      { path: 'labpackage', loadChildren: () => import('./labpackage/labpackage.module').then(m => m.LabpackageModule) },
      { path: 'nabl', loadChildren: () => import('./nabl/nabl.module').then(m => m.NablModule) },
      { path: 'staff', loadChildren: () => import('./staff/staff.module').then(m => m.StaffModule) },
      { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
      { path: 'setup', loadChildren: () => import('./setup/setup.module').then(m => m.SetupModule) },
      { path: 'himssetup', loadChildren: () => import('./setup_hims/setup.module').then(m => m.HIMSSetupModule) },
      { path: 'referrallab', loadChildren: () => import('./referrallab/referrallab.module').then(m => m.ReferralLabModule) },
      { path: 'inventory', loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule) },
      // { path: 'homeservice', loadChildren: () => import('./homeservice/homeservice.module').then(m => m.HomeserviceModule) },
      { path: 'privilegecard', loadChildren: () => import('./loyaltycard/loyaltycard.module').then(m => m.LoyaltyCardModule) },
      { path: 'medicalfitness', loadChildren: () => import('./medicalfitness/medicalfitness.module').then(m => m.MedicalFitnessModule) },
      { path: 'sourcing', loadChildren: () => import('./outsourcing/outsourcing.module').then(m => m.OutsourcingModule) },
      { path: 'bulkmessaging', loadChildren: () => import('./announcement/announcement.module').then(m => m.AnnouncementModule) },
      { path: 'billing', loadChildren: () => import('./billing/billing.module').then(m => m.BillingModule) },
      { path: 'marketingexecutive', loadChildren: () => import('./marketexecutive/marketexecutive.module').then(m => m.MarketingExecutiveModule) },
      { path: 'prescription', loadChildren: () => import('./prescription/prescription.module').then(m => m.PrescriptionModule) },
      { path: 'pharmacy', loadChildren: () => import('./pharmacy/pharmacy.module').then(m => m.PharmacyModule) },
      { path: 'nursingstation', loadChildren: () => import('./nursingstation/nursingstation.module').then(m => m.NursingStationModule) },
      { path: "subscribe", component: SubscriptionComponent, },

    ],
    canActivate: [AuthGuard]
  },
  { path: 'noaccess', component: NoacessComponent },
  {
    path : 'admin', component : LayoutComponent, children : [
      {path: 'client', loadChildren: () => import('./client/client.module').then(m => m.ClientModule)},
      {path: 'gs', loadChildren: () => import('./globalsetting/globalsetting.module').then(m => m.GlobalSettingModule)},
      {path: 'plans', loadChildren: () => import('./saplans/superadminplans.module').then(m => m.SAPlansModule)}
    ], canActivate: [SuperAdminAuthGuard]
  },
  { path: '', component: LayoutComponent, loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
  { path: 'auth', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
  { path: 'testpage', component: PatientOverviewComponent },
  // { path: 'testpagesecond', component: TestpageSecondComponent },
  { path: 'patient_report', component: PrintReportComponent },
  { path: 'download_patient_receipt', component: DownloadPatientReceiptComponent },
  // { path: 'admin', loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule) },
]


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
