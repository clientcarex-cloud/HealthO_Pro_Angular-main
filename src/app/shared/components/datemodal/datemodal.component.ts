import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbCalendar, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';

@Component({
  selector: 'app-datemodal',
  templateUrl: './datemodal.component.html',
})

export class DatemodalComponent implements OnInit, AfterViewInit {

  @Input() showDate: boolean = true ;
  @Input() showCustom: boolean = true ;
  @Input() initWith: number = 1 ;
  @Input() setTodayDefault: boolean = true ;
  @Input() defaultDateValue : string | null = null ; // used to set default showing date 

  @Input() isLoading: boolean = false ;

  @Output() dateValueChanged: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('dateDropdown') dateDropdown: any;

  duration = [
    { id: 1, name: 'Date' },
    { id: 2, name: 'Month' },
    { id: 3, name: 'Year' },
    { id: 4, name: 'Custom' }
  ];

  dateValue: any ='';
  dateForm!: UntypedFormGroup;
  dateNewValue: any;
  maxDate: any;
  selectStartDateNew: any = '';
  selectEndDateNew: any = '';
  MAinshowDateValue: string = "Today's";
  customYearValue!: string;
  customMonthValue: string = 'all';

  years: Array<{ year: string, selected: boolean, dateRange: any  }> = [];

  constructor(
    private formBuilder: FormBuilder,
    public capitalSrvc: CaptilizeService,
    public timeSrvc: TimeConversionService,
    private ngbCalendar: NgbCalendar,
    private dateAdapter: NgbDateAdapter<string>
  ) {}

  ngOnInit(): void {

    if(!this.showDate){
      this.duration = this.duration.filter((d: any) => d.name != 'Date');
    }

    if(!this.showCustom){
      this.duration = this.duration.filter((d: any) => d.name != 'Custom');
    }


    if(this.setTodayDefault){
      this.setDefaultDateValues();
    }

    if(this.defaultDateValue){
      this.dateValue = this.defaultDateValue ;
    }

    this.initializeForm();
  }

  ngAfterViewInit(): void {


  }

  private initializeForm(): void {
    this.dateForm = this.formBuilder.group({
      duration: [this.initWith]
    });
  }

  private setDefaultDateValues(): void {
    this.dateNewValue = this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
    this.maxDate = this.dateNewValue;
    this.selectDate(this.maxDate);
  }

  selectDate(selectedDate: any): void {
    this.MAinshowDateValue = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;
    this.dateValue = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;
    this.emitDateValue(this.MAinshowDateValue);
  }

  changeDuration(event: any): void {
    this.selectStartDateNew = '';
    this.selectEndDateNew = '';

    this.dateForm.get('duration')?.setValue(parseInt(event.target.value))

    switch (parseInt(event.target.value)) {
      case 4:
        this.setCustomDatesToToday();
        
        break;
      case 3:
        this.years = this.generateYearsObject();
        this.customYearValue = this.generateYearsObject().reverse()[0].year;
        this.dateValue = this.generateYearsObject().reverse()[0].dateRange ;
        this.emitDateValue();
        break;
      case 2:
        this.customMonthValue = this.timeSrvc.getTodaysDateAsObject().month;
        this.dateValue = this.generateMonthsObject().find((month: any)=> month.selected)!.dateRange ; 
        this.customMonthValue = this.dateValue ; 
        this.emitDateValue()
        break;
      case 1:
        this.MAinshowDateValue = "Today's";
        this.dateNewValue = this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
        this.dateValue = this.timeSrvc.getTodaysDate();
        this.emitDateValue();
        break;
    }
  }

  private setCustomDatesToToday(): void {
    const today = this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
    this.selectStartDateNew = today;
    this.selectEndDateNew = today;
    this.dateValue = `${this.timeSrvc.getTodaysDate()} to ${this.timeSrvc.getTodaysDate()}`;
  }

  displayString : string = "";
  emitDateValue(date: string = this.dateValue): void {
    this.dateValueChanged.emit(date);

    // if(date == this.timeSrvc.getTodaysDate()){
    //   this.displayString = "Today" ;
    // }else{
    //   this.displayString = date ;
    // }
  }

  customYear(event: any): void {
    this.customMonthValue = `${event.target.value}-01-01 to ${event.target.value}-12-31`;
    this.dateValue = `${event.target.value}-01-01 to ${event.target.value}-12-31` ;
    this.emitDateValue();
  }

  customMonth(event: any): void {
    this.customMonthValue = event.target.value;
    this.dateValue = event.target.value ;
    this.emitDateValue();
  }

  generateYearsObject(): Array<{ year: string; selected: boolean; dateRange: string }> {
    const currentYear = new Date().getFullYear();
    const startYear = 2024;

    // Create an array from startYear to currentYear (inclusive)
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => {
        const year = (startYear + i).toString();
        const dateRange = `${year}-01-01 to ${year}-12-31`; // Define the date range for the year

        return {
            year,
            selected: year === currentYear.toString(), // Set selected to true if it's the current year
            dateRange // Include the date range
        };
    }); // Reverse to show the most recent year first
}


  generateMonthsObject(): Array<{ month: string; value: string; dateRange: string; selected: boolean }> {
    const months = [
      { name: 'January', value: '01', mth: 1 },
      { name: 'February', value: '02', mth: 2 },
      { name: 'March', value: '03', mth: 3 },
      { name: 'April', value: '04', mth: 4 },
      { name: 'May', value: '05', mth: 5 },
      { name: 'June', value: '06', mth: 6 },
      { name: 'July', value: '07', mth: 7 },
      { name: 'August', value: '08', mth: 8 },
      { name: 'September', value: '09', mth: 9 },
      { name: 'October', value: '10', mth: 10 },
      { name: 'November', value: '11', mth: 11 },
      { name: 'December', value: '12', mth: 12 }
  ];
  
    const currentYear = new Date().getFullYear();
    const currentMonthValue = new Date().getMonth() + 1; 

    // .filter(month => month.mth <= currentMonthValue)
    
    return months
      .map(month => {
          const monthValue = month.value;
          const firstDate = `${currentYear}-${monthValue}-01`;
          const lastDate = new Date(currentYear, parseInt(monthValue), 0).getDate(); // Last day of the month
          const lastDateString = `${currentYear}-${monthValue}-${String(lastDate).padStart(2, '0')}`;

          return {
              month: month.name,
              value: month.value,
              dateRange: `${firstDate} to ${lastDateString}`,
              selected: parseInt(monthValue) === currentMonthValue // Set selected to true if it's the current month
          };
    });
}



  selectCustomDate(date: any, id: number): void {
    function doubleDigit(num: any){
      num = num.toString();
      return num.length == 1 ? `0${num}` : num
    }

    if (id === 1) {
      this.selectStartDateNew = date;

      this.dateValue = `${date.year}-${doubleDigit(date.month)}-${doubleDigit(date.day)} to `

      this.selectEndDateNew = null
    } else {
      this.selectEndDateNew = date;
      
      if(this.selectStartDateNew){
        this.dateValue =`${this.selectStartDateNew.year}-${doubleDigit(this.selectStartDateNew.month)}-${doubleDigit(this.selectStartDateNew.day)} to ${date.year}-${doubleDigit(date.month)}-${doubleDigit(date.day)}`
      }

    }
  }
}
