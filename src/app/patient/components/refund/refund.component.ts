import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { AddPatientEndpoint } from '../../endpoints/addpatient.endpoint';
import { PrintService } from '@sharedcommon/service/print.service';

@Component({
  selector: 'app-refund',
  templateUrl: './refund.component.html',
  styleUrl: './refund.component.scss'
})

export class RefundComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    public capitalSrvc: CaptilizeService,
    private cookieSrvc: CookieStorageService,
    private printSrvc: PrintService,

    private endPoint: AddPatientEndpoint
  ){ super(injector) }

  @Input() ptn: any ;
  @Input() staffId : any ;
  @Input() checkRefundLimit: any = 0 ;
  @Input() checkTestLimit: any = 0;
  @Input() payModes: any;

  @Input() refundTests: any = [];
  @Input() refundPackages: any = [] ;

  @Input() modal: any ;

  @Output() saved: EventEmitter<any> = new EventEmitter<any>() ;

  cancelTestId!: any;
  cancelPackageId!: any;

  refundform !: any ;

  refundLoading: boolean = false ;

  override ngOnInit(): void {
    this.initializeRefundForm();
  }

  initializeRefundForm() {
    this.refundform = this.formBuilder.group({
      test: [null],
      package: [null],
      refund: [null, Validators.required],
      remarks: [""],
      remarks_from_staff: ['', Validators.required],
      add_refund_to_due: [false, Validators.required],
      refund_mode: [1, Validators.required],
      refund_limit: [null]
    })
    if (this.checkRefundLimit === 0) {
      this.refundform.get('refund')?.disable();
      this.refundform.get('add_refund_to_due')?.disable();
      this.refundform.get('refund_mode')?.disable();
    }
  }

  getRefundModel() {
    const model = {
      refund: this.refundform.get('refund')?.value,
      remarks: this.refundform.get('remarks')?.value,
      patient: this.ptn.id,
      created_by: this.staffId,
      remarks_from_staff: this.refundform.get('remarks_from_staff')?.value,
      add_refund_to_due: this.refundform.get('add_refund_to_due')?.value,
      tests: [],
      refund_mode: this.refundform.get('refund_mode')?.value,
    }
    return model;
  }

  saveRefund(test: boolean) {

    if (test) {
      if (this.refundform.valid) {
        this.refundLoading = true;
        this.refundform.disable();
        const refund = this.getRefundModel();
        this.subsink.sink = this.endPoint.postRefund(refund).subscribe((Response) => {

          this.saved.emit(Response)
          this.alertService.showSuccess("Refunded", refund.refund);
          this.refundLoading = false;
          this.refundform.enable();
          this.resetRefundForm();

          this.print_patient_refund_slip(Response)
        }, (error) => {
          this.refundLoading = false;
          this.refundform.enable();
          this.alertService.showError(error.error.error, "");
        })
      } else {
        // Object.keys(this.refundform.controls).forEach(key => {
        //   const control = this.refundform.get(key);
        //   if (control && !control.valid) {
        //     this.alertService.showError("", `Enter ${this.capitalSrvc.AutoName(key.replace("_", " "))}`)
        //   }
        // });
        this.showBaseFormErrors(this.refundform.controls);
      }
    } else {

      if (this.refundform.valid && (this.cancelTestId?.length !== 0 || this.cancelPackageId?.length !== 0)) {
        this.refundLoading = true;
        this.refundform.disable();
        let testIds: any = [];
        let remarkText: string = "Tests Cancelled ";
        if ((this.cancelTestId && this.cancelTestId.length !== 0)) {
          this.cancelTestId?.forEach((test: any) => {
            testIds.push(test.LabGlobalTestId);
            remarkText += test.name + ","
          });
        }


        let packageIds: any = [];

        if ((this.cancelPackageId && this.cancelPackageId.length !== 0)) {
          remarkText += "\nPackage Cancelled : ";

          this.cancelPackageId?.forEach((test: any, index: number) => {
            packageIds.push(test.id.replace("pkg", ""));
            remarkText += test.name;
            if (index !== this.cancelPackageId.length - 1) {
              remarkText += ', ';
            }
          });
        }


        const model = {
          tests: testIds,
          packages: packageIds,
          refund: this.refundform.get('refund')?.value,
          remarks: this.refundform.get('remarks')?.value,
          remarks_from_staff: this.refundform.get('remarks_from_staff')?.value,
          patient: this.ptn.id,
          created_by: this.staffId,
          add_refund_to_due: false,
          refund_mode: this.refundform.get('refund_mode')?.value,
        }
        this.subsink.sink = this.endPoint.postRefund(model).subscribe((Response) => {
          
          this.saved.emit(Response)

          this.alertService.showSuccess("Refunded", model?.refund);
          this.resetRefundForm();

          this.refundLoading = false;
          this.refundform.enable();
          this.print_patient_refund_slip(Response)
        }, (error) => {
          this.refundLoading = false;
          this.refundform.enable();
          this.alertService.showError(error.error.error, "")
        })
      } else {
        this.cancelTestId && this.cancelTestId?.length === 0 ? this.alertService.showError("", "Select Atleast One Test") : ""

        !this.refundform.get("remarks_from_staff")?.value ? this.alertService.showError("", "Enter Remarks") : "";
        !this.refundform.get("refund_mode")?.value ? this.alertService.showError("", "Enter Refund Mode") : "";
      }
    }
  }



  patientTestCancel() {
    if ((this.cancelTestId && this.cancelTestId.length !== 0) || (this.cancelPackageId && this.cancelPackageId.length !== 0)) {

      let testIds: any[] = [];
      let packageIds: any = [];
      let remarkText: string = "";

      if ((this.cancelTestId && this.cancelTestId.length !== 0)) {
        remarkText += "Tests Cancelled : ";
        this.cancelTestId?.forEach((test: any, index: number) => {
          testIds.push(test.LabGlobalTestId);
          remarkText += test.name;
          if (index !== this.cancelTestId.length - 1) {
            remarkText += ', ';
          }
        });
      }

      if ((this.cancelPackageId && this.cancelPackageId.length !== 0)) {
        remarkText += "\nPackage Cancelled : ";

        this.cancelPackageId?.forEach((test: any, index: number) => {
          packageIds.push(test.id.replace("pkg", ""));
          remarkText += test.name;
          if (index !== this.cancelPackageId.length - 1) {
            remarkText += ', ';
          }
        });
      }

      // Ensure the remarkText ends with a period
      if (remarkText.endsWith(', ')) {
        remarkText = remarkText.slice(0, -2); // Remove the trailing comma
      }
      remarkText += '.';

        const model = {
          tests: testIds,
          packages: packageIds,
          refund: "0",
          remarks: remarkText,
          patient: this.ptn.id,
          created_by: this.staffId,
          add_refund_to_due: false,
          refund_mode: 1
        }

        this.subsink.sink = this.endPoint.postRefund(model).subscribe((Response) => {
          this.saved.emit(Response)
          this.alertService.showSuccess(remarkText);
          this.resetRefundForm();
        }, (error) => {
          this.showAPIError(error);
        })

    } else {
      this.alertService.showError("Select Atleast One Test")
    }
  }


  print_patient_refund_slip(refund: any) {

    const model = {
      client_id: this.cookieSrvc.getCookieData().client_id,
      patient_id: this.ptn.id,
      refund_id: refund.id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id
    }

    this.subsink.sink = this.endPoint.PostAndGetPatientRefundSlip(model).subscribe((data: any) => {
      this.printSrvc.print(data.html_content)
    }, (error) => {
      this.showAPIError(error)
    })
  }


  getMaxRefundLimit(withTests: boolean = true) {
    const model: any = {
      patient_id: this.ptn.id,
      test_package_ids: [],
      test_ids: []
    }

    if (withTests) {
      if (this.cancelTestId) {
        this.cancelTestId.forEach((test: any) => {
          model.test_ids.push(test.LabGlobalTestId)
        })
      }

      if (this.cancelPackageId) {
        this.cancelPackageId.forEach((test: any) => {
          model.test_package_ids.push(parseInt(test.id.replace("pkg", "")));
        })
      }
    }

    this.subsink.sink = this.endPoint.getRefundMaxList(model).subscribe((response: any) => {
      if (response.refund_max_limit >= 0) {
        this.refundform.get('refund_limit')?.setValue(response.refund_max_limit);
        this.refundform.get('refund')?.setValue(response.refund_max_limit);
      } else {
        this.refundform.get('refund_limit')?.setValue(0);
        this.refundform.get('refund')?.setValue(0);
      }

    })
  }

  // utilities 

  dismiss(){
    this.modal.dismiss()
  }

  validateRefund(e: any) {
    this.refundform.get('refund')?.setValue(e)
  }

  resetRefundForm() {
    this.refundform.reset();
    this.initializeRefundForm();
    this.cancelTestId = null;
    this.cancelPackageId = null;
  }

  
  saveRefundRemark() {
    let remarkText: string = "";

    if ((this.cancelTestId && this.cancelTestId.length !== 0)) {
      remarkText += "Tests Cancelled : ";
      this.cancelTestId?.forEach((test: any, index: number) => {

        remarkText += test.name;
        if (index !== this.cancelTestId.length - 1) {
          remarkText += ', ';
        }
      });

    }

    if ((this.cancelPackageId && this.cancelPackageId.length !== 0)) {
      remarkText += "\nPackage Cancelled : ";
      this.cancelPackageId?.forEach((test: any, index: number) => {
        remarkText += test.name;
        if (index !== this.cancelPackageId.length - 1) {
          remarkText += ', ';
        }
      });

    }

    // Ensure the remarkText ends with a period
    if (remarkText.endsWith(', ')) {
      remarkText = remarkText.slice(0, -2); // Remove the trailing comma
    }
    remarkText += '.';
    this.refundform.get('remarks')?.setValue(remarkText);
    this.refundform.get('package')?.setValue(this.cancelPackageId);

    if ((this.cancelTestId && this.cancelTestId?.length != 0) || (this.cancelPackageId && this.cancelPackageId?.length != 0)) {
      this.getMaxRefundLimit();
    } else {
      this.refundform.get("refund")?.setValue("")
    }
  }


  cancelPackage(e: any) {
    if (e && e !== "") {

      this.refundform.get('refund')?.setValue("");

      this.cancelPackageId = e;

      this.checkTestLimit = 0;
      this.cancelPackageId.forEach((test: any) => {
        this.checkTestLimit += parseFloat(test.total.replace(/,/g, ''))
      })

      this.saveRefundRemark();

    } else {
      this.refundform.get("refund")?.setValue("")
      this.cancelPackageId = null;
    }
  }

  cancelTest(e: any) {
    if (e && e !== "") {
      this.refundform.get('refund')?.setValue("")
      this.cancelTestId = e;
      this.checkTestLimit = 0;
      this.cancelTestId.forEach((test: any) => {
        this.checkTestLimit += parseFloat(test.total.replace(/,/g, ''))
      })

      this.saveRefundRemark();

    } else {
      this.refundform.get('refund')?.setValue("")
      this.cancelTestId = null;
    }
  }

}
