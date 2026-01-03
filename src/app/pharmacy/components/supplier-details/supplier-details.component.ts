import { Component, Injector, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { FileService } from '@sharedcommon/service/file.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { PharmacyEndpoint } from 'src/app/setup_hims/components/services-hims/pharmacy.endpoint';

@Component({
  selector: 'app-supplier-details',
  templateUrl: './supplier-details.component.html',
})

export class SupplierDetailsComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: PharmacyEndpoint,
    private proEndpoint: ProEndpoint,
    private cookieSrvc: CookieStorageService,
  ){ super(injector) } ;

  @ViewChild('addUpdateSupplier') addUpdateSupplier: any ;

  openAdd(){
    this.selected_item = null ;
    this.openModal(this.addUpdateSupplier, { size: 'lg', centered: true })
  }

  page_size: any = 10 ;
  page_number: number = 1 ;
  count: number = 1 ;
  all_count: number = 0 ;

  query: string = "" ;
  dept: string = "" ;
  date: string = "";
  from_date: string = "";
  to_date: string = "";

  suppliers: any = [] ;
  departments: any = [] ;
  
  sort: boolean = false;
  timer: any ;
  selectDept: any = null;

  selected_item : any = null ;

  operational_types: any ;
  categories: any ;

  override ngOnInit(): void {
    this.getData() ;
    this.getOperationalType();
  }

  getOperationalType(){
    this.subsink.sink = this.proEndpoint.getOperationalTypes().subscribe((data: any) => {
      this.operational_types = data;
    })
  }


  changeSorting() {
    this.sort = !this.sort;
    this.getData();
  }
  
  getData() {
    this.subsink.sink = this.endPoint.getSuppliers(
      this.page_size, this.page_number,
      this.query, '', this.sort
    ).subscribe((data: any) => {
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.suppliers = data.results
    })

  }

  selectedCategory: any = '';
  selectedOperation: any = '' ;

  categorySelect(e: any){
    this.selectedCategory = e && e != '' ? e?.id : '' ;
    this.getData() ;
  }

  operationSelect(e: any){
    this.selectedOperation = e && e != '' ? e?.id : '' ;
    this.getData() ;
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

  updateIsActive(model: any, val:any){
    model.is_active = val ; 
    model.department = model?.department?.id;
    this.updateMedicine(model) ;
  }

  updateMedicine(model: any){
    model['last_updated_by'] = this.cookieSrvc.getCookieData()?.lab_staff_id ;
    this.subsink.sink = this.endPoint.updateMedicine(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.name} updated.`) ;
      this.getData() ;
    }, (error)=>{
      this.showAPIError(error);
    })
  }

  // utilities 


}
