import { Component, Injector,ViewChildren, QueryList, ViewChild } from '@angular/core';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { NgbdSortableHeader, SortEvent } from '@sharedcommon/directives/sortable.directive'
import { BaseComponent } from '@sharedcommon/base/base.component';
import { ExpensesEndpoint } from '../../endpoints/expense.endpoint';
import { Expense } from '../../models/expense/expense.model';
import { ExpensesService } from '../../services/expense.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { PrintService } from '@sharedcommon/service/print.service';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  providers: [ExpensesService]
})

export class ExpensesComponent extends BaseComponent<Expense> {


  selected_item: any ;
  
  totalAmount: any = 0 ;
  expensesLength!: number;
  paymentModes!: any[];
  expenseType!: any[];
  paid_to_types!: any[];

  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;

  constructor(
    injector: Injector,
    private endPoint: ExpensesEndpoint,
    public service: ExpensesService,
    public timeSrvc : TimeConversionService,
    private cookieSrvc: CookieStorageService,
    private printSrvc: PrintService
  ) { super(injector); }

  pageNum!: number ;
  override ngOnInit(): void {

    this.page_size = 10;
    this.page_number = 1;
    this.count = 1 ;
    this.all_count = 1;
    this.query = "";
    this.expenses = []

    this.getData()

  }

  count!: number ;
  all_count!: number;
  expenses!:any;
  date: string = this.timeSrvc.getFormattedDate();
  status_id: string = "";
  from_date: string = "";
  to_date: string = ""
  timer:any; 
  page_size!: any ;
  page_number! : any;
  query!:string;
  sort : any = false;
  
  changeSorting(){
    this.sort = !this.sort;
    this.getData();
  }

  @ViewChild('datePicker') datePicker!: AppDatePickerComponent;

