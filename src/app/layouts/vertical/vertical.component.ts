import { Component, HostListener, Injector, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TopbarEndPoint } from '../endpoints/topbar.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-vertical',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.scss']
})

export class VerticalComponent extends BaseComponent<any> {

 
  constructor(
    injector: Injector,
    private router: Router,
    private route: ActivatedRoute,
    private endPoint: TopbarEndPoint,
    public timeSrvc: TimeConversionService,
    private cookieSrvc: CookieStorageService
  ) {
    super(injector);
  }


  isCondensed = false;
  isComponentVisible:any = true ;
  isSubscribeRoute = false;
  invoiceDetails: any;
  isExpired: boolean = false;

  // @HostListener('window:beforeunload', ['$event'])
  // beforeUnloadHandler(event: Event) {
  //   sessionStorage.setItem('isReloading', 'true');
  // }
  
  // @HostListener('window:load', ['$event'])
  // loadHandler(event: Event) {
  //   sessionStorage.removeItem('isReloading');
  // }

  // @HostListener('window:beforeunload', ['$event'])
  // unloadHandler(event: Event) {
  //   const numberOfTabs = localStorage.getItem('numberOfTabs');
  //   if (numberOfTabs) {
  //     const newNumberOfTabs = parseInt(numberOfTabs, 10) - 1;
  //     localStorage.setItem('numberOfTabs', newNumberOfTabs.toString());
  //     if (newNumberOfTabs === 0) {
  //       this.cookieSrvc.clearCookieData();
  //       localStorage.setItem('logout', Date.now().toString());
  //     }
  //   }
  // }

  // storageEventListener(event: StorageEvent) {
  //   if (event.key === 'logout') {
  //     this.cookieSrvc.clearCookieData();
  //     localStorage.setItem('logout', Date.now().toString());
  //   }
  // }

  override ngOnDestroy() {
    // window.removeEventListener('storage', this.storageEventListener.bind(this));


    // const numberOfTabs = localStorage.getItem('numberOfTabs');
    // if (numberOfTabs) {
    //   const newNumberOfTabs = parseInt(numberOfTabs, 10) - 1;
    //   localStorage.setItem('numberOfTabs', newNumberOfTabs.toString());
    // }
  
    // window.removeEventListener('storage', this.storageEventListener.bind(this));
  }


  override ngOnInit(): void {


    // window.addEventListener('storage', this.storageEventListener.bind(this));


    // const numberOfTabs = localStorage.getItem('numberOfTabs');
    // const newNumberOfTabs = numberOfTabs ? parseInt(numberOfTabs, 10) + 1 : 1;
    // localStorage.setItem('numberOfTabs', newNumberOfTabs.toString());
  
    // window.addEventListener('storage', this.storageEventListener.bind(this));
    
    if(!this.cookieSrvc.is_sa_login()){
      this.subsink.sink = this.endPoint.getBusinessSubscriptionPlanPurchase(1).subscribe((res: any) => {
        this.invoiceDetails = res.results[0];
        this.isExpired = this.hasCrossedSpecifiedDateTime(res.results[0].subscription_status.account_locks_on) || !this.invoiceDetails.subscription_status.is_subscription_active;
      })
    }

    // Subscribe to router events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if(this.router.url == "/subscribe"){
        this.isSubscribeRoute = true
      }else{
        this.isSubscribeRoute = false
      }
      
    });

    document.documentElement.setAttribute('data-layout', 'vertical');
    document.documentElement.setAttribute('data-topbar', 'light');
    document.documentElement.setAttribute('data-sidebar', 'light');
    document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    document.documentElement.setAttribute('data-layout-style', 'default');
    document.documentElement.setAttribute('data-layout-mode', 'light');
    document.documentElement.setAttribute('data-layout-width', 'fluid');
    document.documentElement.setAttribute('data-layout-position', 'fixed');
    window.addEventListener('resize', function () {
      if (window.screen.width <= 767) {
        document.documentElement.setAttribute('data-sidebar-size', '');
      }
      else if (window.screen.width <= 1024) {
        document.documentElement.setAttribute('data-sidebar-size', 'sm');
      }
      else if (window.screen.width >= 1024) {
        document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
      }
    });
  }

  loadPage(){
    this.isComponentVisible = false;
    setTimeout(() => {
      this.isComponentVisible = true;
    }, 0); // Toggle the value immediately or with a timeout
  }

  hasCrossedSpecifiedDateTime(specifiedTimestamp: string): boolean {
    const specifiedDate = new Date(specifiedTimestamp);
    const currentDate = new Date();
    return currentDate.getTime() > specifiedDate.getTime();
  }

  /**
   * On mobile toggle button clicked
   */
  onToggleMobileMenu() {
    document.body.classList.toggle('sidebar-enable');
    const currentSIdebarSize = document.documentElement.getAttribute("data-sidebar-size");
    if (window.screen.width >= 992) {
      if (currentSIdebarSize == null) {
        (document.documentElement.getAttribute('data-sidebar-size') == null || document.documentElement.getAttribute('data-sidebar-size') == "lg") ? document.documentElement.setAttribute('data-sidebar-size', 'sm') : document.documentElement.setAttribute('data-sidebar-size', 'lg')
      } else if (currentSIdebarSize == "md") {
        (document.documentElement.getAttribute('data-sidebar-size') == "md") ? document.documentElement.setAttribute('data-sidebar-size', 'sm') : document.documentElement.setAttribute('data-sidebar-size', 'md')
      } else {
        (document.documentElement.getAttribute('data-sidebar-size') == "sm") ? document.documentElement.setAttribute('data-sidebar-size', 'lg') : document.documentElement.setAttribute('data-sidebar-size', 'sm')
      }
    }
    this.isCondensed = !this.isCondensed;
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    document.body.classList.toggle('right-bar-enabled');
    const rightBar = document.getElementById('theme-settings-offcanvas');
    if (rightBar != null) {
      rightBar.classList.toggle('show');
      rightBar.setAttribute('style', "visibility: visible;");
    }
  }
}
