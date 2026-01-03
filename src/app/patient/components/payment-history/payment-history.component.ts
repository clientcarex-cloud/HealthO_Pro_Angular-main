import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AddPatientEndpoint } from '../../endpoints/addpatient.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
})

export class PaymentHistoryComponent extends BaseComponent<any> {

  @Input() ptn : any ;
  @Input() show_payment: boolean = false ;
  @Input() show_payment_for: boolean = false;
  @Input() is_superadmin: boolean = true ;
  @Input() pay_modes: any = [] ;

  invoiceLoading: boolean = false;
  paymentHistoryTable: any = [] ;
  refundList : any = [] ;

  constructor(
    injector: Injector,
    private cookieSrvc: CookieStorageService,
    private printSrvc: PrintService,
    public timeSrvc: TimeConversionService,
    private endPoint: AddPatientEndpoint
  ){ super(injector)}

  override ngOnInit(): void {

    if(this.show_payment) this.getPaymentHistory();
    this.getRefundList();
  }

  getPaymentHistory(){
    this.paymentHistoryTable = [] ;
    this.subsink.sink = this.endPoint.getPaymentHistory(this.ptn.id).subscribe((data: any) => {
      this.paymentHistoryTable = data;
    })
  }

  getRefundList() {
    this.subsink.sink = this.endPoint.getRefundHistory(this.ptn.id).subscribe((data: any) => {
      this.refundList = data;
    }, (error) => {
      this.alertService.showError("Failed to Get Refund History", error)
    })
  }

  print_patient_report(id: any, receipt: any) {

    const model = {
      patient_id: this.ptn.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      receipt_id: id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    receipt['loading'] = true;
    this.subsink.sink = this.endPoint.getPatientPrintReport(model).subscribe((response: any) => {
      receipt['loading'] = false;
      this.printSrvc.printRcpts(response.html_content);
    }, (error: any) => {
      receipt['loading'] = false;
      this.alertService.showError(error?.error?.Error || error?.error?.error || error);
    })

  }

  print_patient_invoice() {

    this.invoiceLoading = true;
    const model = {
      patient_id: this.ptn.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    this.subsink.sink = this.endPoint.getPatientPrintInvoice(model).subscribe((response: any) => {
      this.invoiceLoading = false;
      this.printSrvc.printInvoice(response.html_content);
    }, (error: any) => {
      this.invoiceLoading = false;
      this.alertService.showError(error?.error?.Error || error?.error?.error || error);
    })

  }

  print_patient_refund_slip(refund: any) {

    const model = {
      client_id: this.cookieSrvc.getCookieData().client_id,
      patient_id: this.ptn.id,
      refund_id: refund.id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id
    }

    this.subsink.sink = this.endPoint.PostAndGetPatientRefundSlip(model).subscribe((data: any) => {
      this.printSrvc.print(data.html_content)
    }, (error) => {
      this.alertService.showError(error?.error?.Error || error?.error?.error || error);
    })
  }

  updateReceipt(model: any){
    this.subsink.sink = this.endPoint.updateReceipt(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Updated.")
      this.getPaymentHistory() ;
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error );
    })
  }

  changePayMode(paymode: any, receipt: any, index: number){

    const payModel = {
      id: receipt.payments[index]?.id,
      pay_mode : this.pay_modes.find((mode: any)=> mode.name == paymode).id,
      paid_amount : receipt.payments[index].paid_amount
    }

    const model: any = {
      id : receipt.id,
      payments : []
    }

    if(receipt.payments.length == 2){
      if(index == 0){
        model.payments.push(payModel) ;

        const otherPayMode = {
          id: receipt.payments[1]?.id,
          pay_mode : this.pay_modes.find((mode: any)=> mode.name == receipt.payments[1].pay_mode).id,
          paid_amount : receipt.payments[1].paid_amount 
        }
        model.payments.push(otherPayMode)
      }else{
        const otherPayMode = {
          id: receipt.payments[0]?.id,
          pay_mode : this.pay_modes.find((mode: any)=> mode.name == receipt.payments[0].pay_mode).id,
          paid_amount : receipt.payments[0].paid_amount 
        }

        model.payments.push(otherPayMode) ;
        model.payments.push(payModel);
      }
    }else{
      model.payments.push(payModel) ;
    }

    this.updateReceipt(model);
  }

  // utilities 

  getMultiPaymodes(payModes: any) {
    if (payModes.length === 1) {
      return payModes[0].pay_mode;
    } else {
      return payModes.map((mode: any) => mode.pay_mode).join(' and ');
    }
  }

  placeBreak(str: any) {
    return str.replace('\n', '<br/>')
  }

  getFloatVal(num: any) {
    return parseFloat(num.replace(/,/g, ''))
  }

  
  getMultiPaymodesAmount(payModes: any) {
    if (payModes.length === 1) {
      return payModes[0].paid_amount;
    } else {
      return payModes.map((mode: any) => mode.paid_amount).join(' + ');
    }
  }


}
