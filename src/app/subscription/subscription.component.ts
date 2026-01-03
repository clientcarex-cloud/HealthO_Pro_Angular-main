import { Component, Injector, OnInit } from '@angular/core';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { SharedModule } from '@sharedcommon/shared.module';
import { TopbarEndPoint } from '../layouts/endpoints/topbar.endpoint';
import { BaseComponent } from '@sharedcommon/base/base.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent extends BaseComponent<any> {


  constructor(
    public timeSrvc: TimeConversionService,
    public endPoint: TopbarEndPoint,
    injector: Injector
  ){ super(injector) }

  purchaseData: any ;
  overviewData:any ;
  invoiceDetails : any;
  showMark: boolean = false;
  invDetails: any ;

  override ngOnInit(): void {
    this.getData();
  }

  getData(){
    this.subsink.sink = this.endPoint.getBusinessPlanCalculation().subscribe((data:any)=>{
      this.invDetails = data
    })

    this.subsink.sink = this.endPoint.getBusinessSubscriptionPlanPurchase('all').subscribe((res: any)=>{
      this.purchaseData = res;
      this.purchaseData.forEach((data: any)=>{
        if(data.is_plan_completed && !data.is_bill_paid && data.plan_name !== 'HealthOPro - Trail Subscription'){
          this.showMark = true;
        }
      })
    })
  }

  formatIndianNumber(number: number): string {
    const formattedNumber = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(number);
    return formattedNumber;
  }
  

  postSUbscription(){
    this.subsink.sink = this.endPoint.postSubscription(this.purchaseData[0].b_id).subscribe((response : any)=>{
      this.alertService.showSuccess("Subscription Successful");
      this.getData();
    }, (error)=>{
      this.alertService.showError("Subscription Failed", error)
    })
  }
  
}
