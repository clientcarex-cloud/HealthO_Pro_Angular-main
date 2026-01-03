import { ChangeDetectorRef, Component, Injector, Input, ViewChild } from '@angular/core';
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
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrl: './payroll.component.scss'
})

export class PayrollComponent extends BaseComponent<any>{


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

    private cd: ChangeDetectorRef,
    private router : Router,
  ) { super(injector) }

  @ViewChild('attendanceModal') attendanceModal: any ;

  labStaff : any ;
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
  @Input() staffQuery = '&role=MarketingExecutive'
  picture: any ;
  todayDate: any ;
  is_sa: boolean = false;
  selectedItem: any ;
  is_today : boolean = false ;

  

  override ngOnInit(): void {

    this.page_size = 10;
    this.page_number = 1;
    this.count = 1 ;
    this.all_count = 1;
    this.date = this.timeSrvc.getTodaysDate();
    this.query = "";

    this.todayDate = this.timeSrvc.getTodaysDate();

    // const cookieData = this.cookieSrvc.getCookieData() ;
    
    // if(!cookieData.is_superadmin){
    //   // this.staffQuery = `&lab_staff=${cookieData.lab_staff_id}` ; 
    //   // this.getLabStaff(cookieData.lab_staff_id)
    //   this.staffQuery = null
    // }else{

    //   this.staffQuery = null ;
    //   this.is_sa = true ;

    // }

  }

  override ngAfterViewInit(): void {
    this.getData();
  }


  getLabStaff(id: any){

    this.subsink.sink = this.staffEndpoint.getSingleStaff(id).subscribe((user: any) => {
      this.labStaff = user ;
    })
  }




  getData(){
    this.staffs = [];
    this.pageLoading = true;
    this.is_today = this.todayDate == this.date
    this.subsink.sink = this.endPoint.getPayroll(
      this.page_size, this.page_number, this.query, this.sort, this.staffQuery
    ).subscribe((data: any)=>{
      this.pageLoading = false;
      this.staffs = data?.results || data ;
   
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;

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

  saveCtc(){
    if(this.selectedItem?.payroll?.id){
      if(this.selectedItem.payroll?.payment_structure){
        this.selectedItem.payroll['payment_structure'] = this.selectedItem.payroll?.payment_structure?.id
      }else{
        this.selectedItem.payroll['payment_structure'] = 1 ;
      }

      this.updateCtc();
    }else{
      this.selectedItem.payroll['payment_structure'] = 1 ;
      this.selectedItem.payroll['lab_staff'] = this.selectedItem?.id ;
      this.postCtc()
    }
  }

  postCtc(){
    if(this.selectedItem?.payroll){
      this.subsink.sink = this.endPoint.postPayroll(this.selectedItem?.payroll).subscribe((res: any)=>{
        this.alertService.showSuccess("Payroll Saved.");
        this.modalService.dismissAll();
        this.getData();
      }, (error)=>{
        this.alertService.showError(error?.error?.error || error?.error?.Error)
      })
    }else{
      this.alertService.showInfo("Something went wrong.");
    }

  }

  updateCtc(){
    this.subsink.sink = this.endPoint.updatePayroll(this.selectedItem?.payroll).subscribe((res: any)=>{
      this.alertService.showSuccess("Payroll Saved.");
      this.modalService.dismissAll();
      this.getData();
    }, (error)=>{
      this.alertService.showError(error?.error?.error || error?.error?.Error)
    })
  }



  // utilities

  writeValue(value: any, type: any){
    this.selectedItem['payroll'][type] = value ;
  }

  editPayroll(content: any, item: any){
    this.selectedItem = item ;
    if(!this.selectedItem?.payroll){
      this.selectedItem['payroll'] = {};

      const payroll = this.selectedItem?.payroll;

      // Function to ensure value is set to 0 if not a valid number
      const ensureZero = (value: any): number => {
          return (value != null && !isNaN(parseFloat(value))) ? parseFloat(value) : 0;
      };

      // Assign values, setting to zero if necessary
      payroll.special_allowance = ensureZero(payroll.special_allowance);
      payroll.conveyance_allowance = ensureZero(payroll.conveyance_allowance);
      payroll.hra = ensureZero(payroll.hra);
      payroll.basic_salary = ensureZero(payroll.basic_salary);
      payroll.incentive = ensureZero(payroll.incentive);
      payroll.overtime_payment = ensureZero(payroll.overtime_payment);
      payroll.deductions = ensureZero(payroll.deductions);

    }
    this.openModal(content, { size: '' })
  }

  

  returnCTC(){
    const allowance = this.getFloatVal(this.selectedItem?.payroll?.special_allowance)
                          + this.getFloatVal(this.selectedItem?.payroll?.conveyance_allowance)
                          + this.getFloatVal(this.selectedItem?.payroll?.hra) ;
    
    const ctc = this.getFloatVal(this.selectedItem?.payroll?.basic_salary)
                    + this.getFloatVal(this.selectedItem?.payroll?.incentive) 
                    + allowance
                    + this.getFloatVal(this.selectedItem?.payroll?.overtime_payment)
                    - this.getFloatVal(this.selectedItem?.payroll?.deductions)
  
    this.selectedItem['payroll']['ctc'] = ctc ;

    this.cd.detectChanges(); // Manually trigger change detection
    
    return this.capitalSrvc.formatIndianNumber(ctc) ;
  }

  getFloatVal(num: any) {
    try {
      if(num){
        const floatNum = parseFloat(num.replace(/,/g, ''))
        return floatNum
      }else{ 
        return 0
      }

    } catch (error) {
      return num
    }

  }

}