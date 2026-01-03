import { Component, Injector } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';

import { BaseComponent } from '@sharedcommon/base/base.component';
import { IdConfigModel } from '../../models/id-config/idconfig.model';

import { IdConfigService } from '../../services/idconfig.service';
import { IdConfigEndpoint } from '../../endpoints/idconfig.endpoint';
import { IdConfigCategoryModel } from '../../models/id-config/idconfig-category.model';
import { IdConfigTypeModel } from '../../models/id-config/idconfig-type.model';
import { IdConfigResetModel } from '../../models/id-config/idconfig-reset.model';
import { IdConfigSeparatorModel } from '../../models/id-config/idconfig-separator.model';

@Component({
    selector: 'app-idconfig',
    templateUrl: './idconfig.component.html',
    styleUrls: ['./idconfig.component.scss'],
    providers: [IdConfigService]
})
export class IDConfigComponent extends BaseComponent<IdConfigModel> {
    minStartDate: Date = new Date();
    preview: string = "";

    constructor(
        injector: Injector,
        public service: IdConfigService,
        private formBuilder: UntypedFormBuilder,
        private endPoint: IdConfigEndpoint) {
        super(injector);
    }

    /** config masters **/
    categories: IdConfigCategoryModel[] = [];
    types: IdConfigTypeModel[] = [];
    resetTypes: IdConfigResetModel[] = [];
    separators: IdConfigSeparatorModel[] = [];

    categoryChange(category: any) {
        //this.country = state?.country?.name ?? "";
    }

    typeChange(type: any) {
        this.setPreview();
    }

    separatorChange(separator: any) {
        this.setPreview();
    }

    resetTypeChange(resetType: any) {
        this.setPreview();
    }

    onInitialValueChange(intialValue: number) {
        this.setPreview();
    }

    onPrefixChange(prefix: string) {
        this.setPreview();
    }

    setPreview() {
        this.preview = "";
        const prefix = this.baseForm.controls['prefix'].value ?? "";
        const separator = this.baseForm.controls['separator'].value?.separator ?? ".";
        const initialValue = this.baseForm.controls['initialValue'].value ?? "0";

        if (prefix && separator) {
            let typeStr = "";
            const type = this.baseForm.controls['type'].value;
            if (type && type.description) {
                const year = this.minStartDate.getFullYear().toString().slice(-2);
                const month = (this.minStartDate.getMonth() + 1).toString().padStart(2, "0");
                const day = (this.minStartDate.getDay() + 1).toString().padStart(2, "0");
                switch (type.description.toLowerCase()) {
                    case 'yearly':
                        typeStr = year;
                        break;
                    case 'monthly':
                        typeStr = year + month;
                        break;
                    case 'daily':
                        typeStr = year + month + day;
                        break;
                }

                this.preview = prefix + separator + typeStr + separator + initialValue;
            }
        }
    }
    /** end config masters **/

    override ngOnInit(): void {
        /** Form Validation **/
        this.baseForm = this.formBuilder.group({
            category: ['', [Validators.required]],
            type: ['', [Validators.required]],
            reset: ['', [Validators.required]],
            prefix: ['', [Validators.required, Validators.maxLength(5)]],
            separator: ['', [Validators.required]],
            initialValue: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(6)]],
            startDate: ['', [Validators.required]]
        });

        this.dataList$ = this.service.idConfigs$;
        this.total$ = this.service.total$;

        this.subsink.sink = this.endPoint.getIdCategories().subscribe((data) => {
            this.categories = data;
        });

        this.subsink.sink = this.endPoint.getIdTypes().subscribe((data) => {
            this.types = data;
        });

        this.subsink.sink = this.endPoint.getIdResetTypes().subscribe((data) => {
            this.resetTypes = data;
        });

        this.subsink.sink = this.endPoint.getIdSeparators().subscribe((data) => {
            this.separators = data;
        });

        this.subsink.sink = this.endPoint.getIdConfigs().subscribe((data) => {
            this.service.idConfigs = data;
        });
    }

    override clearData(): void {
        if (this.isNewRecord) {
            this.modalTitle = "New -  ID Setting";
        } else {
            this.modalTitle = "Update - ID Setting";
        }

        this.baseForm.controls['initialValue'].setValue(1);
        this.baseForm.controls['startDate'].setValue(this.minStartDate);
    }

    override setFormValues(data: any): void {
        this.baseForm.get('category')?.setValue(data.category);
        this.baseForm.get('type')?.setValue(data.type);
        this.baseForm.get('reset')?.setValue(data.reset);
        this.baseForm.get('prefix')?.setValue(data.prefix);
        this.baseForm.get('separator')?.setValue(data.separator);
        this.baseForm.get('initialValue')?.setValue(data.initialValue);
        this.baseForm.get('startDate')?.setValue(data.startDate);
    }

    private getIdConfigModel(): IdConfigModel {
        const prefix = this.baseForm.get('prefix')?.value?.toUpperCase();
        const model: IdConfigModel = {
            id: "",
            category: this.baseForm.get('category')?.value,
            type: this.baseForm.get('type')?.value,
            reset: this.baseForm.get('reset')?.value,
            prefix: prefix,
            separator: this.baseForm.get('separator')?.value,
            initialValue: this.baseForm.get('initialValue')?.value,
            startDate: this.baseForm.get('startDate')?.value,
            startedDate: "",
            preview: this.preview,
            status: true,
            disabled: false
        };

        return model;
    }

    /** * save idconfig **/
    override saveApiCall(): void {
        const model: IdConfigModel = this.getIdConfigModel();
        this.subsink.sink = this.endPoint.addIdConfig(model).subscribe((response) => {
            if (this.handleApiResponse(response, `Id Setting (${model.preview}) added successfully.`)) {
                model.startedDate = response.adhocData.startedDate;
                model.disabled = response.adhocData.disabled;
                this.service.addIdConfig(model);
            }
        });
    }

    override deleteApiCall(model: any) {
        this.subsink.sink = this.endPoint.deleteIdConfig(model).subscribe((response) => {
            if (this.handleApiResponse(response, `Id Setting (${model.preview}) deleted successfully.`)) {
                this.service.deleteIdConfig(model.prefix);
            }
        });
    }
}
