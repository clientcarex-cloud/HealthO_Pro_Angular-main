import { Component, Injector } from '@angular/core';
import { UntypedFormBuilder,}from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { StaffEndpoint } from '../../endpoint/staff.endpoint';
import { Staff } from '../../model/staff.model';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { StaffService } from '../../service/staff.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent extends BaseComponent<Staff> {

  constructor(
    private formBuilder: UntypedFormBuilder,
    private endPoint: StaffEndpoint,
    injector: Injector,
    public service: StaffService, 
    public capitalSrvc : CaptilizeService,
    private router : Router
  ) { super(injector) }


  inProgress: boolean = false;
  pageNum! : number | null;
  users:any = [];

  override ngAfterViewInit(): void {
    this.subsink.sink = this.endPoint.getAllStaff().subscribe((data:any)=>{
      this.dataEmployee[0].count = data.length;  
      data.forEach((emp:any)=>{
        emp.is_login_access ? this.dataEmployee[1].count = this.dataEmployee[1].count + 1 : "";
        !emp.is_login_access ? this.dataEmployee[2].count = this.dataEmployee[2].count + 1 : "";
        
      })
    })
  }

  override ngOnInit(): void {
    // this.dataList$ = this.service.staffs$
    // this.total$ = this.service.total$;
    // this.pageNum = null;
    // this.fetchdata(this.pageNum);
    // this.service.searchTerm = ""
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



















  fetchdata(pageNum: any): void {
    this.subsink.sink = this.endPoint.getStaff(pageNum).subscribe((data: any) => {
      const pntData = data.results;

      if (data.next !== null) {
        pageNum++; // Increase the page number for the next fetch
        this.service.staffs = pntData;
        this.fetchNextPage(pageNum, pntData);
        
      } else {
        // No more pages, assign the data to your service or do other processing
        this.service.staffs = pntData;
      }

      this.dataEmployee[0].count = pntData.length;

      pntData.forEach((emp:any)=>{
        emp.is_login_access ? this.dataEmployee[1].count = this.dataEmployee[1].count + 1 : "";
        !emp.is_login_access ? this.dataEmployee[2].count = this.dataEmployee[2].count + 1 : "";
      })
    });
  }

  fetchNextPage(pageNum: number, pntData: any[]): void {
    this.endPoint.getStaff(pageNum).subscribe((dataNext: any) => {
      pntData.push(...dataNext.results);

      if (dataNext.next !== null) {
        pageNum++; // Increase the page number for the next fetch
        this.fetchNextPage(pageNum, pntData); // Continue fetching next pages
      } else {
        // No more pages, assign the accumulated data to your service or do other processing
        this.service.staffs = pntData;
      }
    });
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

  formatString(e:any,val:any){
    this.baseForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e))
  }

  showStaff(id:any){
    this.router.navigate(['/staff/view/'], { queryParams: {s_id: id}});
}

  
  dataEmployee = [
    {label: 'Employees', count:0, },
    {label: 'Active', count:0},
    {label: 'Inactive', count: 0 },
    // {label: 'Total Users', count: 65 },
  ]



}
