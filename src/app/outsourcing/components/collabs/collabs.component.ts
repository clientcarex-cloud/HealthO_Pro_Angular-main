import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { debounceTime, Subject } from 'rxjs';
import test from 'node:test';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-collabs',
  templateUrl: './collabs.component.html'
})
export class CollabsComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private endPoint: OutsourcingEndpoint,
    private cookieSrvc: CookieStorageService,
    private spinnerSrvc: NgxSpinnerService
  ){ super(injector) }

  @Input() sourcing_term: any = '';
  @Input() is_referring: boolean = false;

  b_id!: number ;
  count!: number ;
  all_count!: number;
  collabs!:any;
  timer:any; 
  page_size: any = 10;
  page_number : any = 1;
  query:string = "";
  pageLoading: boolean = false;
  sort : any = false;

  selected_organization : any ;
  initiator: any;
  global_tests: any ;
  test_page_number:number = 1;
  test_page_size: any = 10;
  testQuery: any = "";
  test_all_count: any ;

  departments: any ;

  dept: any = '';
  selected_collab: any ;

  private inputSubject: Subject<any> = new Subject<any>();


  override ngOnInit(): void {

    this.inputSubject.pipe(
			debounceTime(300)  // Adjust the debounce time as neededd
		).subscribe(value => {
			this.bulkRevisePrice(value);
		});
    
    this.page_number = 1;
    this.query = '';
    this.b_id = this.cookieSrvc.getCookieData().b_id;
    this.getData();

  }
  
  changeSorting(){
    this.sort = !this.sort;
    this.getData();
  }

  getData(){
    this.collabs = [];
    this.pageLoading = true;

    this.subsink.sink = this.endPoint.getPartnerships(
      this.query, this.sourcing_term, this.b_id, this.page_size, this.page_number, true
    ).subscribe((res: any)=>{
      this.collabs = res.results;
      this.pageLoading = false;
      this.count = Math.ceil(res.count / this.page_size)
      this.all_count = res.count;
    });
  
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

  changePageNumber(e:any){
    this.page_size = e.target.value;
    this.page_number = 1;
    this.getData()
  }

  onPageChange(e:any){
    this.page_number=e;
    this.getData();
  }



  getImportedTests(){
    this.subsink.sink = this.endPoint.getImportedTests(this.initiator, this.selected_collab).subscribe((res: any)=>{
      this.tests_included = res.imported_tests
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

  getDepartment(){
    this.subsink.sink = this.endPoint.getSourcingDepartments(
      this.selected_organization?.partner?.id || this.b_id,
    ).subscribe((res: any)=>{
      this.departments = res ;
    })
  }

  openTests(sourcingContent: any,  globalTestsContent: any, collab: any){
    this.selected_organization = collab; 
    this.initiator = collab.initiator;
    this.selected_collab = collab.id;

    if(collab?.acceptor){
      this.testQuery = "";
      this.dept = '';
      this.test_page_number = 1;
      this.test_page_size = 10;
  
      this.getDepartment();
      this.getImportedTests();
      this.getTests();

      this.openModal(sourcingContent, {size: 'xl', scrollable: true, centered : true }); 
    }else{
      this.openModal(globalTestsContent, {size: 'xl', scrollable: true, centered: true }); 
    }


  }



  bills(content: any, collab: any){
    this.query = "";
    this.page_number = 1;
    this.page_size = 10;

    this.selected_organization = collab; 
    this.initiator = collab.initiator;
    this.selected_collab = collab.id;
    
    this.openModal(content, {size: 'xl', scrollable: true}); 
  }


  testLoading: boolean = false ;

  getTests(){

    this.testLoading = true;
    this.global_tests = [];

    this.spinnerSrvc.show() ;
    

    if(!this.is_referring){

      this.subsink.sink = this.endPoint.getSourcingTests(
        this.selected_organization.partner.id, this.testQuery, this.test_page_number, this.test_page_size, this.dept
      ).subscribe((res: any)=>{
        this.testLoading = false ;
        this.global_tests = res?.results || res;
        this.test_all_count = res.count;
      }, (error)=>{
        this.alertService.showError(error?.error?.Error || error?.error?.error || error) ;
      })
    }else{

      this.subsink.sink = this.endPoint.getRevisedTests(
        this.selected_collab, this.testQuery, this.test_page_number, this.test_page_size, this.dept
      ).subscribe((res: any)=>{
        this.testLoading = false ;
        this.global_tests = res?.results || res;
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
        if(!this.tests_included?.includes(test.id)){
          this.add_or_remove(test.id);
        }
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

      this.alertService.showInfo("All tests already imported.")

    }

  }


  loginAccess(lab: any){
    const model = {
      sourcing_lab : lab.id
    }
    this.spinnerSrvc.show();
    this.subsink.sink = this.endPoint.postRefLabLoginAccess(model).subscribe((res: any)=>{
      this.getData();
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error) ;
    })
  }


  deleteCollab(model: any){
    this.subsink.sink = this.endPoint.deleteCollab(model.id).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model?.partner?.name} Collabortion Request Cancelled.`);
      this.getData();
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error) ;
    })
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
  


  all_collabs: any ;

  getAllCollabs(){
    
    this.syncTest.source = null ;
    this.syncTest.target = null ;

    this.subsink.sink = this.endPoint.getPartnerships(
      this.query, this.sourcing_term, this.b_id, 'all', this.page_number, true
    ).subscribe((res: any)=>{
      this.all_collabs = res?.results || res;

      this.all_collabs.forEach((collab: any)=>{
        collab['organizationName'] = collab?.organization_name || collab?.partner?.organization_name ; 
      })

      this.pageLoading = false;
    });
  }

  syncSave: boolean = false ;

  syncTest : any = {
    source: null,
    target: null,
  }

  selectSourceTarget(e: any, type: any){
    this.syncTest[type] = e && e!='' ? e : null ;
  }

  syncTests(){
    if(this.syncTest.source && this.syncTest?.target){

      this.syncSave = true ;

      const model = {
        source : this.syncTest.source.id,
        target: this.syncTest.target.id
      }
      this.subsink.sink = this.endPoint.postSyncTests(model).subscribe((res: any)=>{
        this.syncSave = false ;
        this.alertService.showSuccess(`Synced.`)
        this.modalService.dismissAll() ;
      }, (error)=>{
        this.syncSave = false ;
        this.alertService.showError(error?.error?.Error || error?.error?.error || error );
      })
    }else{
      this.alertService.showError("Select All Fields.") ;
    }
  }


  // utilities 

  updateCollab(content: any, collab: any, size: any = ''){
    this.selected_organization = collab ; 
    this.openModal(content, { size: size, centered: true, scrollable: true }) ;
  }
  
  formatIndianNumber(number: number): string {
    const formattedNumber = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(number);
    return formattedNumber;
  }

}
