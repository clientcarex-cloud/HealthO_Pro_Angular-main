import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule, NgbPaginationModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbNavModule, NgbAccordionModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { NgxEditorModule } from 'ngx-editor';
// Swiper Slider
// import { SwiperModule } from 'ngx-swiper-wrapper';
// import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
// import { SwiperConfigInterface } from 'ngx-swiper-wrapper';

import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ScrollspyDirective } from './scrollspy.directive';

import { AppPagination } from './components/pagination/pagination.component';
import { AutoFocusDirective } from './directives/autofocus.directive';
import { AllowNumbersOnlyDirective } from './directives/numbersonly.directive';
import { AllowLettersOnlyDirective } from './directives/lettersonly.directive';
import { AppPositionDirective } from './directives/position.directive';
import { NgbdSortableHeader } from './directives/sortable.directive';
import { PanelComponent } from './components/panel-component/panel.component';
import { NewModelComponent } from './components/newmodel-component/newmodel.component';
import { PagerComponent } from './components/pager-component/pager.component';
import { DataTableComponent } from './components/datatable-component/datatable.component';
import { TabContentComponent } from './components/tab-item-component/tab-item.component';
import { TabsComponent } from './components/tab-component/tab.component';
import { SettingsButtonComponent } from './components/settings-btn-component/settings-btn.component';
import { SubmitButtonComponent } from './components/submit-btn-component/submit-btn.component';
import { DeleteButtonComponent } from './components/delete-btn-component/delete-btn.component';
import { EditButtonComponent } from './components/edit-btn-component/edit-btn.component';
import { AddNewButtonComponent } from './components/addnew-btn-component/addnew-btn.component';
import { SearchBoxComponent } from './components/searchbox-component/searchbox.component';
import { MasterComponent } from './components/master-component/master.component';
import { AppDatePickerComponent } from './components/datepicker-component/app-datepicker.component';
import { AppCheckboxComponent } from './components/checkbox-component/app-checkbox.component';
import { AppSelectComponent } from './components/select-component/app-select.component';
import { AppInputComponent } from './components/input-component/app-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { FileuploadComponentComponent } from './components/fileupload-component/fileupload-component.component';
import { GmapComponent } from './components/gmap/gmap.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { InterNavComponent } from './components/pageInter-nav/inter-nav.component';
import { ExportBtnComponent } from './components/export-btn/export-btn.component';
import { PrintBtnComponent } from './components/print-btn-component/print-btn.component';
import { DisplayDataComponent } from './components/display-data/display-data.component';
import { TextareaComponent } from './components/textarea/textarea.component';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { RadioComponent } from './components/radio/radio.component';
import { InfoBtnComponent } from './components/info-btn/info-btn.component';
import { ReceiveBtnComponent } from './components/receive-btn/receive-btn.component';
// import { BtnComponent } from './components/btn/btn.component';
import { DraftreportComponent } from './components/draftreport/draftreport.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { SelectPrintComponent } from './components/select-print/select-print.component';
import { LayoutComponent } from './components/layout/layout.component';
// import { ButtonsCheckboxComponent } from './components/buttons-checkbox/buttons-checkbox.component';
import { DecimalPipe } from '@angular/common';
import { AlphabetOnlyDirective } from './directives/alphabet-only.directive';
import { DatepickerSectionComponent } from './components/datepicker-section/datepicker-section.component';
import { NgxSimpleTextEditorModule } from 'ngx-simple-text-editor';
import { SimpleEditorComponent } from './components/simple-editor/simple-editor.component';
import { MiniEditorComponent } from './components/mini-editor/mini-editor.component';
import { TestEditorComponent } from './components/test-editor/test-editor.component';
import { WordEditorComponent } from './components/word-editor/word-editor.component';
import { LoadAnimationComponent } from './components/load-animation/load-animation.component';
import { NumInputComponent } from './components/num-input/num-input.component';
import { TestEditorTestingComponent } from './components/test-editor-testing/test-editor-testing.component';
import { EditorIframeComponent } from './components/editor-iframe/editor-iframe.component';
import { PositionDirective } from './directives/iframe-position.directive';
import { MagnifyComponent } from './components/magnify/magnify.component';
import { WordEditorIframeComponent } from './components/word-editor-iframe/word-editor-iframe.component';
import { JoditAngularModule } from 'jodit-angular';
import { JoditEditorComponent } from './components/jodit-editor/jodit-editor.component';
import { JoditWordEditorComponent } from './components/jodit-word-editor/jodit-word-editor.component';
import { AutoGrowDirective } from './directives/autogrow.directive';
import { TextareaInputComponent } from './components/textarea-input/textarea-input.component';
import { DevRichComponent } from './components/dev-rich/dev-rich.component';
// import { DevRichComponent } from './components/dev-rich/dev-rich.component';
import { DevrichPrinttemplatesComponent } from './components/devrich-printtemplates/devrich-printtemplates.component';
import { InfoDivComponent } from './components/info-div/info-div.component';
import { PatientDetailsComponent } from './components/patient-details/patient-details.component';
import { WebCameraComponent } from './components/webcam/webcam.component';

