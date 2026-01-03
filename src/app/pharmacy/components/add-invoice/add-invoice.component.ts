import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { PharmacyEndpoint } from 'src/app/setup_hims/components/services-hims/pharmacy.endpoint';

@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html',
  styles: `

  :host ::ng-deep .table-custom td{
    padding: 0.1rem 0.2rem !important;
  }

  :host ::ng-deep .table-custom th{
    padding: 0.1rem 0.2rem !important;
  }

  .ng-autocomplete {
    width:100%;
    
  }

  :host ::ng-deep .autocomplete-container .input-container input{
    font-size: 11px !important;
  }

  :host ::ng-deep .suggestions-container {
    position: fixed;
    max-width: 400px;
    overflow: visible;
  }

  :host ::ng-deep .autocomplete-container .not-found {
    padding: 0 .75em;
    border: solid 1px #f1f1f1;
    background: white;
    position: fixed;
  }

  `
})

export class AddInvoiceComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private cookieSrvc: CookieStorageService,
    private endPoint: PharmacyEndpoint,
    private proEndpoint: ProEndpoint
  ){ super(injector) };

  @Input() supplier: any ;
  @Input() invoice: any ;

  @Output() saved: EventEmitter<any> = new EventEmitter<any>()

  timer: any ;
  totalAmount: number = 0 ;
  taxAmount: number =  0;
  discount_inv: any = 0 ;
  stocks: any = [];
  medicines: any = [] ;
  searchLoading: boolean = false ;
  invoiceForm!: UntypedFormGroup ;

  selectedMeds: any = [] ;
  taxTypes: any = [];
  suppliers: any = [] ;

  override ngOnInit(): void {

    if(this.invoice){
      this.supplier = this.invoice.stock[0].manufacturer ;
      this.discount_inv = this.invoice.stock[0]?.over_all_discount || 0;
      this.taxAmount = this.invoice.stock[0]?.over_all_tax || 0 ;

      this.invoice.stock.forEach((stock: any)=>{

        const model = {
          item: stock.item,
          batch_number: stock.batch_number,
          expiry_date: stock.expiry_date,
          price: this.getFloatVal(stock?.price) ,
          rate: this.getFloatVal(stock?.cost),
          quantity: stock?.available_quantity || 0,
          total_amount: parseFloat(stock?.total_amount) ,
          tax: stock?.tax ,
          tax_type: stock?.tax_type || null ,
          packs: stock?.packs,
          discount: this.getFloatVal(stock?.discount)
        }

        model.item['showName'] =  `${stock.item?.name}${stock.item?.composition ? ' - ' + stock.item?.composition : ''}`;

        this.stocks.push(model);
        this.selectedMeds.push(stock.item.id) ;

        try{
          const rate = parseFloat(stock.cost); // Ensure it's a number
          const quantity = stock.available_quantity; // Ensure it's a number
          const tax = parseFloat(stock?.tax);
          
          this.totalAmount += parseFloat(stock?.total_amount) ;
          // this.taxAmount += (rate * quantity) * (tax / 100) ;
        }catch(error){

        }


      })
    }
    
    this.getSuppliers();
    this.initializeForm();
  }

  initializeForm(){

    this.invoiceForm = this.formBuilder.group({
      manufacturer : [this.supplier || null, Validators.required],
      invoice_number: [this.invoice ? this.invoice.invoice_number : null, Validators.required],
      over_all_discount: [this.invoice ? this.invoice.over_all_discount : null],
      over_all_tax: [this.invoice ? this.invoice?.over_all_tax : null]
    }) 

    this.initializeBaseForm();
    this.getTaxTypes() ;
  }

  initializeBaseForm(){
    this.baseForm = this.formBuilder.group({
      item: [null, Validators.required],
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


  getSuppliers(){
    this.subsink.sink = this.endPoint.getSuppliers(
      "all", 1, "", '', false
    ).subscribe((data: any) => {
      this.suppliers = data;
    })
  }

  getTaxTypes(){
    this.subsink.sink = this.proEndpoint.getTaxTypes().subscribe((res: any)=>{
      this.taxTypes = res.filter((tax: any)=> tax.is_active) ;
      // this.baseForm.get('tax_type')?.setValue(res[0]);
    })
  }
  
  getSearches(searchTerm: any){
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if(searchTerm.length >= 2){
        this.searchLoading = true ;
        this.subsink.sink = this.endPoint.getMedicines('all', 1, searchTerm, '', '').subscribe((res: any)=>{
          res.map((med: any)=> med['showName'] = `${med.name}${med?.composition ? ' - ' + med?.composition : ''}` ) ;
          this.medicines = res.filter((r: any)=> !this.selectedMeds.includes(r.id));
          this.searchLoading = false ;
        }, (error)=>{
          this.searchLoading = false ;
        })
      }
      
    }, 500); // Adjust the delay as needed
  }


  getModel(){
    const model: any = {
      manufacturer : this.invoiceForm.get('manufacturer')?.value?.id,
      invoice_number: this.invoiceForm.get('invoice_number')?.value,
      over_all_discount: this.invoiceForm.get('over_all_discount')?.value,
      over_all_tax: this.invoiceForm?.get('over_all_tax')?.value,
      created_by: this.cookieSrvc.getCookieData().lab_staff_id,
      stock: []
    }

    this.stocks.forEach((stock: any)=>{
      const stockModel = {
        item: stock.item?.id,
        quantity: stock?.quantity,
        price: stock?.price || 0,
        expiry_date: stock?.expiry_date || null,
        batch_number: stock?.batch_number,
        cost: stock?.rate || 0,
        tax_type: stock?.tax_type?.id || null,
        tax: stock?.tax ? parseFloat(stock?.tax) : 0,
        discount: stock?.discount ? parseFloat(stock?.discount) : 0,
        packs: stock?.packs
      }
      model.stock.push(stockModel) ;
    })

    return model ;
  }

  saveInvoice(){

    if(this.invoiceForm.valid && this.stocks.length != 0){
      const model = this.getModel() ;
      
      this.subsink.sink = this.endPoint.postInvoice(model).subscribe((res: any)=>{
        this.saved.emit({})
        this.alertService.showSuccess("Saved.");
        this.modalService.dismissAll();
      }, (error)=>{
        this.showAPIError(error);
      })
    }else{
      this.showBaseFormErrors(this.invoiceForm);
      if(this.stocks.length == 0) this.alertService.showError("Add Atleast One Medicine.")
    }
  }
  // utilities

  inputSelected(event: any, autoComplete: any){
    if(this.selectedMeds.includes(event.id)){
      this.alertService.showInfo(`${event.showName} medicine already included.`);
      autoComplete.clear();
      return 
    }

    this.baseForm.get('item')?.setValue(event);
  }

  override addItem(autoComplete: any){
    
    if(this.baseForm.valid){

      const rate = parseFloat(this.baseForm.get('rate')?.value); // Ensure it's a number
      const price = parseFloat(this.baseForm.get('price')?.value); // Ensure it's a number
      const quantity = parseFloat(this.baseForm.get('quantity')?.value); // Ensure it's a number
      const packs = parseInt(this.baseForm.get('packs')?.value);
      const tax = parseFloat(this.baseForm.get('tax')?.value);
      
      // Set the total_amount by multiplying rate and quantity
      this.baseForm.get('total_amount')?.setValue(rate * quantity);

      this.totalAmount += rate * quantity ;
      // this.taxAmount += (rate * quantity) * (tax / 100) ;

      // Format rate and price to two decimals and set them back as numbers
      this.baseForm.get('packs')?.setValue(packs || 1) ;
      this.baseForm.get('rate')?.setValue(parseFloat(rate.toFixed(2)));
      this.baseForm.get('price')?.setValue(parseFloat(price.toFixed(2)));
      this.baseForm.get('quantity')?.setValue(parseInt(quantity.toString()))

      this.selectedMeds.push(this.baseForm.value.item.id) ;

      this.stocks.push(this.baseForm.value) ;
      this.baseForm.reset();
      this.initializeBaseForm();
      autoComplete.clear();
      this.medicines = [] ;
      autoComplete.focus();
      this.submitted = false ;
    }else{
      this.showBaseFormErrors();
    }
  }
  
  deleteStock(item: any, index: number){
    this.totalAmount -= item.total_amount ;
    // this.taxAmount -= (item.total_amount) * (item.tax / 100) ;
    this.stocks.splice(index, 1);
    this.selectedMeds.splice(index, 1);
    if(this.stocks.length == 0) {
      this.totalAmount = 0;
      this.taxAmount = 0;
      this.discount_inv = 0;
      this.invoiceForm.get('over_all_discount')?.setValue(0);
    } ;
    
  }

  editStock(item: any, index: number, autoComplete: any){

    this.baseForm.get('item')?.setValue(item.item) ;
    this.baseForm.get('batch_number')?.setValue(item?.batch_number || null );
    this.baseForm.get('expiry_date')?.setValue(item?.expiry_date || null);
    this.baseForm.get('price')?.setValue(item?.price);
    this.baseForm.get('rate')?.setValue(item?.rate);
    this.baseForm.get('quantity')?.setValue(item?.quantity);

    autoComplete.select(item?.item);

    this.deleteStock(index, item);

  }

  getDecimalNumber(num: any){
    const decimalPart = num !== 0 ? num.toString().split('.')[1] : "0"
    const discountAmountFormatted = decimalPart ? num.toString().split('.')[0] + '.' + decimalPart.substring(0, 2) : num.toFixed(2);
    return num !== 0 ? discountAmountFormatted : "0.00" ;
  }

  selectFirstOption(e: any, autoComplete: any){
    e.preventDefault();
    if(this.medicines.length > 0) {
      this.inputSelected(this.medicines[0], autoComplete);
    }
  }

  returnTotalAmount(num = this.totalAmount, showCurr: boolean = true): any{
    if(num){
      const curr = num.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });
      
      if(!showCurr) return curr.substring(1) ;
      return curr;
    }else{
      return "0.00"
    }
  }

  getFloatVal(num: any) {
    try {
      const floatNum = parseFloat(num.replace(/,/g, ''))
      return floatNum
    } catch (error) {
      return num
    }
  }

  setSupplier(event: any, modal: any){
    this.supplier = event ;
    this.invoiceForm.get('manufacturer')?.setValue(event);
    modal.dismiss('Cross click');
  }

  updateOverallDiscount(event: any){
    this.invoiceForm.get('over_all_discount')?.setValue(event);
    this.discount_inv = event ;
  }

  updateOverallTax(event: any){
    this.invoiceForm.get('over_all_tax')?.setValue(event);
    this.taxAmount = event ;
  }

  setMedicine(stock: any, autoComplete: any ,modal: any){

    stock = stock[0] ;

    stock['showName'] = `${stock.name}${stock?.composition ? ' - ' + stock?.composition : ''}`;
    this.baseForm.get('item')?.setValue(stock);
    autoComplete.select(stock);
    modal.dismiss('Cross click');
  }

}
