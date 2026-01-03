import { Component, Injector } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { debounceTime, Subject } from 'rxjs';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';

@Component({
  selector: 'app-lab-partner',
  templateUrl: './lab-partner.component.html',
  styleUrl: './lab-partner.component.scss'
})
export class LabPartnerComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private formBuilder : FormBuilder,
    private endPoint: OutsourcingEndpoint,
    private cookieSrvc: CookieStorageService,
    private signupEndpoint: SignUpEndpoint,
  ){ super(injector)}

  private searchTermSubject: Subject<any> = new Subject<any>();

  activeTab: any = 1;
  organizations: any = [];
  is_loading: boolean = false;
  searchTerm: string = '';

  private b_id!: number ;

  override ngOnInit(): void {
    this.searchTermSubject.pipe(
			debounceTime(300)  // Adjust the debounce time as neededd
		).subscribe(value => {
			this.getOrganizations();
		});

    this.initializeForm();


    this.subsink.sink = this.signupEndpoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{
      this.b_id = data[0].id;
    })
  }

  initializeForm(){
    this.baseForm = this.formBuilder.group({
      acceptor: [null],
      description: [''],
      credit_payment: [false],
      min_paid_amount: [0.00],
      min_print_amount: [0.00]
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
    const isCash = e.target.value === 'true'; // Convert to boolean as value will be a string

    this.baseForm.get('credit_payment')?.setValue(isCash);
    if (isCash) {
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
    const model = {
      acceptor: this.baseForm.get('acceptor')?.value.id,
      description: this.baseForm.get('description')?.value,

      credit_payment:  this.baseForm.get('credit_payment')?.value,

      min_print_amount: this.baseForm.get('min_print_amount')?.value,
      min_paid_amount: this.baseForm.get('min_paid_amount')?.value,

      initiator: this.b_id,
      is_active: false,
      is_two_way: false,

    }

    return model;
  }


  override saveApiCall(): void {

    const model = this.getModel();

    this.subsink.sink = this.endPoint.postCollab(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Collaboration Request Sent.");

      this.baseForm.reset();
      this.modalService.dismissAll();
    }, (error)=>{

      if(error?.error?.Error?.includes('exists!')){
        this.alertService.showError(error.error.Error);
      }else{
        this.alertService.showError(error);
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
