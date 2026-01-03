import { Component, Injector, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BaseComponent } from '@sharedcommon/base/base.component';
import { WAPPurchaseModel } from "../../models/wap/wappurchase.model";
import { WAPConfigService } from "../../services/wapconfig.service";
import { WAPConfigEndpoint } from '../../endpoints/wapconfig.endpoint';
import { WAPConfigModel } from '../../models/wap/wapconfig.model';

@Component({
    selector: 'app-wapconfig',
    templateUrl: './wapconfig.component.html',
    styleUrls: ['./wapconfig.component.scss'],
    providers: [WAPConfigService]
})
export class WAPConfigComponent extends BaseComponent<WAPPurchaseModel> {
    @Input() branchId: string = "";
    @Input() dbName: string = "";
    wapConfigForm!: FormGroup;
    wapConfigFormId!: string;

    constructor(
        injector: Injector,
        public service: WAPConfigService,
        private formBuilder: FormBuilder,
        private endPoint: WAPConfigEndpoint) {
        super(injector);
        this.wapConfigFormId = this.getRandomString(10);
    }

    override ngOnInit(): void {
        /** Form Validation **/
        this.wapConfigForm = this.formBuilder.group({
            apiKey: ['', [Validators.required,Validators.maxLength(50)]],
            accountId: ['', [Validators.required,Validators.maxLength(50)]],
            status: ['', [Validators.required]],
        });

        // wap purchases
        this.baseForm = this.formBuilder.group({
            wapCount: ['0', [Validators.required, Validators.minLength(1), Validators.maxLength(6)]],
            remarks: ['', [Validators.required, Validators.maxLength(500)]],
        });

        this.dataList$ = this.service.wapPurchases$;
        this.total$ = this.service.total$;

        // wap config        
        this.subsink.sink = this.endPoint.getConfig(this.branchId, this.dbName).subscribe((data) => {
            if (data) {
                this.wapConfigForm.get('apiKey')?.setValue(data.apiKey);
                this.wapConfigForm.get('accountId')?.setValue(data.accountId);
                this.wapConfigForm.get('status')?.setValue(data.status);
            } else {
                this.wapConfigForm.get('apiKey')?.setValue('');
                this.wapConfigForm.get('accountId')?.setValue('');
                this.wapConfigForm.get('status')?.setValue(false);
            }
        });

        this.subsink.sink = this.endPoint.getWAPPurchase(this.branchId, this.dbName).subscribe((data) => {
            this.service.wapPurchase = data;
        });

        // wap summary        
        this.subsink.sink = this.endPoint.getWAPSummary(this.branchId, this.dbName).subscribe((data) => {
            this.service.setWAPSummary(data);
        });
    }

    override clearData(): void {
    }

    /**
       wap config
    **/
    get wapForm() {
        return this.wapConfigForm.controls;
    }

    /**
        save config
    **/
    saveConfig(): void {
        this.submitted = true;
        if (!this.wapConfigForm.valid)
            return;

        const model = this.getWAPConfigModel();

        this.subsink.sink = this.endPoint.saveConfig(model).subscribe((response) => {
            if (this.handleApiResponse(response, `Configuration saved successfully.`)) {
            }
        });
    }

    private getWAPConfigModel(): WAPConfigModel {
        const model: WAPConfigModel = {
            id: "",
            apiKey: this.wapConfigForm.get('apiKey')?.value,
            accountId: this.wapConfigForm.get('accountId')?.value,
            status: this.wapConfigForm.get('status')?.value,
            branchId: this.branchId,
            dbName: this.dbName
        };

        return model;
    }

    /**
    * save wap purchase
    */
    override saveApiCall(): void {
        const model: WAPPurchaseModel = this.getWAPPurchaseModel();
        this.subsink.sink = this.endPoint.saveWAPPurchase(model).subscribe((response) => {
            if (this.handleApiResponse(response, `SMS added successfully.`)) {
                model.purchaseDate = response.adhocData.purchaseDate;
                this.service.addWAPPurchases(model);
                this.service.wapSummary.total = (this.service.wapSummary.total + Number(model.count));
                this.service.wapSummary.balance = (this.service.wapSummary.balance + Number(model.count));
            }
        });
    }

    private getWAPPurchaseModel(): WAPPurchaseModel {
        const model: WAPPurchaseModel = {
            id: "",
            count: this.baseForm.get('wapCount')?.value,
            remarks: this.baseForm.get('remarks')?.value,
            purchaseDate: "",
            disabled: true,
            branchId: this.branchId,
            dbName: this.dbName,
        };

        return model;
    }

    override deleteApiCall(model: any) {
    }
}