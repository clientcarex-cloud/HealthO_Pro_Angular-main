import { Component, Injector, } from '@angular/core';
import { FormGroup, UntypedFormBuilder, } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { StaffEndpoint } from '../../endpoint/staff.endpoint';
import { NgbdSortableHeader, SortEvent } from '@sharedcommon/directives/sortable.directive';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Staff } from '../../model/staff.model';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { StaffService } from '../../service/staff.service';
import { Router } from '@angular/router';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent extends BaseComponent<Staff> {

  constructor(
    private formBuilder: UntypedFormBuilder,
    private endPoint: StaffEndpoint,
    injector: Injector,
    public service: StaffService, 
    private cookieSrvc: CookieStorageService,
    public capitalSrvc : CaptilizeService,
    private router : Router,
  ) { super(injector) }

  inProgress: boolean = false;
  pageNum! : number | null;
  users:any = [];

  override ngAfterViewInit(): void {

  }


  override ngOnInit(): void {

    this.page_size = 10;
    this.page_number = 1;
    this.count = 1 ;
    this.all_count = 1;
    this.query = "";
    this.staffs = [];
    this.getData();

  }


  datePickerMaxDate: any;
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

  getData(){
    if(this.page_size > 49){
     
      this.staffs = [];
    }

    this.pageLoading = true;
    this.subsink.sink = this.endPoint.getPaginatedStaff(
      this.page_size, this.page_number,
        this.query,
      this.sort
        ).subscribe((data:any)=>{
        
      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.staffs = data.results ;
      this.dataEmployee[0].count = data.count;

    })
  }


  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      // this.dateSection.clearAllDates();
      // this.date = "";
      // this.from_date = "";
      // this.to_date = "";
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

  formatString(e:any,val:any){
    this.baseForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e))
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }
  
  calculateDaysBack(dateString: string): string {
    const currentDate = new Date();
    const inputDate = new Date(dateString);
  
    // Calculate the difference in milliseconds
    const differenceMs = currentDate.getTime() - inputDate.getTime();
  
    // Calculate the difference in days
    const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
  
    // Return the result based on the difference
    if (differenceDays === 0) {
      return 'Today';
    } else if (differenceDays === 1) {
      return 'Yesterday';
    } else if (differenceDays <= 7) {
      return `${differenceDays} days ago`;
    } else if (differenceDays <= 30) {
      const weeksAgo = Math.floor(differenceDays / 7);
      return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
    } else if (differenceDays <= 90) {
      return 'One month ago';
    } else if (differenceDays <= 365) {
      const monthsAgo = Math.floor(differenceDays / 30);
      return `${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
    } else {
      const yearsAgo = Math.floor(differenceDays / 365);
      return `${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago`;
    }
  }

  dataEmployee = [
    {label: 'Employees', count:0},
    {label: 'Total Present', count:0},
    {label: 'Total Absent', count: 0 },
    {label: 'Total Users', count: 0 },
  ]



  showStaff(id:any){
      this.router.navigate(['/staff/view/'], { queryParams: {s_id: id}});
  }

  toggleAccess(staff:any, e: any){

    if(!e && staff.is_superadmin){
      staff.is_superadmin = false;
    }

    const model ={
      client: this.cookieSrvc.getCookieData().client_id,
      lab_staff : staff.id
    }

    this.subsink.sink = this.endPoint.toggleAccess(model).subscribe((res:any)=>{
      res['user_tenant.isactive'] ?  this.alertService.showSuccess("Login Active", staff.name ) : this.alertService.showInfo("Login Inactive", staff.name);
    },(error)=>{
      this.alertService.showError(error);
      staff.is_login_access = !e;
    })

  }

}
