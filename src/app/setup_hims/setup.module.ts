import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CKEditorModule } from 'ckeditor4-angular';
import { EditorComponent } from '@sharedcommon/components/editor/editor.component';
import { NgxEditorModule } from 'ngx-editor';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { MainComponent } from './components/main/main.component';
import { HIMSSetupRoutingModule } from './setup-routing.module';
import { SetupModule } from '../setup/setup.module';
import { HimsmasterComponent } from './components/himsmaster/himsmaster.component';
import { ServicesHimsComponent } from './components/services-hims/services-hims.component';
import { AddServiceComponent } from './components/add-service/add-service.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { AddRoomsComponent } from './components/add-rooms/add-rooms.component';
import { PackagesComponent } from './components/packages/packages.component';
import { AddPackagesComponent } from './components/add-packages/add-packages.component';
import { MedicinesComponent } from './components/medicines/medicines.component';
import { AddMedicineComponent } from './components/add-medicine/add-medicine.component';


@NgModule({
  declarations: [   
    MainComponent,
    HimsmasterComponent,
    ServicesHimsComponent,
    AddServiceComponent,
    RoomsComponent,
    AddRoomsComponent,
    PackagesComponent,
    AddPackagesComponent,
    MedicinesComponent,
    AddMedicineComponent
  ],
  imports: [
    HIMSSetupRoutingModule,
    SharedModule,
    DragDropModule,
    EditorComponent,
    CKEditorModule ,
    NgxEditorModule,
    AutocompleteLibModule,
    SetupModule
  ],
  exports: [ MedicinesComponent, AddMedicineComponent ],
  providers: [
  ]
})

export class HIMSSetupModule { }