import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { debounceTime, Subject } from 'rxjs';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';

@Component({
  selector: 'app-add-lab',
  templateUrl: './add-lab.component.html'
})

export class AddLabComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private formBuilder : FormBuilder,
    private cookieSrvc: CookieStorageService,
    private endPoint: OutsourcingEndpoint,
    private proEndpoint: ProEndpoint,
    private signupEndpoint: SignUpEndpoint,
  ){ super(injector)}

  private searchTermSubject: Subject<any> = new Subject<any>();

  @Input() is_initiator: boolean = true ;
  @Input() lab: any = null ;

  @Output() saved: any = new EventEmitter() ;

  activeTab: any = 1;
  organizations: any = [];
  is_loading: boolean = false;
  searchTerm: string = '';


  policyTypes: any = [] ;

  private b_id!: number ;

  override ngOnInit(): void {

    this.subsink.sink = this.proEndpoint.getPaymentPolicies().subscribe((res: any)=>{
      this.policyTypes = res ;
    })

    this.searchTermSubject.pipe(debounceTime(300)).subscribe(value => this.getOrganizations() );
    this.initializeForm();

    if(this.lab){
      this.baseForm.patchValue({
        // acceptor: [null],
        organization_name : this.lab?.organization_name || this.lab?.partner?.organization_name,
        phone_number: this.lab?.phone_number || this.lab?.partner?.phone_number,
        lab_code: this.lab?.lab_code,
        address: this.lab?.address,
      
        description: this.lab?.address,
        credit_payment: this.lab?.credit_payment,
        min_paid_amount: this.lab?.min_paid_amount,
        min_print_amount: this.lab?.min_print_amount,

        type: this.lab?.type?.id
      });

      this.baseForm.get('organization_name')?.disable() ;
      this.baseForm.get('phone_number')?.disable() ;
    }

    this.subsink.sink = this.signupEndpoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{
      this.b_id = data[0].id;
    })
  }

  initializeForm(){
    this.baseForm = this.formBuilder.group({
      // acceptor: [null],
      organization_name : [null, Validators.required],
      phone_number: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      lab_code: [null],
      address: [null],
    
      description: [''],
      credit_payment: [false],
      min_paid_amount: [0.00],
      min_print_amount: [0.00],

      type: [1, Validators.required]
    })
  }


  showOrgs(e: any){
    this.searchTerm = e;
    this.is_loading = true;
    this.searchTermSubject.next('')
  }

  acceptorSelected(e: any){
    if(e && e!= ''){
      this.baseForm.get('acceptor')?.setValue(e);
    }else{
      this.baseForm.get('acceptor')?.setValue(null);
    }

  }


  creditPaymentChange(e: any) {
    const isCash = parseInt(e.target.value); // Convert to boolean as value will be a string

    this.baseForm.get('type')?.setValue(isCash);
    if (isCash == 2) {
      // If "Cash" is selected, you might want to set different values
      this.baseForm.get("min_paid_amount")?.setValue(0);
      this.baseForm.get("min_print_amount")?.setValue(0);
    } else {
      // If "Credit" is selected, set these different values
      this.baseForm.get("min_paid_amount")?.setValue(100); // Example value for Credit
      this.baseForm.get("min_print_amount")?.setValue(100); // Example value for Credit
    }
  }
  

  getOrganizations(searchTerm: any = this.searchTerm){
    this.subsink.sink = this.endPoint.getOrganizations(searchTerm).subscribe((res: any)=>{
      this.is_loading = false;
      this.organizations = res;
    })
  }


  getModel(){
    const model: any = {
      acceptor: null,
      initiator: null,

      organization_name : this.baseForm.get('organization_name')?.value,
      phone_number: this.baseForm.get('phone_number')?.value,
      lab_code: this.baseForm.get('lab_code')?.value,
      address: this.baseForm.get('address')?.value,

      description: this.baseForm.get('description')?.value,

      credit_payment:  this.baseForm.get('credit_payment')?.value,

      min_print_amount: this.baseForm.get('min_print_amount')?.value,
      min_paid_amount: this.baseForm.get('min_paid_amount')?.value,

      type: this.baseForm.get('type')?.value,

      is_referral_lab: true,
      is_active: true,
      is_two_way: false,

    }

    if(this.is_initiator){
      model.initiator = this.b_id ;
    }else{
      model.acceptor = this.b_id ;
    }

    if(this.lab){
      model.initiator = this.lab.initiator ;
      model.acceptor = this.lab.acceptor ; 
    }

    return model;
  }


  override saveApiCall(): void {

    if(this.baseForm.valid){
      const model = this.getModel();

      if(!this.lab){
        this.postLab(model) ;
      }else{
        model['id'] = this.lab?.id ;
        this.updateCollab(model) ;
      }

    }else{
      this.showBaseFormErrors();
    }


  }

  postLab(model: any){
    this.subsink.sink = this.endPoint.postCollab(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Saved.");
      this.saved.emit({}) ;
      this.baseForm.reset();
      this.modalService.dismissAll();
    }, (error)=>{

      if(error?.error?.Error?.includes('exists!')){
        this.alertService.showError(error.error.Error);
      }else{
        this.showAPIError(error);
      }
      
    })
  }

  updateCollab(model: any){
    this.subsink.sink = this.endPoint.updateCollab(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Saved.");
      this.saved.emit({}) ;
      this.baseForm.reset();
      this.modalService.dismissAll();
    }, (error)=>{

      if(error?.error?.Error?.includes('exists!')){
        this.alertService.showError(error.error.Error);
      }else{
        this.showAPIError(error);
      }
      
    })
  }


  // sourcing lab tests 
  query: any = "";
  timer: any ;
  page_number: number = 1;
  page_size: any = 10;
  all_count: any ;
  global_tests: any ;
  departments: any ;

  dept: any = '';

  selectDepartment(e: any) {

    if (e && e !== "") {
      this.dept = e.id;
      this.page_number = 1;
      this.getData();
    } else {
      this.dept = "";
      this.page_number = 1;
      this.getData();
    }

  }

  getDepartment(){
    this.subsink.sink = this.endPoint.getSourcingDepartments(
      this.baseForm.get('acceptor')?.value.id
    ).subscribe((res: any)=>{
      this.departments = res ;
    })
  }

  getData(){
    this.subsink.sink = this.endPoint.getSourcingTests(
      this.baseForm.get('acceptor')?.value.id, this.query, this.page_number, this.page_size, this.dept
    ).subscribe((res: any)=>{
      this.global_tests = res.results;
      this.all_count = res.count;
    })
  }

  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page_number = 1;
      this.page_size = 10;
      this.getData();
    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e: any) {
    this.page_size = e.target.value;
    this.getData()
  }

  onPageChange(e: any) {
    this.page_number = e;
    this.getData();
  }

}
