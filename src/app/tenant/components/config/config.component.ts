import { Component, Injector, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { BaseComponent } from 'src/app/shared/base/base.component';
import { ConfigModel } from "../../models/config.model";
import { ConfigEndpoint } from '../../endpoints/config.endpoint';

@Component({
    selector: 'app-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss'],
})
export class ConfigComponent extends BaseComponent<ConfigModel> {
    @Input() branchId: string = "";
    @Input() dbName: string = "";

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private endPoint: ConfigEndpoint) {
        super(injector);
    }

    override ngOnInit(): void {
        /** Form Validation **/
        this.baseForm = this.formBuilder.group({
            userLogins: ['', [Validators.required]],
            labLogins: ['', [Validators.required]],
            patientLogin: ['', [Validators.required]],
        });

        this.subsink.sink = this.endPoint.getConfig(this.branchId, this.dbName).subscribe((data) => {
            if (data) {
                this.baseForm.get('userLogins')?.setValue(data.userLogins);
                this.baseForm.get('labLogins')?.setValue(data.labLogins);
                this.baseForm.get('patientLogin')?.setValue(data.patientLogin);
            } else {
                this.baseForm.get('userLogins')?.setValue(0);
                this.baseForm.get('labLogins')?.setValue(0);
                this.baseForm.get('patientLogin')?.setValue(false);
            }
        });
    }

    /**
  save config
 **/
    saveConfig(): void {
        this.submitted = true;
        if (!this.baseForm.valid)
            return;

        const model: ConfigModel = {
            id: "",
            userLogins: this.baseForm.get('userLogins')?.value,
            labLogins: this.baseForm.get('labLogins')?.value,
            patientLogin: this.baseForm.get('patientLogin')?.value,
            branchId: this.branchId,
            dbName: this.dbName
        };

        this.subsink.sink = this.endPoint.saveConfig(model).subscribe((response) => {
            if (this.handleApiResponse(response, `Configuration saved successfully.`)) {
            }
        });
    }
}