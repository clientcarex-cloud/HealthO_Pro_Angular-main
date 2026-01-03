import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { CKEditorModule } from 'ckeditor4-angular';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AnalyticsComponent } from './component/analytics/analytics.component';
import { AnayticRoutingModule } from './analytic-routing.module';
import { DoctorModule } from '../doctor/doctor.module';
import { MainComponentComponent } from './component/main-component/main-component.component';
import { UserCollectionComponent } from './component/user-collection/user-collection.component';
import { MarketingExecutiveModule } from '../marketexecutive/marketexecutive.module';
import { TestWiseComponent } from './component/test-wise/test-wise.component';


@NgModule({
  declarations: [   
    AnalyticsComponent,
    MainComponentComponent,
    UserCollectionComponent,
    TestWiseComponent
  ],
  imports: [
    AnayticRoutingModule,
    SharedModule,
    NgbModalModule,
    CKEditorModule,
    DoctorModule,
    MarketingExecutiveModule
  ],
  providers: [
    
  ]
})

export class AnalyticModule { }