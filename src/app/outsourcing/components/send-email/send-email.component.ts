import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.scss'
})
export class SendEmailComponent extends BaseComponent<any> {

  @Input() sourcing_lab: any = null;
  @Input() company : any = null
  @Input() is_referring: any = false;

  bulkPayment!: UntypedFormGroup;

  pageLoading: boolean = false;
  b_id: any;

  all_count!: number | string;
  patients!: any;

  poNum: any = "";
  grnNum: any = "";

  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;
  page_size: any = 10;
  page_number: any = 1;
  query: string = "";
  sort: any = false;
  max_date: any;
  payModes: any = [];

  total_due: any = null;
  total_paid: any = null;

  checkInvoice(invoice: null | Object): any {
    if (invoice !== null) { return invoice }
    else { return "-" }
  }


  constructor(
    private formBuilder: UntypedFormBuilder,
    private endPoint: OutsourcingEndpoint,
    injector: Injector,
    public timeSrvc: TimeConversionService,
    config: NgbDropdownConfig,
    private cookieSrvc: CookieStorageService,
    private printSrvc: PrintService,
    private proEndpoint: ProEndpoint
  ) {
    super(injector);
    config.autoClose = false;
  }

  override ngAfterViewInit(): void {
    this.getData();
    this.getMinDate();
  }

  override ngOnInit(): void {
    this.selected_partner = null ;
    this.from_date = this.timeSrvc.getTodaysDate();
    this.to_date = this.timeSrvc.getTodaysDate();
    this.b_id = this.cookieSrvc.getCookieData().b_id;

    this.subsink.sink = this.proEndpoint.getPayModes().subscribe((data: any) => {
      this.payModes = data.results.filter((method: any) => method.is_active);
    });

    this.bulkPayment = this.formBuilder.group({
      pay_mode: [1],
      paid_amount: ["", Validators.required]
    })

  }

  changeSorting() {
    this.sort = !this.sort;
    this.getData();
  }


  getData() {

    this.patients = [];
    this.pageLoading = true;

    this.bulkPayment.get('paid_amount')?.setValue('');


    if(this.sourcing_lab){
      this.getSourcingPatients();
    }

    if(this.company){
      this.getCompanyPatients();
    }


  }


  getSourcingPatients(){
    this.subsink.sink = this.endPoint.getSourcingPatients(
      this.sourcing_lab,
      "", 1, 1,
      "", this.from_date, this.to_date, this.sort
    ).subscribe((res: any) => {

      this.subsink.sink = this.endPoint.getSourcingPatients(
        this.sourcing_lab,
        "", res.count, 1,
        "", this.from_date, this.to_date, !this.sort

      ).subscribe((data: any) => {

        this.pageLoading = false;
        this.all_count = data?.count || 0;
        this.patients = data.results;

        this.getTOtalDue()

      }, (error: any) => {
        this.all_count = "Failed to fetch";
        this.pageLoading = false;
        this.alertService.showError(error?.error?.Error)
      })


    }, (error: any) => {
      this.pageLoading = false;
      this.alertService.showError(error?.error?.Error)
    })
  }


  getCompanyPatients(){
    if(this.from_date && this.to_date){
      this.subsink.sink = this.endPoint.getCompanyPatients(
        this.company.id,
        "", 1, 1,
        "", this.from_date, this.to_date, this.sort
      ).subscribe((res: any) => {
  
        let partner = '' ;
  
        if(this.selected_partner && this.selected_partner?.id){
          partner = `&partner=${this.selected_partner?.id}`
        }
  
        this.subsink.sink = this.endPoint.getCompanyPatients(
          this.company.id,
          "", res.count, 1,
          "", this.from_date, this.to_date, !this.sort,
          partner,
          '&status_id=3,7,17'
  
        ).subscribe((data: any) => {
  
          this.pageLoading = false;
          this.all_count = data?.count || 0;
          this.patients = data.results;
  
          this.getTOtalDue()
  
        }, (error: any) => {
          this.all_count = "Failed to fetch";
          this.pageLoading = false;
          this.alertService.showError(error?.error?.Error)
        })
  
  
      }, (error: any) => {
        this.pageLoading = false;
        this.alertService.showError(error?.error?.Error)
      })
    }else{
      this.alertService.showInfo("Select Start date & end date.")
    }

  }


