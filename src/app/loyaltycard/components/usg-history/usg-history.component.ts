import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { LoyaltyCardEndpoint } from '../../loyaltycard.enpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-usg-history',
  templateUrl: './usg-history.component.html',
  styleUrl: './usg-history.component.scss'
})
export class UsgHistoryComponent extends BaseComponent<any>{

  constructor(
    private endPoint: LoyaltyCardEndpoint,
    injector: Injector,
    private router : Router,
    public timeSrvc: TimeConversionService,
    private spinner: NgxSpinnerService,
    private cookieSrvc : CookieStorageService,
    private printSrvc: PrintService
    ){ super(injector) }

    @Input() member: any = null;
    activeId: any = null ;

    toggleAccordionnn(id: any): void {
      this.activeId = this.activeId === id ? null : id;
    }
  
    concatenateShortCodes(item:any) {
      let shortForm = ''
      if(item.lab_tests.length > 0){
        item.lab_tests.forEach((test:any)=>{
          shortForm += test.name + ', '
        })
      }
  
      if(item?.lab_packages && item?.lab_packages?.length > 0){
        item.lab_packages.forEach((pkg:any)=>{
          pkg.lab_tests.forEach((test:any)=>{
            shortForm += test.name + ', '
          })
        })
      }
  
      return shortForm.slice(0, -2)
    }

    override ngOnInit(): void {
      this.getData();
    }

    count!: number ;
    all_count!: number;
  
    date: string = "";
    status_id: string = "";
    from_date: string = "";
    to_date: string = "";
    timer:any;
    page_size!: any ;
    page_number! : any;
    query!:string;
    sort : any = true;
    valid_starts:boolean = false;
    valid_end: boolean = false;
    patients: any = [];
  
    pageLoading: boolean = false;


    getData(e:any =''){
   
      this.spinner.show() ;
      this.pageLoading = true;
      this.subsink.sink = this.endPoint.getUsageHistory(
        'all', 1, '',
           this.sort, '', '', '', 
           this.member.id, ''
          ).subscribe((data:any)=>{
  
        this.count = Math.ceil(data.count / this.page_size)
        this.all_count = data.count;
        this.patients =  data.usages;
        this.pageLoading = false;

      })
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
  
    changePageNumber(e:any){
    
      this.page_size = e.target.value;
      if(this.page_size == this.all_count){
        this.page_number = 1;
      }
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
  

    showPatient(details: any){
      const url = this.router.createUrlTree(['/patient/patient_standard_view/'], { queryParams: { patient_id: details.id } }).toString();
      window.open(url, '_blank');
      
    }
  

}
