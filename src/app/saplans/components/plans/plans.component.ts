import { Component, Injector } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ClientEndpoint } from 'src/app/client/clients.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
})
export class PlansComponent extends BaseComponent<any> {


  constructor(
    injector: Injector,
    private endPoint: ClientEndpoint,
    public timeSrvc: TimeConversionService,
    private router : Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private cookieSrvc: CookieStorageService
  ){
    super(injector);
  }

  count!: number;
  all_count!: number;
  plans!: any;
  date: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;
  page_size!: any;
  page_number!: any;
  query!: string;
  sort: boolean =false;

  sub_types: any ; 
  cal_types: any ;
  pr_cal_types: any ;

  menus: any ;

  override ngOnInit(): void {
    this.page_number = 1;
    this.page_size = 10;
    this.query = "";
    this.getData();

    this.initializeForm();

  

    this.subsink.sink = this.endPoint.getSubsType().subscribe((res: any)=>{
      this.sub_types = res;
      this.baseForm.get('subscription_type')?.setValue(res[1])
    });

    this.subsink.sink = this.endPoint.getCalsType().subscribe((res: any)=>{
      this.cal_types = res.filter((r: any)=> r.subscription_type == 1);
      this.pr_cal_types = res.filter((r: any)=> r.subscription_type == 2);

      // this.baseForm.get('calculation_type')?.setValue(this.cal_types[1])
    });

    this.getAllModules();


  }

  pageLoading: boolean = false;

  initializeForm(){
    this.baseForm = this.formBuilder.group({
      name: ['', Validators.required],
      plan_description: [''],
      plan_validity_in_days: ['',Validators.required],

      plan_price: [0, Validators.required],
      grace_period: [0],

      subscription_type: [null, Validators.required],
      calculation_type: [null, Validators.required],

      modules: [null]

    })
  }

  getData() {
    this.pageLoading= true;
    this.plans = [];
    this.subsink.sink = this.endPoint.getPlans(
      this.page_size, this.page_number, this.query, this.date, this.from_date, this.to_date, this.sort
    ).subscribe((data: any) => {
      this.pageLoading= false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.plans = data.results;
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

  setCalcType(){
    const type = this.baseForm.get('subscription_type')?.value?.id ;
    if(type == 1){
      this.baseForm.get('plan_price')?.setValue(0);
    }else{
      this.baseForm.get('plan_price')?.setValue(null);
    }
  }


  toggleDefault(org: any, checkBox: any){
    
    this.spinner.show();

    const model = org ;

    model.is_default_plan = !model.is_default_plan ; 
    model.calculation_type = model.calculation_type.id;
    model.subscription_type = model.subscription_type.id;
    model.created_by = model.created_by.id;
    model.last_updated_by = this.cookieSrvc.getCookieData().s_id;
    
    this.subsink.sink = this.endPoint.updatePlan(model).subscribe((res: any)=>{
      this.getData();
    }, (error)=>{
      this.alertService.showError(error?.error?.Error)
    })
  }


  getPlanModel(){
    const sub_type = this.baseForm.get('subscription_type')?.value?.id ;

    let mods: any = this.baseForm.get('modules')?.value || [] ;

    if(mods){
      const temp = mods;
      mods = [];
      temp.forEach((t: any)=>{
        mods.push(t.id);
      })
    }

    const model: any = {
      name: this.baseForm.get('name')?.value,
      plan_description: this.baseForm.get('plan_description')?.value,
      plan_validity_in_days: this.baseForm.get('plan_validity_in_days')?.value,
      grace_period: this.baseForm.get('grace_period')?.value,
      subscription_type: sub_type,
      plan_price:  this.baseForm.get('plan_price')?.value,
      calculation_type: sub_type == 1 ? 0 : this.baseForm.get('calculation_type')?.value?.id,
      created_by: this.cookieSrvc.getCookieData().s_id,
      last_updated_by: this.cookieSrvc.getCookieData().s_id,

      modules: mods
      
    }

    return model ;

  }



  savePlan(){
    
    if(this.baseForm.valid){
      const model = this.getPlanModel();

      this.subsink.sink = this.endPoint.postPlan(model).subscribe((res: any)=>{
        this.baseForm.reset();
        
        this.alertService.showSuccess("Plan Created", `${model.name}`);
        this.modalService.dismissAll();
        this.getData();
      }, (error)=>{
        this.alertService.showError(error?.error?.Error);
      })
    }else{
      this.submitted = true;
      this.alertService.showInfo("Please fill all mandatory fields.")
    }
  }

  getAllModules(){
    this.subsink.sink = this.endPoint.getAllMenus().subscribe((res: any)=>{
      this.menus = res;
      this.menus?.forEach((menu: any)=>{
        menu.is_active = false;
      })
    })
  }

  getMenusText(modules: any){
    let text = '' ;

    modules.forEach((m: any)=>{
      text += m.label + ', '
    })

    return text
  }


  toggleMenuONOFF(e: any, menu: any){
    menu.is_active = e ;
  }

}
