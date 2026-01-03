import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { LabtechnicianComponent } from './components/labtechnician/labtechnician.component';
import { LabtechnicianRoutingModule } from './labtechnician-routing.module';
import { CKEditorModule } from 'ckeditor4-angular';
import { PatientTitleComponent } from './components/patient-title/patient-title.component';
import { MultiPrintComponent } from './components/multi-print/multi-print.component';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import { FixedReportingComponent } from './components/fixed-reporting/fixed-reporting.component';

@NgModule({
  declarations: [   
    LabtechnicianComponent,
    MultiPrintComponent,
    FixedReportingComponent
  ],
  imports: [
    CdkDrag,
    DragDropModule,
    LabtechnicianRoutingModule,
    SharedModule,
    CKEditorModule,
    PatientTitleComponent
  ],
  exports:[
    MultiPrintComponent,
    FixedReportingComponent,
    LabtechnicianComponent
  ],
  providers: [
    
  ]
})

export class LabtechnicianModule { }