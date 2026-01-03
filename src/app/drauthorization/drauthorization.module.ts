import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { DrauthorizationRoutingModule } from './drauthorization-routing.module';
import { DrauthorizationComponent } from './components/drauthorization/drauthorization.component';
import { CKEditorModule } from 'ckeditor4-angular';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { PatientTitleComponent } from '../labtechnician/components/patient-title/patient-title.component';


@NgModule({
  declarations: [   
    DrauthorizationComponent
  ],
  imports: [
    DrauthorizationRoutingModule,
    SharedModule,
    NgbModalModule,
    CKEditorModule,
    PatientTitleComponent
  ],
  providers: [
    
  ]
})

export class DrauthorizationModule { }