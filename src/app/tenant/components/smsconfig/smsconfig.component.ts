import { Component, Injector, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BaseComponent } from '@sharedcommon/base/base.component';
import { SMSPurchaseModel } from "../../models/sms/smspurchase.model";
import { SMSConfigService } from "../../services/smsconfig.service";
import { SMSConfigEndpoint } from '../../endpoints/smsconfig.endpoint';
import { SMSConfigModel } from '../../models/sms/smsconfig.model';
import { SMSProviderModel } from '../../models/sms/smsprovider.model';

@Component({
    selector: 'app-smsconfig',
    templateUrl: './smsconfig.component.html',
    styleUrls: ['./smsconfig.component.scss'],
    providers: [SMSConfigService]
})
export class SMSConfigComponent extends BaseComponent<SMSPurchaseModel> {
    @Input() branchId: string = "";
    @Input() dbName: string = "";
    smsConfigForm!: FormGroup;
    smsConfigFormId!: string;

    constructor(
        injector: Injector,
        public service: SMSConfigService,
        private formBuilder: FormBuilder,
        private endPoint: SMSConfigEndpoint) {
        super(injector);
        this.smsConfigFormId = this.getRandomString(10);
    }

    override ngOnInit(): void {
        /** Form Validation **/
        this.smsConfigForm = this.formBuilder.group({
            transProvider: ['', [Validators.required]],
            transSenderId: ['', [Validators.required,Validators.maxLength(50)]],
            promoProvider: ['', [Validators.required]],
            promoSenderId: ['', [Validators.required,Validators.maxLength(50)]],
            entityId: ['', [Validators.required,Validators.maxLength(25)]],
            status: ['', [Validators.required]],
        });

        // sms purchases
        this.baseForm = this.formBuilder.group({
            smsCount: ['0', [Validators.required,Validators.minLength(1),Validators.maxLength(6)]],
            remarks: ['', [Validators.required,Validators.maxLength(500)]],
        });

        this.dataList$ = this.service.smsPurchases$;
        this.total$ = this.service.total$;

        // sms providers
        //let providers = this.endPoint.getSMSProviders(this.branchId, this.dbName);
        this.subsink.sink = this.endPoint.getSMSProviders(this.branchId, this.dbName).subscribe((data) => {
            this.transProviders = data;
            this.promoProviders = data;
        });

        // sms config        
        this.subsink.sink = this.endPoint.getConfig(this.branchId, this.dbName).subscribe((data) => {
            if (data) {
                this.smsConfigForm.get('transProvider')?.setValue(data.transProvider);
                this.smsConfigForm.get('transSenderId')?.setValue(data.transSenderId);
                this.smsConfigForm.get('promoProvider')?.setValue(data.promoProvider);
                this.smsConfigForm.get('promoSenderId')?.setValue(data.promoSenderId);
                this.smsConfigForm.get('entityId')?.setValue(data.entityId);
                this.smsConfigForm.get('status')?.setValue(data.status);
            } else {
                this.smsConfigForm.get('transProvider')?.setValue('');
                this.smsConfigForm.get('transSenderId')?.setValue('');
                this.smsConfigForm.get('promoProvider')?.setValue('');
                this.smsConfigForm.get('promoSenderId')?.setValue('');
                this.smsConfigForm.get('entityId')?.setValue('');
                this.smsConfigForm.get('status')?.setValue(false);
            }
        });

        this.subsink.sink = this.endPoint.getSMSPurchase(this.branchId, this.dbName).subscribe((data) => {
            this.service.smsPurchase = data;
        });

        // sms summary
        //let smsSummary = this.endPoint.getSMSSummary(this.branchId, this.dbName);
        this.subsink.sink = this.endPoint.getSMSSummary(this.branchId, this.dbName).subscribe((data) => {
            this.service.setSMSSummary(data);
        });
    }

    override clearData(): void {       
    }

    /**
       sms config
   **/
    get smsForm() {
        return this.smsConfigForm.controls;
    }

    /**
        save config
    **/
    saveConfig(): void {
        this.submitted = true;
        if (!this.smsConfigForm.valid)
            return;

        const model =  this.getSMSConfigModel();

        this.subsink.sink = this.endPoint.saveConfig(model).subscribe((response) => {
            if (this.handleApiResponse(response, `Configuration saved successfully.`)) {
            }
        });
    }

    private getSMSConfigModel(): SMSConfigModel {        
        const model: SMSConfigModel = {
            id: "",
            transProvider: this.smsConfigForm.get('transProvider')?.value,
            transSenderId: this.smsConfigForm.get('transSenderId')?.value,
            promoProvider: this.smsConfigForm.get('promoProvider')?.value,
            promoSenderId: this.smsConfigForm.get('promoSenderId')?.value,
            entityId: this.smsConfigForm.get('entityId')?.value,
            status: this.smsConfigForm.get('status')?.value,
            branchId: this.branchId,
            dbName: this.dbName
        };
    
        return model;
    }

    /**
       sms providers
   **/
    transProviders: SMSProviderModel[] = [];
    promoProviders: SMSProviderModel[] = [];

    /**
    * save sms purchase
    */
    override saveApiCall(): void {
        const model: SMSPurchaseModel = this.getSMSPurchaseModel();
        this.subsink.sink = this.endPoint.saveSMSPurchase(model).subscribe((response) => {
            if (this.handleApiResponse(response, `SMS added successfully.`)) {                
                model.purchaseDate = response.adhocData.purchaseDate;
                this.service.addSMSPurchases(model);
                this.service.smsSummary.total = (this.service.smsSummary.total+Number(model.count));
                this.service.smsSummary.balance = (this.service.smsSummary.balance+Number(model.count));
            }
        });
    }   
    
    private getSMSPurchaseModel(): SMSPurchaseModel {        
        const model: SMSPurchaseModel = {
          id: "",
          count: this.baseForm.get('smsCount')?.value,
          remarks: this.baseForm.get('remarks')?.value,
          purchaseDate: "",
          disabled: true,
          branchId: this.branchId,
          dbName: this.dbName,
        };
    
        return model;
      }

    override deleteApiCall(model: any) {
        // model.branchId = this.branchId;
        // model.dbName = this.dbName;
        // this.subsink.sink = this.endPoint.deleteLogin(model).subscribe((response) => {
        //     if (this.handleApiResponse(response, `User (${model.userName}) deleted successfully.`)) {
        //         this.service.deleteLogin(model.userName);
        //     }
        // });
    }
}