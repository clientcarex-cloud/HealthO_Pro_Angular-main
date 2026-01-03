import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { SetupRoutingModule } from './setup-routing.module';
import { TweaksComponent } from './components/tweaks/tweaks.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SetupComponent } from './components/setup/setup.component';
import { MasterrrComponent } from './components/masterrr/masterrr.component';
import { MainComponent } from './components/main/main.component';
import { GlobalTestsComponent } from './components/masterrr/global-tests/global-tests.component';
import { DiscountTypeComponent } from './components/masterrr/discount-type/discount-type.component';
import { DepartmentTypeComponent } from './components/masterrr/department-type/department-type.component';
import { StaffRoleComponent } from './components/tweaks/staff-role/staff-role.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CKEditorModule } from 'ckeditor4-angular';
import { PrintTemplatesComponent } from './components/masterrr/print-templates/print-templates.component';
import { EditorComponent } from '@sharedcommon/components/editor/editor.component';
import { BusinessPermissionsComponent } from './components/tweaks/business-permissions/business-permissions.component';
import { LetterheadSettingComponent } from './components/tweaks/letterhead-setting/letterhead-setting.component';
import { ImportDataComponent } from './components/tweaks/import-data/import-data.component';
import { NgxEditorModule } from 'ngx-editor';
import { BusinessSettingComponent } from './components/masterrr/business-setting/business-setting.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { TestFontSizesComponent } from './components/tweaks/test-font-sizes/test-font-sizes.component';

@NgModule({
  declarations: [   
    TweaksComponent, 
    SetupComponent, 
    MasterrrComponent, 
    BusinessPermissionsComponent,
    MainComponent, 
    GlobalTestsComponent, 
    DiscountTypeComponent, 
    DepartmentTypeComponent, 
    StaffRoleComponent, 
    PrintTemplatesComponent,
    LetterheadSettingComponent,
    ImportDataComponent,
    BusinessSettingComponent,
    TestFontSizesComponent
  ],
  imports: [
    SetupRoutingModule,
    SharedModule,
    NgbNavModule,
    DragDropModule,
    EditorComponent,
    CKEditorModule ,
    NgxEditorModule,
    AutocompleteLibModule
  ],
  exports: [ 
    SetupComponent, 
    GlobalTestsComponent, 
    BusinessSettingComponent,
    DepartmentTypeComponent,
    LetterheadSettingComponent,
    PrintTemplatesComponent,
    DiscountTypeComponent,
    StaffRoleComponent
  ],
  providers: [
  ]
})

export class SetupModule { }