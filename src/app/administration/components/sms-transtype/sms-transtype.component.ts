import { Component, Injector } from '@angular/core';
import { SMSTransTypeService } from '../../services/sms/sms-transtype.service';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { SMSTransTypeModel } from '../../models/sms/sms-transtype.model';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { SMSTransTypeEndpoint } from '../../endpoints/sms/sms-transtype.endpoint';

@Component({
    selector: 'app-sms-transtype',
    templateUrl: './sms-transtype.component.html',
    styleUrls: ['./sms-transtype.component.scss'],
    providers: [SMSTransTypeService]
})
export class SMSTransTypeComponent extends BaseComponent<SMSTransTypeModel> {

    constructor(
        injector: Injector,
        public service: SMSTransTypeService,
        private formBuilder: UntypedFormBuilder,
        private endPoint: SMSTransTypeEndpoint) {
        super(injector);
    }

    override ngOnInit(): void {
        /** Form Validation **/
        this.baseForm = this.formBuilder.group({
            description: ['', [Validators.required, Validators.maxLength(30)]]
        });

        this.dataList$ = this.service.smsTransTypes$;
        this.total$ = this.service.total$;

        this.subsink.sink = this.endPoint.getSMSTransTypes().subscribe((data) => {
            this.service.smsTransTypes = data;
        });
    }

    override clearData(): void {
        if (this.isNewRecord) {
            this.modalTitle = "Add Transaction Type";
        } else {
            this.modalTitle = "Update Transaction Type";
        }
    }

    override setFormValues(data: any): void {
        this.baseForm.get('description')?.setValue(data.description);
    }

    /** save sms trans. type **/
    override saveApiCall(): void {
        const description = this.baseForm.get('description')?.value;

        this.subsink.sink = this.endPoint.addSMSTransType(description).subscribe((response) => {
            if (this.handleApiResponse(response, `Transaction Type (${description}) added successfully.`)) {
                this.service.addSMSTransType("", description);
            }
        });
    }

    /** update sms trans. type **/
    override updateApiCall(): void {
        const description = this.baseForm.get('description')?.value;

        this.subsink.sink = this.endPoint.updateSMSTransType(description, this.oldItemName).subscribe((response) => {
            if (this.handleApiResponse(response, `Transaction Type (${description}) updated successfully.`)) {
                this.service.updateSMSTransType(description, this.oldItemName);
            }
        });
    }

    /** Update sms trans. type status **/
    updateSMSTransTypeStatus(data: any) {
        this.subsink.sink = this.endPoint.updateSMSTransTypeStatus(data).subscribe(response => {
            if (!this.handleApiResponse(response, `Transaction Type (${data.description}) status updated successfully.`)) {
                data.status = !data.status;
            }
        }, (err) => {
            data.status = !data.status;
        });
    }

    /** delete sms trans. type **/
    override deleteApiCall(model: any) {
        this.subsink.sink = this.endPoint.deleteSMSTransType(model).subscribe((response) => {
            if (this.handleApiResponse(response, `Transaction Type (${model.description}) deleted successfully.`)) {
                this.service.deleteSMSTransType(model.description);
            }
        });
    }
}