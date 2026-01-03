import { Component, Injector, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { PharmacyEndpoint } from 'src/app/setup_hims/components/services-hims/pharmacy.endpoint';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html'
})

export class SupplierComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private endPoint: PharmacyEndpoint
  ){ super(injector) }

  active: number = 1 ;

  @ViewChild('supplierDetails') supplierDetails : any ;
  @ViewChild('meds') meds: any ;
  @ViewChild('mfgInvoice') mfgInvoice: any ;

  override ngOnInit(): void {
    
  }

  openAddInvoice(){
    this.mfgInvoice.openAddInvoice(); 
  }

  openAddSupplier(){
    this.modalService.dismissAll();
    this.supplierDetails.openAdd() ;
  }

  openMedsImport(){
    this.meds.openOtherModel();
  }

  openMedsAdd(){
    this.meds.openAdd();
  }

}
