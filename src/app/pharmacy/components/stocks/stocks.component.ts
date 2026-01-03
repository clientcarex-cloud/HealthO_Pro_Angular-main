import { Component, Injector, Input, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { FileService } from '@sharedcommon/service/file.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { Validators } from 'ngx-editor';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { PharmacyEndpoint } from 'src/app/setup_hims/components/services-hims/pharmacy.endpoint';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
})

export class StocksComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private endPoint: PharmacyEndpoint,
    private proEndpoint: ProEndpoint,
    private cookieSrvc: CookieStorageService,
    private fileSrvc: FileService,
    private printSrvc: PrintService,
    private spinner: NgxSpinnerService
  ){ super(injector) } ;

  @Input() hideTitle: boolean = false ; 


  @ViewChild('addUpdate') addUpdate: any ;

  openAdd(){
    this.selected_item = null;
    this.openModal(this.addUpdate, { size: '', centered: true, scrollable: true })
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

  global_stocks: any = [] ;
  departments: any = [] ;
  
  timer: any ;
  selectDept: any = null;

  selected_item : any = null ;

  operational_types: any ;
  categories: any ;
  taxTypes: any ;

  override ngOnInit(): void {
    this.getData() ;
    this.getTaxTypes();
    this.getCategories();
    this.getOperationalType();
  }

  getTaxTypes(){
    this.subsink.sink = this.proEndpoint.getTaxTypes().subscribe((res: any)=>{
      this.taxTypes = res.filter((tax: any)=> tax.is_active) ;
      // this.baseForm.get('tax_type')?.setValue(res[0]);
    })
  }

  initializeBaseForm(){
    this.baseForm = this.formBuilder.group({
      // item: [null, Validators.required],
      batch_number: [null],
      expiry_date: [null],
      tax_type: [null],
      tax: [0],
      discount: [0, Validators.required],
      packs: [1, Validators.required],
      price: [null, Validators.required],
      rate: [null, Validators.required],
      quantity: [1, Validators.required],
      total_amount: [null]
    });
  }

  getOperationalType(){
    this.subsink.sink = this.proEndpoint.getOperationalTypes().subscribe((data: any) => {
      this.operational_types = data;
    })
  }

  getCategories(){
    this.subsink.sink = this.endPoint.getCategory().subscribe((data: any) => {
      this.categories = data;
    })
  }

  sort: boolean = false ;
  
  getData() {
    this.subsink.sink = this.endPoint.getStocks(
      this.page_size, this.page_number, this.query, this.selectedCategory, this.selectedOperation
    ).subscribe((data: any) => {
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.global_stocks = data?.results || data ; 
    }, (error)=>{
      this.showAPIError(error);
    })

  }

  selectedCategory: any = '';
  selectedOperation: any = '' ;

  categorySelect(e: any){
    this.selectedCategory = e && e != '' ? e?.id : '' ;
    this.page_number = 1 ;
    this.getData() ;
  }

  operationSelect(e: any){
    this.selectedOperation = e && e != '' ? e?.id : '' ;
    this.page_number = 1 ;
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
    model.category = model.category?.id ;
    model.operation_type = model.operation_type?.id ;
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

  inProgress: boolean = false ;
  saveBulkMedicines(){
    if(this.fileName != ''){
      if(this.otherData.length != 0 ){
        if(this.ValidationErrors == ''){
          this.inProgress = true ;
          this.subsink.sink = this.endPoint.postMedicine(this.otherData)?.subscribe((res: any)=>{
            this.inProgress = false;
            this.page_number = 1 ;
            this.getData();
            this.resetExcel(null);
            this.modalService.dismissAll();
            this.alertService.showSuccess("Saved.");
          }, (error)=>{
            this.inProgress = false;
            this.showAPIError(error)
          })
        }else{
          this.alertService.showError("Clear the errors, upload file and save again.")
        }
      }else{
        this.alertService.showInfo(`No Data Availiable found in ${this.fileName} file.`)
      }
    }else{
      this.alertService.showInfo('Upload File');
    }
  }

  // utilities 

  keys: any = [] ;
  otherData: any;
  fileName: any= "" ;

  onFileChanged(event: any){
    const file = event.target.files[0];

    if (file) {
      this.spinner.show();
      this.ValidationErrors = '' ;

      this.fileSrvc.excelToJson(file).then((data: string) => {
        this.fileName = file.name ;
        this.validateJsonData(data) ;
        this.otherData = data ;

        this.keys = this.getAllKeysFromJson(data) ;
        this.spinner.hide();
      });

    }
  }

  ValidationErrors : any = '';

  validateJsonData(jsonData: any): boolean {
    // Check if jsonData is an array
    if (!Array.isArray(jsonData)) {
      console.error('The provided data is not an array.');
      return false;
    }
  
    // Validate each entry in the array
    for (let index = 0; index < jsonData.length; index++) {
      const entry = jsonData[index];
  
      // Check if 'name' is present
      if (!entry.hasOwnProperty('name')) {
        this.ValidationErrors += `Validation failed at row ${index + 1}: "name" is missing, `
        // return false; // Stop on first failure
      }
  
      if (!entry.hasOwnProperty('category')) {
        this.ValidationErrors += `Validation failed at row ${index + 1}: "category" is missing, `
      }

      if (!entry.hasOwnProperty('operation_type')) {
        this.ValidationErrors += `Validation failed at row ${index + 1}: "operation_type" is missing, `
      }

    }
  
    // If all validations pass, return true
    return true;
  }

  // Utility function to get all key-value pairs from an object
  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj); // Return key-value pairs
  }
    
  getAllKeysFromJson(jsonData: any): string[] {
    const allKeys = new Set<string>();
  
    jsonData.forEach((item: any) => {
      Object.keys(item).forEach((key) => {
        allKeys.add(key); // Add each key to a Set to ensure uniqueness
      });
    });
  
    return Array.from(allKeys); // Convert Set to Array
  }

  resetExcel(file: any){
    this.otherData = null; 
    this.ValidationErrors = ''; 
    this.keys=[] ;
    if(file) file.value = ''; 
  }

  test(){
    this.printSrvc.exportToExcel(this.testContent, "Example_excel")
  }

  testContent= `
<table border="1">
  <thead>
    <tr>
      <th>name</th>
      <th>category</th>
      <th>operation_type</th>
      <th>short_code</th>
    </tr>
  </thead>
  <tbody>
    <tr><td></td><td></td><td></td><td></td></tr>
  </tbody>
</table>

  `


  openSelected(item: any){
    this.selected_item = item ;

    if(this.baseForm) this.baseForm.reset();
    this.initializeBaseForm();
    this.baseForm.get('item')?.setValue(item.item) ;
    this.baseForm.get('batch_number')?.setValue(item?.batch_number || null );
    this.baseForm.get('expiry_date')?.setValue(item?.expiry_date || null);
    this.baseForm.get('price')?.setValue(item?.price);
    this.baseForm.get('rate')?.setValue(item?.cost);
    this.baseForm.get('quantity')?.setValue(item?.available_quantity);
    this.baseForm.get('packs')?.setValue(item?.packs);
    this.baseForm.get('tax')?.setValue(item.tax) ;
    this.baseForm.get('tax_type')?.setValue(this.taxTypes.find((tax: any)=> tax.id == item.tax));
    this.baseForm.get('discount')?.setValue(item?.discount);

    this.openModal(this.addUpdate, { size: '', centered: true, scrollable: true })
  }


  override saveApiCall(): void {
    if(this.baseForm.valid){
      const model = {
        id: this.selected_item.id,
        item: this.selected_item?.item?.id,
        batch_number: this.baseForm.get('batch_number')?.value,
        expiry_date: this.baseForm.get('expiry_date')?.value,
        price: this.baseForm.get('price')?.value,
        cost: this.baseForm.get('rate')?.value,
        available_quantity: this.baseForm.get('quantity')?.value,
        packs: this.baseForm.get('packs')?.value,
        tax: this.baseForm.get('tax')?.value,
        tax_type: this.baseForm.get('tax_type')?.value?.id,
        discount: this.baseForm.get('discount')?.value,
      }
      
      this.subsink.sink = this.endPoint.updateStock(model).subscribe((res: any)=>{
        this.alertService.showSuccess("Saved.");
        this.modalService.dismissAll();
        this.getData();
      }, (error)=>{
        this.showAPIError(error);
      })

    }else{
      this.showBaseFormErrors();
    } 
  }

}
