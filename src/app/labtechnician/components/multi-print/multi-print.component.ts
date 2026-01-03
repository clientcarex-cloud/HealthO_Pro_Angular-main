import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { FileService } from '@sharedcommon/service/file.service';
import { PrintService } from '@sharedcommon/service/print.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { AddPatientEndpoint } from 'src/app/patient/endpoints/addpatient.endpoint';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';

@Component({
  selector: 'app-multi-print',
  templateUrl: './multi-print.component.html',
  styleUrl: './multi-print.component.scss'
})
export class MultiPrintComponent extends BaseComponent<any> {
  constructor(
    injector: Injector,
    private endPoint: AddPatientEndpoint,
    private patientEndpoint: PatientEndpoint,
    public timeSrvc: TimeConversionService,
    private cookieSrvc: CookieStorageService,
    private printSrvc: PrintService,
    private spinner: NgxSpinnerService,
    private fileSrvc: FileService
  ){ super(injector) }

  @Input() date: any ;
  @Input() from_date: string = "";
  @Input() to_date: string = "";
  @Input() ultraText: string= "";
  @Input() ages: any ;
  @Input() departments: any = [];
  @Input() canGivePrint: boolean = false;
  @Input() duePrint: boolean = false;
  @Input() flow_type: number = 1;
  
  patients!: any;
  status_id: string = `&status_id=3,7,13,17`;

  ptn: any ; 
  multiPrintReports: any ;
  filteredMultiPrints: any ;
  printDepts: any = [] ;
  selected_tests_for_prints: any = [];
  selectedTests: any ;
  printReports: boolean  = false;

  override ngOnInit(): void {
    this.date = this.timeSrvc.getTodaysDate();
    this.getData();
  }

  selectDate(e: any, datePicker: any, select: any){

    if(e && e!=''){
      this.date = e;
      this.ptn = null;
      this.selectedTests = [];
      this.filteredMultiPrints = [];

      this.getData();
    }else{

      this.ptn = null;
      this.patients = [];
      this.alertService.showInfo("Select Date.")
      
    }

  }


  getData(){
    this.subsink.sink = this.patientEndpoint.getPaginatedPatients(
      'all', 1, this.status_id, this.ultraText, '', this.date, '', '', true
    ).subscribe((res: any)=>{
      this.patients = res;
    }, (error)=>{
      this.showAPIError(error);
    });
  }

  returnAgesName(id: any){
    return this.ages?.find((a: any) => a.id == id)?.name || '';
  }



  selectPatient(patient: any){

    if(patient && patient != ''){
      const due = parseFloat(patient?.invoice?.total_due.replace(/,/g, ''))

      if((due == 0 || this.duePrint)){
        this.ptn = patient;
  
        this.selectedTests = [];
        this.printDepts = [];
    
    
        if (this.ptn && this.ptn.lab_tests) {
          this.ptn.lab_tests.lab_tests?.forEach((test: any) => {
            this.updateLabTest(test);
          });
        }
    
        if (this.ptn && this.ptn.lab_packages) {
          this.ptn.lab_packages?.forEach((test: any) => {
            this.UpdateLabPackage(test);
          });
        }
    
        this.openMultiPrint()
      }else{
        this.ptn = null;
        this.alertService.showInfo("You Don't Have Access To Give Due Patient's Print.")
      }
    }else{
      this.ptn = null;
      this.selectedTests = [];
      this.printDepts = [];
      this.filteredMultiPrints = [];
    }

  
  }

  index = 0;

  updateLabTest(item: any) {

    const tempTest = {
      tempId: this.index,
      LabGlobalTestId: item.id,
      name: item.name,
      date: this.timeSrvc.decodeTimestamp(item.added_on),
      status: item.status_id,
      cost: item.price,
      cost_true: false,
      discount: '0',
      discountAmount: '0.00',
      total: item.status_id !== "Cancelled" ? item.price : item.price,
      added_on: this.timeSrvc.decodeTimestamp(item.added_on),
      added_time: item.added_on,
      canRemove: false,
      department: item.department ? item.department : "",
      department_flow_type : item.department_flow_type
    }
    this.index = this.index + 1;
    this.selectedTests.push(tempTest);
  }

  UpdateLabPackage(item: any) {
    let concelled = false;
    item.lab_tests.forEach((test: any) => {
      test.LabGlobalTestId = test.id;
      test['tempId'] = this.index;
      this.index = this.index + 1;
      if (test.status_id == 'Cancelled') {
        concelled = true;
      }
    })

    const tempTest = {
      id: item.id + "pkg",
      name: item.name,
      date: this.timeSrvc.decodeTimestamp(item.added_on),
      status: concelled ? 'Cancelled' : 'Pending',
      cost: item.offer_price,
      cost_true: false,
      total: item.offer_price,
      added_on: this.timeSrvc.decodeTimestamp(item.added_on),
      canRemove: false,
      department: "",
      package: true,
      package_tests: item.lab_tests,
      package_id: item.id,
      added_time: item.added_on,
    };

    this.selectedTests.push(tempTest);
  }

  
  drop(event: CdkDragDrop<string[]>) {
    this.selected_tests_for_prints = [];
    moveItemInArray(this.filteredMultiPrints, event.previousIndex, event.currentIndex);
  }

  isTestSelectedForPrint(test: any): boolean {
    return this.selected_tests_for_prints.some((selectedTest: any) => selectedTest.tempId === test.tempId);
  }


