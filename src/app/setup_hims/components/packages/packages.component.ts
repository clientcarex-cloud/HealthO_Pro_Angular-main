import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { HIMSSetupEndpoint } from '../services-hims/hmis.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
})

export class PackagesComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    
    private endPoint: HIMSSetupEndpoint,
    private masterEndpoint: MasterEndpoint,

    private cookieSrvc: CookieStorageService
  ){ super(injector) } ;

  page_size: any = 10 ;
  page_number: number = 1 ;
  count: number = 1 ;
  all_count: number = 0 ;

  query: string = "" ;
  dept: string = "" ;
  date: string = "";
  from_date: string = "";
  to_date: string = "";

  global_packages: any = [] ;
  departments: any = [] ;
  
  timer: any ;
  selectDept: any = null;

  selected_item : any = null ;

  override ngOnInit(): void {
    // this.getDepartments() ;
    this.getData() ;
  }

  getDepartments(){
    this.subsink.sink = this.masterEndpoint.getDepartments().subscribe((data: any) => {
      this.departments = data.filter((d: any) => d.is_active);
    })
  }
  
  getData() {

    this.subsink.sink = this.endPoint.getPackages(
      this.page_size, this.page_number, this.query
    ).subscribe((data: any) => {
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.global_packages = data.results
    }, (error)=>{
      this.showAPIError(error);
    })

  }

  concatenateShortCodes(data: any) {

    const model = {
      name : '',
      count : 0
    }

    if(data.lab_tests?.length > 0){
      data.lab_tests.forEach((d : any)=>{
        model.name += d.name+ ", ";
        model.count ++ 
      })
    }

    if(data.consultations?.length > 0){
      data.consultations.forEach((d: any)=>{
        model.name += d.labdoctors.name+ ", ";
        model.count ++ 
      })
    }

    if(data.rooms?.length > 0){
      data.rooms.forEach((d: any)=>{
        model.name += d.name+ ", ";
        model.count ++ 
      })
    }

    if(data.services?.length > 0){
      data.services.forEach((d: any)=>{
        model.name += d.name+ ", ";
        model.count ++ 
      })
    }

    return model
  }

  selectDepartment(e: any) {

    if (e && e !== "") {
      this.dept = e.id;
      this.selectDept = e;
      this.getData();
    } else {
      this.dept = "";
      this.selectDept = null;
      this.getData();
    }

  }
  
  searchQuery(e: any) {
    this.query = e;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
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

  openPackage(item: any, content: any){
    this.selected_item = item ;
    this.openModal(content, { size: "lg", centered: true})
  }

  updateIsActive(model: any, val:any){
    model.is_active = val ; 
    this.updatePackage(model) ;
  }

  updatePackage(model: any){
    model['last_updated_by'] = this.cookieSrvc.getCookieData()?.lab_staff_id ;
    this.subsink.sink = this.endPoint.updatePackage(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.name} updated.`) ;
      this.getData() ;
    }, (error)=>{
      this.alertService.showError(error?.error?.Error || error?.error?.error || error )
    })
  }


  // utilities 

  formatCurrency(bill: any): any {
    if (bill) {
      const curr = parseInt(bill).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });
      return curr;
    } else {
      return 0
    }
  }

  getFormatedVal(num:any){
    return parseFloat(num.replace(/,/g, ''))
  }
  
}