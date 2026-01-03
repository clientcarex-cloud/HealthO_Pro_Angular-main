import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { Income } from '../../models/income/income.model';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { ExpensesEndpoint } from '../../endpoints/expense.endpoint';
import { Expense } from '../../models/expense/expense.model';
import { IncomeEndpoint } from '../../endpoints/income.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { IncomeComponent } from '../income/income.component';
import { ExpensesComponent } from '../expenses/expenses.component';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent extends BaseComponent<Expense | Income> {


  activeTab: any = 1 ;

  @ViewChild(IncomeComponent) IncomeComponent!: IncomeComponent;
  @ViewChild(ExpensesComponent) ExpensesComponent!: ExpensesComponent;

  expenseType!: any[];
  paymentModes!: any[];
  paid_to_types!: any[];
  account_to!: any[];

  expenseForm!: UntypedFormGroup;
  incomeForm!: UntypedFormGroup;
  expenseTypeForm!: UntypedFormGroup;
  incomeTypeForm!: UntypedFormGroup;
  paidToTypeForm!: UntypedFormGroup;
  AccToTypeForm!: UntypedFormGroup;
  incomeType!: any[];


  constructor(
    injector: Injector,
    private expenseEndPoint: ExpensesEndpoint,
    private incomeEndPoint: IncomeEndpoint,
    private formBuilder: UntypedFormBuilder,
    private cookieSrvc: CookieStorageService,
    public capital: CaptilizeService,
    private staffEndpoint: StaffEndpoint,
    public timeSrvc: TimeConversionService,
    private proEndpoint: ProEndpoint
  ) { super(injector) }


  getStaffId() {
    const data = this.cookieSrvc.getCookieData()
    return data.lab_staff_id;
  }

  staffs: any = [];
  receivedFroms: any = [] ;

  override ngOnInit(): void {

    this.subsink.sink = this.proEndpoint.getPayModes().subscribe((data: any) => {
      this.paymentModes = data.results.filter((item: any) => item.is_active);
    });

    this.getExpenseTypes();
    this.getIncomeTypes();
    this.getReceivedFrom();

    this.subsink.sink = this.expenseEndPoint.getPaidTo_types().subscribe((data: any) => {
      this.paid_to_types = data.results.filter((item: any) => item.is_active);
    });

    // this.subsink.sink = this.expenseEndPoint.getAccount_To().subscribe((data: any) => {
    //   this.account_to = data.results.filter((item: any) => item.is_active);
    // });

    this.subsink.sink = this.staffEndpoint.getAllStaff().subscribe((data: any) => {
      this.staffs = data;
      this.account_to = data;
    });

    this.initializeExpenseForm();
    this.initializeIncomeForm();
    this.initializeExpenseTypeForm();
    this.initializeIncomeTypeForm();
    this.initializePaidTypeForm();
    this.initializeAccTypeForm();

  }

  getExpenseTypes() {
    this.subsink.sink = this.expenseEndPoint.getExpenseType().subscribe((data: any) => {
      this.expenseType = data.results.filter((item: any) => item.is_active);
    });
  }

  getPaidTypes() {
    this.subsink.sink = this.expenseEndPoint.getPaidTo_types().subscribe((data: any) => {
      this.paid_to_types = data.results.filter((item: any) => item.is_active);
    });
  }

  getAccTypes() {
    this.subsink.sink = this.expenseEndPoint.getPaidTo_types().subscribe((data: any) => {
      this.paid_to_types = data.results.filter((item: any) => item.is_active);
    });
  }

  getIncomeTypes() {
    this.subsink.sink = this.incomeEndPoint.getIncomeType().subscribe((data: any) => {
      this.incomeType = data.results.filter((item: any) => item.is_active);
    });
  }

  getReceivedFrom(){
    this.subsink.sink = this.incomeEndPoint.getReceivedFrom().subscribe((data: any) => {
      this.receivedFroms = data ;
    });
  }

  initializeExpenseForm() {
    this.expenseForm = this.formBuilder.group({
      expense_date: [this.timeSrvc.getTodaysDate(), Validators.required],
      amount: ["", Validators.required],
      description: ['', Validators.required],
      invoice_no: ['', Validators.required],
      expense_type: [null, Validators.required],
      paid_to: [null, Validators.required],
      pay_mode: [null, Validators.required],
      account_to: [null, Validators.required],
      is_authorized: true,
      authorized_by: this.getStaffId(),
    });
  }

  resetExpenseForm() {
    this.expenseForm.reset();
    this.initializeExpenseForm();
  }

  initializeIncomeForm() {
    this.incomeForm = this.formBuilder.group({
      income_date: [this.timeSrvc.getTodaysDate(), Validators.required],
      amount: ["", Validators.required],
      description: ['', Validators.required],
      // income_id: ['', Validators.required],
      is_authorized: true,
      income_type: [null, Validators.required],
      received_from: [null, Validators.required],
      pay_mode: [null, Validators.required],
      account_to: [null, Validators.required],
      authorized_by: this.getStaffId(),
    });
  }

  resetIncomeForm() {
    this.incomeForm.reset();
    this.initializeIncomeForm();
  }

  initializeIncomeTypeForm() {
    this.expenseTypeForm = this.formBuilder.group({
      name: ["", Validators.required],
      is_active: [false, Validators.required]
    })
  }

  initializePaidTypeForm() {
    this.paidToTypeForm = this.formBuilder.group({
      name: ["", Validators.required],
      is_active: [true, Validators.required]
    })
  }

  initializeAccTypeForm() {

    this.AccToTypeForm = this.formBuilder.group({
      name: ["", Validators.required],
      is_active: [true, Validators.required]
    })
  }


  getAccountType() {
    this.subsink.sink = this.expenseEndPoint.getAccount_To().subscribe((data: any) => {
      this.account_to = data.results.filter((item: any) => item.is_active);
    });
  }

  initializeExpenseTypeForm() {
    this.incomeTypeForm = this.formBuilder.group({
      incmTypename: ["", Validators.required],
      is_active_incm: [true, Validators.required]
    })

  }

  resetForm() {
    this.expenseForm.reset();

    this.incomeForm.reset();

    this.expenseTypeForm.reset();

    this.incomeTypeForm.reset();

    this.initializeExpenseForm();

    this.initializeIncomeForm();

    this.initializeExpenseTypeForm();

    this.initializeIncomeTypeForm();
  }



  CapitalizeDescIncome(event: any) {
    const value = event;
    if (value.length > 0) {
      this.incomeForm.patchValue({
        description: value.charAt(0).toUpperCase() + value.slice(1)
      }, { emitEvent: false });
    }
  }


  private getExpenseModel(): Expense {
    const model: any = {
      expense_date: this.expenseForm.value?.expense_date,
      amount: this.expenseForm.value?.amount,
      description: this.expenseForm.value?.description,
      invoice_no: this.expenseForm.value?.invoice_no,
      is_authorized: true,
      expense_type: this.expenseForm.value?.expense_type?.id || null,
      paid_to: this.expenseForm.value?.paid_to?.id || null,
      pay_mode: this.expenseForm.value?.pay_mode?.id || null,
      account_to: this.expenseForm.value?.account_to?.id || null,
      authorized_by: this.getStaffId() ? this.getStaffId() : null,

    };
    return model;
  }

  private getIncomeModel(): Income {
    const model: any = {
      income_date: this.incomeForm.value?.income_date,
      amount: this.incomeForm.value?.amount,
      description: this.incomeForm.value?.description,
      // income_id: this.incomeForm.value?.income_id,
      is_authorized: this.incomeForm.value?.is_authorized || false,
      income_type: this.incomeForm.value?.income_type?.id,
      received_from: this.incomeForm.value?.received_from?.id,
      // received_from: 1, //mistake on server 
      pay_mode: this.incomeForm.value?.pay_mode?.id,
      account_to: this.incomeForm.value?.account_to?.id,
      authorized_by: this.getStaffId() ? this.getStaffId() : null,

    };
    return model;
  }

  private getExpenseTypeForm() {
    const model: { name: string, is_active: boolean, } = {
      name: this.expenseTypeForm.value?.name,
      is_active: this.expenseTypeForm.value?.is_active,

    }
    return model;
  }


  private getIncomeTypeForm() {
    const model: { name: string, is_active: boolean, } = {
      name: this.incomeTypeForm.value?.incmTypename,
      is_active: this.incomeTypeForm.value?.is_active_incm,

    }
    return model;
  }

  typeSubmit: boolean = false;
  Expensesubmitted: boolean = false;


  saveApiCalll(url: string): any {

    if (url === "expense") {

      if (this.expenseForm.valid) {
        const model: Expense = this.getExpenseModel();
        this.subsink.sink = this.expenseEndPoint.addExpense(model).subscribe((response) => {
          this.ExpensesComponent.getData();
          this.resetExpenseForm();
          this.alertService.showSuccess("Expense Added", "Successful");
          this.Expensesubmitted = false;
          this.modalService.dismissAll();
        }, (error) => {
          this.alertService.showError("Failed to Add Income", error);
        })
      } else {
        this.alertService.showInfo("Enter All Fields")
        this.Expensesubmitted = true;
      }
    }

    else if (url === "income") {

      if (this.incomeForm.valid) {
        const model: Income = this.getIncomeModel();
        this.subsink.sink = this.incomeEndPoint.addIncome(model).subscribe((response) => {
          // this.resetForm();
          this.IncomeComponent.getData();
          this.resetIncomeForm();
          this.alertService.showSuccess("Income Added", "Successful");
          this.modalService.dismissAll();
        }, (error) => { this.alertService.showError("Failed to Add Income", error); }
        )
      } else {
        this.submitted = true;
      }

    }

    else if (url === "expsTp") {

      if (this.expenseTypeForm.valid) {
        const model: { name: string, is_active: boolean } = this.getExpenseTypeForm();

        this.subsink.sink = this.expenseEndPoint.addExpenseType(model).subscribe((response) => {
          this.expenseTypeForm.reset();
          this.initializeExpenseTypeForm();
          this.alertService.showSuccess("Expense Type Added", "Successful");
          this.getExpenseTypes();
          this.typeSubmit = false;
        }, (error) => {
          this.alertService.showError("Expense Type Adding Failed", error);

        })
      } else {
        this.typeSubmit = true
      }
    }

    else if (url === "incmTp") {
      if (this.incomeTypeForm.valid) {
        const model: { name: string, is_active: boolean } = this.getIncomeTypeForm();
        this.subsink.sink = this.incomeEndPoint.addIncomeType(model).subscribe((response) => {
          this.incomeTypeForm.reset();
          this.initializeIncomeTypeForm();
          this.alertService.showSuccess("Income Type Added", "Successful");
          this.getIncomeTypes();
          this.incomeType.push(response);
          this.typeSubmit = false;
        }, (error) => {
          this.alertService.showError("Failed to Add Income Type", error);
        })
      } else {
        this.typeSubmit = true
      }
    }

    else if (url === "paidToName") {

      if (this.paidToTypeForm.valid) {
        // const model: {name:string, is_active:boolean} = this.getExpenseTypeForm();

        this.subsink.sink = this.expenseEndPoint.addPaidToType(this.paidToTypeForm.value).subscribe((response) => {
          this.paidToTypeForm.reset();
          this.initializePaidTypeForm();
          this.alertService.showSuccess("Added", "Successful");
          this.getPaidTypes()
          this.typeSubmit = false;
        }, (error) => {
          this.alertService.showError("Adding Failed", error);

        })
      } else {
        this.typeSubmit = true
      }
    }

    else if (url === "accTo") {

      if (this.AccToTypeForm.valid) {

        this.subsink.sink = this.expenseEndPoint.addAccToType(this.AccToTypeForm.value).subscribe((response) => {
          this.AccToTypeForm.reset();
          this.initializeAccTypeForm();
          this.alertService.showSuccess("Added", "Successful");
          this.getAccountType();
          this.typeSubmit = false;
        }, (error) => {
          this.alertService.showError("Adding Failed", error);

        })
      } else {
        this.typeSubmit = true
      }
    }
  }



  saveReceivedFrom(modal: any){
    if (this.AccToTypeForm.valid) {
      this.subsink.sink = this.incomeEndPoint.postReceivedFrom(this.AccToTypeForm.value).subscribe((res: any)=>{
        this.getReceivedFrom();
        this.AccToTypeForm.reset();
        this.typeSubmit = false;
        this.alertService.showSuccess("Added", "Successful");
        modal.dismiss();
      }, (error)=>{ this.showAPIError(error) })
    }
  }

  openXl(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop });
  }

  enterName(type: any = 1, e: any) {
    if (type == 1) {
      this.paidToTypeForm.get('name')?.setValue(this.capital.AutoName(e))
    } else {
      this.AccToTypeForm.get('name')?.setValue(this.capital.AutoName(e))
    }

  }
}
