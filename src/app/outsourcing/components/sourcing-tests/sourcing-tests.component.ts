import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-sourcing-tests',
  templateUrl: './sourcing-tests.component.html',
  styleUrl: './sourcing-tests.component.scss'
})

export class SourcingTestsComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: OutsourcingEndpoint,
    private spinnerSrvc: NgxSpinnerService
  ){ super(injector) }

  @Input() is_referring: boolean  = false ;
  @Input() selected_organization: any ;
  @Input() selected_collab: any ;
  @Input() sourcing_term: any = '' ;
  @Input() b_id: any;

  private inputSubject: Subject<any> = new Subject<any>();

  test_page_number:number = 1;
  test_page_size: any = 10;
  testQuery: any = "";
  test_all_count: any ;
  testLoading: boolean = false ;
  global_tests: any = [] ;

  departments: any = [];

  dept: any = ''  ;
  query:any = '' ;
  timer: any ;
  

  override ngOnInit(): void {
    this.inputSubject.pipe(
			debounceTime(300)  // Adjust the debounce time as neededd
		).subscribe(value => {
			this.bulkRevisePrice(value);
		});

    this.getDepartment() ; 
    this.getTests() ;
  }
  
  getDepartment(){
    this.subsink.sink = this.endPoint.getSourcingDepartments(
      this.selected_organization?.partner?.id || this.b_id,
    ).subscribe((res: any)=>{
      this.departments = res ;
    })
  }

  selectDepartment(e: any) {
    if (e && e !== "") {
      this.dept = e.id;
      this.test_page_number = 1;
      this.getTests();
    } else {
      this.dept = "";
      this.test_page_number = 1;
      this.getTests();
    }
  }

  getTests(){

    this.testLoading = true;
    this.global_tests = [];
    this.test_all_count = 0;

    this.spinnerSrvc.show() ;
    

    if(!this.is_referring){

      this.subsink.sink = this.endPoint.getSourcingTests(
        this.selected_organization.partner.id, this.testQuery, this.test_page_number, this.test_page_size, this.dept
      ).subscribe((res: any)=>{

        this.testLoading = false ;
        
        this.global_tests = res.results;
        this.test_all_count = res.count;
      }, (error)=>{
        this.alertService.showError(error?.error?.Error || error?.error?.error || error) ;
      })
    }else{

      this.subsink.sink = this.endPoint.getRevisedTests(
        this.selected_collab, this.testQuery, this.test_page_number, this.test_page_size, this.dept
      ).subscribe((res: any)=>{

        this.testLoading = false ;

        this.global_tests = res.results;
        this.test_all_count = res.count;
      }, (error)=>{
        this.testLoading = false ;
        this.alertService.showError(error?.error?.Error || error?.error?.error || error) ;
      })
    }

  }

  searchTestQuery(e: any) {
    this.testQuery = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.test_page_number = 1;
      this.getTests();
    }, 500); 
  }

  changeTestPageNumber(e:any){
    this.test_page_size = e.target.value;
    this.test_page_number = 1;
    this.getTests();
  }

  onTestPageChange(e:any){
    this.test_page_number=e;
    this.alertService.showInfo(e);
    this.getTests();

  }


  tests_included: any = [];
  new_included: any = [];

  is_test_added(test: any){
    return this.tests_included.includes(test) || this.new_included.includes(test);
  };

  add_or_remove(test: any){
    if(!this.new_included.includes(test)){
      this.new_included.push(test);
    }
  }

  selectAll(e: any){
    if(e){
      this.global_tests.forEach((test : any) => {
        this.add_or_remove(test.id);
      });
    }else{
      this.new_included= [];
    }
  }

  importTests(){
    if(this.new_included.length != 0){
      const tests = this.new_included.join(',');

      this.subsink.sink = this.endPoint.postTests({
        id : this.selected_collab, tests : tests
      }).subscribe((Res: any)=>{
        this.alertService.showSuccess('Saved')
        this.modalService.dismissAll()
      },(error: any)=>{
        this.alertService.showError(error?.error?.Error || error?.error?.error || error );
      })
    } else{
      this.alertService.showInfo("Select Atleast One Test.")
    }

  }

  
  bulkEnter(e: any){
    this.inputSubject.next(e)
  }

  bulkRevisePrice(e: any){
    this.global_tests.forEach((test: any)=>{
      const rp = test.price * (e/100)
      this.changeRevisedPrice(rp, test);
    })
  }

  changeRevisedPrice(e: any, test: any){
    if(test?.revised_price){
      try{
        test.revised_price['revised_price'] = e.toFixed(2);
      }catch(error){
        test.revised_price['revised_price'] = e;
      }
    }else{
      test['is_new']= true;
      test['revised_price'] = {
        revised_price : e,
        LabGlobalTestId: test.id,
        sourcing_lab: this.selected_collab
      }
    }

  }

  priceSaving: boolean = false ;
  async saveRevisedPrice() {
    let count = 0;
    this.priceSaving = true;
  
    for (const test of this.global_tests) {
      if (!test?.revised_price || test?.is_new) {
        if (!test?.is_new) {
          test['revised_price'] = {
            revised_price: test.price,
            LabGlobalTestId: test.id,
            sourcing_lab: this.selected_collab,
          };
        }
        
        try {
          await this.postRevidedPrice(test.revised_price);
        } catch (error) {
          // Handle the error if necessary

        }
      } else {
        try {
          await this.updateRevisedPrice(test.revised_price);
        } catch (error) {
          // Handle the error if necessary

        }
      }
      
      count++;
      this.checkNGetAgain(count);
    }
  
    // After all requests are completed
    this.getTests();
    this.priceSaving = false;
  }
  

  postRevidedPrice(revisedPrice: any){
    return new Promise((resolve, reject) => {
      this.subsink.sink = this.endPoint.postRevisedTest(revisedPrice).subscribe((res: any)=>{
        resolve(res);
      }, (error: any)=>{
        this.alertService.showError(error?.error?.Error || error?.error?.error || error) ;
        reject(error);
      })
    })
  }

  updateRevisedPrice(revisedPrice: any){
    return new Promise((resolve, reject) => {
      this.subsink.sink = this.endPoint.updateRevisedTest(revisedPrice).subscribe((res: any)=>{
        resolve(res);
      }, (error: any)=>{
        this.alertService.showError(error?.error?.Error || error?.error?.error || error) ;
        reject(error);
      })
    })
  }

  checkNGetAgain(count: any){
    if(count == this.global_tests.length){
      this.getTests();
      this.alertService.showSuccess(`${count} Tests Revised Prices Saved.`);
    }
  }
  



}
