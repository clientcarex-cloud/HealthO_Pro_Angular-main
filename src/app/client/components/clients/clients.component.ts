import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { ClientEndpoint } from '../../clients.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
})

export class ClientsComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: ClientEndpoint,
    public timeSrvc: TimeConversionService,
    private router : Router,
    private spinner: NgxSpinnerService,
  ){ super(injector) }

  count!: number;
  all_count!: number;
  clients!: any;
  date: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;
  page_size!: any;
  page_number!: any;
  query!: string;
  sort: boolean =false;

  override ngOnInit(): void {
    this.page_number = 1;
    this.page_size = 10;
    this.query = "";
    this.getData()
  }

  pageLoading: boolean = false;

  getData() {
    this.pageLoading= true;
    this.clients = [] ;
    this.subsink.sink = this.endPoint.getClientsData(
      this.page_size, this.page_number, this.query, this.date, this.from_date, this.to_date, this.sort
    ).subscribe((data: any) => {
      this.pageLoading= false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.clients = data.results;
    }, (error)=>{
      this.pageLoading= false;
      this.alertService.showError(error?.error?.Error)
    })
  }


  changeSorting(){
    this.sort = !this.sort;
    this.getData();
  }  

  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page_number = 1;
      this.getData();
    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e: any) {
    this.page_size = e.target.value;
    if(this.page_size == this.all_count){
      this.page_number = 1
    }
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

  showOrg(details: any){
    this.router.navigate(['/admin/client/org'], { queryParams: {org_id: details.id}});
  }


  toggleOrganization(org: any){
    this.spinner.show();
    this.subsink.sink = this.endPoint.postToggleOnOff(org.id).subscribe((res: any)=>{
      this.getData();
    })

  }

  hasCrossedSpecifiedDateTime(specifiedTimestamp: string): boolean {
    const specifiedDate = new Date(specifiedTimestamp);
    const currentDate = new Date();
    return currentDate.getTime() > specifiedDate.getTime();
  }

  returnHtml(e: any){
    if(this.hasCrossedSpecifiedDateTime(e)){
      return "<span class='text-danger'>Expired</span>"
    }else{
      return "<span class='text-success'>Active</span>"
    }
  }
}
