import { Component, Injector } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';

@Component({
  selector: 'app-billings',
  templateUrl: `./billings.component.html`,
})

export class BillingsComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    config: NgbDropdownConfig,
    public timeSrvc: TimeConversionService,
    private cookieSrvc: CookieStorageService,
    private signupEndpoint: SignUpEndpoint
  ) {
    super(injector);
    config.autoClose = false;
  }

  healthCareRegistry: any ;

  override ngAfterViewInit(): void { }

  override ngOnInit(): void {
    this.subsink.sink = this.signupEndpoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      this.healthCareRegistry = data[0].provider_type ;
    })

  };


}