import {WebcamModule} from 'ngx-webcam';
import { DatemodalComponent } from './components/datemodal/datemodal.component';
import { PatientIdsComponent } from './components/patient-ids/patient-ids.component';
import { SmallTextComponent } from './components/small-text/small-text.component';
import { NomSelectComponent } from './components/nom-select/nom-select.component';
import { ViewImageComponent } from './components/view-image/view-image.component';

// import { TabbedContentComponent } from './components/tabbed-content/tabbed-content.component';

// import { HttpClientModule } from '@angular/common/http';
// const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
//   direction: 'horizontal',
//   slidesPerView: 'auto'
// };

@NgModule({
  declarations: [
   
    
    BreadcrumbsComponent,
    AppPagination,
    AppInputComponent,
    AppSelectComponent,
    AppCheckboxComponent,
    AppDatePickerComponent,
    MasterComponent,
    SearchBoxComponent,
    AddNewButtonComponent,
    EditButtonComponent,
    DeleteButtonComponent,
    SubmitButtonComponent,
    SettingsButtonComponent,
    TabsComponent,
    TabContentComponent,
    DataTableComponent,
    PagerComponent,
    NewModelComponent,
    PanelComponent,
    DatepickerSectionComponent,
    SimpleEditorComponent,
    MiniEditorComponent,
    NumInputComponent,
    // directives
    ScrollspyDirective,
    AutoFocusDirective,
    AutoGrowDirective,
    NgbdSortableHeader,
    AllowNumbersOnlyDirective,
    AllowLettersOnlyDirective,
    AppPositionDirective,
    FileuploadComponentComponent,
    GmapComponent,
    InterNavComponent,
    ExportBtnComponent,
    PrintBtnComponent,
    DisplayDataComponent,
    TextareaComponent,
    PositionDirective,
    LoadAnimationComponent,
    MagnifyComponent,

    TabsComponent,
    RadioComponent,
    InfoBtnComponent,
    ReceiveBtnComponent,
    // BtnComponent,
    DraftreportComponent,
    TopbarComponent,
    SelectPrintComponent,
    LayoutComponent,
    // ButtonsCheckboxComponent,
    AlphabetOnlyDirective,
    TestEditorComponent,

    WordEditorComponent,
    TestEditorTestingComponent,
    EditorIframeComponent,
    WordEditorIframeComponent,
    JoditEditorComponent,
    JoditWordEditorComponent,
    TextareaInputComponent,
    DevRichComponent,
    DevrichPrinttemplatesComponent,
    InfoDivComponent,
    NomSelectComponent,

    PatientDetailsComponent,
    WebCameraComponent,
    DatemodalComponent,
    PatientIdsComponent,
    SmallTextComponent,
    ViewImageComponent
    //  TabbedContentComponent,
    

  ],
  imports: [

    WebcamModule,
    JoditAngularModule,
    NgxSimpleTextEditorModule,

    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbDropdownModule,
    NgSelectModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    LeafletModule,
    NgxEditorModule,
    

    FlatpickrModule.forRoot(),
  ],
  exports: [
    DatemodalComponent,
    WebCameraComponent,
    PatientDetailsComponent,
    InfoDivComponent,
    TextareaInputComponent,
    JoditWordEditorComponent,
    JoditEditorComponent,
    DevRichComponent,
    DevrichPrinttemplatesComponent,
    BreadcrumbsComponent,
    AppPagination,
    AppPagination,
    AppInputComponent,
    AppSelectComponent,
    AppCheckboxComponent,
    AppDatePickerComponent,
    MasterComponent,
    SearchBoxComponent,
    AddNewButtonComponent,
    EditButtonComponent,
    DeleteButtonComponent,
    SubmitButtonComponent,
    SettingsButtonComponent,
    TabsComponent,
    TabContentComponent,
    DataTableComponent,
    PagerComponent,
    NewModelComponent,
    PanelComponent,
    GmapComponent,
    ExportBtnComponent,
    PrintBtnComponent,
    DisplayDataComponent,
    TextareaComponent,
    RadioComponent,
    InfoBtnComponent,
    FileuploadComponentComponent,
    ReceiveBtnComponent,
    // BtnComponent,
    DraftreportComponent,
    SelectPrintComponent,
    LayoutComponent,
    DatepickerSectionComponent,
    SimpleEditorComponent,
    MiniEditorComponent,
    TestEditorComponent,
    WordEditorComponent,
    TestEditorTestingComponent,
    LoadAnimationComponent,
    NumInputComponent,
    EditorIframeComponent,
    MagnifyComponent,
    WordEditorIframeComponent,
    PatientIdsComponent,
    SmallTextComponent,
    NomSelectComponent,
    ViewImageComponent,

    // directives
    ScrollspyDirective,
    AutoFocusDirective,
    NgbdSortableHeader,
    AllowNumbersOnlyDirective,
    AllowLettersOnlyDirective,
    AppPositionDirective,

    // modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbDropdownModule,
    NgSelectModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    FlatpickrModule,

    
  ],
  providers: [NgbNav, DecimalPipe]

})


export class SharedModule {
}
