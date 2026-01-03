import { Component, Injector, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BaseComponent } from '@sharedcommon/base/base.component';
import { RenewalService } from "../../services/renewal.service";
import { RenewalEndpoint } from '../../endpoints/renewal.endpoint';
import { RenewalModel } from '../../models/renewal.model';

@Component({
    selector: 'app-renewal',
    templateUrl: './renewal.component.html',
    styleUrls: ['./renewal.component.scss'],
    providers: [RenewalService]
})
export class RenewalComponent extends BaseComponent<RenewalModel> {
    @Input() branchId: string = "";
    @Input() dbName: string = "";
    minExpDate: Date = new Date();
    constructor(
        injector: Injector,
        public service: RenewalService,
        private formBuilder: FormBuilder,
        private endPoint: RenewalEndpoint) {
        super(injector);
        this.minExpDate.setDate(this.minExpDate.getDate() + 6);
    }

    override ngOnInit(): void {
        /** Form Validation **/
        this.baseForm = this.formBuilder.group({
            newExpiry: ['', [Validators.required]],
            remarks: ['', [Validators.required, Validators.maxLength(500)]],
        });

        this.dataList$ = this.service.renewals$;
        this.total$ = this.service.total$;

        this.subsink.sink = this.endPoint.getRenewals(this.branchId, this.dbName).subscribe((data) => {
            this.service.renewals = data;
        });
    }

    /**
   * save renewal
   */
    override saveApiCall(): void {
        const model: RenewalModel = this.getRenewalModel();
        this.subsink.sink = this.endPoint.saveRenewal(model).subscribe((response) => {
            if (this.handleApiResponse(response, `Renewal (${response.adhocData.extendedDate}) added successfully.`)) {
                model.renewedDate = response.adhocData.renewedDate;
                model.extendedDate = response.adhocData.extendedDate;
                this.service.addRenewal(model);
            }
        });
    }

    private getRenewalModel(): RenewalModel {
        const model: RenewalModel = {
            id: "",
            newExpiry: this.baseForm.get('newExpiry')?.value,
            remarks: this.baseForm.get('remarks')?.value,
            extendedDate: "",
            renewedDate: "",
            disabled: false,
            branchId: this.branchId,
            dbName: this.dbName,
        };

        return model;
    }

    override deleteApiCall(model: any) {
        model.branchId = this.branchId;
        model.dbName = this.dbName;
        this.subsink.sink = this.endPoint.deleteRenewal(model).subscribe((response) => {
            if (this.handleApiResponse(response, `Renewal (${model.extendedDate}) deleted successfully.`)) {
                this.service.deleteRenewal(model.extendedDate);
            }
        });
    }
}