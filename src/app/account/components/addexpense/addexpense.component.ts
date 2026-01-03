import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { IncomeComponent } from '../income/income.component';
import { ExpensesComponent } from '../expenses/expenses.component';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ExpensesEndpoint } from '../../endpoints/expense.endpoint';
import { IncomeEndpoint } from '../../endpoints/income.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { Validators } from 'ngx-editor';
import { Expense } from '../../models/expense/expense.model';
import { Income } from '../../models/income/income.model';

@Component({
  selector: 'app-addexpense',
  templateUrl: './addexpense.component.html',
  styleUrls: ['./addexpense.component.scss']
})
export class AddexpenseComponent extends BaseComponent<any> {

  @ViewChild(IncomeComponent) IncomeComponent!: IncomeComponent;
  @ViewChild(ExpensesComponent) ExpensesComponent!: ExpensesComponent;

  @Input() income: any ;
  @Input() expense: any ;

  @Output() saved: EventEmitter<any> = new EventEmitter<any>() ;

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
    private formBuilder: UntypedFormBuilder,
    private cookieSrvc: CookieStorageService,
    public timeSrvc: TimeConversionService,
    public capital: CaptilizeService,
    private expenseEndPoint: ExpensesEndpoint,
    private incomeEndPoint: IncomeEndpoint,
    private staffEndpoint: StaffEndpoint,
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
      // this.account_to = data.results.filter((item: any) => item.is_active);
    // });

    this.subsink.sink = this.staffEndpoint.getAllStaff().subscribe((data: any) => {
      this.staffs = data;
      this.account_to = data ;
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
      expense_date: [ this.expense?.expense_date || this.timeSrvc.getTodaysDate(), Validators.required],
      amount: [ this.expense?.amount || null, Validators.required ] ,
      description: [ this.expense?.description || null, Validators.required ],
      invoice_no: [ this.expense?.invoice_no || null , Validators.required ],
      expense_type: [ this.expense?.expense_type || null , Validators.required],
      paid_to: [ this.expense?.paid_to || null , Validators.required],
      pay_mode: [ this.expense?.pay_mode || null , Validators.required],
      account_to: [ this.expense?.account_to || null , Validators.required],
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
      income_date: [ this.income?.income_date || this.timeSrvc.getTodaysDate(), Validators.required],
      amount: [ this.income?.amount || null , Validators.required],
      description: [ this.income?.description || null , Validators.required],
      // income_id: ['', Validators.required],
      is_authorized: true,
      income_type: [ this.income?.income_type || null , Validators.required],
      received_from: [ this.income?.received_from || null , Validators.required],
      pay_mode: [ this.income?.pay_mode || null, Validators.required],
      account_to: [ this.income?.account_to || null , Validators.required],
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
      id: this.expense.id,
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
      id: this.income.id,
      income_date: this.incomeForm.get('income_date')?.value,
      amount: this.incomeForm.get('amount')?.value,
      description: this.incomeForm.get('description')?.value,
      is_authorized: this.incomeForm.get('is_authorized')?.value || false,
      income_type: this.incomeForm.get('income_type')?.value?.id,
      received_from: this.incomeForm.get('received_from')?.value?.id,
      pay_mode: this.incomeForm.get('pay_mode')?.value?.id,
      account_to: this.incomeForm.get('account_to')?.value?.id,
      authorized_by: this.getStaffId() ? this.getStaffId() : null,

      // income_id: this.incomeForm.get('').income_id,
      // received_from: 1, //mistake on server 

    };

    // if(!model.income_type) model.income_type = this.incomeType.find((item: any)=> item.name == this.income.income_type)?.id ;

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
        this.subsink.sink = this.expenseEndPoint.updateExpense(model).subscribe((response) => {
          this.saved.emit(response) ;
          this.alertService.showSuccess("Updated.");
          this.modalService.dismissAll();
        }, (error) => {
          this.showAPIError(error);
        })

      } else {
        this.alertService.showInfo("Enter All Fields")
        this.Expensesubmitted = true;
      }
    }

    else if (url === "income") {

      if (this.incomeForm.valid) {

        const model: any = this.getIncomeModel();

        this.subsink.sink = this.incomeEndPoint.updateIncome(model).subscribe((response) => {
          this.saved.emit(response) ;
          this.alertService.showSuccess("Updated.");
          this.modalService.dismissAll();
        }, (error) => { this.showAPIError(error); }
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


}
