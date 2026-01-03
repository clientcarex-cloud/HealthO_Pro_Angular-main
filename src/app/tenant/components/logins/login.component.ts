import { Component, Injector, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { BaseComponent } from 'src/app/shared/base/base.component';
import { LoginModel } from "../../models/login.model";
import { LoginService } from "../../services/login.service";
import { LoginEndpoint } from '../../endpoints/login.endpoint';

@Component({
  selector: 'app-logins',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [LoginService]
})
export class LoginsComponent extends BaseComponent<LoginModel> {
  @Input() branchId: string = "";
  @Input() dbName: string = "";
  fieldTextType: boolean = true;
  lastTouchedPwd: string = "";

  constructor(
    injector: Injector,
    public service: LoginService,
    private formBuilder: FormBuilder,
    private endPoint: LoginEndpoint) {
    super(injector);
  }

  override ngOnInit(): void {
    /** Form Validation **/
    this.baseForm = this.formBuilder.group({
      userName: ['', [Validators.required, Validators.maxLength(15)]],
      userPwd: ['', [Validators.required, Validators.maxLength(15)]],
      mobileNo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]]
    });

    this.dataList$ = this.service.logins$;
    this.total$ = this.service.total$;

    this.subsink.sink = this.endPoint.getLogins(this.branchId, this.dbName).subscribe((data) => {
      this.service.logins = data;
    });
  }

  override clearData(): void {
    if (this.isNewRecord) {
      this.modalTitle = "Add User Login";
      this.resettingPwd = false;
      this.baseForm.get('userName')?.enable();
      this.baseForm.get('userPwd')?.enable();
      this.baseForm.get('mobileNo')?.enable();
    }
  }

  override setFormValues(data: any): void {
    if (this.resettingPwd) {
      this.baseForm.get('userName')?.disable();
      this.baseForm.get('mobileNo')?.disable();
      this.baseForm.get('userPwd')?.enable();
      this.lastTouchedPwd = data.userPwd;
      data.userPwd = '';
    } else {
      this.baseForm.get('userName')?.disable();
      this.baseForm.get('userPwd')?.disable();
      this.baseForm.get('mobileNo')?.enable();
    }

    this.baseForm.get('userName')?.setValue(data.userName);
    this.baseForm.get('userPwd')?.setValue(data.userPwd);
    this.baseForm.get('mobileNo')?.setValue(data.mobileNo);
    this.baseForm.get('sendSMS')?.setValue(data.sendSMS);
  }

  private getLoginModel(): LoginModel {
    const userName = this.baseForm.get('userName')?.value?.toUpperCase();
    const model: LoginModel = {
      id: "",
      userName: userName,
      userPwd: this.baseForm.get('userPwd')?.value,
      mobileNo: this.baseForm.get('mobileNo')?.value,
      sendSMS: this.baseForm.get('sendSMS')?.value,
      branchId: this.branchId,
      dbName: this.dbName,
      status: true
    };

    return model;
  }

  /**
  * save login
  */
  override saveApiCall(): void {
    const model: LoginModel = this.getLoginModel();
    this.subsink.sink = this.endPoint.addLogin(model).subscribe((response) => {
      if (this.handleApiResponse(response, `User (${model.userName}) added successfully.`)) {        
        this.service.addLogin(model);
      }
    });
  }

  /**
* update login
*/
  editLogin(content: any, data: any): void {
    this.resettingPwd = false;
    this.modalTitle = "Edit User Login";
    this.updateItem(content, data, data.userName);
  }

  override updateApiCall(): void {
    let model: LoginModel = this.getLoginModel();
    if (this.resettingPwd) {
      this.subsink.sink = this.endPoint.updateLogin(model).subscribe((response) => {
        if (this.handleApiResponse(response, `User (${model.userName}) password reset successfully.`)) {
          this.resettingPwd = false;
          this.service.updateLogin(model);
        }
      });
    } else {
      if(!model.userPwd) {
        model.userPwd = this.lastTouchedPwd;
      }

      this.subsink.sink = this.endPoint.updateLogin(model).subscribe((response) => {
        if (this.handleApiResponse(response, `User (${model.userName}) updated successfully.`)) {
          this.service.updateLogin(model);
        }
      });
    }
  }

  /**
 * Update login status
 */
  updateLoginStatus(data: any) {
    data.branchId = this.branchId;
    data.dbName = this.dbName;
    this.subsink.sink = this.endPoint.updateLoginStatus(data).subscribe(response => {
      if (!this.handleApiResponse(response, `User (${data.userName}) status updated successfully.`)) {
        data.status = !data.status;
      }
    }, (err) => {
      data.status = !data.status;
    });
  }

  /**
* Update login sms send status
*/
  updateLoginSMSStatus(data: any) {
    data.branchId = this.branchId;
    data.dbName = this.dbName;
    this.subsink.sink = this.endPoint.updateSMSStatus(data).subscribe(response => {
      if (!this.handleApiResponse(response, `User (${data.userName}) login SMS status updated successfully.`)) {
        data.sendSMS = !data.sendSMS;
      }
    }, (err) => {
      data.status = !data.status;
    });
  }

  override deleteApiCall(model: any) {
    model.branchId = this.branchId;
    model.dbName = this.dbName;

    if(!model.userPwd) {
      model.userPwd = this.lastTouchedPwd;
    }

    this.subsink.sink = this.endPoint.deleteLogin(model).subscribe((response) => {
      if (this.handleApiResponse(response, `User (${model.userName}) deleted successfully.`)) {
        this.service.deleteLogin(model.userName);
      }
    });
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  resettingPwd: boolean = false;
  resetPwd(content: any, data: any): void {
    this.modalTitle = "Reset User Password";
    this.resettingPwd = true;
    this.baseForm.get('userName')?.disable();
    this.baseForm.get('userPwd')?.enable();
    this.baseForm.get('mobileNo')?.disable();

    this.updateItem(content, data, data.userName);
  }
}