  getData(){

    this.totalAmount = 0 ;
    this.expenses = [] ;

    this.subsink.sink = this.endPoint.getPaginatedExpenses(
      this.page_size, this.page_number,
       this.query,
        this.date, this.from_date, this.to_date, this.sort, this.cookieSrvc.getCookieData().lab_staff_id
        ).subscribe((data:any)=>{
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.expenses = data.results ;

      this.expenses.forEach((expense: any)=> this.totalAmount += parseFloat(expense.amount));

      this.totalAmount = this.numberToCurrency(this.totalAmount);
    })
  }

  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page_number = 1;
      this.getData();
      
    }, 1000); // Adjust the delay as needed
  }

  changePageNumber(e:any){
    this.page_size = e.target.value;
    this.getData()
  }

  onPageChange(e:any){
    this.page_number=e;
    this.getData();
  }

  getRangeValue(e:any){
    if(e.length !== 0){
      if(e.includes("to")){
        this.separateDates(e);
      }else{
        this.date = e;
        this.from_date = "";
        this.to_date = "" ;
        this.page_number = 1;
        this.getData();
      }}
      else{
        this.date = this.timeSrvc.getFormattedDate();
        this.from_date = "";
        this.to_date = "";
        this.page_number = 1;
        this.getData();
      }
  }

  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.from_date = startDate;
    this.to_date = endDate ;
    this.date = "";
    this.pageNum = 1;
    this.getData();
  }

  totalExpenses : any ;

  testing(is_print: boolean){

    this.subsink.sink = this.endPoint.getPaginatedExpenses(
      'all', 1, '', this.date, this.from_date, this.to_date, this.sort, '').subscribe((data:any)=>{
        this.totalExpenses = data ;
        
        if(this.totalExpenses.length > 0){
          if(is_print) this.printSrvc.printZeroWithBootstrap(this.getExpensePrint());
          else{
            let title = `Expenses - `
            if(this.date && this.date != "") title += this.date ;
            else title += `${this.from_date} to ${this.to_date}`;
        
            this.printSrvc.exportToExcel(this.getExpenseExcel(), title);
          }
        }else{
          this.alertService.showInfo("No data to print/export.")
        }
    })

  }

  getExpensePrint(){

    let is_print = true ;
    let borderColor = is_print ? '#dee2e6' : '#000';
    let borderString = is_print ? `border: ${is_print ? '0.25px' : '1px'} solid ${borderColor}; ` : '';

    let dateRows = ``;
    if (this.date && this.date != '') {
      dateRows = `
        <tr style="font-size: 11px !important; line-height: 10px; background-color:rgb(239, 243, 254) !important; ">
          <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="6">Date - ${this.timeSrvc.dateAsString(this.date, false, false)}</th>
          <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="5">Printed On - ${this.timeSrvc.dateAsString(null, true, true)}</th>
        </tr>
      `;
    } else {
      dateRows = `
        <tr style="font-size: 11px !important; line-height: 10px;background-color:rgb(239, 243, 254) !important; ">
          <th style="text-align: center; font-weight: bold;" colspan="6">
            Date - ${this.timeSrvc.dateAsString(this.from_date, false, true)}${this.to_date && this.to_date != '' ? ' to ' + this.timeSrvc.dateAsString(this.to_date, false, true) : ''}
          </th>
          <th colspan="6">Printed - ${this.timeSrvc.dateAsString(null, true, true)}</th>
        </tr>
      `;
    }

    let html = `
    <table id="excelReport" style="width: 100%;" class="table table-sm table-bordered">
      <thead class="table-light">
        <tr style="font-size: 11px !important; line-height: 10px;background-color:rgb(239, 243, 254) !important; ">
          <th style="text-align: center;" colspan="11">EXPENSES</th>
        </tr>
        ${dateRows}
        <tr style="font-size: 11px !important; line-height: 10px; background-color:rgb(239, 243, 254) !important; ">
          <th class="text-black">S.no</th>
          <th>Expense Date</th>
          <th><span>Expense</span></th>
          <th>Invoice No.</th>
          <th>Account To</th>
          <th>Authorized At</th>
          <th><span>Authorized By</span></th>
          <th><span>Paid To</span></th>
          <th><span>Remarks</span></th>
          <th><span>Mode</span></th>
          <th class="text-end"><span>Amount</span></th>
        </tr>
      </thead>
      <tbody>
        
    `;


    let expenseAmount = 0;

    this.totalExpenses.forEach((item: any, i:number)=>{
      expenseAmount += parseFloat(item.amount) ;

      const tableColumn = `
        <tr style="line-height: 10px;">
          <td class="patientPrintColumn">
            <small><small>${i+1}</small></small>
          </td>
          <td class="patientPrintColumn">
            <small><small>${this.timeSrvc.formatDateWithDiv(item?.expense_date, '-')}</small></small>
          </td>
          <td class="patientPrintColumn">
            <small><small>${item?.expense_type?.name}</small></small>
          </td>
          <td class="patientPrintColumn">
            <small><small>${item?.invoice_no}</small></small>
          </td>
          <td class="patientPrintColumn">
            <small><small>${item.account_to?.name}</small></small>
          </td>
          <td class="patientPrintColumn">
            <small><small>${this.timeSrvc.formatDateWithDiv(item.added_on, '-')}</small></small>
          </td>
          <td class="patientPrintColumn">
            <small><small>${item?.authorized_by}</small></small>
          </td>
          <td class="patientPrintColumn">
            <small><small>${item.paid_to?.name}</small></small>
          </td>
          <td class="patientPrintColumn">
            <small><small>${item?.description || "-"}</small></small>
          </td>
          <td class="patientPrintColumn">
            <small><small>${item.pay_mode?.name}</small></small>
          </td>
          <td class="text-end">
            <small><small>${item.amount}</small></small>
          </td>
        </tr>
      `;
      html += tableColumn ;
    });

    html += `
        <tr class="bg-muted" style="line-height: 10px; background-color:rgb(239, 243, 254) !important; ">
          <td colspan="10" class="text-end fw-semibold">Total :</td>
          <td class="text-end fw-bold">${expenseAmount}</td>
        </tr>
      </tbody>
    </table>
    `

    return html ;
  }


  getExpenseExcel() {
    let borderString = '';
    let bgColor = `background-color: rgb(239, 243, 254) ;`;
  
    let dateRows = ``;
    if (this.date && this.date != '') {
      dateRows = `
        <tr style="line-height: 10px; ${bgColor} ">
          <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="6">Date - ${this.timeSrvc.dateAsString(this.date, false, false)}</th>
          <th class="patientPrintColumn" style="text-align: center; font-weight: bold;" colspan="5">Printed On - ${this.timeSrvc.dateAsString(null, true, true)}</th>
        </tr>
      `;
    } else {
      dateRows = `
        <tr style="line-height: 10px; ${bgColor} ">
          <th style="text-align: center; font-weight: bold;" colspan="6">
            Date - ${this.timeSrvc.dateAsString(this.from_date, false, true)}${this.to_date && this.to_date != '' ? ' to ' + this.timeSrvc.dateAsString(this.to_date, false, true) : ''}
          </th>
          <th colspan="5">Printed - ${this.timeSrvc.dateAsString(null, true, true)}</th>
        </tr>
      `;
    }
  
    let html = `
      <table border="1" borderColor="#d4d4d6" id="excelReport" style="width: 100%; border-collapse: collapse;">
        <thead style="${bgColor}">
          <tr style="line-height: 10px; ${bgColor} ">
            <th style="text-align: center;" colspan="11">EXPENSES</th>
          </tr>
          ${dateRows}
          <tr style="line-height: 10px; ${bgColor} ">
            <th class="text-black" style="text-align: center; font-weight: bold; ${borderString}">S.no</th>
            <th style="text-align: center; font-weight: bold; ${borderString}">Expense Date</th>
            <th style="text-align: center; font-weight: bold; ${borderString}">Expense</th>
            <th style="text-align: center; font-weight: bold; ${borderString}">Invoice No.</th>
            <th style="text-align: center; font-weight: bold; ${borderString}">Account To</th>
            <th style="text-align: center; font-weight: bold; ${borderString}">Authorized At</th>
            <th style="text-align: center; font-weight: bold; ${borderString}">Authorized By</th>
            <th style="text-align: center; font-weight: bold; ${borderString}">Paid To</th>
            <th style="text-align: center; font-weight: bold; ${borderString}">Remarks</th>
            <th style="text-align: center; font-weight: bold; ${borderString}">Mode</th>
            <th class="text-end" style="text-align: right; font-weight: bold; ${borderString}">Amount</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    let expenseAmount = 0;
  
    this.totalExpenses.forEach((item: any, i: number) => {
      expenseAmount += parseFloat(item.amount);

      const tableColumn = `
        <tr style="line-height: 10px;">
          <td class="patientPrintColumn" style="${borderString}text-align: left; vertical-align: middle; white-space: nowrap;">
            ${i + 1}
          </td>
          <td class="patientPrintColumn" style="${borderString}text-align: left; vertical-align: middle; white-space: nowrap;">
            ${this.timeSrvc.formatDateWithDiv(item?.expense_date, '-')}
          </td>
          <td class="patientPrintColumn" style="${borderString}text-align: left; vertical-align: middle; white-space: nowrap;">
            ${item?.expense_type?.name}
          </td>
          <td class="patientPrintColumn" style="${borderString}text-align: left; vertical-align: middle; white-space: nowrap;">
            ${item?.invoice_no}
          </td>
          <td class="patientPrintColumn" style="${borderString}text-align: left; vertical-align: middle; white-space: nowrap;">
            ${item.account_to?.name}
          </td>
          <td class="patientPrintColumn" style="${borderString}text-align: left; vertical-align: middle; white-space: nowrap;">
            ${this.timeSrvc.formatDateWithDiv(item.added_on, '-')}
          </td>
          <td class="patientPrintColumn" style="${borderString}text-align: left; vertical-align: middle; white-space: nowrap;">
            ${item?.authorized_by}
          </td>
          <td class="patientPrintColumn" style="${borderString}text-align: left; vertical-align: middle; white-space: nowrap;">
            ${item.paid_to?.name}
          </td>
          <td class="patientPrintColumn" style="${borderString}text-align: left; vertical-align: middle; white-space: nowrap;">
            ${item?.description || "-"}
          </td>
          <td class="patientPrintColumn" style="${borderString}text-align: left; vertical-align: middle; white-space: nowrap;">
            ${item.pay_mode?.name}
          </td>
          <td class="text-end" style="${borderString}text-align: right; vertical-align: middle; white-space: nowrap;">
            ${item.amount}
          </td>
        </tr>
      `;
  
      html += tableColumn;
    });
  
    html += `
      <tr class="bg-muted" style="${bgColor}">
        <td colspan="10" style="text-align: end">Total :</td>
        <td style="text-align: end; font-weight: bold;">${expenseAmount}</td>
      </tr>
    </tbody>
  </table>
  `;
  
    return html;
  }


}
