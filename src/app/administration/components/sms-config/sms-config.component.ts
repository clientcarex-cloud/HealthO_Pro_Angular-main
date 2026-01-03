import { Component, Injector } from '@angular/core';
import { SMSConfigService } from '../../services/sms/sms-config.service';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { SMSConfigModel } from '../../models/sms/sms-config.model';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { SMSConfigEndpoint } from '../../endpoints/sms/sms-config.endpoint';
import { SMSTransTypeModel } from '../../models/sms/sms-transtype.model';
import { SMSCategoryModel } from '../../models/sms/sms-category.model';

@Component({
    selector: 'app-sms-config',
    templateUrl: './sms-config.component.html',
    styleUrls: ['./sms-config.component.scss'],
    providers: [SMSConfigService]
})
export class SMSConfigComponent extends BaseComponent<SMSConfigModel> {

    constructor(
        injector: Injector,
        public service: SMSConfigService,
        private formBuilder: UntypedFormBuilder,
        private endPoint: SMSConfigEndpoint) {
        super(injector);
    }

    charactersCount: number = 0;
    messageCount: number = 0;

    /** Loading dept. groups **/
    smsTransTypes: SMSTransTypeModel[] = [];
    smsCategories: SMSCategoryModel[] = [];

    override ngOnInit(): void {
        /** Form Validation **/
        this.baseForm = this.formBuilder.group({
            smsTransType: ['', [Validators.required]],
            smsCategory: ['', [Validators.required]],
            templateId: ['', [Validators.maxLength(50)]],
            smsBody: ['', [Validators.maxLength(500)]],
            smsStatus: ['', [Validators.required]],
            wapBody: ['', [Validators.maxLength(2000)]],
            wapSendWithImg: ['', [Validators.required]],
            wapStatus: ['', [Validators.required]],
        });

        this.dataList$ = this.service.smsConfigs$;
        this.total$ = this.service.total$;

        this.subsink.sink = this.endPoint.getSMSTransactionTypes().subscribe((data) => {
            this.smsTransTypes = data;
        });

        this.subsink.sink = this.endPoint.getSMSCategories().subscribe((data) => {
            this.smsCategories = data;
        });

        this.subsink.sink = this.endPoint.getSMSConfigs().subscribe((data) => {
            this.service.smsConfigs = data;
        });
    }

    override clearData(): void {
        if (this.isNewRecord) {
            this.modalTitle = "Add SMS Config.";
            this.baseForm.get('smsStatus')?.setValue(false);
            this.baseForm.get('wapSendWithImg')?.setValue(false);
            this.baseForm.get('wapStatus')?.setValue(false);
        } else {
            this.modalTitle = "Update SMS Config.";
        }
    }

    override setFormValues(data: any): void {
        this.baseForm.get('smsTransType')?.setValue(data.smsTransType);
        this.baseForm.get('smsCategory')?.setValue(data.smsCategory);
        this.baseForm.get('templateId')?.setValue(data.templateId);
        this.baseForm.get('smsBody')?.setValue(data.smsBody);
        this.baseForm.get('smsStatus')?.setValue(data.smsStatus);
        this.baseForm.get('wapBody')?.setValue(data.wapBody);
        this.baseForm.get('wapSendWithImg')?.setValue(data.wapSendWithImg);
        this.baseForm.get('wapStatus')?.setValue(data.wapStatus);
    }

    private getSMSConfigModel(): SMSConfigModel {
        const model: SMSConfigModel = {
            id: "",
            smsTransType: this.baseForm.get('smsTransType')?.value,
            smsCategory: this.baseForm.get('smsCategory')?.value,
            templateId: this.baseForm.get('templateId')?.value,
            smsBody: this.baseForm.get('smsBody')?.value,
            smsStatus: this.baseForm.get('smsStatus')?.value,
            wapBody: this.baseForm.get('wapBody')?.value,
            wapSendWithImg: this.baseForm.get('wapSendWithImg')?.value,
            wapStatus: this.baseForm.get('wapStatus')?.value,
            disabled: false
        };

        return model;
    }

    /** save sms config. type **/
    override saveApiCall(): void {
        const model = this.getSMSConfigModel();
        const msg = `SMS Config with Trans. Type (${model.smsTransType.description}) and Category (${model.smsCategory.description}) added successfully.`;
        this.subsink.sink = this.endPoint.addSMSConfig(model).subscribe((response) => {
            if (this.handleApiResponse(response, msg)) {
                this.service.addSMSConfig(model);
            }
        });
    }

    /** update sms config. type **/
    override updateApiCall(): void {
        const model = this.getSMSConfigModel();
        const msg = `SMS Config with Trans. Type (${model.smsTransType.description}) and Category (${model.smsCategory.description}) updated successfully.`;
        this.subsink.sink = this.endPoint.updateSMSConfig(model).subscribe((response) => {
            if (this.handleApiResponse(response, msg)) {
                this.service.updateSMSConfig(model);
            }
        });
    }

    /** Update sms status **/
    updateSMSSendStatus(data: any) {
        const msg = `SMS Send status with Trans. Type (${data.smsTransType.description}) and Category (${data.smsCategory.description}) updated successfully.`;
        this.subsink.sink = this.endPoint.updateSMSSendStatus(data).subscribe(response => {
            if (!this.handleApiResponse(response, msg)) {
                data.smsStatus = !data.smsStatus;
            }
        }, (err) => {
            data.smsStatus = !data.smsStatus;
        });
    }

    /** Update wap status **/
    updateWAPSendStatus(data: any) {
        const msg = `WAP Send status with Trans. Type (${data.smsTransType.description}) and Category (${data.smsCategory.description}) updated successfully.`;
        this.subsink.sink = this.endPoint.updateWAPSendStatus(data).subscribe(response => {
            if (!this.handleApiResponse(response, msg)) {
                data.wapStatus = !data.wapStatus;
            }
        }, (err) => {
            data.wapStatus = !data.wapStatus;
        });
    }

    /** delete sms trans. type **/
    override deleteApiCall(model: any) {
        const msg = `SMS Config with Trans. Type (${model.smsTransType.description}) and Category (${model.smsCategory.description}) deleted successfully.`;
        this.subsink.sink = this.endPoint.deleteSMSConfig(model).subscribe((response) => {
            if (this.handleApiResponse(response, msg)) {
                this.service.deleteSMSConfig(model);
            }
        });
    }
}