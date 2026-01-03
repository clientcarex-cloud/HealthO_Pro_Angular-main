import { NgModule } from '@angular/core';

// // Swiper Slider
// import { SwiperModule } from 'ngx-swiper-wrapper';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';

import { TenantRoutingModule } from './tenants-routing.module';
import { SharedModule } from "../shared/shared.module";
import { TenantComponent } from './components/tenant/tenant.component';

import { CountryComponent } from './components/country/country.component';
import { StateComponent } from './components/state/state.component';
import { CityComponent } from './components/city/city.component';
import { BranchComponent } from './components/branch/branch.component';
import { LoginsComponent } from './components/logins/login.component';
import { ConfigComponent } from './components/config/config.component';
import { SMSConfigComponent } from './components/smsconfig/smsconfig.component';

import { RenewalComponent } from './components/renewal/renewal.component';
import { WAPConfigComponent } from './components/wapconfig/wapconfig.component';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto'
};

@NgModule({
  declarations: [   
    TenantComponent,
    CountryComponent,
    StateComponent,
    CityComponent,
    BranchComponent,
    LoginsComponent,
    ConfigComponent,
    SMSConfigComponent,
    RenewalComponent,
    WAPConfigComponent,
  ],
  imports: [
    TenantRoutingModule,
    SharedModule,
  ],
  providers: [
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    }
  ]
})

export class TenantModule { }