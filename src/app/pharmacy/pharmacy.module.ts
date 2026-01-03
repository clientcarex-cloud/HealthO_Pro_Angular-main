import { NgModule } from '@angular/core';
import { SharedModule } from '@sharedcommon/shared.module';
import { PharmacyRoutingModule } from './pharmacy-routing.module';
import { MainComponent } from './components/main/main.component';
import { SupplierComponent } from './components/supplier/supplier.component';
import { AddSupplierComponent } from './components/add-supplier/add-supplier.component';
import { SupplierDetailsComponent } from './components/supplier-details/supplier-details.component';
import { HIMSSetupModule } from '../setup_hims/setup.module';
import { AddInvoiceComponent } from './components/add-invoice/add-invoice.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { MfgInvoiceComponent } from './components/mfg-invoice/mfg-invoice.component';
import { AddPharmacyPatientBillingComponent } from './components/add-pharmacy-patient-billing/add-pharmacy-patient-billing.component';
import { DoctorModule } from '../doctor/doctor.module';
import { PatientModule } from '../patient/patient.module';
import { StocksComponent } from './components/stocks/stocks.component';
import { PharmacyPatientsComponent } from './components/pharmacy-patients/pharmacy-patients.component';
import { PharmacyStandardViewComponent } from './components/pharmacy-standard-view/pharmacy-standard-view.component';
import { BillingModule } from '../billing/billing.module';

@NgModule({
  declarations: [
    MainComponent,
    SupplierComponent,
    AddSupplierComponent,
    SupplierDetailsComponent,
    AddInvoiceComponent,
    MfgInvoiceComponent,
    AddPharmacyPatientBillingComponent,
    StocksComponent,
    PharmacyPatientsComponent,
    PharmacyStandardViewComponent
  ],
  imports: [
    DoctorModule,
    PatientModule,
    SharedModule,
    PharmacyRoutingModule,
    HIMSSetupModule,
    AutocompleteLibModule,
    BillingModule
    
],
  exports: [
    HIMSSetupModule
  ],
  providers: [
  ]
})

export class PharmacyModule { }