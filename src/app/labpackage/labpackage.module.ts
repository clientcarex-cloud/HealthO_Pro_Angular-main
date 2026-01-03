import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { LabpackagesComponent } from './components/labpackages/labpackages.component';
import { LabpackageRoutingModule } from './labpackage-routing.module';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [   
    LabpackagesComponent
  ],
  imports: [
    LabpackageRoutingModule,
    SharedModule,
    AutocompleteLibModule,
    NgbTypeaheadModule
  ],
  providers: [
  ]
})

export class LabpackageModule { }