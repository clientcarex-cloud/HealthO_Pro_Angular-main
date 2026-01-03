import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { ClientEndpoint } from '../../clients.endpoint';
import { ActivatedRoute } from '@angular/router';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-org',
  templateUrl: './org.component.html',
})

export class OrgComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    public timeSrvc: TimeConversionService,
    private endPoint: ClientEndpoint,
    private route: ActivatedRoute,
    public capitalSrvc: CaptilizeService,
    private spinner: NgxSpinnerService,
    private formBuilder: UntypedFormBuilder,
    private cookieSrvc: CookieStorageService
  ){ super(injector) };

  // creditsForm!: UntypedFormGroup;

  organization: any = null ; 
  title: string = "" ;

  whatsAppPurchaseHistory: any = [];
  SMSPurchaseHistory: any = [];

  dataWhatsApp: any = [
    {label: 'Balance', count: '-', },
    {label: 'Used', count: '-', },
    {label: 'WA Pack', count: '-', toolTip: 'Previously Purchased Credits' },
  ]

  dataSMS: any = [
    {label: 'Balance', count: '-'},
    {label: 'Used', count: '-'},
    {label: 'SMS Pack', count: '-',  toolTip: 'Previously Purchased Credits' },
  ]

  menus: any ;
  accessed_menus: any = [] ;
  menuLoading: boolean = false ;

  sub_plans: any = [] ;

  override ngOnInit(): void {
    this.spinner.show();

    this.route.queryParams.subscribe(params => {
      this.getData(params['org_id']);
    });

    this.baseForm = this.formBuilder.group({
      new_credits : ['', Validators.required],
      remarks : [''],
      service_type: ['']
    });

    this.getAllModules();
  }

  resetBaseForm(){
    this.baseForm.reset();
  }

  getData(id: any = this.organization?.id){
    this.spinner.show()
    this.subsink.sink = this.endPoint.getOrg(id).subscribe((res: any)=>{
      res.organization_name = this.capitalSrvc.AutoName(res.organization_name);
      this.organization = res ;
      this.getCredits();
    })
  }

  getAllModules(id: any = this.organization?.id){
    this.subsink.sink = this.endPoint.getAllMenus().subscribe((res: any)=>{
      this.menus = res;
    })
  }
  
  getMenus(id: any = this.organization?.id){
    this.spinner.show();
    this.menuLoading = true ;

    this.subsink.sink = this.endPoint.getMenus(id).subscribe((res: any)=>{
      this.menuLoading = false ;
      this.accessed_menus = res[0];
    },(error)=>{
      this.alertService.showError(error?.error?.error);
    })
  }


  toggleOrganization(e: any){
    this.spinner.show();

    this.subsink.sink = this.endPoint.postToggleOnOff(this.organization.id).subscribe((res: any)=>{
      this.getData();
    })
  }


  toggleMessagingService(e: any, type: any){
    const model = this.organization.business_settings
    model[type] = e ;

    const messageModel = {
      is_sms_active: model.is_sms_active,
      is_whatsapp_active: model.is_whatsapp_active,
      business: model.business,
      id: model.id,
    }
    
    this.spinner.show();
    this.subsink.sink = this.endPoint.updateBusinessMessaginSettings(messageModel).subscribe((res: any)=>{
      this.getData();
      this.alertService.showSuccess(this.organization.organization_name ,`Messaging Settings Updated.`)
    }, (error)=>{
      this.alertService.showError(error?.error?.Error)
    })
    
  }



  getCredits(){
    this.subsink.sink = this.endPoint.getMessagingCredits(this.organization.id).subscribe((res: any)=>{

      const sms = res.latest.find((type: any)=> type.messaging_service_types == 'SMS') || null;
      const wa = res.latest.find((type: any)=> type.messaging_service_types == 'WhatsApp') || null;

      if(sms){
        this.dataSMS[2].count = sms.new_credits ; 
        this.dataSMS[1].count = sms.total_messages ; 
        this.dataSMS[0].count = sms.new_credits - sms.total_messages ; 
      }

      if(wa){
        this.dataWhatsApp[2].count = wa.new_credits ; 
        this.dataWhatsApp[1].count = wa.total_messages ; 
        this.dataWhatsApp[0].count = wa.new_credits - wa.total_messages ; 
      }

      this.whatsAppPurchaseHistory = res?.whatsapp_history?.reverse() || [] ;
      this.SMSPurchaseHistory = res?.sms_history?.reverse() || [];
    })
  }

  getcreditsModel(){
    const model = {
      b_id : this.organization.id,
      new_credits : this.baseForm.get('new_credits')?.value,
      service_type : this.baseForm.get('service_type')?.value,
      remarks : this.baseForm.get('remarks')?.value,
    }

    return model;
  }

  saveCredits(){
    if(this.baseForm.valid){

      const model = this.getcreditsModel() ; 

      if(model.new_credits > 0){
        this.subsink.sink = this.endPoint.postCredits(model).subscribe((res: any)=>{
        
          this.modalService.dismissAll();
          this.alertService.showSuccess("Credits Saved.");
          this.getCredits();
  
        }, (error)=>{
          this.alertService.showError(error?.error?.Error);
        })
      }else{
        this.alertService.showInfo("Credits Must Be Greater Than Zero.")
      }
    }
  }

  toggleMenuONOFF(e: any, id: any, selectAll: boolean = false){
    let menus = [] ;
    if(selectAll){
      if(e){
        this.menus.forEach((menu: any)=>{
          menus.push(menu.id);
        })
      }
    }else{
      if(e){
        menus = this.accessed_menus.modules ;
        menus.push(id)
      }else{
        menus = this.accessed_menus.modules.filter((menu: any)=> menu != id);
      }
    }


    const model = {
      business: this.organization.id,
      modules: menus
    }
    this.subsink.sink = this.endPoint.updateBusinessModules(model, this.accessed_menus.id).subscribe((res:any)=>{
      this.getMenus();
    }, (error: any)=>{
      this.getMenus();
      this.alertService.showError(error?.error?.Error);
    })

  }


  getPlans(){
    this.spinner.show();
    this.subsink.sink = this.endPoint.getPlans(
      "all", 1, '', '', '', '', true
    ).subscribe((res: any)=>{
      this.sub_plans = [];
      this.sub_plans = res.filter((r: any)=> r.is_active ) ;
    })
  }

  savePlan(){
    const model = {
      b_id: this.organization.id,
      plan: this.selectedPlan.id,
      plan_start_date: this.selectedPlanDate ? this.timeSrvc.getAddedOnTime(this.selectedPlanDate) : null
      // created_by: this.cookieSrvc.getCookieData().s_id,
      // last_updated_by: this.cookieSrvc.getCookieData().s_id
    }
    this.subsink.sink = this.endPoint.postBusinessPlan(model).subscribe((res:any)=>{
      this.selectedPlanDate = null; 
      this.getCurrentPlans();
      this.modalService.dismissAll();
      this.alertService.showSuccess(`${this.selectedPlan.name} added.`)
      this.selectedPlan = null ;
    }, (error: any)=>{
      this.alertService.showError(error?.error?.Error);
    })
  }


  currentPlans: any = [];

  getCurrentPlans(){
    this.subsink.sink = this.endPoint.getBusinessPlan(this.organization.id).subscribe((res: any)=>{
      this.currentPlans = res;
    },(error)=>{
      this.alertService.showError(error?.error?.Error);
    })
  }


  lockAccount(){
    const model = this.organization.subscription_status ;

    model.is_subscription_active = !model.is_subscription_active;

    this.subsink.sink = this.endPoint.updateSubscriptionStatus(model).subscribe((res:any)=>{
      this.getData();
      this.modalService.dismissAll();
      this.alertService.showInfo(`${this.organization.organization_name} ${model.is_subscription_active ?'Unlocked.' : 'Locked.'}`)
    }, (error: any)=>{
      this.getData();
      this.alertService.showError(error?.error?.Error);
    })
  }

  

  // utilities 

  openCreditsModel(content: any, type: any){
    if(type == 1){
      this.title = "Add SMS Credits" ;
    }else{
      this.title = "Add WhatsApp Credits" ;
    }

    this.resetBaseForm();
    this.baseForm.get('service_type')?.setValue(type);
    this.openModal(content, { size: '' })
  }

  // !organization?.is_account_disabled
  returnOrgClass(){
    if(this.organization?.is_account_disabled){
      return "border-danger bg-soft-danger"
    }else{
      return "border-primary bg-soft-primary"
    }
  }


  selectedPlan: any ;
  selectedPlanDate: any = null;

  planSelected(e: any){
    this.selectedPlan = null ;
    if(e && e!='') this.selectedPlan = e ;
  }

  planDateSelected(e: any){
    this.selectedPlanDate = null ;
    if(e && e!= '') this.selectedPlanDate = e ;
  }



}
