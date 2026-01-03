import { Component, Injector,ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Test } from 'src/app/setup/models/master/test.model';
import { UntypedFormGroup, UntypedFormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { NgbdSortableHeader, SortEvent } from '@sharedcommon/directives/sortable.directive';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { CaptilizeService } from '@sharedcommon/service/captilize.service';


@Component({
  selector: 'app-discount-type',
  templateUrl: './discount-type.component.html',
  styleUrls: ['./discount-type.component.scss']
})

export class DiscountTypeComponent extends BaseComponent<Test> {

  constructor(
    private formBuilder: UntypedFormBuilder,
    private endPoint: MasterEndpoint,
    injector: Injector, 
    public capitalSrvc : CaptilizeService
  ) { super(injector) }

  pageNum!: number | null;
  types!: any;
  inProgress: boolean =false;
  discountForm!: UntypedFormGroup;

  override ngOnInit(): void {
    this.pageNum = null;


  this.fetchData();
  this.initializeForm();
    
  }

  sort: boolean = false;

  changeSorting(){
    this.sort = !this.sort
    this.types.reverse() 
  }

  fetchData(){
    this.subsink.sink = this.endPoint.getDicountType().subscribe((data:any) =>{
      data.sort((a:any, b:any) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });
      !this.sort ? this.types = data : this.types = data.reverse(); ;
    } )

  }

  initializeForm(){
    this.discountForm = this.formBuilder.group({
      name: ['', Validators.required],
      number: [null, Validators.required],
      is_percentage: [false,],
      is_active: [true],
    });
  }

  formatString(e:any, val: string = 'any'){
    if(val==='name'){ this.discountForm.get(val)?.setValue(this.capitalSrvc.AutoName(e)); }
  }

  openXl(content: any, sz:string = '', cntrd:boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop});
  }

  getModel(){
    const model:any = {
      name: this.discountForm.get('name')?.value,
      number :this.discountForm.get('number')?.value,
      is_percentage : this.discountForm.get('is_percentage')?.value,
      is_active: this.discountForm.get('is_active')?.value,
    }
    return model;
  }

  saveDiscount(){
    const model = this.getModel();
    if(this.discountForm.valid){
      this.inProgress = true;
      const model = this.getModel();
      this.endPoint.postDiscount(model).subscribe((Response)=>{
        this.inProgress = false;
        this.alertService.showSuccess("Added",model.name);
        this.pageNum = null;
        this.fetchData();
        this.discountForm.reset();
        this.initializeForm();
        this.modalService.dismissAll();
      }, (error)=>{
        this.alertService.showError(error);
      })
    }else{
      this.submitted = true;
    }
  }

  doActiveInactiveDiscount(type:any, e:any){
    type.is_active = e;
    this.update(type);
    
  }

  @ViewChild('UpdateDiscount') discountModal: any;

  selectedDisc : any ;
  openDiscount(dis: any){
    this.discountForm.reset();
    this.initializeForm();

    this.discountForm.get('name')?.setValue(dis.name);
    this.discountForm.get('number')?.setValue(dis.number);
    this.discountForm.get('is_percentage')?.setValue(dis.is_percentage);
    this.discountForm.get('is_active')?.setValue(dis.is_active);
    this.selectedDisc = dis ;
    this.modalService.open(this.discountModal)
  }

  updateDiscount(){
    const model = this.getModel();

    model.id = this.selectedDisc.id;

    this.update(model);

    
  }

  update(model:any){
    this.endPoint.UpdateDiscount(model).subscribe((response:any)=>{
      model= response;
      this.alertService.showSuccess("Updated",`${model.name}`);
      this.modalService.dismissAll();
      this.fetchData()
    }),(error:any)=>{
      this.alertService.showError("Failed to Update", error);
    }
  }


  discountPercentage(){
    this.discountForm.get('number')?.setValue(null);

  }


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

  
  validateDiscount(e:any){
    function extractNumbers(input: string): number {
      const trimmedInput = input.trim(); // Remove leading and trailing whitespace
      const numberPattern = /^0*(\d+(\.\d{1,2})?)/; // Match digits with up to two digits after the decimal point, ignoring leading zeros
      const match = trimmedInput.match(numberPattern);
      if (match) {
        return parseFloat(match[1]);
      } else {
        return 0;
      }
    }

    const input_number = extractNumbers(e.target.value);

    const isPercentage = this.discountForm.get('is_percentage')?.value;

    if(isPercentage){
      if(input_number <= 0){
        this.discountForm.get('number')?.setValue(null);
      }else if(input_number > 100){
        this.discountForm.get('number')?.setValue(100);
      }
    }else{
      if(input_number <= 0){
        this.discountForm.get('number')?.setValue(null);
      }
    }

  }

}
