import { Component, OnInit, Output, EventEmitter, ElementRef, HostListener, Input } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateAdapter, NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';


@Component({
  selector: 'app-datepicker-section',
  standalone: false,
  templateUrl: './datepicker-section.component.html',
  styleUrl: './datepicker-section.component.scss'
})
export class DatepickerSectionComponent implements OnInit {

  constructor(
    public timeSrvc: TimeConversionService,
    config: NgbDropdownConfig,
    private modalService: NgbModal,
    private ngbCalendar: NgbCalendar,
		private dateAdapter: NgbDateAdapter<string>,
  ){
    // Configure NgbDropdown
    config.autoClose = true; // Set to false initially
  }

  datePickerMaxDate: any ;
  buttonText : any ;
  @Output() dateRangeSelected = new EventEmitter<any>();
  @Input() selectToday: boolean = false;
  @Input() defaultText: string = "Today's"
  @Input() setMax: boolean = true ;
  maxDate: any ;
  @Input() initDate: any = false;


  @Input() closeModal: boolean = true

  ngOnInit(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.datePickerMaxDate = today;

    if(this.setMax){
      this.maxDate = this.dateAdapter.toModel(this.ngbCalendar.getToday())!
    }


    if(this.selectToday){
      this.setToday(this.initDate, false);
      this.buttonText = this.defaultText;
    }else{
      this.defaultText = "All Time ( Active )"
      this.buttonText = "All Time ( Active )"
    }
  }


  get today() {
		return this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
	}

  
  SR_start_date: any ;
  SR_end_date: any;
  SR_staff: any ;
  SR_template: any;
  title: string = "";
  viewPrintLoading : boolean = false;
  printLoading : boolean = false;

  setToday(init = true, initModal = true){
    this.SR_start_date = this.timeSrvc.getTodaysDate();
    this.buttonText = this.defaultText;
    this.SR_end_date = ""
    if(initModal){
      this.modalService.dismissAll();
    }
    
    if(init){
      this.emitDateRange();
    }
 
    
  }

  setYesterday(){
    this.SR_start_date = this.timeSrvc.getYesterdayDate();
    this.SR_end_date = ""
    this.buttonText = "Yesterday";
    this.modalService.dismissAll();
    this.emitDateRange();
  }

  setSevenDays(){
    this.SR_start_date = this.timeSrvc.getLast7Days()?.startDate;
    this.SR_end_date = this.timeSrvc.getLast7Days()?.endDate;
    this.buttonText = "Last 7 Days";
    this.modalService.dismissAll();
    const dateRange = this.SR_start_date + (this.SR_end_date ? ` to ${this.SR_end_date}` : '');
    if (dateRange) {
      this.buttonText = dateRange;
      this.dateRangeSelected.emit(dateRange);
    }
  }


  set_shiftReport_start_date(e:any){
    if(e.srcElement.value && e.srcElement.value !== ""){
      this.SR_start_date = e.srcElement.value;
      this.SR_end_date = "";
      this.buttonText = this.SR_start_date;
      
    }else{
      this.SR_end_date = null;
      this.setToday();
    }

  }

  set_shiftReport_end_date(e:any){
    if(e.srcElement.value && e.srcElement.value !== ""){
      this.SR_end_date = e.srcElement.value;
      this.buttonText = this.SR_start_date + " to " + this.SR_end_date;
      this.emitDateRange();
      // config.autoClose = true;
    }else{
      if(this.SR_start_date && this.SR_start_date !== ""){
        this.buttonText = this.SR_start_date;
        this.emitDateRange();
      }else{
        this.setToday();
      }
    }


  }

  private emitDateRange() {
    let dateRange; 
    
    if (this.SR_start_date) {
        dateRange = this.SR_start_date + (this.SR_end_date ? ` to ${this.SR_end_date}` : '');
    } else {
        dateRange = null;
    }

    if (dateRange) {
        this.buttonText = dateRange;
        this.dateRangeSelected.emit(dateRange);
    } else {
        this.todayDate();
    }
}


  startDate: any ;
  endDate: any ;

  todayDate(){

    if(this.selectToday){
      const e:any = this.dateAdapter.toModel(this.ngbCalendar.getToday())!
      this.SR_start_date = `${e?.year}-${String(e?.month).padStart(2, '0')}-${String(e?.day).padStart(2, '0')}`;
      this.emitDateRange();
      this.buttonText = "Today's";
    }else{

      const e:any = this.dateAdapter.toModel(this.ngbCalendar.getToday())!
      this.startDate = e ;
      this.SR_start_date = `${e?.year}-${String(e?.month).padStart(2, '0')}-${String(e?.day).padStart(2, '0')}`;
      
      this.emitDateRange();
      this.buttonText = "Today's";
    }
  }

  yesterday(){
    const today = this.ngbCalendar.getToday();
    const yesterday = this.ngbCalendar.getNext(today, 'd', -1);
    this.selectStartDate(yesterday);
    this.selectEndDate("");
    this.buttonText = "Yesterday's"
  }

  getLast7Days(){
    const today = this.ngbCalendar.getToday();
    const endDate = today; // End date is today

    // Calculate start date by subtracting 7 days from today
    const startDate = this.ngbCalendar.getNext(today, 'd', -7);

    this.startDate = startDate;
    this.endDate = endDate;

    this.selectStartDate(startDate, false);
    this.selectEndDate(endDate);
    

    this.buttonText = this.SR_start_date + " to " + this.SR_end_date
  }

  selectStartDate(e:any, emit: boolean = true){
    if(e){
      this.startDate = e ;
      this.SR_start_date = `${e?.year}-${String(e?.month).padStart(2, '0')}-${String(e?.day).padStart(2, '0')}`;
      if(emit){
        this.emitDateRange()
      }

    }else{
      this.clearStartDate();
    }
  }

  clearStartDate(){
    // this.clearEndDate();
    this.endDate = null;
    this.SR_end_date = null;
    this.startDate = null;
    this.SR_start_date = null;
    if(this.selectToday){
      this.todayDate();
      // this.selectStartDate(this.dateAdapter.toModel(this.ngbCalendar.getToday())!);
      // this.selectEndDate("");
      
      // this.dateRangeSelected.emit(""); 
      // this.buttonText = "All Time ( Active )"

    }else{

      this.dateRangeSelected.emit(""); 
      this.buttonText = this.defaultText;
    }
  }

  selectEndDate(e:any){
    if(e){
      this.endDate = e ;
      this.SR_end_date = `${e?.year}-${String(e?.month).padStart(2, '0')}-${String(e?.day).padStart(2, '0')}`;
      this.emitDateRange()
    }else{
      this.clearEndDate();
    }
  }

  clearEndDate(){
    this.endDate = null;
    this.SR_end_date = null;
    this.emitDateRange();
  }


  clearAllDates(){
    // if(this.selectToday){
    //   this.todayDate();
    // }else{
    //   this.startDate = null;
    //   this.endDate = null;
    //   this.SR_start_date=""
    //   this.SR_end_date = ""
    //   this.dateRangeSelected.emit("");
    //   this.buttonText = this.defaultText;
    // }

    this.startDate = null;
    this.endDate = null;
    this.SR_start_date=""
    this.SR_end_date = ""
    this.dateRangeSelected.emit("");
    this.buttonText = this.defaultText;
  }

}
