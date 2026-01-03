import { Component, Injector, ViewChild, ViewChildren } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ExecutiveVisitsComponent } from '../executive-visits/executive-visits.component';
import { MarketExecutiveEndpoint } from '../../marketexecutive.endpoint';
import { LocationService } from '@sharedcommon/service/location.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
})

export class MainComponent extends BaseComponent<any> {

  constructor(
    injector: Injector, 
    private route: ActivatedRoute,
    private cookieSrvc: CookieStorageService,
    private endPoint: MarketExecutiveEndpoint,
    private locationSrvc: LocationService
  ){ super(injector); }

  @ViewChild('addVisit') addVisit: any ;
  @ViewChild('exeVisits') exeVisits : any ;
  @ViewChild('targetPage') targetPage : any ;

  activeTab: number = 5 ;
  is_sa: boolean = false ;
  title: any = '';
  assign: boolean = false ;
  myLocation: any = null ;

  refDoctor: any ;

  override ngOnInit(): void {
    const cookieData = this.cookieSrvc.getCookieData();
    this.is_sa = cookieData.is_superadmin ;

    if(!this.is_sa){
      this.activeTab = 2;

      // get location object 
      this.subsink.sink = this.endPoint.getStaffLocation(cookieData.lab_staff_id).subscribe((res: any) => {
        this.myLocation = res.length == 1 ? res[0] : null ;
        if(this.myLocation){
          delete this.myLocation.last_seen_on
          this.myLocation.lab_staff = this.myLocation.lab_staff.id ;
          this.updateLocation(); // if object returned update the current location
        }
      })

    }

  }

  override ngAfterViewInit(): void {
    this.route.queryParams.subscribe(params => {
      if(params['d_id']){
        this.refDoctor = +params['d_id'];
        this.activeTab = 2 ;

        this.taskModal(this.addVisit, this.is_sa)
      }
    })
  }

  taskModal(content: any, assign: boolean){
    this.assign = assign ; 
    this.title = assign ? 'Assign Task' : 'Add Visit' ;
    this.openModal(content, { size: 'lg', centered: true}) ;
  }


  updateLocation(){
    if(this.myLocation){
      this.locationSrvc.getLocation().then((location: any)=>{
          this.myLocation.latitude_at_last_seen = location.latitude ;
          this.myLocation.longitude_at_last_seen = location.longitude ;
          
          this.subsink.sink = this.endPoint.updateLocation(this.myLocation).subscribe((res: any)=>{ })
      })
    }
  }

  targetModal(content: any){
    
  }

  exeVisitsGetData(){
    this.exeVisits.getData();
  }

  targetGetData(){
    this.targetPage.getData();
    this.modalService.dismissAll();
  }

}
