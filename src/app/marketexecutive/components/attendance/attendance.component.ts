import { Component, Injector, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { MarketExecutiveEndpoint } from '../../marketexecutive.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { NgxSpinnerService } from 'ngx-spinner';
import { LocationService } from '@sharedcommon/service/location.service';


@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent extends BaseComponent<any>{


  constructor(
    injector: Injector,

    private staffEndpoint: StaffEndpoint,
    private endPoint: MarketExecutiveEndpoint,
    private proEndPoint: ProEndpoint,

    private cookieSrvc: CookieStorageService,
    public capitalSrvc : CaptilizeService,
    public timeSrvc: TimeConversionService,
    private spinner: NgxSpinnerService,
    private locationSrvc: LocationService,

    private router : Router,
  ) { super(injector) }

  @ViewChild('attendanceModal') attendanceModal: any ;

  lab_staff : any ;
  count!: number ;
  all_count!: number;
  staffs!:any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer:any; 
  page_size!: any ;
  page_number! : any;
  query!:string;
  sort : any = false;
  pageLoading: boolean = false;

  staffQuery: any ; 

  picture: any ;

  todayDate: any ;

  is_sa: boolean = false;

  override ngOnInit(): void {

    this.page_size = 10;
    this.page_number = 1;
    this.count = 1 ;
    this.all_count = 1;
    this.date = this.timeSrvc.getTodaysDate();
    this.query = "";

    this.todayDate = this.timeSrvc.getTodaysDate();

    const cookieData = this.cookieSrvc.getCookieData() ;
    
    if(!cookieData.is_superadmin){
      this.staffQuery = `&lab_staff=${cookieData.lab_staff_id}` ; 
      this.getlab_staff(cookieData.lab_staff_id)
    }else{

      this.staffQuery = null ;
      this.is_sa = true ;

    }

  }

  override ngAfterViewInit(): void {
    this.getData();
  }


  getlab_staff(id: any){

    this.subsink.sink = this.staffEndpoint.getSingleStaff(id).subscribe((user: any) => {
      this.lab_staff = user ;
    })
  }


  is_today : boolean = false ;

  getData(){
    this.staffs = [];

    this.pageLoading = true;
    this.is_today = this.todayDate == this.date

    this.subsink.sink = this.endPoint.getAttendance(
      this.page_size, this.page_number, this.query, this.sort, this.date, this.staffQuery
    ).subscribe((data: any)=>{
      if(data.results.length != 0){
        this.pageLoading = false;
        this.staffs = data?.results || data ;
        this.count = Math.ceil(data.count / this.page_size)
        this.all_count = data.count;
        
      }else{
        if(this.is_today && !this.is_sa){
          this.openModal(this.attendanceModal, {size: 'sm', centered: true })
        }
      }
    });
    
  }

  
  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page_number = 1;
      this.getData();
    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e:any){
    this.page_size = e.target.value;
    this.page_number = 1;
    this.getData()
  }

  onPageChange(e:any){
    this.page_number=e;
    this.getData();
  }

  getRangeValue(e:any){
    if(e.length !== 0){
      if(e.includes("to")){
        this.separateDates(e);
      }else{
        this.date = e;
        this.from_date = "";
        this.to_date = "" ;
        this.page_number = 1;
        this.getData();
      }}
      else{
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
    this.to_date = endDate ;
    this.date = "";
    this.page_number = 1;
    this.getData();
  }


  getModal(){

    const model = {
      lab_staff: this.lab_staff.id,
      date: this.timeSrvc.getTodaysDate(),
      check_in_time: this.timeSrvc.djangoFormatWithT(),
      check_out_time: null,
    }

    return model ;
  }

  postCheckIn(){
    const model: any = this.getModal();

    

    this.locationSrvc.getLocation().then((location: any) => {

      this.spinner.show() ;

      model['check_in_lat'] = location?.latitude ;
      model['check_in_lon'] = location?.longitude ;

      this.subsink.sink = this.endPoint.postAttendance(model).subscribe((res: any)=>{
        this.alertService.showSuccess(`${this.lab_staff.name} Saved.`);
        this.modalService.dismissAll();
        this.getData();
      }, (error: any)=>{
        this.alertService.showError(error?.error?.Error || error?.error?.error)
      })
    }).catch(error => {


      this.alertService.showInfo('Please Turn ON Location and Try Again.',error.errorMessage);
    });

  }

  checkOut(item: any){
    this.locationSrvc.getLocation().then((location: any) => {
      const model = item ;
      model['check_out_time'] = this.timeSrvc.djangoFormatWithT();
      model['lab_staff'] = model.lab_staff.id;
      model['check_out_lat'] = location?.latitude ;
      model['check_out_lon'] = location?.longitude ;
      this.updateModel(model) ;
    }).catch(error => {
      this.alertService.showInfo('Please Turn ON Location and Try Again.',error.errorMessage);
    });

  }

  updateModel(model: any){
    this.subsink.sink = this.endPoint.updateAttendace(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.lab_staff.name} Saved.`);
      this.getData();
    }, (error: any)=>{
      this.getData() ;
      this.alertService.showError(error?.error?.Error || error?.error?.error)
    })
  }


  // utilities 

  selectedItem: any ;
  openMap(content: any, item:any, is_start: any){  
    this.selectedItem = item ;
    this.selectedItem['is_start'] = is_start ;
    if(is_start){
      this.selectedItem['locations'] = [this.selectedItem.check_in_lat, this.selectedItem.check_in_lon]
    }else{
      this.selectedItem['locations'] = [this.selectedItem.check_out_lat, this.selectedItem.check_out_lon]
    }
    this.openModal(content, { size: 'xl', centered: true });
  }


  getCurrentTime() {
    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const amPm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Format minutes and seconds with leading zeros
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    return `${hours}:${formattedMinutes} ${amPm}`;
}


}