import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { FormBuilder, Validators } from '@angular/forms';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';

@Component({
  selector: 'app-advance-payments',
  templateUrl: './advance-payments.component.html',
})

export class AdvancePaymentsComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private endPoint: OutsourcingEndpoint,
    private cookieSrvc: CookieStorageService,
    public timeSrvc: TimeConversionService
  ){super(injector)};

  @Input() lab: any = null ;
  @Output() saved: any = new EventEmitter() ;

  payments: any = [] ;

  inProgress: boolean = false ;

  page_size: number = 10 ;
  page_number: number = 1 ;
  all_count: number = 0;
  count: any = 0 ;
  
  override ngOnInit(): void {

    this.baseForm = this.formBuilder.group({
      paid_amount: ["", Validators.required]
    })

    this.getData();
  }

  getLab(){
    this.subsink.sink = this.endPoint.getSpecificSourcingLab(this.lab.id).subscribe((res: any)=>{
      this.lab = res ;
    })
  }

  getData(){
    this.subsink.sink = this.endPoint.getAdvnacePaymentHistory(this.lab?.id, this.page_number, this.page_size).subscribe((res: any)=>{
      this.payments = res?.results || res ;
      this.count = Math.ceil(res.count / this.page_size)
      this.all_count = res.count;
    })
  }


  savePayment(){
    if(this.baseForm.valid){
      const model = {
        sourcing_lab: this.lab.id,
        paid_amount : this.baseForm?.value?.paid_amount,
        created_by: this.cookieSrvc.getCookieData().lab_staff_id
      }
      this.subsink.sink = this.endPoint.postSourcingAdvancePayment(model)?.subscribe((res: any)=>{
        this.getData();
        this.getLab();
        this.baseForm.reset();
        this.saved.emit({});
      }, (error)=>{ this.showAPIError(error) })
    }else{
      this.showBaseFormErrors();
    }
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

  // utilities 

  formatIndianNumber(number: number): string {
    const formattedNumber = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(number);
    return formattedNumber;
  }

}