  openMultiPrint() {
    this.multiPrintReports = [];
    this.filteredMultiPrints = [];
    this.printDepts = [];

    this.ptn['printLoading'] = false;

    this.selectedTests.forEach((test: any) => {
      if (!test?.package && test.department_flow_type == this.flow_type) {
        if (test.status === 'Completed') {
          test['packageTest'] = false;
          this.multiPrintReports.push(test);
          this.filteredMultiPrints = this.multiPrintReports

          const existingDept = this.printDepts.find((d: any) => d.name === test.department);
          if (!existingDept) {
            this.printDepts.push(this.departments.find((d: any) => d.name === test.department));
          }
        }
      }
      if (test.package) {
        test.package_tests.forEach((t: any) => {
          if (t.status_id === 'Completed' && t.department_flow_type == this.flow_type) {
            t['packageTest'] = true
            this.multiPrintReports.push(t);
            this.filteredMultiPrints = this.multiPrintReports
            const existingDept = this.printDepts.find((d: any) => d.name === t.department);
            if (!existingDept) {
              this.printDepts.push(this.departments.find((d: any) => d.name === t.department));
            }
          }
        });
        this.filteredMultiPrints = this.multiPrintReports
      }
    })

    if (this.filteredMultiPrints.length !== 0) {
      this.selected_tests_for_prints = [];

    } else {
      this.printReports = false;
      this.ptn = null;
      this.printDepts = ''
      this.selectedTests = ''
      this.alertService.showInfo(`No ${this.flow_type == 1 ? 'Technician' : 'Radiology'} Reports Were Completed To Print.`)
    }

  }

  
  selectDeptForPrint(e: any) {
    if (e) {
      this.selected_tests_for_prints = [];
      this.filteredMultiPrints = this.multiPrintReports.filter((test: any) => test.department == e.name);
    } else {
      this.filteredMultiPrints = this.multiPrintReports;
    }
  }

  selectAllTests(e: any) {

    if (e.target.checked) {

      this.selected_tests_for_prints = [];

      this.filteredMultiPrints.forEach((item: any) => {
        this.Handle_print_report({ target: { checked: true } }, item);
      })

    } else {
      this.filteredMultiPrints.forEach((item: any) => {
        this.Handle_print_report({ target: { checked: false } }, item);
      })
    }

  }

  getMatchingObjects() {

    // Step 1: Create a map of tempId to index in originalOrder
    let tempIdIndexMap: { [key: number]: number } = {};
    this.filteredMultiPrints.forEach((item: any, index: any) => {
      tempIdIndexMap[item.tempId] = index;
    });

    // Step 2: Sort the array based on the mapped indices
    this.selected_tests_for_prints.sort((a: any, b: any) => {
      return tempIdIndexMap[a.tempId] - tempIdIndexMap[b.tempId];
    });

    const matchingObjects = this.selected_tests_for_prints.map((test: any) => {
      // Check if the test is present in selectedTests
      let matchingTest = this.selectedTests.find((selectedTest: any) => selectedTest.tempId === test.tempId);

      // If not found in selectedTests, check in lab_packages
      if (!matchingTest) {
        this.selectedTests.forEach((selectedTest: any) => {
          if (selectedTest.package_tests) {
            const packageTest = selectedTest.package_tests.find((pkgTest: any) => pkgTest.tempId === test.tempId);
            if (packageTest) {
              matchingTest = { ...packageTest, package_id: selectedTest.package_id };
            }
          }
        });
      }

      return matchingTest;
    });

    return matchingObjects
  }


  printMultiplePrints(download: boolean) {


    if (this.selected_tests_for_prints.length != 0) {
      this.spinner.show();
      this.ptn['printLoading'] = true;
      const testObj = this.getMatchingObjects();
      let test_ids = '';
      let count = 0
      testObj.forEach((test: any) => {
        test_ids += test.LabGlobalTestId + ','
        count += 1;
        if (count == testObj.length) {

          this.subsink.sink = this.endPoint.postAndGetMultiPrint(
            test_ids.slice(0, -1), 
            this.cookieSrvc.getCookieData().client_id, 
            this.ptn.id, 
            this.download_letterhead,
            download
          ).subscribe((res: any) => {
            this.ptn['printLoading'] = false;
           
            if(!download){
              this.printSrvc.printHeader(res.html_content, res.header, false, 1500, this.download_letterhead == '&lh=true');
            }else{
              this.fileSrvc.downloadFile(res.link_pdf, `${this.ptn.name}_${this.ptn.visit_id}_${this.ptn.mobile_number}.pdf`)
            }
            
            this.spinner.hide();
          }, (error) => {
            this.ptn['printLoading'] = false;
          })
        }
      })
    } else {
      this.alertService.showInfo("Select atleast one test.")
    }


  }

  Handle_print_report(e: any, item: any, pkg: boolean = false): void {

    const checkBoxValue = e.target.checked;
    if (checkBoxValue) {

      const model = {
        tempId: item.tempId,
        test_id: pkg ? item.id : item.LabGlobalTestId,
        client_id: this.cookieSrvc.getCookieData().client_id,
      };

      this.selected_tests_for_prints.push({ tempId: model.tempId });

    } else {
      const index = this.selected_tests_for_prints.findIndex((test: any) => test.tempId === item.tempId);
      if (index !== -1) {
        this.selected_tests_for_prints.splice(index, 1);
      }
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
