import { Component, Inject, Injector, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { DrAuthsEndpoint } from 'src/app/drauthorization/endpoints/drauth.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
})

export class AnalyticsComponent extends BaseComponent<any> {
  constructor(
    injector: Injector,
    private endPoint: DrAuthsEndpoint, 
    public timeSrvc : TimeConversionService,
    private cookieSrvc : CookieStorageService
  ) { super(injector) }



  override ngOnInit(): void {
    const staffData = this.cookieSrvc.getCookieData();
    this.page_size = 10;
    this.page_number = 1;
    this.count = 1;
    this.all_count = 1;
    this.query = "";
    this.patients = [];
    this.from_date = this.timeSrvc.getTodaysDate();
    this.to_date= this.timeSrvc.getTodaysDate();
    this.getData()

  }




  count!: number;
  all_count!: number;
  patients!: any;
  timer: any;
  sort:any = true;
  date: any ;
  from_date: any = this.timeSrvc.getTodaysDate();
  to_date: any = this.timeSrvc.getTodaysDate();
  pageNum: any;
  page_size!: any;
  page_number!: any;
  query!: string;
  // @ViewChild('datePicker') datePicker!: AppDatePickerComponent;

  getData() {

  }

  changeSorting(){
    this.sort = !this.sort;
    this.getData();
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
    }, 800); // Adjust the delay as needed
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
    this.pageNum = 1;
    this.getData();
  }

}
