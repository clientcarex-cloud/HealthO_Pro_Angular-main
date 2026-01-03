import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ClientEndpoint } from 'src/app/client/clients.endpoint';

@Component({
  selector: 'app-globalsettings',
  templateUrl: './globalsettings.component.html',
  styleUrl: './globalsettings.component.scss'
})
export class GlobalsettingsComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: ClientEndpoint,
    private spinner: NgxSpinnerService,
    public timeSrvc: TimeConversionService
  ){ super(injector) }

  whatsAppMessage: any = true ;
  smsMessage: any = true ;

  smsLoading: any = false;
  waLoading: any = false;

  openedSetting: any ;


  override ngOnInit(): void {
    this.getMessagingData();
  }

  getMessagingData(){

    // this.spinner.show();
    this.smsLoading = true ; 

    this.subsink.sink = this.endPoint.getGlobalMessagingSettings().subscribe((res: any)=>{

      this.smsLoading = false ;
      this.waLoading = false;

      this.smsMessage = res.results.find((type: any)=> type.type.id == 1);
      this.whatsAppMessage = res.results.find((type: any)=> type.type.id == 2);
    },(error)=>{
      this.alertService.showError(error?.error?.Error);
    })
  }

  saveMessageSetting(model: any){
    this.subsink.sink = this.endPoint.updateGlobalMessaginSettings(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Setting Updated.");
      this.getMessagingData();
      this.modalService.dismissAll();
    },(error)=>{
      this.getMessagingData()
      this.alertService.showError(error?.error?.Error);
    })
  }

  toggleMessaging(content: any, e: any, type: any){
    const model: any = {
      id : type,
      is_active: e,
      type: type
    }
    if(e){
      model['remarks'] = ''
      this.saveMessageSetting(model);
    }else{
      this.openedSetting = model ;
      this.openModal(content, { size: '' })
    }

  }
  

  enterMessageRemarks(e: any){
    this.openedSetting['remarks'] = e
  }

  saveRemarksForMessaging(){
    if(this.openedSetting.remarks && this.openedSetting.remarks!= ''){
      this.saveMessageSetting(this.openedSetting);
    }
  }
  
}
