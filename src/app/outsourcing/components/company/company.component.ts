import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { debounceTime, Subject } from 'rxjs';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
})

export class CompanyComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private endPoint: OutsourcingEndpoint,
    private cookieSrvc: CookieStorageService,
    private masterEndpoint: MasterEndpoint,
    private spinner: NgxSpinnerService
  ){ super(injector) }

  @Input() sourcing_term: any = '';
  @Input() is_referring: boolean = true;

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

    this.subsink.sink = this.endPoint.getCompanies(
      this.query, this.page_size, this.page_number
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

    this.subsink.sink = this.masterEndpoint.getDepartments().subscribe((res: any)=>{
      this.departments = res || [];
    })
  }

  openTests(sourcingContent: any,  globalTestsContent: any, collab: any){
    this.selected_organization = collab; 
    this.initiator = collab.initiator;
    this.selected_collab = collab.id;
    this.savingProgress = false ;
    if(true){
      this.testQuery = "";
      this.dept = '';
      this.test_page_number = 1;
      this.test_page_size = 10;
  
      this.getDepartment();
      // this.getImportedTests();
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
    this.initiator = collab?.initiator;
    this.selected_collab = collab.id;
    
    this.openModal(content, {size: 'xl', scrollable: true}); 
  }

  revisedPrice: any = null ;

  getTests(){

    this.revisedPrice = null ;
    
    this.global_tests = [] ;
    this.spinner.show() ;
    
    this.subsink.sink = this.endPoint.getRevisedTestsCompany(
      this.selected_collab, this.testQuery, this.test_page_number, this.test_page_size, this.dept
    ).subscribe((res: any)=>{
      this.global_tests = res.lab_tests.results;
      this.test_all_count = res.lab_tests.count;
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error );
    })
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
        this.alertService.showError(error?.error?.Error || {})
      })
    } else{
      this.alertService.showInfo("Select Atleast One Test.")
    }

  }


  deleteCollab(model: any){
    this.subsink.sink = this.endPoint.deleteCollab(model.id).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model?.partner?.name} Collabortion Request Cancelled.`);
      this.getData();
    }, (error)=>{
      this.alertService.showError(error)
    })
  }


  bulkEnter(e: any){
    this.inputSubject.next(e)
  }

  bulkRevisePrice(e: any){
    // this.alertService.showError(e);
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
        company: this.selected_collab
      }
    }

  }


  savingProgress: any = false ;

  async saveRevisedPrice() {
    let count = 0;
  
    this.savingProgress = true ;

    for (const test of this.global_tests) {
      if (!test?.revised_price || test?.is_new) {
        if (!test?.is_new) {
          test['revised_price'] = {
            revised_price: test.price,
            LabGlobalTestId: test.id,
            company: this.selected_collab,
          };
        }
        try {
          await this.postRevidedPrice(test.revised_price);
        } catch (error) {
          // Handle the error if necessary
        }
        count++;
        this.checkNGetAgain(count);
      } else {
        try {
          await this.updateRevisedPrice(test.revised_price);
        } catch (error) {
          // Handle the error if necessary
        }
        count++;
        this.checkNGetAgain(count);
      }
    }
  
    // Call getData after all requests have been processed
    this.getData();
  }
  

  postRevidedPrice(revisedPrice: any){
    return new Promise((resolve, reject) => {
      this.subsink.sink = this.endPoint.postCompanyRevisedTest(revisedPrice).subscribe((res: any)=>{
        resolve(res);
      }, (error: any)=>{
        this.alertService.showError(error?.error?.Error || error?.error?.error || error) ;
        reject(error);
      })
    })
  }

  updateRevisedPrice(revisedPrice: any){
    return new Promise((resolve, reject) => {
      this.subsink.sink = this.endPoint.updateCompanyRevisedTest(revisedPrice).subscribe((res: any)=>{
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
      this.savingProgress = false ;
      this.alertService.showSuccess(`${count} Tests Revised Prices Saved.`);
    }
  }



  editCompany(content: any ,item: any){
    this.selected_collab = item ;
    this.openModal(content, { size: '', centered: true })
  }


  saveCompany(model: any){
    this.subsink.sink = this.endPoint.updateCompany(model.modal).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.modal.name} saved.`);
      this.modalService.dismissAll();
      this.getData();
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error ) ;
    })
  }

}
