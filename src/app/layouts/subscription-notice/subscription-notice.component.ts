import { Component, Injector, Input, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TopbarEndPoint } from '../endpoints/topbar.endpoint';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-subscription-notice',
  templateUrl: './subscription-notice.component.html',
  styleUrls: ['./subscription-notice.component.scss']
})

export class SubscriptionNoticeComponent extends BaseComponent<any> {

  constructor(
    private router: Router,
    private endPoint: TopbarEndPoint,
    public timeSrvc: TimeConversionService,
    private cookieSrvc: CookieStorageService,
    injector: Injector
  ) { super(injector) }

  @Input() show: boolean = false;
  trail: boolean = false;
  expired: boolean = true;
  daysString: any = '';
  validityExpired: boolean = false;
  subData: any;

  override ngOnInit(): void {

    if (!this.cookieSrvc.is_sa_login()) {
      if (window.location.pathname == '/subscribe') {

      } else {

        this.subsink.sink = this.endPoint.getBusinessSubscriptionPlanPurchase(1).subscribe((res: any) => {
          if (res.results[0].plan_name == "HealthOPro - Trail Subscription") {
            this.trail = true;
            // this.show = true 
            this.subData = res.results[0].subscription_status.validity
            this.expired = this.timeSrvc.hasThreeDaysGap(this.timeSrvc.djangoFormatWithT(), res.results[0].subscription_status.validity).bool
            this.daysString = this.timeSrvc.hasThreeDaysGap(this.timeSrvc.djangoFormatWithT(), res.results[0].subscription_status.validity).value
            this.validityExpired = this.timeSrvc.hasCrossedSpecifiedDateTime(res.results[0].subscription_status.validity)
  
          } else {
            this.show = false;
          }
        })
      }
    }

    // Subscribe to router events
    // this.router.events.pipe(
    //   filter(event => event instanceof NavigationEnd)
    // ).subscribe((event: any) => {

    //   // this.show = this.router.url == "/subscribe"
    //   // this.show = true
    //   // Your existing code to check the URL
    // });

    
  }

}
