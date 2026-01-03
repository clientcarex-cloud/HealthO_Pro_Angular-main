import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DoctorEndpoint } from 'src/app/doctor/endpoint/doctor.endpoint';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';


@Component({
  selector: 'app-business-setting',
  templateUrl: './business-setting.component.html',
})

export class BusinessSettingComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: MasterEndpoint,
    private doctorEndpoint: DoctorEndpoint,
    private signupEndpoint: SignUpEndpoint,
    private cookieSrvc: CookieStorageService,
    private timeSrvc: TimeConversionService
  ) {
    super(injector)
  }

  @Input() showPharmacyDiscount : boolean = false ;

  private discountSubject: Subject<number> = new Subject<number>();
  private paidSubject: Subject<number> = new Subject<number>();
  private pndtSubject: Subject<any> = new Subject<any>();

  private emailSubject: Subject<any> = new Subject<any>();

  discount_setting: any = {
    id: 0,
    number: 0,
    is_percentage: true,
    is_active: false,
    loading: false
  }

  paid_amount_setting: any = {
    id: 0,
    number: 0,
    is_percentage: true,
    is_active: false,
  }

  due_print: any = {
    id: 0,
    is_active: false
  }

  organization: any ;
  emailCredentials: any ;
  manualDateTime: any = null ;

  pharmacy__dis_tax: any

  override ngAfterViewInit(): void {
   this.subsink.sink = this.signupEndpoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{
      this.organization = data[0]
    });
  }

  override ngOnInit(): void {
    this.discountSubject.pipe(
      debounceTime(300)  // Adjust the debounce time as neededd
    ).subscribe(value => {
      this.postPutDiscount();
    });

    this.paidSubject.pipe(
      debounceTime(300)  // Adjust the debounce time as needed
    ).subscribe(value => {
      this.postPutMinimumPaidAmount();
    });

    this.pndtSubject.pipe(
      debounceTime(300)  // Adjust the debounce time as needed
    ).subscribe(value => {
      this.postPutPNDTDetails()
    });

    this.emailSubject.pipe(
      debounceTime(300)  // Adjust the debounce time as neededd
    ).subscribe(value => {
     this.updateEmailCredentials();
    });

    this.getDiscountSetting();

    if(this.showPharmacyDiscount) this.getPharmacyDiscountTaxs();

    this.getMimumPaidAmount();
    this.getPrintDueReports();
    this.getPNDTDetails();
    this.getMessagesStatus();
    this.getDefaultDoctors();
    this.getPhlebotomistBarCode();

    this.getManualDateSettings() ;

    this.getEmailCredentials() ;
  }


  getPharmacyDiscountTaxs(){
    this.subsink.sink = this.endPoint.getPharmacyDisTax().subscribe((res: any)=>{
      this.pharmacy__dis_tax = res[0];
    })
  }

  timer: any ; 
  updatePharmacyDisTax(type: any, event: any){
    this.pharmacy__dis_tax[type] = event ;
    clearTimeout(this.timer) ; 
    this.timer = setTimeout(()=>{
      this.subsink.sink = this.endPoint.updatePharmacyDiscountTax(this.pharmacy__dis_tax).subscribe((res: any)=>{
        this.alertService.showSuccess("Saved.")
      }, (error)=>{
        this.getPharmacyDiscountTaxs();
      })
    }, 1000)
  }

  getEmailCredentials(){
    this.subsink.sink = this.endPoint.getEmailCredentials().subscribe((res: any)=>{
      this.emailCredentials = res[0]
    })
  }

  enterCreditials(e: any, type: any){
    this.emailCredentials[type] = e.target.value ; 

    this.emailSubject.next('');
  }

  updateEmailCredentials(){
    this.subsink.sink = this.endPoint.updateEmailCredentials(this.emailCredentials).subscribe((res: any)=>{

    }, (error)=>{
      this.alertService.showError(error?.error?.error || error?.error?.Error || error );
    })
  }

  getManualDateSettings(){
    this.subsink.sink = this.endPoint.getManualDateTimeSetting().subscribe((res: any)=>{
      try{
        this.manualDateTime = res[0] ;
      }catch(error){

      }

    })
  }

  handleManualDateTime(event: any){
    this.manualDateTime['manual_date'] = event ;

    this.subsink.sink = this.endPoint.updateManualDateTime(this.manualDateTime).subscribe((res: any)=>{
      this.alertService.showSuccess("Manual Date Time Settings Updated.");
    }, (error)=>{
      this.alertService.showError("Failed to Update settings.", error?.error?.Error || error?.error?.error || error )
    })

  }

  getDiscountSetting() {
    this.discount_setting['loading'] = true;

    this.subsink.sink = this.endPoint.getBusinessDiscountSetting().subscribe((data: any) => {
      if (data.length !== 0) {
        this.discount_setting.loading = false;
        this.discount_setting.number = data[0].number;
        this.discount_setting.is_active = data[0].is_active;
        this.discount_setting.id = data[0].id;
      }else{
        this.discount_setting['loading'] = false;
        this.discount_setting['error'] = true;
        this.alertService.showError("Failed to get Discount Details")
      }
    }, (error)=>{
      this.discount_setting['loading'] = false;
      this.discount_setting['error'] = true;
      this.alertService.showError(error, "Failed to get Discount Details")
    })
  }

  postPutDiscount() {
    const model: any = {
      number: this.discount_setting.is_active ? this.discount_setting.number : 100,
      is_active: this.discount_setting.is_active,
      is_percentage: true,
    }

    this.discount_setting.id !== 0 ? model['id'] = this.discount_setting.id : null;

    if (this.discount_setting.id == 0) {
      this.subsink.sink = this.endPoint.postBusinessDiscountSetting(model).subscribe((response: any) => {
        this.discount_setting.id = response.id;
        
      }, (error) => {
        this.getDiscountSetting();
        this.alertService.showError(error);
      })
    } else {
      if(model.number && model.number>=1){
        this.subsink.sink = this.endPoint.updateBusinessDiscountSetting(model).subscribe((response: any) => {
          // this.getDiscountSetting();
        }, (error) => {
          this.getDiscountSetting();
          this.alertService.showError(error);
        })
      }

    }
  }

  handleDiscountCheckBox(e: any) {
    this.discount_setting.is_active = !this.discount_setting.is_active
    if (this.discount_setting.is_active) {
      this.postPutDiscount();
      this.getDiscountSetting();
    } else {
      this.discount_setting.number = 100;
      this.postPutDiscount();
    }

  }

  enterDiscount(e: any) {

    this.discount_setting.number = e;

    if(e && e!= '' && e >= 1){
      this.discountSubject.next(this.discount_setting.number);
    }else{
      this.alertService.showInfo("Can't be less 1%")
    }

  }








  getMimumPaidAmount() {
    this.paid_amount_setting['loading'] = true;

    this.subsink.sink = this.endPoint.getBusinessMinimumPaidAmount().subscribe((data: any) => {
      if (data.length !== 0) {
        this.paid_amount_setting['loading'] = false;
        this.paid_amount_setting.number = data[0].number;
        this.paid_amount_setting.is_active = data[0].is_active;
        this.paid_amount_setting.id = data[0].id;
      }else{
        this.paid_amount_setting['loading'] = false;
        this.paid_amount_setting['error'] = true;
        this.alertService.showError("Failed to get Minimum Paid Amount Settings")
      }
    }, (error)=>{
      this.paid_amount_setting['loading'] = false;
      this.paid_amount_setting['error'] = true;
      this.alertService.showError(error, "Failed to get Minimum Paid Amount Settings")
    })
  }


  handlePaidAmountCheckBox(e: any) {
    this.paid_amount_setting.is_active = !this.paid_amount_setting.is_active
    if (this.paid_amount_setting.is_active) {
      this.postPutMinimumPaidAmount();
      this.getMimumPaidAmount();

    } else {
      this.paid_amount_setting.number = 100;
      this.postPutMinimumPaidAmount();

    }
  }

  enterPaidAmount(e: any) {
    this.paid_amount_setting.number = e;
    if(e && e!= '' && e >= 1){
      this.paidSubject.next(this.paid_amount_setting.number);
    }else{
      this.alertService.showInfo("Can't be less 1%")
    }
  }

  postPutMinimumPaidAmount() {
    const model: any = {
      number: this.paid_amount_setting.is_active ? this.paid_amount_setting.number : 100,
      is_active: this.paid_amount_setting.is_active,
      is_percentage: true,
    }

    this.paid_amount_setting.id !== 0 ? model['id'] = this.paid_amount_setting.id : null;

    if (this.paid_amount_setting.id == 0) {
      this.subsink.sink = this.endPoint.postMinimumPAidAmountSetting(model).subscribe((response: any) => {
        this.paid_amount_setting.id = response.id;
      }, (error) => {
        this.getMimumPaidAmount()
        this.alertService.showError(error);
      })
    } else {
      if(model.number && model.number>=1){
        this.subsink.sink = this.endPoint.updateMinimumPaidAmountSetting(model).subscribe((response: any) => {
          // this.discount_setting.id = response.id;
        }, (error) => {
          this.getMimumPaidAmount();
          this.alertService.showError(error);
        })
      }
      }

  }



  getPrintDueReports() {
    this.due_print['loading'] = true;

    this.subsink.sink = this.endPoint.getPrintDueReports().subscribe((response: any) => {
      this.due_print['loading'] = false;
      if (response.length !== 0) {
        this.due_print.id = response[0].id;
        this.due_print.is_active = response[0].is_active;
      }
    }, (error)=>{
      this.due_print['loading'] = false;
      this.due_print['error'] = true;
      this.alertService.showError(error, "Failed to get Print Due Reports Status")
    })
  }

  handleDuePrint(e: any) {
    this.due_print.is_active = e
    const model: any = {
      is_active: this.due_print.is_active,
    }

    this.due_print.id !== 0 ? model['id'] = this.due_print.id : null;

    if (this.due_print.id == 0) {
      this.subsink.sink = this.endPoint.postDuePrintSetting(model).subscribe((response: any) => {
        this.due_print.id = response.id;
      }, (error) => {
        this.getPrintDueReports();
        this.alertService.showError(error);
      })
    } else {
      this.subsink.sink = this.endPoint.updateDuePrintSetting(model).subscribe((response: any) => {

      }, (error) => {
        this.getPrintDueReports()
        this.alertService.showError(error);
      })
    }
  }



  query: any;
  searchData!: any;
  doctors:any = [] ;
  showAddDoc: boolean = false;

  pndt_details: any ={
    id: 0,
    default_pndt_doctors: [],
    pndt_reg_number: '',
    is_active: false
  }

  getData(e:any, check: boolean = true) {

    this.subsink.sink = this.doctorEndpoint.getPaginatedConsultingDoctors(
      'all', 1, e,
      '', '', '', false
    ).subscribe((data: any) => {
      if(check){
        const docs = this.pndt_details.default_pndt_doctors.map((d: any) => d.id);
        this.searchData = data.filter((d:any)=> !docs.includes(d.id));
      }else{
        this.searchData = data;
      }

    })
  }

  enterPNDTNUmber(e:any){
    this.pndt_details.pndt_reg_number = e.target.value.toUpperCase();
    e.target.value = e.target.value.toUpperCase();

    this.pndtSubject.next(this.pndt_details)
  }

  pndtActive(e:any){
    this.pndt_details.is_active = e;
    this.pndtSubject.next(this.pndt_details)
  }

  getPNDTDetails() {

    this.pndt_details['loading'] = true;

    this.subsink.sink = this.endPoint.getPNDTDetails().subscribe((data: any) => {
      this.pndt_details['loading'] = false;
      if(data.length != 0){
        this.pndt_details.default_pndt_doctors = data[0].default_pndt_doctors
        this.pndt_details.pndt_reg_number = data[0].pndt_reg_number
        this.pndt_details.id = data[0].id;
        this.pndt_details.is_active = data[0].is_active
      }
    }, (error)=>{
      this.pndt_details['loading'] = false;
      this.pndt_details['error'] = true;
      this.alertService.showError(error, "Failed to get PNDT Details")
    })
  }

  onItemSelected(e:any){
    this.pndt_details.default_pndt_doctors.push(e);
    this.postPutPNDTDetails();
  }

  removeDoctor(e:any){
    this.pndt_details.default_pndt_doctors = this.pndt_details.default_pndt_doctors.filter((d:any)=> d.id !== e.id);
    this.postPutPNDTDetails();
  }

  postPutPNDTDetails(){
    const docs = this.pndt_details.default_pndt_doctors.map((d: any) => d.id);

    const model: any = {
      default_pndt_doctors : docs,
      // pndt_reg_number: this.pndt_details.pndt_reg_number,
      b_id: this.organization.id,
      is_active: docs.length !==0 ? true : false
    }

    this.pndt_details.id !== 0 ? model['id'] = this.pndt_details.id : null;

    if (this.pndt_details.id == 0) {
      this.subsink.sink = this.endPoint.postPNDTDetails(model).subscribe((response: any) => {
        this.pndt_details.id = response.id;
      }, (error) => {
        this.getPNDTDetails();
        this.alertService.showError(error);
      })
    } else {
      this.subsink.sink = this.endPoint.updatePNDTDetails(model).subscribe((response: any) => {
      }, (error) => {
        this.getPNDTDetails();
        this.alertService.showError(error);
      })
    }
  }







  // Messages 
  messageStatus:any = {
    id: 0,
    is_sms_active: true,
    is_whatsapp_active: true,
    send_reports_by: 0,
    client: this.cookieSrvc.getCookieData().client_id
}

  getMessagesStatus(){
    this.messageStatus['loading']= true;

    this.subsink.sink = this.endPoint.getMessagesDetails(this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{
      this.messageStatus['loading'] = false;
      this.messageStatus.id = data[0].id;
      this.messageStatus.is_sms_active = data[0].is_sms_active;
      this.messageStatus.is_whatsapp_active = data[0].is_whatsapp_active;
      this.messageStatus.send_reports_by = data[0]?.send_reports_by || 1; 
    }, (error)=>{
      this.messageStatus['loading'] = false;
      this.messageStatus['error'] = true;
      this.alertService.showError("Failed to get Message Details")
    })
  }

  handleMessageEvent(type: any, e:any, radio: boolean = true){
    this.messageStatus[type] = e;

    this.subsink.sink = this.endPoint.updateMessagesStatus(this.messageStatus).subscribe((data:any)=>{
      if(radio){
        if(type.includes("whats")){
          e ? this.alertService.showSuccess("Active" , "Whatsapp Messages Service") : this.alertService.showInfo("OFF" , "Whatsapp Messages Service")
        }else{
          e ? this.alertService.showSuccess("Active" , "SMS Service") : this.alertService.showInfo("OFF" , "SMS Service")
        }
      }else{
        this.alertService.showSuccess("WhatsApp Communication Settings Updated.");
      }

    },(error)=>{
      this.alertService.showError("failed to update message status", error?.error?.Error || error?.error?.error || error)
    })
  }




  // referral settings 

  refSettings : any = [
    {
      id: 0,
      is_calculation_by_total: false,
      is_calculation_by_net_total: true,
      due_clear_patients: true,
      discount_by_doctor: false,
      client: this.cookieSrvc.getCookieData().client_id
  }
  ]

  getRefDOcSettings(){
    this.subsink.sink = this.endPoint.getRefDocSettings(this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{

      this.refSettings = data[0];
    }, (error)=>{

      this.alertService.showError(error)
    })
  }


  changeRefDocValue(e: any, typeTrue: any, typeFalse : any){
    this.refSettings[typeTrue] = e;
    this.refSettings[typeFalse] = !e;
    this.updateRefDoc();
  }

  changeDueNDisRefSettings(e:any, type: any){
    this.refSettings[type] = e;
    this.updateRefDoc();
  }

  updateRefDoc(){
    this.subsink.sink = this.endPoint.updateRefSetting(this.refSettings).subscribe((res: any)=>{
      this.alertService.showSuccess("Referral Doctor Setting updated successfully");
    }, (error)=>{
      this.alertService.showError(error)
    })
  }










  defaultTechDoctor: any = null;
  defaultRadDoctor: any = null;
  NewdefaultDocObj : boolean = false;

  
  getDefaultDoctors(){
    // this.subsink.sink = this.endPoint.getDefaultConsultingDoctors().subscribe((res: any)=>{
    //   if(res && res.length != 0){
    //     this.defaultTechDoctor = res.find((doc: any)=> doc.department_flow_type == 1).consulting_doctor || null;
    //     this.defaultRadDoctor = res.find((doc: any)=> doc.department_flow_type == 2).consulting_doctor || null;
    //     this.NewdefaultDocObj = false;
    //   }else{
    //     this.NewdefaultDocObj =true
    //   }
    // })
  }


  selectCDefaultConsultingDoc(e: any, flow: any, obj: any = null){
    const model = {
      department_flow_type: flow,
      consulting_doctor: e?.id || null
    }
    this.subsink.sink = this.endPoint.PostDefaultDoctors(model).subscribe((res : any)=>{
        this.getDefaultDoctors();
    },(error)=>{
      this.alertService.showError("Error in setting the default doctor")
    })
  }





  date: string = this.timeSrvc.getTodaysDate();
  from_date: string = "";
  to_date: string = "";
  activeAccordion: string = "";
  messageStatic :  any ;
  api: any = "business_messaging_stats"
  stat_loading: boolean = false;
  getMessagesStatistics(){
    this.stat_loading = true
    this.subsink.sink = this.endPoint.getMessageStats(
      this.cookieSrvc.getCookieData().client_id,
      this.date, this.from_date, this.to_date, this.api
    ).subscribe((response : any)=>{
      this.stat_loading = false
      this.messageStatic = response
    },(error: any)=>{
      this.stat_loading = false
    })
  }

  getRangeValue(e:any){
    if(e.length !== 0){
      if(e.includes("to")){
        this.separateDates(e);
      }else{
        this.date = e;
        this.from_date = "";
        this.to_date = "" ;
        this.getMessagesStatistics();
      }}
      else{
        this.date = this.timeSrvc.getTodaysDate();
        this.from_date = "";
        this.to_date = "";
        this.getMessagesStatistics();
      }
  }

  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.from_date = startDate;
    this.to_date = endDate ;
    this.date = "";
    this.getMessagesStatistics();
  }

  withoutSpecChars(e: any) {
    return e.replace(/\n/g, '<br>')
  }

  title = '';
  openXl(content: any, sz:string = 'lg', cntrd:boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.getMessagesStatistics();
    this.getMessagesAdded();
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop});
  }



  messages_included: any = null;

  getMessagesAdded(){
    if(!this.messages_included){
      this.subsink.sink = this.endPoint.getMessagesAdded().subscribe((res: any)=>{
        this.messages_included = res[0];
      }, (error)=>{
        this.alertService.showError(error.error?.Error);
      })
    }


  }

  toggleMessagesTemplate(template: any, e: any){
    if(e){
      if(!this.messages_included.templates.includes(template.id)){
        this.messages_included.templates.push(template.id);
        this.updateMsgTemplate(this.messages_included);
      }
    }else{
      if(this.messages_included.templates.includes(template.id)){
        this.messages_included.templates = this.messages_included.templates.filter((temp: any)=> temp != template.id);
        this.updateMsgTemplate(this.messages_included);
      }
    }

  }

  updateMsgTemplate(model: any){
    this.subsink.sink = this.endPoint.updateMessageTemplates(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Saved.")
    }, (error)=>{
      this.alertService.showError(error.error?.Error || error?.error?.error)
    })
  }





  phlebotomist_settings: any ;
  heightArray : any  = [] ;


  getPhlebotomistBarCode(){

    const heightsArray = [];

    for (let height = 4; height <= 500; height += 2) {
        heightsArray.push(height);
    }

    this.heightArray = heightsArray ;
    
    this.subsink.sink = this.endPoint.getPhlebotomistSetting().subscribe((res: any)=>{
      this.phlebotomist_settings = res.length != 0 ? res[0] : null;
    })
  }

  updatePhlebotomistBarcode(type: any, e: any){
    this.phlebotomist_settings[type] = e.target.value;

    this.subsink.sink = this.endPoint.updatePhlebotomistBarcodeSettings(this.phlebotomist_settings).subscribe((res: any)=>{
      this.alertService.showSuccess("Settings Saved Successful")
    })
  };

  returnInt(e: any){
    return parseInt(e);
  }



  // sendEmail(to: string[], subject: string, text: string): Observable<any> {
  //   const body = {
  //     to,
  //     subject,
  //     text
  //   };

  //   return this.http.post(this.apiUrl, body, {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json'
  //     })
  //   });
  // }

}
