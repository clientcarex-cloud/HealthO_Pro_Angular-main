import { Component, Injector } from '@angular/core';
import { DepartmentGroupService } from '../../services/department/deptgroup.service';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { DepartmentGroupModel } from '../../models/department/dept-group.model';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { DepartmentGroupEndpoint } from '../../endpoints/department/deptgroup.endpoint';

@Component({
    selector: 'app-deptgroup',
    templateUrl: './deptgroup.component.html',
    styleUrls: ['./deptgroup.component.scss'],
    providers: [DepartmentGroupService]
})
export class DepartmentGroupComponent extends BaseComponent<DepartmentGroupModel> {

    constructor(
        injector: Injector,
        public service: DepartmentGroupService,
        private formBuilder: UntypedFormBuilder,
        private endPoint: DepartmentGroupEndpoint) {
        super(injector);
    }

    override ngOnInit(): void {
        /** Form Validation **/
        this.baseForm = this.formBuilder.group({
            description: ['', [Validators.required, Validators.maxLength(30)]]
        });

        this.dataList$ = this.service.deptGroups$;
        this.total$ = this.service.total$;

        this.subsink.sink = this.endPoint.getDeptGroups().subscribe((data) => {
            this.service.deptGroups = data;
        });
    }

    override clearData(): void {
        if (this.isNewRecord) {
            this.modalTitle = "Add Department Group";
        } else {
            this.modalTitle = "Update Department Group";
        }
    }

    override setFormValues(data: any): void {
        this.baseForm.get('description')?.setValue(data.description);
    }

    /** save dept. group **/
    override saveApiCall(): void {
        const description = this.baseForm.get('description')?.value;

        this.subsink.sink = this.endPoint.addDeptGroup(description).subscribe((response) => {
            if (this.handleApiResponse(response, `Department Group (${description}) added successfully.`)) {
                this.service.addDeptGroup("", description);
            }
        });
    }

    /** update dept. group **/
    override updateApiCall(): void {
        const description = this.baseForm.get('description')?.value;

        this.subsink.sink = this.endPoint.updateDeptGroup(description, this.oldItemName).subscribe((response) => {
            if (this.handleApiResponse(response, `Department Group (${description}) updated successfully.`)) {
                this.service.updateDeptGroup(description, this.oldItemName);
            }
        });
    }

    /** Update dept. group status **/
    updateDeptGroupStatus(data: any) {
        this.subsink.sink = this.endPoint.updateDeptGroupStatus(data).subscribe(response => {
            if (!this.handleApiResponse(response, `Department Group (${data.description}) status updated successfully.`)) {
                data.status = !data.status;
            }
        }, (err) => {
            data.status = !data.status;
        });
    }

    /** delete dept. group **/
    override deleteApiCall(model: any) {
        this.subsink.sink = this.endPoint.deleteDeptGroup(model).subscribe((response) => {
            if (this.handleApiResponse(response, `Department Group (${model.description}) deleted successfully.`)) {
                this.service.deleteDeptGroup(model.description);
            }
        });
    }
}