  selected_partner: any = null ;
  selectPartner(e : any){
    if(e && e!= ''){
      this.selected_partner = e ;
    }else{
      this.selected_partner = null ;
    }

    this.getData();
  }

  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page_number = 1;
      this.getData();
    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e: any) {
    this.page_size = e.target.value;
    this.page_number = 1;
    this.getData()
  }

  onPageChange(e: any) {
    this.page_number = e;
    this.getData();
  }

  setStartDate(e: any) {
    if (e && e != '') {
      this.from_date = e;
      this.to_date = "";
      this.alertService.showInfo("Select End Date.");
      this.getMinDate();
      this.patients = [];
    } else {
      this.to_date = "";
      this.alertService.showInfo("Select Start Date.")
      this.patients = [];
    }
  }

  setEndDate(e: any) {
    if (e && e != '') {
      this.to_date = e;
      this.getData();
    } else {
      this.patients = [];
    }
  }

  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.from_date = startDate;
    this.to_date = endDate;
    this.page_number = 1;
    this.getData();
  }

  getTestsLength(item: any){
    let count  = 0 ;
    if (item.lab_tests && item.lab_tests.length > 0) {
      item.lab_tests.forEach((test: any) => {
        count ++ 
      })
    }

    if (item.lab_packages && item.lab_packages.length > 0) {
      item.lab_packages.forEach((pkg: any) => {
        pkg.lab_tests.forEach((test: any) => {
          count ++ 
        })
      })
    }

    return count;
  }

  concatenateShortCodes(item: any) {
    let shortForm = ''
    if (item.lab_tests.length > 0) {
      item.lab_tests.forEach((test: any) => {
        shortForm += test.name + ', '
      })
    }

    if (item.lab_packages.length > 0) {
      item.lab_packages.forEach((pkg: any) => {
        pkg.lab_tests.forEach((test: any) => {
          shortForm += test.name + ', '
        })
      })
    }

    return shortForm.slice(0, -2)
  }

  concatenateShortCodesHTML(item: any): string {
    let htmlContent = '';
  
    if (item.lab_tests.length > 0) {
      // htmlContent += '<div>Tests</div>'
      htmlContent += '<ul>';
      item.lab_tests.forEach((test: any) => {
        htmlContent += `<li><small>${test.name}</small></li>`;
      });
      htmlContent += '</ul>';
    }
  
    if (item.lab_packages.length > 0) {
      item.lab_packages.forEach((pkg: any) => {
        htmlContent += `<div class='fw-medium'><small>${pkg.name}</small></div>`
        htmlContent += '<ul>';
        pkg.lab_tests.forEach((test: any) => {
          htmlContent += `<li><small>${test.name}</small></li>`;
        });
        htmlContent += '</ul>';
      });
    }
  
    return htmlContent || '<p>No lab tests or packages available.</p>';
  }
  

  openXl(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop });
  }

  getPackagesLength(item: any[]) {
    let count = 0;
    item.forEach((pkg: any) => {
      if (pkg.lab_tests && pkg.lab_tests.length > 0) {
        count += pkg.lab_tests.length;
      }
    });
    return count;
  }


  bulkSaving: boolean = false ;

  saveBulkPayment() {

    const amt = this.bulkPayment.get('paid_amount')?.value
    if (this.bulkPayment.valid && amt != 0 && amt != '') {

      this.bulkSaving = true ;

      this.patients.forEach(async (ptn: any) => {
      
      if(ptn?.invoice?.paying){
        const model = {
          patient: ptn.id,
          payments: [
            {
              pay_mode: this.bulkPayment.get('pay_mode')?.value,
              paid_amount: ptn.invoice.paying,
            }
          ],
          created_by: this.cookieSrvc.getCookieData().lab_staff_id,
          sourcing_lab: this.sourcing_lab,
          client_id: this.cookieSrvc.getCookieData().client_id
        }
  
        try{ await this.postPayment(model) }catch(error){ }
      }

      });
      

      this.alertService.showSuccess('Saved.') ;
      this.getData();

      this.bulkSaving = false ;

    } else {
      this.alertService.showError("Enter Valid Paid Amount.")
    }
  }

  postPayment(model: any){
    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.endPoint.postBulkPayment(model).subscribe((res: any)=>{
  
        resolve({});
      }, (error: any)=>{
        this.alertService.showError(error?.error?.Error || error);
        reject({})
      });
    })
  }



  // utilities
  getFloatVal(num: any) {
    return parseFloat(num.replace(/,/g, ''))
  }

  getMinDate(date: any = this.from_date) {
    const dateObject = new Date(date);
    this.max_date = dateObject
  }

  getTOtalDue() {
    this.total_due = 0;
    this.total_paid = 0;
    this.patients.forEach((ptn: any) => {
      if (this.getFloatVal(ptn.invoice.total_due) > 0) {
        this.total_due += this.getFloatVal(ptn.invoice.total_due);
      }

      this.total_paid += this.getFloatVal(ptn.invoice.total_paid);
    })
  }

  formatIndianNumber(number: number): string {
    const formattedNumber = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(number);
    return formattedNumber;
  }


  payBill(event: any){

    let paymentAmount = event;
    
    this.patients.forEach((patient: any) => {
      const invoice = patient.invoice;

      // const amountDue = parseFloat(invoice.total_price) - parseFloat(invoice.total_paid);
      const amountDue = parseFloat(invoice.total_due);

      if(amountDue > 0){
        invoice['paying'] = "0";

        if (paymentAmount > 0 && amountDue > 0) {
            const paymentToMake = Math.min(paymentAmount, amountDue);
            invoice.paying = (parseFloat(invoice.paying) + paymentToMake).toFixed(2); // Update the 'paying' amount
            paymentAmount -= paymentToMake;
        }else{
          invoice['paying'] = "";
        }
      }

  });

  }



  invoiceLoading: boolean  = false ;

  printInvoice(){

    if(this.selected_partner?.id){
      let patients: any = [];

      this.invoiceLoading = true ;

      this.patients?.forEach(async (ptn: any) => {
        if(ptn.invoice?.total_due == '0.00'){
          patients.push(ptn.id);
        }
      })
  
      if(patients.length != 0 && this.selected_partner?.id){
        const model = {
          patient_ids : patients,
          partner_id: this.selected_partner?.id
        }
  
        this.subsink.sink = this.endPoint.postInvoice(model)?.subscribe((res: any)=>{
          this.invoiceLoading = false ;
          this.printSrvc.printer(res.html_content) ;
          this.bulkPayment.get('paid_amount')?.setValue('');
        }, (error)=>{
          this.invoiceLoading = false ;
          this.alertService.showError(error?.error?.Error || error?.error?.error || error)
        })
  
      }else{

        this.invoiceLoading = false ;
        this.alertService.showInfo("No patients due was cleared.")
      }
    }else{
      this.alertService.showInfo("Select partner.")
    }

  }


  
  sendMail(){
    if(this.selected_partner){
      let ptns: any = [];

      this.patients?.forEach(async (patient: any) => {
        ptns.push(patient.id) ; 
      })

      if(ptns.length != 0 && this.selected_partner?.id){

        this.invoiceLoading = true ;

        const model = {
          patients : ptns,
          partner_id: this.selected_partner?.id,
          date_range_after: this.from_date,
          date_range_before : this.to_date,
          lh:  this.download_letterhead == '&lh=true'
        }
        

        
        this.subsink.sink = this.endPoint.postEmail(model)?.subscribe((res: any)=>{
          this.invoiceLoading = false ;
          this.alertService.showSuccess("Mail sent successfully!");
        }, (error)=>{
          this.invoiceLoading = false ;
          this.alertService.showError(error?.error?.Error || error?.error?.error || error)
        })
  
      }else{

        this.invoiceLoading = false ;
        this.alertService.showInfo("No patients registered.")
      }

    }else{
      this.alertService.showInfo("Select Partner.")
    }
  }



  download_letterhead: any = '&lh=true' ; 

  toggleDownloadLetterhead(event : any){
    if(event){
      this.download_letterhead = '&lh=true' ;
    }else{
      this.download_letterhead = '&lh=false' ;
    }
  }


}