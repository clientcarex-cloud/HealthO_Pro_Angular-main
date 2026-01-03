import { Component, Injector } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';

import { BaseComponent } from '@sharedcommon/base/base.component';
import { DepartmentGroupModel } from '../../models/department/dept-group.model';
import { DepartmentModel } from '../../models/department/department.model';

import { DepartmentService } from '../../services/department/department.service';
import { DepartmentGroupEndpoint } from '../../endpoints/department/deptgroup.endpoint';
import { DepartmentEndpoint } from '../../endpoints/department/department.endpoint';
import { DepartmentTypeModel } from '../../models/department/dept-type.model';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
  providers: [DepartmentService]
})
export class DepartmentComponent extends BaseComponent<DepartmentModel> {

  constructor(
    injector: Injector,
    public service: DepartmentService,
    private formBuilder: UntypedFormBuilder,
    private endPoint: DepartmentEndpoint,
    private deptGroupEndpoint: DepartmentGroupEndpoint) {
    super(injector);
  }

  /** Loading dept. groups **/
  deptGroups: DepartmentGroupModel[] = [];
  deptTypes: DepartmentTypeModel[] = [];

  override ngOnInit(): void {
    /** Form Validation **/
    this.baseForm = this.formBuilder.group({
      departmentGroup: ['', [Validators.required]],
      departmentType: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(150)]],
      reportHeader: ['', [Validators.maxLength(250)]],
      showReportHeader: ['', [Validators.required]],
      reportFooter: ['', [Validators.maxLength(4000)]],
      showReportFooter: ['', [Validators.required]],
    });

    this.dataList$ = this.service.depts$;
    this.total$ = this.service.total$;

    this.subsink.sink = this.deptGroupEndpoint.getActiveDeptGroups().subscribe((data) => {
      this.deptGroups = data;
    });

    this.subsink.sink = this.endPoint.getDeptTypes().subscribe((data) => {
      this.deptTypes = data;
    });

    this.subsink.sink = this.endPoint.getDeparments().subscribe((data) => {
      this.service.depts = data;
    });
  }

  override clearData(): void {
    if (this.isNewRecord) {
      this.modalTitle = "Add Department";
      this.baseForm.get('showReportHeader')?.setValue(false);
      this.baseForm.get('showReportFooter')?.setValue(false);
    } else {
      this.modalTitle = "Update Department";
    }
  }

  override setFormValues(data: any): void {
    this.baseForm.get('departmentGroup')?.setValue(data.departmentGroup);
    this.baseForm.get('departmentType')?.setValue(data.departmentType);
    this.baseForm.get('name')?.setValue(data.name);
    this.baseForm.get('reportHeader')?.setValue(data.reportHeader);
    this.baseForm.get('showReportHeader')?.setValue(data.showReportHeader);
    this.baseForm.get('reportFooter')?.setValue(data.reportFooter);
    this.baseForm.get('showReportFooter')?.setValue(data.showReportFooter);
  }

  private getDepartmentModel(): DepartmentModel {
    const name = this.baseForm.get('name')?.value?.toUpperCase();
    const model: DepartmentModel = {
      id: "",
      departmentGroup: this.baseForm.get('departmentGroup')?.value,
      departmentType: this.baseForm.get('departmentType')?.value,
      name: name,
      oldName: name,
      reportHeader: this.baseForm.get('reportHeader')?.value,
      showReportHeader: this.baseForm.get('showReportHeader')?.value,
      reportFooter: this.baseForm.get('reportFooter')?.value,
      showReportFooter: this.baseForm.get('showReportFooter')?.value,
      status: true,
      disabled: false
    };

    return model;
  }

  /** save department **/
  override saveApiCall(): void {
    const model = this.getDepartmentModel();
    this.subsink.sink = this.endPoint.addDeparment(model).subscribe((response) => {
      if (this.handleApiResponse(response, `Department (${model.name}) added successfully.`)) {
        this.service.addDept(model);
      }
    });
  }

  /** update department **/
  override updateApiCall(): void {
    const model = this.getDepartmentModel();
    this.subsink.sink = this.endPoint.updateDeparment(model, this.oldItemName).subscribe((response) => {
      if (this.handleApiResponse(response, `Department (${model.name}) updated successfully.`)) {
        this.service.updateDept(model, this.oldItemName);
      }
    });
  }

  /** Update department status **/
  updateDepartmentStatus(data: any) {
    this.subsink.sink = this.endPoint.updateDeparmentStatus(data).subscribe(response => {
      if (!this.handleApiResponse(response, `Department (${data.name}) status updated successfully.`)) {
        data.status = !data.status;
      }
    }, (err) => {
      data.status = !data.status;
    });
  }

  /** delete department **/
  override deleteApiCall(model: any) {
    this.subsink.sink = this.endPoint.deleteDeparment(model).subscribe((response) => {
      if (this.handleApiResponse(response, `Department (${model.name}) deleted successfully.`)) {
        this.service.deleteDept(model.name);
      }
    });
  }
}