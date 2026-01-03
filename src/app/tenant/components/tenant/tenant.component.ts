import { Component, Injector } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';

import { TenantModel } from '../../models/tenant.model';
import { TenantService } from '../../services/tenant.service';
import { TenantEndpoint } from '../../endpoints/tenant.endpoint';
import { BaseComponent } from '@sharedcommon/base/base.component';

@Component({
  selector: 'app-tenant',
  templateUrl: './tenant.component.html',
  styleUrls: ['./tenant.component.scss'],
  providers: [TenantService, DecimalPipe]
})
export class TenantComponent extends BaseComponent<TenantModel> {
  checkedList: any;
  masterSelected!: boolean;
  identifierReadOnly: boolean = false;

  constructor(
    injector: Injector,
    public service: TenantService,
    private formBuilder: FormBuilder,
    private tntEndPoint: TenantEndpoint) {
    super(injector);
  }

  override ngOnInit(): void {
    /** Form Validation **/
    this.baseForm = this.formBuilder.group({
      identifier: ['', [Validators.required, Validators.maxLength(25)]],
      name: ['', [Validators.required, Validators.maxLength(500)]],
      dbName: ['', [Validators.required, Validators.maxLength(25)]]
    });

    this.dataList$ = this.service.tenants$;
    this.total$ = this.service.total$;

    this.subsink.sink = this.tntEndPoint.getTenants().subscribe((data) => {
      this.service.tenants = data;
    });
  }

  override clearData(): void {
    if (this.isNewRecord) {
      this.modalTitle = "Add Tenant";
      this.identifierReadOnly = false;
    } else {
      this.modalTitle = "Update Tenant";
    }
  }

  override setFormValues(data: any): void {
    this.baseForm.get('identifier')?.setValue(data.identifier);
    this.baseForm.get('name')?.setValue(data.name);
    this.baseForm.get('dbName')?.setValue(data.dbName);
    this.identifierReadOnly = true;
  }

  /**
 * save tenant
 */
  override saveApiCall(): void {
    const identifier = this.baseForm.get('identifier')?.value;
    const name = this.baseForm.get('name')?.value;
    const dbName = this.baseForm.get('dbName')?.value;

    this.subsink.sink = this.tntEndPoint.addTenant(identifier, name, dbName).subscribe((response) => {
      if (this.handleApiResponse(response, `Tenant (${identifier}) added successfully.`)) {
        this.service.addTenant(identifier, name, dbName);
      }
    });
  }

  /**
  * update tenant
  */
  override updateApiCall(): void {
    const identifier = this.baseForm.get('identifier')?.value;
    const name = this.baseForm.get('name')?.value;
    const dbName = this.baseForm.get('dbName')?.value;

    this.subsink.sink = this.tntEndPoint.updateTenant(identifier, name, dbName).subscribe((response) => {
      if (this.handleApiResponse(response, `Tenant (${identifier}) updated successfully.`)) {
        this.service.updateTenant(identifier, name, dbName);
      }
    });
  }

  /**
 * delete tenant
 */
  override deleteApiCall(data: any) {
    this.subsink.sink = this.tntEndPoint.deleteTenant(data.identifier).subscribe((response) => {
      if (this.handleApiResponse(response, `Tenant (${data.identifier}) deleted successfully.`)) {
        this.service.deleteTenant(data.identifier);
      }
    });
  }

  /**
  * Update tenant status
  */
  updateTenantStatus(data: any) {
    this.subsink.sink = this.tntEndPoint.updateTenantStatus(data.identifier, data.status).subscribe(response => {
      if (!this.handleApiResponse(response, `Tenant (${data.identifier}) status updated successfully.`)) {
        data.status = !data.status;
      }
    });
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll() {
    for (var i = 0; i < this.data.length; i++) {
      this.data[i].isSelected = this.masterSelected;
    }

    this.getCheckedItemList();
  }

  // Get List of Checked Items
  getCheckedItemList() {
    this.checkedList = [];
    for (var i = 0; i < this.data.length; i++) {
      if (this.data[i].isSelected)
        this.checkedList.push(this.data[i]);
    }

    this.checkedList = JSON.stringify(this.checkedList);
  }
}
