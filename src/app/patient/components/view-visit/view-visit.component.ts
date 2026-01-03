import { Component, Injector } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AddPatientEndpoint } from '../../endpoints/addpatient.endpoint';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { ProEndpoint } from '../../endpoints/pro.endpoint';
import { PatientEndpoint } from '../../endpoints/patient.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-view-visit',
  templateUrl: './view-visit.component.html',
  styleUrl: './view-visit.component.scss'
})
export class ViewVisitComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private router: Router,
    private route: ActivatedRoute,

    public timeSrvc: TimeConversionService,
    public capitalSrvc: CaptilizeService,
    private printSrvc: PrintService,
    private cookieSrvc: CookieStorageService,
    private spinner: NgxSpinnerService,

    private endPoint: AddPatientEndpoint,
    private proEndpoint: ProEndpoint,
    private patientEndpoint: PatientEndpoint,
  ) { super(injector) }

  titles: any ;
  genders: any ;
  ptnId: any ;
  title: any ='';
  ages: any ;
  patiendData:any  ;
  all_discount: any;


  override ngOnInit(): void {
    this.spinner.show() ;

    this.subsink.sink = this.proEndpoint.getTitle().subscribe((data: any) => {
      this.titles = data;
      this.spinner.show() ;
      this.subsink.sink = this.proEndpoint.getGender().subscribe((res: any) => {
        this.genders = res.results;
        this.spinner.show() ;
        this.subsink.sink = this.proEndpoint.getAges().subscribe((response: any) => {
          this.ages = response.results;
          this.spinner.show() ;
          this.loadPatient();
        });
      });
    });

  }

  override ngAfterViewInit(): void {
    this.subsink.sink = this.endPoint.getDiscountTypes().subscribe((data: any) => {
      this.all_discount = data;
    })
  }


  loadPatient(){
    // this.spinner.show() ;

    this.route.queryParams.subscribe(params => {
      this.ptnId = params['patient_id']
      if (this.ptnId) {
        this.subsink.sink = this.patientEndpoint.getPaginatedPatients(
          "all", 1,'','', this.ptnId, '','','', false
          ).subscribe((data: any) => {

          this.title = `${data[0].title?.name || ''} ${data[0].name} (${data[0].age} ${this.ages.find((age: any)=> age.id == data[0].ULabPatientAge)?.name} / ${this.genders.find((g:any)=> g.id == data[0].gender).name}) ` + "   ".repeat(3) + `MR No : ${data[0].mr_no}`;
          this.patiendData = data.filter((d: any) => d.mr_no == this.ptnId);
          
          this.patiendData.forEach((d:any)=>{
            d.loading = false;
          })

          this.spinner.hide();
        })
      }
    })
  }



  paymentHistoryTable:any;
  openId: any ;
  getPayments(content:any, patient:any){
    this.openId = patient;
    patient.loading = true ;
    this.subsink.sink = this.endPoint.getPaymentHistory(patient.id).subscribe((data: any) => {
      patient.loading = false ;
      this.paymentHistoryTable = data;
    }, (error:any)=>{
      patient.loading = false ;
      this.alertService.showError("Failed to Fetch the Payment Details")
    })
    this.getRefundList();
    this.modalService.open(content, { size: 'xl', centered: false, scrollable: true });
  }

  refundList: any = [];

  getRefundList() {
    this.subsink.sink = this.endPoint.getRefundHistory(this.openId.id).subscribe((data: any) => {
      this.refundList = data
    }, (error) => {
      this.alertService.showError("Failed to Get Refund History", error)
    })
  }

  print_patient_invoice() {
    const model = {
      patient_id: this.openId.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by:  this.cookieSrvc.getCookieData().lab_staff_id,
    }

    this.openId.loading = true;

    this.subsink.sink = this.endPoint.getPatientPrintInvoice(model).subscribe((response: any) => {
      this.openId.loading = false;
      this.printSrvc.printInvoice(response.html_content)
    }, (error: any) => {
      this.openId.loading = false;
      this.alertService.showError(error);
    })

  }


  
  getMultiPaymodes(payModes:any){
    if (payModes.length === 1) {
      return payModes[0].pay_mode;
    } else {
      return payModes.map((mode:any) => mode.pay_mode).join(' and ');
    }
  }

  getMultiPaymodesAmount(payModes: any) {
    if (payModes.length === 1) {
      return payModes[0].paid_amount;
    } else {
      return payModes.map((mode: any) => mode.paid_amount).join(' + ');
    }
  }


  getDiscountName(id:any){
    return this.all_discount.find((d:any)=> d.id == id) || "";
  }
  

  getFloatVal(num: any) {
    return parseFloat(num.replace(/,/g, ''))
  }

  print_patient_report(id:any) {

    const model = {
      patient_id: this.openId.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      receipt_id: id,
      printed_by:  this.cookieSrvc.getCookieData().lab_staff_id,
    }

    this.endPoint.getPatientPrintReport(model).subscribe((response: any) => {
      this.printSrvc.printRcpts(response.html_content);
    }, (error: any) => {
      this.alertService.showError(error);
    })

  }


  showPatient(){
    this.router.navigate(['/patient/addpatients'], { queryParams: {patient_id: this.ptnId}});
  }

  goToStandardView(item: any){
    // const url = this.router.createUrlTree(['/patient/patient_standard_view'], { queryParams: { patient_id: item.id } }).toString();
    // window.open(url, '_blank');
    this.router.navigate(['/patient/patient_standard_view'], { queryParams: { patient_id: item.id } });

  }

}
