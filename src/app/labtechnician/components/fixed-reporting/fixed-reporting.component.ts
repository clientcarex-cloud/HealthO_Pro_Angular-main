import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { debounceTime, distinctUntilChanged, map, Observable, OperatorFunction, Subject } from 'rxjs';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';

@Component({
  selector: 'app-fixed-reporting',
  templateUrl: './fixed-reporting.component.html',
  styleUrl: './fixed-reporting.component.scss'
})
export class FixedReportingComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private timeSrvc: TimeConversionService,
    private masterEndpoint: MasterEndpoint
  ) { super(injector) }

  @Input() patient: any; // mandatory input
  @Input() lab_remark: any = ''; // mandatory inout 

  @Input() reportTableData: any = [];

  editedFixedData: any = [] ;

  @Input() saveLoading: boolean = false;
  @Input() saveAuthLoading: boolean = false;
  @Input() changesMade: boolean = false;

  private inputSubject: Subject<any> = new Subject<any>();

  @Output() saved: EventEmitter<any> = new EventEmitter<any>();
  @Output() FullScreen: EventEmitter<any> = new EventEmitter<any>() ;

  parameters: any = [];
  q_param: any = "";


  patientAge: any = 1 ;

  override ngOnInit() {

    if(this.patient?.LabPatientTestID?.patient?.ULabPatientAge == 'DOB'){
      this.patientAge = this.timeSrvc.calculateDaysBack(this.patient?.LabPatientTestID?.patient.dob)
    }else{
      let daysFactor = 1 ;
      if(this.patient?.LabPatientTestID?.patient?.ULabPatientAge == 'Years'){
        daysFactor = 365 ;
      }else if(this.patient?.LabPatientTestID?.patient?.ULabPatientAge == 'Months'){
        daysFactor = 30.44;
      }
      this.patientAge = this.patient?.LabPatientTestID?.patient.age * daysFactor ;
    }

    this.load(this.reportTableData)

    this.inputSubject.pipe(
      debounceTime(500)  // Adjust the debounce time as neededd
    ).subscribe(value => {
      this.getTestDefaultParamters()
    });

  }

  load(reportTableData: any){
    // this.reportTableData = [] ;
    // this.editedFixedData = [];
    this.editedFixedData = reportTableData;
    this.reportTableData = this.groupData(reportTableData);

    if(!this.patient.printed){
      this.reportTableData.forEach((report: any)=>{
        report.parameters.forEach((item: any)=>{
          this.checkNR(item.value, item);
          this.checkFormula(item, true);
          // this.checkBold(item.value, item.id, item)
        })
      })
    }
  }


  getFixedData(save: boolean){
    this.saved.emit(
      {
        data: this.editedFixedData,
        save: save
      }
    );
  }

  handleFullScreen(){
    this.FullScreen.emit(this.editedFixedData);
  }


  onReportValueSelected(newValue: any, report: any) {

    const index = this.editedFixedData.findIndex((d: any) => d.id === report);
    if (index !== -1) {
      this.editedFixedData[index].value = newValue.item;

      this.changesMade = true;
      this.getTestDefaultParamters(newValue.item);
    }

  }

  checkFormula(parameter: any, not_init: boolean = false) {
    // && (!parameter.formula.includes(`{${parameter.parameter}}`) || not_init)
    if (parameter.formula && parameter.formula !== '') {
      let formula = parameter.formula;

      if(formula.includes('{PatientAgeInDays}')){
        formula = formula.replace(new RegExp(`{PatientAgeInDays}`, 'g'), this.patientAge)
        console.log(this.patientAge)
      }
      // Replace placeholders in the formula with actual values
      this.editedFixedData.forEach((input: any) => {
        const escapedParameter = input.parameter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
          formula = formula.replace(new RegExp(`{${escapedParameter}}`, 'g'), input.value);
      });


      try {
        // Evaluate the formula and catch any errors
        const index = this.editedFixedData.findIndex((d: any) => d.id === parameter.id);
        let result = eval(formula);
 
        try {
          parameter.value = this.getFloatVal(result.toFixed(2));
          this.editedFixedData[index].value = this.getFloatVal(result.toFixed(2));
        } catch (error) {
          parameter.value = result;
          this.editedFixedData[index].value = result
        }

        this.validateNormalRanges(index, parameter);

      } catch (error) {
        // If there's an error, set the result to an empty string
        parameter.value = '';
        const index = this.editedFixedData.findIndex((d: any) => d.id === parameter.id);
        this.editedFixedData[index].value = '';
        // console.error('Error evaluating formula:', error);
      }
    }
  }

  checkBold(e: any, report: any, item: any) {
    const index = this.editedFixedData.findIndex((d: any) => d.id === report);
    if (index !== -1) {
      this.editedFixedData[index].is_value_bold = e;
      this.changesMade = true;
    }
    item.is_value_bold = e;
  }

  onReportValueChange(newValue: any, report: any) {

    newValue?.preventDefault();

    const index = this.editedFixedData.findIndex((d: any) => d.id === report.id);
    if (index !== -1) {


      if (report.select) {

        function rearrangeString(selected: any, str: any) {
          // const str = "select**Normal**Abnormal**Neutral**";
          const parts = str.split('**').slice(1, -1); // Remove "Select" and the trailing empty string
          const index = parts.indexOf(selected);

          if (index !== -1) {
            parts.splice(index, 1); // Remove the selected element from its current position
            parts.unshift(selected); // Add the selected element to the beginning
          }

          return `select**${parts.join('**')}**`;
        }

        this.editedFixedData[index].value = rearrangeString(newValue.target.value, report.defVal)

      } else {

        report.value = newValue.target.value;
        this.editedFixedData[index].value = newValue.target.value;


        this.changesMade = true;
        this.q_param = newValue.target.value;
        this.inputSubject.next(this.q_param);

        this.validateNormalRanges(index, report);
      }

    }

  }


  checkNR(newValue: any, report: any){
    const index = this.editedFixedData.findIndex((d: any) => d.id === report.id);
    
    report.value = newValue;
    this.editedFixedData[index].value = newValue;


    this.changesMade = true;
    this.q_param = newValue;
    this.inputSubject.next(this.q_param);

    this.validateNormalRanges(index, report);

  }


  validateNormalRanges(index: any, report: any){
    if (!isNaN(report.value) && report.value != '') {
      if (report.normal_ranges) {
        if (
          (this.getFloatVal(report.normal_ranges.value_min) > report.value) ||
          (this.getFloatVal(report.normal_ranges.value_max) < report.value)) {
          this.editedFixedData[index].is_value_bold = true;
          report.is_value_bold = true;
        } else {
          this.editedFixedData[index].is_value_bold = false;
          report.is_value_bold = false;
        }
      }else if(report.referral_range && report.referral_range != ''){
        const range = this.validateAndExtractRange(report.referral_range) ; 

        if(range.isValid){

          if (
            (parseFloat(range.startValue) > report.value) || (parseFloat(range.endValue) < report.value)) {

            this.editedFixedData[index].is_value_bold = true;
            report.is_value_bold = true;

          } else {
            this.editedFixedData[index].is_value_bold = false;
            report.is_value_bold = false;

          }
        }
      }
    } else {
      report.is_value_bold = false;
    }
  }


  validateAndExtractRange(range: any) {
    // Regular expression to match the formats "X.XX - Y.YY", "X - Y", or without spaces "X.YY-Y.YY"
    const regex = /^\s*\d+(\.\d+)?\s*-\s*\d+(\.\d+)?\s*$/;

    if (regex.test(range)) {
        // Split the range into start and end values
        const [startValue, endValue] = range.split("-").map((value: any) => value.trim());

        // Convert to numbers for further validation
        const startNumber = parseFloat(startValue);
        const endNumber = parseFloat(endValue);

        // Check if start is less than end
        if (startNumber < endNumber) {
            return {
                isValid: true,
                startValue,
                endValue
            };
        } else {
            return {
                isValid: false,
                message: "The start value must be less than the end value."
            };
        }
    } else {
        return {
            isValid: false,
            message: "Invalid format. Please use the format 'X.XX - Y.YY', 'X - Y', or 'X.YY-Y.YY' with numbers only."
        };
    }
}

  getTestDefaultParamters(q: any = this.q_param) {

    this.subsink.sink = this.masterEndpoint.getDefaultParamters(this.patient.LabPatientTestID.LabGlobalTestId, "all", 1, q).subscribe((res: any) => {
      if (res.length >= 1) {
        this.parameters = [];
        res.forEach((d: any) => {
          if (d.is_active) {
            this.parameters.push(d.parameter);
          }
        })
      }

    })

    this.reportTableData.forEach((param: any) => {
      if (param.parameters && param.parameters.length >= 1) {
        param.parameters.forEach((rpt: any) => {
          this.checkFormula(rpt)
        })
      }
    })
  }

  // utilities

  groupData(data: any): any {
    const groupedData: any = [];

    // Sort data by ordering
    data.sort((a: any, b: any) => a.ordering - b.ordering);

    let blankGroupCounter = 0;
    let currentBlankGroup = `blank_${blankGroupCounter}`;

    for (const report of data) {
      let groupname = report.group;

      if (groupname == null) {
        report.group = "";
        groupname = "";
      }

      // If group name is blank, use the current blank group identifier
      if (groupname === "") {
        groupname = currentBlankGroup;
      } else {
        // Reset the blank group identifier when encountering a named group
        currentBlankGroup = `blank_${++blankGroupCounter}`;
      }

      const groupIndex = groupedData.findIndex((group: any) => group.groupname === groupname);

      let val = typeof report?.value === 'string' ? report.value.toLowerCase() : report?.value || '';
      let select: boolean = false;


      if (typeof val === 'string' && val.includes('select') && val.includes("**")) {
        val = report.value.split('**').slice(1, -1);

        select = true;
      }

      if (groupIndex === -1) {

        // If the group does not exist, create a new group
        groupedData.push({
          groupname: groupname,
          parameters: [{
            id: report.id,
            parameter: report.parameter,

            value: select ? val[0] : report.value,
            select: select,
            defVal: report.value,
            selectOptions: val,

            units: report.units,
            method: report.method,
            referral_range: report.referral_range,
            added_on: report.added_on,
            LabGlobalTestID: report.LabGlobalTestID,
            LabPatientTestID: report.LabPatientTestID,
            is_value_bold: report.is_value_bold,
            normal_ranges: report.normal_ranges,
            formula: report.formula
          }]
        });
      } else {

        // If the group already exists, push the parameter to its parameters array
        groupedData[groupIndex].parameters.push({
          id: report.id,
          parameter: report.parameter,

          value: select ? val[0] : report.value,
          select: select,
          defVal: report.value,
          selectOptions: val,

          units: report.units,
          method: report.method,
          referral_range: report.referral_range,
          added_on: report.added_on,
          LabGlobalTestID: report.LabGlobalTestID,
          LabPatientTestID: report.LabPatientTestID,
          is_value_bold: report.is_value_bold,
          normal_ranges: report.normal_ranges,
          formula: report.formula
        });
      }
    }

    // Replace temporary unique blank group identifiers with empty strings
    groupedData.forEach((group: any) => {
      if (group.groupname.startsWith("blank_")) {
        group.groupname = "";
      }
    });

    return groupedData;
  }

  withoutSpecChars(e: any) {
    return e.replace(/\n/g, '<br>')
  }

  getFloatVal(num: any) {
    try {
      const floatNum = parseFloat(num.replace(/,/g, ''))
      return floatNum
    } catch (error) {
      return num
    }
  }

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2 ? [] : this.parameters.filter((v: any) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );

}