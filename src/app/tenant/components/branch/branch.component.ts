import { Component, Injector } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { BaseComponent } from '@sharedcommon/base/base.component';
import { BranchModel } from '../../models/branch.model';
import { CityModel } from '../../models/city.model';
import { TenantModel } from '../../models/tenant.model';

import { BranchService } from '../../services/branch.service';
import { CityEndpoint } from '../../endpoints/city.endpoint';
import { BranchEndpoint } from '../../endpoints/branch.endpoint';
import { TenantEndpoint } from '../../endpoints/tenant.endpoint';
import { NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss'],
  providers: [BranchService]
})
export class BranchComponent extends BaseComponent<BranchModel> {

  constructor(
    injector: Injector,
    public service: BranchService,
    private formBuilder: FormBuilder,
    private endPoint: BranchEndpoint,
    private tenantEndpoint: TenantEndpoint,
    private cityEndpoint: CityEndpoint) {
    super(injector);
  }

  override ngOnInit(): void {
    this.settingsFormId = this.getRandomString(10);

    /** Form Validation **/
    this.baseForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      shortName: ['', [Validators.maxLength(10)]],
      address: ['', [Validators.maxLength(500)]],
      area: ['', [Validators.maxLength(50)]],
      city: ['', [Validators.required]],
      pinCode: ['', [Validators.maxLength(15)]],
      emailId: ['', [Validators.maxLength(50), Validators.email]],
      cPersonName1: ['', [Validators.maxLength(100)]],
      cPersonMobileNo1: ['', [Validators.minLength(10), Validators.maxLength(10)]],
      cPersonName2: ['', [Validators.maxLength(100)]],
      cPersonMobileNo2: ['', [Validators.minLength(10), Validators.maxLength(10)]],
      websiteUrl: ['', [Validators.maxLength(100)]]
    });

    this.dataList$ = this.service.branches$;
    this.total$ = this.service.total$;

    this.subsink.sink = this.tenantEndpoint.getTenants().subscribe((data) => {
      this.tenants = data;
    });

    this.subsink.sink = this.cityEndpoint.getActiveCities().subscribe((data) => {
      this.cities = data;
    });
  }

  override clearData(): void {
    if (this.isNewRecord) {
      this.modalTitle = "Add Branch";
    } else {
      this.modalTitle = "Update Branch";
    }
  }

  override setFormValues(data: any): void {
    this.baseForm.get('name')?.setValue(data.name);
    this.baseForm.get('shortName')?.setValue(data.shortName);
    this.baseForm.get('address')?.setValue(data.address);
    this.baseForm.get('area')?.setValue(data.area);
    this.baseForm.get('city')?.setValue(data.city);
    this.baseForm.get('pinCode')?.setValue(data.pinCode);
    this.baseForm.get('emailId')?.setValue(data.emailId);
    this.baseForm.get('cPersonName1')?.setValue(data.cPersonName1);
    this.baseForm.get('cPersonMobileNo1')?.setValue(data.cPersonMobileNo1);
    this.baseForm.get('cPersonName2')?.setValue(data.cPersonName2);
    this.baseForm.get('cPersonMobileNo2')?.setValue(data.cPersonMobileNo2);
    this.baseForm.get('websiteUrl')?.setValue(data.websiteUrl);
  }

  private getBranchModel(): BranchModel {
    const name = this.baseForm.get('name')?.value?.toUpperCase();
    const model: BranchModel = {
      id: "",
      name: name,
      oldName: name,
      shortName: this.baseForm.get('shortName')?.value,
      address: this.baseForm.get('address')?.value,
      area: this.baseForm.get('area')?.value,
      city: this.baseForm.get('city')?.value,
      pinCode: this.baseForm.get('pinCode')?.value,
      emailId: this.baseForm.get('emailId')?.value,
      cPersonName1: this.baseForm.get('cPersonName1')?.value,
      cPersonMobileNo1: this.baseForm.get('cPersonMobileNo1')?.value,
      cPersonName2: this.baseForm.get('cPersonName2')?.value,
      cPersonMobileNo2: this.baseForm.get('cPersonMobileNo2')?.value,
      websiteUrl: this.baseForm.get('websiteUrl')?.value,
      tenantId: this.tenantId,
      status: true
    };

    return model;
  }

  /**
  * save branch
  */
  override saveApiCall(): void {
    const model: BranchModel = this.getBranchModel();
    this.subsink.sink = this.endPoint.addBranch(model).subscribe((response) => {
      if (this.handleApiResponse(response, `Branch (${model.name}) added successfully.`)) {
        this.service.addBranch(model);
      }
    });
  }

  /**
 * update branch
 */
  override updateApiCall(): void {
    const model: BranchModel = this.getBranchModel();
    this.subsink.sink = this.endPoint.updateBranch(model, this.oldItemName).subscribe((response) => {
      if (this.handleApiResponse(response, `Branch (${model.name}) updated successfully.`)) {
        this.service.updateBranch(model, this.oldItemName);
      }
    });
  }

  /**
 * Update branch status
 */
  updateBranchStatus(data: any) {
    data.tenantId = this.tenantId;
    this.subsink.sink = this.endPoint.updateBranchStatus(data).subscribe(response => {
      if (!this.handleApiResponse(response, `Branch (${data.name}) status updated successfully.`)) {
        data.status = !data.status;
      }
    }, (err) => {
      data.status = !data.status;
    });
  }

  override deleteApiCall(model: any) {
    this.subsink.sink = this.endPoint.deleteBranch(model).subscribe((response) => {
      if (this.handleApiResponse(response, `Branch (${model.name}) deleted successfully.`)) {
        this.service.deleteBranch(model.name);
      }
    });
  }

  /**
 * Loading tenants
 */
  tenant: string = "";
  private tenantId: string = "";
  tenants: TenantModel[] = [];
  tenantChange(tenant: any) {
    this.tenant = tenant?.name ?? "";
    this.tenantId = tenant?.id ?? "";
    this.dbName = tenant?.dbName;
    this.subsink.sink = this.endPoint.getBranches(this.tenantId).subscribe((data) => {
      this.service.branches = data;
    });
  }

  /**
 * Loading cities
 */
  //city: string = "";
  cities: CityModel[] = [];
  //  cityChange(city: any) {
  //    this.city = city?.country?.name ?? "";
  //  }

  /**
* settings
*/
  settingsFormId: string = '';
  settingsActiveTabIdx: Number = 0;

  settingsTitle: string = "";
  branchId: string = "";
  dbName: string = "";

  settingsModalRef!: NgbModalRef;
  openSettings(content: any, data: any, options?: NgbModalOptions) {
    this.branchId = data.id;
    this.settingsTitle = `Branch Settings (${data.name})`;
    this.settingsModalRef = this.openModal(content, options);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    if (this.settingsModalRef) {
      this.settingsModalRef.close();
    }
  }
}