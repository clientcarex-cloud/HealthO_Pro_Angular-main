import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { MarketExecutiveEndpoint } from '../../marketexecutive.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { FormBuilder, Validators } from '@angular/forms';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { FileService } from '@sharedcommon/service/file.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';

@Component({
  selector: 'app-leave-requests',
  templateUrl: './leave-requests.component.html',
  styleUrl: './leave-requests.component.scss'
})

export class LeaveRequestsComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,

    private ProEndpoint: ProEndpoint,
    private endPoint: MarketExecutiveEndpoint,

    public timeSrvc: TimeConversionService,
    public capitalSrvc: CaptilizeService,
    private fileSrvc: FileService,
    private cookieSrvc: CookieStorageService

  ) { super(injector) }

  leaveTypes: any;
  statusTypes: any;
  activeTab: any = 1;

  is_sa: any = false;

  leaves: any;
  staffQuery: any = null;
  picture: any = null;
  from_date: any = '';
  to_date: any = '';
  date: any = '';

  stats = [
    { label: 'Balance', count: 0, logo: false },
    { label: 'Used', count: 0, logo: false },
  ]

  override ngOnInit(): void {

    this.baseForm = this.formBuilder.group({
      lab_staff: [null],
      leave_type: [null, Validators.required],
      from_date: [this.timeSrvc.getTodaysDate(), Validators.required],
      to_date: [this.timeSrvc.getTodaysDate(), Validators.required],
      no_of_days: [null],
      reason: [null, Validators.required],
      attachments: [null],
    });

    const currentMonth = this.generateMonthsObject().find((month: any)=> month.selected) ; 

    if(currentMonth){
      this.from_date = currentMonth.start;
      this.to_date = currentMonth.end ;
    }

    this.subsink.sink = this.ProEndpoint.getLeaveTypes().subscribe((data: any) => {
      this.leaveTypes = data;
    })

    this.subsink.sink = this.ProEndpoint.getLeaveStatusTypes().subscribe((data: any) => {
      this.statusTypes = data;
    })

    const cookieData = this.cookieSrvc.getCookieData()

    if (!cookieData.is_superadmin) {
      this.staffQuery = `&lab_staff=${cookieData.lab_staff_id}`
    } else {
      this.is_sa = true;
      this.staffQuery = `&is_active=true`
    }

    this.getData();

  }

  getData() {
    this.leaves = [] ;
    this.subsink.sink = this.endPoint.getLeaves(
      'all', 1, '', true, this.date, this.from_date, this.to_date, this.staffQuery
    ).subscribe((res: any) => {
      this.leaves = res?.results || res;
      this.leaves = this.leaves?.reverse();

      if(!this.is_sa){
        this.getLeaveBalance();
      }
    })
  }

  getLeaveBalance(){
    this.subsink.sink = this.endPoint.getLeavesStats(
      'all', 1, '', true, this.date, this.from_date, this.to_date, this.staffQuery
    ).subscribe((res: any) => {
      this.stats[0].count = res.balance_leaves;
      this.stats[1].count = res.total_leaves_taken ;
    })
  }

  getRangeValue(e: any) {
    if (e.length !== 0) {
      if (e.includes("to")) {
        this.separateDates(e);
      } else {
        this.date = e;
        this.from_date = "";
        this.to_date = "";
        this.getData();
      }
    }
    else {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.getData();
    }
  }

  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.from_date = startDate;
    this.to_date = endDate;
    this.date = "";
    this.getData();
  }



  getBalanceLeaves() {

  }


  getModel() {
    const model: any = {
      lab_staff: this.cookieSrvc.getCookieData().lab_staff_id,
      leave_type: this.baseForm.get('leave_type')?.value?.id,
      from_date: this.baseForm.get('from_date')?.value,
      to_date: this.baseForm.get('to_date')?.value,
      reason: this.baseForm.get('reason')?.value,
      attachments: this.baseForm.get('attachments')?.value,

      status: 1,
      is_cancel: false
    }

    model['no_of_days'] = this.calculateDateGap(model.from_date, model.to_date)

    return model;
  }

  override saveApiCall(): void {
    if (this.baseForm.valid) {
      const model = this.getModel();

      this.subsink.sink = this.endPoint.postLeave(model)?.subscribe((res: any) => {
        this.alertService.showSuccess("Updated.");
        this.baseForm.reset();
        this.getData();
        this.activeTab = 1;
      }, (error) => {
        this.alertService.showError(error?.error?.Error || error?.error?.error)
      })
    } else {
      this.showBaseFormErrors();
    }
  }

  updateLeave(model: any) {
    this.subsink.sink = this.endPoint.updateLeave(model)?.subscribe((res: any) => {
      this.alertService.showSuccess("Applied.");
      this.getData();
    }, (error) => {
      this.alertService.showError(error?.error?.Error || error?.error?.error)
    })
  }


  deleteRequest(item: any, is_cancel: boolean, is_active: boolean, status: any) {
    item['is_cancel'] = is_cancel;
    item['is_active'] = is_active;
    item['lab_staff'] = item?.lab_staff?.id;
    item['leave_type'] = item?.leave_type?.id;
    item['status'] = status;
    this.updateLeave(item);
  }

  changeStatus(event: any, item: any) {
    item.status = event.target.id;
    item['lab_staff'] = item?.lab_staff?.id;
    item['leave_type'] = item?.leave_type?.id;
    this.updateLeave(item);
  }



  // utilities
  onFileChanged(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileSrvc.convertToBase64(file).then((base64String: string) => {
        this.baseForm.get('attachments')?.setValue(base64String);
      });
    }
  }

  addCameraImage(e: any, modal: any) {
    this.baseForm.get('attachments')?.setValue(e.imageAsDataUrl);
    modal.dismiss('Cross click');
  }

  removeImage() {
    this.baseForm.get('attachments')?.setValue(null);
  }

  calculateDateGap(startDateStr: any, endDateStr: any) {
    if (startDateStr == endDateStr) {
      return 1
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // Calculate the difference in time
    const differenceInTime = endDate.getTime() - startDate.getTime();

    // Convert time difference to days
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    return differenceInDays;
  }

  // : Array<{ month: string; value: string; dateRange: string; selected: boolean }>
  generateMonthsObject() {
    const months = [
        { name: 'January', value: '01' },
        { name: 'February', value: '02' },
        { name: 'March', value: '03' },
        { name: 'April', value: '04' },
        { name: 'May', value: '05' },
        { name: 'June', value: '06' },
        { name: 'July', value: '07' },
        { name: 'August', value: '08' },
        { name: 'September', value: '09' },
        { name: 'October', value: '10' },
        { name: 'November', value: '11' },
        { name: 'December', value: '12' }
    ];

    const currentYear = new Date().getFullYear();
    const currentMonthValue = new Date().getMonth() + 1; // Get current month (1-based)

    return months.map(month => {
        const monthValue = month.value;
        const firstDate = `${currentYear}-${monthValue}-01`;
        const lastDate = new Date(currentYear, parseInt(monthValue), 0).getDate(); // Last day of the month
        const lastDateString = `${currentYear}-${monthValue}-${String(lastDate).padStart(2, '0')}`;

        return {
            month: month.name,
            value: month.value,
            dateRange: `${firstDate} to ${lastDateString}`,
            start: firstDate,
            end: lastDateString,
            selected: parseInt(monthValue) === currentMonthValue // Set selected to true if it's the current month
        };
    });
}
}
