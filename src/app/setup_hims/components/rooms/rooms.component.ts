import { Component, Injector } from '@angular/core';
import { HIMSSetupEndpoint } from '../services-hims/hmis.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { BaseComponent } from '@sharedcommon/base/base.component';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
})

export class RoomsComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    
    private endPoint: HIMSSetupEndpoint,
    private masterEndpoint: MasterEndpoint,

    private cookieSrvc: CookieStorageService
  ){ super(injector) } ;

  page_size: any = 10 ;
  page_number: number = 1 ;
  count: number = 1 ;
  all_count: number = 0 ;

  query: string = "" ;
  dept: string = "" ;
  date: string = "";
  from_date: string = "";
  to_date: string = "";

  global_rooms: any = [] ;
  departments: any = [] ;
  
  timer: any ;
  selectDept: any = null;

  selected_item : any = null ;

  override ngOnInit(): void {
    // this.getDepartments() ;
    this.getData() ;
  }

  getDepartments(){
    this.subsink.sink = this.masterEndpoint.getDepartments().subscribe((data: any) => {
      this.departments = data.filter((d: any) => d.is_active);
    })
  }
  
  getData() {

    this.subsink.sink = this.endPoint.getRooms(
      this.page_size, this.page_number,
      this.query, this.dept 
    ).subscribe((data: any) => {
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.global_rooms = data.results
    })

  }

  selectDepartment(e: any) {

    if (e && e !== "") {
      this.dept = e.id;
      this.selectDept = e;
      this.getData();
    } else {
      this.dept = "";
      this.selectDept = null;
      this.getData();
    }

  }
  
  searchQuery(e: any) {
    this.query = e;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getData();

    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e: any) {
    this.page_size = e.target.value;
    this.getData()
  }

  onPageChange(e: any) {
    this.page_number = e;
    this.getData();
  }

  getRangeValue(e: any) {
    if (e.length !== 0) {
      if (e.includes("to")) {
        this.separateDates(e);
      } else {
        this.date = e;
        this.from_date = "";
        this.to_date = "";
        this.page_number = 1;
        this.getData();
      }
    }
    else {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getData();
    }
  }

  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.from_date = startDate;
    this.to_date = endDate;
    this.date = "";
    this.page_number = 1;
    this.getData();
  }

  updateIsActive(model: any, val:any){
    model.is_active = val ; 
    model.department = model?.department?.id;
    this.updateService(model) ;
  }

  updateService(model: any){
    model['last_updated_by'] = this.cookieSrvc.getCookieData()?.lab_staff_id ;
    this.subsink.sink = this.endPoint.updateHIMSService(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.name} updated.`) ;
      this.getData() ;
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error )
    })
  }


  // utilities 

}