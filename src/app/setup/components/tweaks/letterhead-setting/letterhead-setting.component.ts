import { Component, Injector, Input } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { FileService } from '@sharedcommon/service/file.service';
import { Validators } from 'ngx-editor';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { SignUpEndpoint } from 'src/app/login/endpoint/signup.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';

@Component({
  selector: 'app-letterhead-setting',
  templateUrl: './letterhead-setting.component.html',
})
export class LetterheadSettingComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: SignUpEndpoint,
    private proEndpoint: ProEndpoint,
    private masterEndpoint: MasterEndpoint,
    private cookieSrvc: CookieStorageService,
    private fileSrvc: FileService,
    private formBuilder: UntypedFormBuilder,) { super(injector) }

  @Input() hideExtra: boolean = false;

  @Input() ref_lab: any = null;

  loading: boolean = false;
  errorShow: boolean = false;

  organization: any;
  settings: any;
  indexNum: number[] = [];
  leftNRight: number[] = [];
  fonts: any;

  override ngOnInit(): void {
    this.initializeForm();
  }

  override ngAfterViewInit(): void {

    let i = 0;
    while (i < 265) {
      this.indexNum.push(i);
      i += 5;
    }

    let j = 0;
    while (j < 85) {
      this.leftNRight.push(j);
      j += 5;
    }


    this.loading = true;

    this.subsink.sink = this.endPoint.getBusinessProfile(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      this.organization = data[0];
    })

    this.subsink.sink = this.proEndpoint.getFonts().subscribe((res: any) => {
      this.fonts = res;
    })

    if (!this.ref_lab) this.getOrganizationLetterheadSettings();
    else this.getSourcingLetterhead();

  }


  getSourcingLetterhead() {
    this.subsink.sink = this.masterEndpoint.getSourcingLabLetterhead(this.ref_lab?.id).subscribe((data: any) => {
      this.loading = false;
      if (data.length !== 0) {
        this.settings = data[0];
        this.setSettings(data);
      } else {
        this.postLetterHEadSetting();
      }
    }, (error) => {
      this.errorShow = true;
      this.loading = false;
    })
  }


  getOrganizationLetterheadSettings() {
    this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      this.loading = false;
      if (data.length !== 0) {
        this.settings = data[0];
        this.setSettings(data);
      } else {
        this.postLetterHEadSetting();
      }
    }, (error) => {
      this.errorShow = true;
      this.loading = false;
    })
  }

  setSettings(data: any) {
    this.baseForm.get("header")?.setValue(parseInt(data[0].header_height));
    this.baseForm.get("footer")?.setValue(parseInt(data[0].footer_height));
    this.baseForm.get("margin_left")?.setValue(parseInt(data[0].margin_left));
    this.baseForm.get("margin_right")?.setValue(parseInt(data[0].margin_right));
    this.baseForm.get('display_letterhead')?.setValue(data[0].display_letterhead);
    this.baseForm.get('b_letterhead')?.setValue(data[0].letterhead);
    this.baseForm.get('invoice_space')?.setValue(data[0].invoice_space);
    this.baseForm.get('receipt_space')?.setValue(data[0].receipt_space);
    this.baseForm.get('display_page_no')?.setValue(data[0].display_page_no);
    this.baseForm.get('default_font')?.setValue(data[0]?.default_font?.id || null);
  }

  initializeForm() {
    this.baseForm = this.formBuilder.group({
      b_letterhead: [''],
      header: [null],
      footer: [null],
      margin_left: [null],
      margin_right: [null],
      display_letterhead: [false],
      invoice_space: [false],
      receipt_space: [false],
      display_page_no: [false],
      default_font: [3],
    });
  }


  changesMade: boolean = false;
  onFileChanged(event: any, name: any): void {
    const file = event.target.files[0];
    this.changesMade = true;
    if (file) {
      this.fileSrvc.convertToBase64(file).then((base64String: string) => {
        // Assign base64 string to form control
        this.baseForm.get(name)?.setValue(base64String);
        this.updateSetting();
      });
    }
  }

  clearLogo(name: any) {
    this.changesMade = true;
    this.baseForm.get(name)?.setValue(null);
    this.baseForm.get('display_letterhead')?.setValue(false);
    this.updateSetting();
  }

  getModal() {
    const model = {
      id: this.settings.id,
      client: this.cookieSrvc.getCookieData().client_id,
      header_height: this.baseForm.get('header')?.value,
      footer_height: this.baseForm.get('footer')?.value,
      margin_left: this.baseForm.get('margin_left')?.value,
      margin_right: this.baseForm.get('margin_right')?.value,
      display_letterhead: this.baseForm.get('display_letterhead')?.value,
      receipt_space: this.baseForm.get('receipt_space')?.value,
      invoice_space: this.baseForm.get('invoice_space')?.value,
      default_font: this.baseForm.get('default_font')?.value,
      display_page_no: this.baseForm.get('display_page_no')?.value
    }

    return model;
  }


  updateSetting() {
    if(this.ref_lab){
      this.updateSourcingLHSettings();
    }else{
      this.updateOrgSettings();
    }
  }

  updateOrgSettings(){
    if (this.changesMade) {
      const org = {
        id: this.organization.id,
        b_letterhead: this.baseForm.get('b_letterhead')?.value,
        phone_number: this.organization.phone_number,
        provider_type: this.organization.provider_type
      }

      this.subsink.sink = this.endPoint.updateBusinessProfile(org, this.organization.id).subscribe((response: any) => {
        this.alertService.showSuccess("Saved.")
      },
        (error: any) => {
          this.alertService.showError(error?.error?.Error || error?.error?.error || error, 'Error updating details.');
        }
      );
    }

    const model = this.getModal();

    this.subsink.sink = this.masterEndpoint.UpdateLetterHeadSetting(model).subscribe((res: any) => {
      
    }, (error) => {
      this.alertService.showError('Error In Updating LetterHead Margins');
    })
  }

  updateSourcingLHSettings(){
    const model: any = this.getModal();
    model['letterhead'] = this.baseForm.get('b_letterhead')?.value,
    model['sourcing_lab'] = this.ref_lab?.id ;
    this.subsink.sink = this.masterEndpoint.UpdateSourcingLetterHeadSetting(model).subscribe((res: any) => {
      this.alertService.showSuccess('Settings Saved.')
    }, (error) => {
      this.showAPIError(error);
    })
  }


  postLetterHEadSetting() {
    const model = {
      client: this.cookieSrvc.getCookieData().client_id,
      header_height: 100,
      footer_height: 100,
      margin_left: 10,
      margin_right: 10,
      default_font: 1,
      receipt_space: true,
      invoice_space: true,
    }

    this.subsink.sink = this.masterEndpoint.PostLetterHeadSetting(model).subscribe((data: any) => {
      this.getData();
    })
  }

  getData() {
    this.subsink.sink = this.masterEndpoint.getLetterHeadSetting(this.cookieSrvc.getCookieData().client_id).subscribe((data: any) => {
      if (data.length !== 0) {
        this.settings = data[0];
        this.baseForm.get("header")?.setValue(parseInt(data[0].header_height));
        this.baseForm.get("footer")?.setValue(parseInt(data[0].footer_height));
      }
    })
  }

  checkIfFormChanged(): any {

  }

  returnStyle() {
    const font = this.baseForm.get("default_font")?.value;
    if (font && this.fonts) {
      return this.fonts.find((f: any) => f.id == font)
    } else {
      return null
    }
  }
}
