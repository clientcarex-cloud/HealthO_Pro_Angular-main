import { Component, Injector, Input, ViewChild } from '@angular/core';
import { Test } from 'src/app/setup/models/master/test.model';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { GlobalTestService } from 'src/app/setup/services/labtest.service';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import * as ClassicEditor from 'ckeditor4-angular'
import { FormGroup } from '@angular/forms';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-global-tests',
  templateUrl: './global-tests.component.html',
  styleUrls: ['./global-tests.component.scss'],
})

export class GlobalTestsComponent extends BaseComponent<Test> {
  public editor = ClassicEditor;
  @ViewChild('editor') editorData: any;
  @Input() sourcing_lab: any = null;

  show_sourcing: boolean = true ;

  public htmlData: any;
  mainMatForm!: FormGroup;

  public wordReportContent: string = '';

  public onReady(editor: any) {
    this.editorData = editor;
  }

  changesMade: boolean = false;
  public wordReportInput({ editor }: any) {
    this.changesMade = true;
    this.wordReportTemplate.report = editor.getData();
  }

  closeReportModels(e: boolean = true) {
    
    this.fixedReportForm.reset();
    this.submitted = false;
    
      if(this.changesMade){
        this.updateOrdering();
        this.changesMade = false;
      }

      if(this.remarkChanges){

        this.subsink.sink = this.endPoint.updateReports(this.ReportId, this.ReportId.id).subscribe((data: any) => {
          this.modalService.dismissAll();
          this.alertService.showSuccess("Remarks Updated.");    
          this.reportTemplatePage(this.selectedLabGlobalTest);
          this.remarkChanges = false;
        }, (error) => {
          this.remarkChanges = false;
          this.alertService.showSuccess("Updating the Report failed.")
        })
       
      }

  }

  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private cookieSrvc: CookieStorageService,
    public service: GlobalTestService,
    public capitalSrvc: CaptilizeService,
    private endPoint: MasterEndpoint,
    private proEndpoint: ProEndpoint,
  ) { super(injector) }

  @ViewChild('addTest') testModel: any;
  @ViewChild('wordReport') wordReportmodal: any;

  pageNum!: null;
  global_tests!: any;
  inProgress: boolean = false;
  updateBool: boolean = false;
  modelTitle!: string;
  templates!: any;
  showReport: boolean = false;
  departments: any = [];
  isBulkEditing: boolean = false;
  testSubmitted: boolean = false;
  reportTypes!: any;
  reportTemplateForm!: UntypedFormGroup;
  fixedReportForm!: UntypedFormGroup;
  depts: any;
  all_departments: any = [];
  fixedReports: any = [];

  b_id: any ;

  override ngAfterViewInit(): void {
    this.initializeReferralRangeForm()
  }

  override ngOnInit(): void {
    
    this.pageNum = null;
    this.getData();

    this.b_id = this.cookieSrvc.getCookieData().b_id || null ;

    this.subsink.sink = this.endPoint.getDepartments().subscribe((data: any) => {
      this.all_departments = data;
      this.depts = data.filter((d: any) => d.is_active)
      data.forEach((d: any) => {
        if (d.is_active) {
          this.departments.push(d)
        }
      });

      this.checkRouterQuery();
    })

    // this.getAllTemplates();
    // this.getAllFixedReport()
    this.getReports();

    this.initializeForm();
    this.initializeReportForm();



  }

  checkRouterQuery(){
    this.route.queryParams.subscribe(params => {
      const g_id = +params['g_id'];
      if(g_id){
        this.subsink.sink = this.endPoint.getTest(g_id).subscribe((data: any)=>{
          this.singleTest(data);

          this.query = data.name;
          this.page_size = 10;
          this.page_number = 1;
          this.count = 1;
          this.all_count = 1;
          this.patients = [];
          this.getData();
        })
      }else{
        this.query = "";
        this.page_size = 10;
        this.page_number = 1;
        this.count = 1;
        this.all_count = 1;
        this.patients = [];
        this.getData();
      }
    })
  }

  count!: number;
  all_count!: number;
  patients!: any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer: any;

  page_size: any = 10;
  page_number: any = 1;
  query: string = "";

  sort: any = false;


  changeSorting() {
    this.sort = !this.sort;
    this.getData();
  }


  @ViewChild('datePicker') datePicker!: AppDatePickerComponent;
  dept: any = "";

  getData() {

    if(!this.sourcing_lab){
      this.subsink.sink = this.endPoint.getPaginatedGlobalTests(
        this.page_size, this.page_number,
        this.query,
        this.dept
      ).subscribe((data: any) => {
        this.count = Math.ceil(data.count / this.page_size)
        this.all_count = data.count;
        this.global_tests = data.results
      })
    }else{
      let srcng = '';

      if(this.sourcing_lab?.initiator){
        srcng  = `&sourcing_lab=${this.sourcing_lab.id}`
      }
      
      this.subsink.sink = this.endPoint.getLabTestWithSouring(
        this.page_size, this.page_number,
        this.query, this.dept , srcng
      ).subscribe((data: any) => {
        this.count = Math.ceil(data.count / this.page_size)
        this.all_count = data.count;
        this.global_tests = data.results
      })
    }

  }

  selectDept: any = null

  selectDepartment(e: any) {

    if (e && e !== "") {
      this.dept = e.id;
      this.selectDept = e;
      this.getData();
    } else {
      this.dept = "";
      this.selectDept = null;
      this.getData();
    }

  }

  searchQuery(e: any) {
    this.query = e;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getData();

    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e: any) {
    this.page_size = e.target.value;
    this.getData()
  }


  onPageChange(e: any) {
    this.page_number = e;
    this.getData();
  }

  getRangeValue(e: any) {
    if (e.length !== 0) {
      if (e.includes("to")) {
        this.separateDates(e);
      } else {
        this.date = e;
        this.from_date = "";
        this.to_date = "";
        this.page_number = 1;
        this.getData();
      }
    }
    else {
      this.date = "";
      this.from_date = "";
      this.to_date = "";
      this.page_number = 1;
      this.getData();
    }
  }

  separateDates(dateString: string): void {
    const [startDate, endDate] = dateString.split(" to ");
    this.from_date = startDate;
    this.to_date = endDate;
    this.date = "";
    this.page_number = 1;
    this.getData();
  }

  temps: any = [];
  getAllTemplates() {
    this.subsink.sink = this.endPoint.getReportTemplates().subscribe((data: any) => {
      this.temps = data;
      this.temps.forEach((d: any) => {
        this.templates = d;
      })
    })
  }

  wordReportTemplate: any;

  initializeReportForm() {
    this.reportTemplateForm = this.formBuilder.group({
      reportName: ["", Validators.required],
      is_default: [false],
      reportType: [null, Validators.required]
    })
  }

  getReports() {
    this.proEndpoint.getReportTypes().subscribe((data: any) => {
      this.reportTypes = data;
    });
  }

  getTestName(id: number) {
    return this.global_tests.find((t: any) => t.id == id);
  }

  getReportName(id: number) {
    return this.reportTypes.find((t: any) => t.id == id);
  }

  formatString(e: any, val: string = 'any') {
    if (val === 'name') { this.baseForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e)); }
    else if (val === 'reportName') { this.reportTemplateForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e)); }
    else if (val === 'short_code') { this.baseForm.get(val)?.setValue(e.toUpperCase()) }
    else if (val === 'parameter') { this.fixedReportForm.get(val)?.setValue(this.capitalSrvc.capitalizeReturn(e)) }
    else { this.baseForm.get(val)?.setValue(this.capitalSrvc.captical(e)) }
  }


  @ViewChild('warningModal') warningModal!: any;

  deleteParam: any;
  deleteParams(content: any, param: any) {
    this.deleteParam = [];
    this.deleteParam.push(param);
    this.openXl(content)
  }

  openXl(content: any, sz: string = 'lg', cntrd: boolean = true, backDrop: string = 'light-blue-backdrop') {
    this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop, backdrop: 'static', keyboard: false });
  }


  updatePricee(newPrice: number, test: Test) {
    test.price = newPrice;
    test.price = test.price.toFixed(2);
    const updatedTests = this.global_tests.map((t: Test) => (t.id === test.id ? test : t));
    this.global_tests = updatedTests;
  }

  updatePrice(newPriceStr: string, test: Test) {
    // Parse the new price as a float
    const newPrice = parseFloat(newPriceStr);
    if (!isNaN(newPrice)) {
      test.price = newPrice;
      const updatedTests = this.global_tests.map((t: Test) => (t.id === test.id ? test : t));
      this.global_tests = updatedTests;
    }
  }

  toggleBulkEdit(){
    this.isBulkEditing = !this.isBulkEditing ; 
    if(!this.isBulkEditing) this.getData() ;
  }

  updateTestValue(val: any, item: any, type: any){
      item[type] = val ;
  }

  getDepartmentId(name: any) {
    return this.all_departments.find((dept: any) => dept.name === name)?.id || name
  }

  getDepartment(name: any) {
    return this.all_departments.find((dept: any) => dept.name === name)
  }

  bulkPrice(val: any){
    this.global_tests.forEach((test: any)=> test.price = val )
  }

  async bulkSave() {
    this.inProgress = true;
    let count: number = 0;
    
    for(const test of this.global_tests){
      test.department = this.getDepartmentId(test.department);
      if(test?.sourcing_lab) test.sourcing_lab = test.sourcing_lab.id;

      try{
        const response = await this.updateTest(test) ;
        count ++ 
      }catch(error){

      }
    }

    this.inProgress = false;
    this.isBulkEditing = false;
    this.pageNum = null;
    this.getData();
    if (count === this.global_tests.length) {
      this.alertService.showSuccess("Updated", "Lab Tests");
      this.getData();
    } else {
      this.alertService.showError("Bulk Save Error")
    }

  }


  async updateTest(test: any){
    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.endPoint.updateTest(test).subscribe((res: any) => {
        resolve(res) ;
      }, (error) => {
        reject(null) ;
        this.alertService.showError(`${test.name}`, error?.error?.error || error?.error?.Error || error );
      })
    })
  }

  async doInactive(test: any, e: any) {

    test.is_active = e ;
    if(!this.isBulkEditing){
      test.department = this.getDepartmentId(test?.department);
      if(test?.sourcing_lab) test.sourcing_lab = test.sourcing_lab.id ;
  
      try{
        const response: any = await this.updateTest(test) ;
        this.getData() ;
        response.is_active ? this.alertService.showSuccess("Active", `${test.name}`) : ""
        !response.is_active ? this.alertService.showInfo("Inactive", `${test.name}`) : ""
      }catch(error){
        this.getData() ;
      }
    }
  }


  doOutSourcing(test: any, e: any) {
    let temp = { ...test }; // Create a copy of the test object
    temp.is_outsourcing = e;
    temp.department = this.getDepartmentId(test.department);

    this.subsink.sink = this.endPoint.updateTest(temp).subscribe(
      (response: any) => {
        // Update the test object with the response
        test = { ...response };
        response.is_outsourcing ? this.alertService.showSuccess("Active", `${test.name}`) : ""
        !response.is_outsourcing ? this.alertService.showInfo("Inactive", `${test.name}`) : ""
      },
      (error) => {
        this.alertService.showError(error);
      }
    );
    this.pageNum = null;

  }

  resetForm() {
    this.modelTitle = "";
    this.updateBool = false;
    this.selectedTest = {}
    this.baseForm.reset();
    this.initializeForm();
    this.testSubmitted = false;
    if(!this.sourcing_lab){
      this.modalService.dismissAll();
    }

  }

  resetReportForm() {
    this.reportTemplateForm.reset();
    this.initializeReportForm();
  }

  initializeForm(): void {
    this.baseForm = this.formBuilder.group({
      name: ['', Validators.required],
      display_name: [''],
      price: [null, Validators.required],
      short_code: [null],
      is_outsourcing: [false],
      inventory_cost: [null],
      total_cost: [null],
      is_active: [true],
      is_accreditation: [false],
      target_tat: [null],
      added_on: [null],
      last_updated: [null],
      sample: [''],
      sample_volume: [''],
      clinical_information: [''],
      department: [null, Validators.required],
      methodology: [null],
      is_authorization: [false],
      expense_for_outsourcing: [null] // Initialize without validation first
    });

    // Set conditional validation for expense_for_outsourcing
    this.setExpenseCostValidation();
  }


  setExpenseCostValidation(): void {
    if (this.sourcing_lab) {
        this.baseForm.get('expense_for_outsourcing')?.setValidators(Validators.required);
        this.baseForm.get('expense_for_outsourcing')?.updateValueAndValidity(); // Ensure value and validation are updated
    }

}

  updateGlobalTest(model: any): void {
    this.subsink.sink = this.endPoint.updateTest(model).subscribe((Response: any) => {
      this.modalService.dismissAll();
    }, (error) => {
      this.alertService.showError(error);
    })
  }

  selectedTest!: any;

  os_test: boolean = false;

  singleTest(test: any) {
    this.modelTitle = test.name;
    this.updateBool = true;
    this.selectedTest = test;

    this.os_test = test.sourcing_lab ? true : false;

    this.baseForm.setValue({
      name: test.name || '',
      display_name: test.display_name,
      price: test.price || null,
      short_code: test.short_code || null,
      is_outsourcing: test.is_outsourcing || false,
      inventory_cost: test.inventory_cost || null,
      total_cost: test.total_cost || null,
      is_active: test.is_active || true,
      is_accreditation: test.is_accreditation || false,
      target_tat: test.target_tat || null,
      added_on: test.added_on || null,
      last_updated: test.last_updated || null,
      sample: test.sample || '',
      sample_volume: test.sample_volume || '',
      clinical_information: test.clinical_information || '',
      department: this.getDepartment(test.department) || null,
      methodology: test.methodology || null,
      is_authorization: test.is_authorization || null,

      expense_for_outsourcing: test.expense_for_outsourcing || null
    });


    this.openXl(this.testModel);
  }


  deleteParamter() {

    const param  = this.deleteParam[0]
    param.is_active = false ; 
    this.subsink.sink = this.endPoint.updateFixedParameterOrdering(param).subscribe((data: any) => {
      this.alertService.showSuccess("Paramter Deleted.")
      this.tableParameters = this.tableParameters.filter((p: any) => p.id != param.id)
    }, (error) => {
      this.alertService.showError("Error in deleting the parameter.");
    })
  }

  updateIItem(model: any) {
    this.subsink.sink = this.endPoint.updateTest(model).subscribe((Response: any) => {
      this.alertService.showSuccess("Updated", model.name);
      this.pageNum = null;
      this.modalService.dismissAll();
      this.resetForm();
      this.getData();
    }, (error) => {
      this.alertService.showError(error);
    })
  }

  updateSingle() {

    if (this.baseForm.valid) {
      this.updateIItem(this.updateModel(this.selectedTest))
    } else {
      this.testSubmitted = true;
      this.showBaseFormErrors();
    }

  }

  private updateModel(t: any) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}T${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
    const model: any = {
      id: t.id,
      name: this.baseForm.get('name')?.value,
      price: this.baseForm.get('price')?.value,
      short_code: this.baseForm.get('short_code')?.value || null,
      is_outsourcing: this.baseForm.get('is_outsourcing')?.value,
      inventory_cost: this.baseForm.get('inventory_cost')?.value,
      total_cost: this.baseForm.get('total_cost')?.value || null,
      is_active: this.baseForm.get('is_active')?.value,
      is_accreditation: this.baseForm.get('is_accreditation')?.value || false,
      target_tat: this.baseForm.get('target_tat')?.value || null,
      added_on: t.added_on,
      last_updated: formattedDate,
      sample: this.baseForm.get('sample')?.value || null,
      sample_volume: this.baseForm.get('sample_volume')?.value || null,
      clinical_information: this.baseForm.get('clinical_information')?.value || null,
      department: this.baseForm.get('department')?.value?.id || null,
      methodology: this.baseForm.get('methodology')?.value || null,
      is_authorization: this.baseForm.get('is_authorization')?.value || false,

      display_name: this.baseForm.get('display_name')?.value,

      expense_for_outsourcing: this.baseForm.get('expense_for_outsourcing')?.value || null
    };

    return model;
  }

  private getModel() {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}T${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
    const model: any = {
      name: this.baseForm.get('name')?.value,
      price: this.baseForm.get('price')?.value,
      short_code: this.baseForm.get('short_code')?.value || null,
      is_outsourcing: this.baseForm.get('is_outsourcing')?.value,
      inventory_cost: this.baseForm.get('inventory_cost')?.value,
      total_cost: this.baseForm.get('total_cost')?.value || null,
      is_active: this.baseForm.get('is_active')?.value,
      is_accreditation: this.baseForm.get('is_accreditation')?.value || false,
      target_tat: this.baseForm.get('target_tat')?.value || null,
      added_on: formattedDate,
      last_updated: formattedDate,
      sample: this.baseForm.get('sample')?.value || null,
      sample_volume: this.baseForm.get('sample_volume')?.value || null,
      clinical_information: this.baseForm.get('clinical_information')?.value || null,
      department: this.baseForm.get('department')?.value?.id || null,
      methodology: this.baseForm.get('methodology')?.value || null,
      is_authorization: this.baseForm.get('is_authorization')?.value || false,
      sourcing_lab : null,
      display_name: this.baseForm.get('display_name')?.value,
      expense_for_outsourcing: this.baseForm.get('expense_for_outsourcing')?.value || null
    };

    if(this.sourcing_lab){
      model.is_outsourcing = true ;
      model['sourcing_lab'] = this.sourcing_lab.id ;
    }

    return model;
  }

  override saveApiCall(): void {

    if (this.baseForm.valid) {
      const test_model = this.getModel();
      this.inProgress = true;
      this.subsink.sink = this.endPoint.postTest(test_model).subscribe((Response) => {
        this.getData();
        this.alertService.showSuccess("Added", test_model.name);
        this.inProgress = false;
        this.resetForm();
        // this.modalService.dismissAll();
      }, (error) => {
        this.inProgress = false;

        if (error.error?.name) {
          this.alertService.showError("Lab global tests with this name already exists.", test_model.name);
        } if (error.error?.includes("short") && error.error?.includes("code") && error.error?.includes("exists")) {
          this.alertService.showError("Lab global tests with the same Short Code already exists.", "");
        } else {
          this.alertService.showError("Failed to add global test", test_model.name);
        }

        this.inProgress = false;
      })
    } else {
      this.testSubmitted = true;

      this.showBaseFormErrors();
    }
  }


  // REPORT PAGE FUNCTIONS 
  filterTemplates!: any;
  reportTemplateName = "";
  selectedLabGlobalTest!: any;

  activeReportId: any = {
    id: "",
    show: true
  };

  activeTmplt: any;
  toggleEditMode(template: any) {
    template.editMode = !template.editMode;
    this.activeTmplt = template.editMode ? template : '';
  }

  displayEdit(template: any, isHover: boolean) {
    if (!template.editMode) {
      template.showEditButton = isHover;
    }
  }

  selectedTemplate: any;
  // temp != 
  changeReportName(e: any, template: any) {
    if (e && e !== "") {
      this.selectedTemplate = template;
      this.selectedTemplate.name = this.capitalSrvc.capitalizeReturn(e);
    }
  }



  saveReportName(remark : boolean = false) {
    if (this.selectedTemplate.name || this.selectedTemplate.name !== "") {
      this.subsink.sink = this.endPoint.updateReports(this.selectedTemplate, this.selectedTemplate.id).subscribe((data: any) => {
          
        this.alertService.showSuccess(remark ? "Parameter Updated." : "Report Name Updated.");
        this.reportTemplatePage(this.selectedLabGlobalTest);
      
      }, (error) => {
        this.alertService.showSuccess(`updating the report ${remark ? 'Parmeter ' : 'Name '} failed.`)
      })
    } else {
      this.reportTemplatePage(this.selectedLabGlobalTest);
      this.alertService.showError("Report Name may not be blank")
    }
  }


  reportTemplatePage(id: any) {
    this.activeIdTab = 1;
    this.parameters = [];
    this.subsink.sink = this.endPoint.getGlobalTestReports(id).subscribe((data: any) => {
      this.temps = data;
      this.filterTemplates = data.sort((a: any, b: any) => a.name.localeCompare(b.name))
      if (this.filterTemplates.length == 0) {
        this.reportTemplateForm.get('is_default')?.setValue(true);
      }
    })

    this.reportTemplateName = this.getTestName(id)?.name || ""
    this.selectedLabGlobalTest = id;
    this.showReport = true;
  }

  resetReportPage() {
    this.global_tests = [];
    this.getData();
    this.filterTemplates = [];
    this.templates = [];
    this.getAllTemplates();
    this.submitted = false;
  }

  private getReportModel() {
    const model: any = {
      name: this.reportTemplateForm.get('reportName')?.value,
      LabGlobalTestID: this.selectedLabGlobalTest,
      is_default: this.reportTemplateForm.get('is_default')?.value,
      report_type: this.reportTemplateForm.get('reportType')?.value?.id,

      default_technician_remarks: ''
    }
    return model;
  }


  groups: any = [] ;

  getGroupsName(){
    this.groups = [] ;
    this.tableParameters.forEach((data:any)=>{
      if(data.group && data.group != ''){
       if(!this.groups.includes(data.group)){
        this.groups.push(data.group)
       }
      }
    })
  }

  updateReportRemark(e: any){
    this.remarkChanges = true;
    this.ReportId['default_technician_remarks'] = e;
  }



  saveReport(): void {
    if (this.reportTemplateForm.valid) {
      const report_model = this.getReportModel();
      this.inProgress = true;
      this.subsink.sink = this.endPoint.postReportTemplate(report_model).subscribe((Response: any) => {
        this.filterTemplates = [];
        this.resetReportForm();
        // this.getAllTemplates();
        this.getReports();
        this.reportTemplatePage(report_model.LabGlobalTestID)
        this.alertService.showSuccess("Added", report_model.name);
        this.inProgress = false;
        this.submitted = false;

        // pass
        if (report_model.report_type == 2) {
          const model = {
            LabReportsTemplate: Response.id,
            report: `<div>Type Content Here</div>`,
            pages: [{
              page_content: "<div>Type Report Here</div>"
            }]
          }

          this.subsink.sink = this.endPoint.postWordReport(model).subscribe((Reponse: any) => {
            this.alertService.showSuccess(this.ReportTitle, "Generated");
            this.modalService.dismissAll();
          }, (error) => {
            this.alertService.showError(error)
          })

        }



      }, (error) => {

        if (error?.error?.name) {
          this.alertService.showError(error.error.name[0]);
        } else {
          this.alertService.showError(error);
        }

        this.inProgress = false;
      })
    } else {
      this.submitted = true
    }
  }



  // FIXED REPORT FUNCTION FROM HERE 
  initializeFixedReport(test_id: number, report_id: number) {
    this.fixedReportForm = this.formBuilder.group({
      parameter: ['', Validators.required],
      value: [null,],
      units: ['',],
      formula: [''],
      referral_range: [''],
      group: [""],
      method: [''],
      LabGlobalTestID: [test_id],
      LabReportsTemplate: [report_id],
      is_value_only: [false],
      is_value_bold: [false],
      normal_ranges_display: [null],
      mcode: [null]
    });
  }


  updateDefault(template: any, e: any) {
    template.is_default = e;
    this.subsink.sink = this.endPoint.updateReportDefault(template).subscribe((data: any) => {
      this.alertService.showSuccess(template.name, "Default Status Updated");
      this.reportTemplatePage(this.selectedLabGlobalTest);
    }, (error) => {
      this.alertService.showError("Failed to Change default status");
      template.is_default = !e;
    })
  }



  ReportTitle!: string;
  ReportId: any = 0;
  ReportGlobalId: any = "";
  showPreview: boolean = false;

  withoutSpecChars(e: any) {
    if(e){
      return e.replace(/\n/g, '<br>')
    }else{
      return ''
    }

  }

  formula_ranges: any = '';
  newFormula: boolean = false;

  addFormula(tag: any){
    if(this.newFormula){
      this.formula_ranges += `{${tag}}`;
    }else{
      this.changesMade = true;
      this.orderChanged = true;
      if(!this.selectedParam.formula){
        this.selectedParam.formula = '' ;
      }
      this.selectedParam.formula += `{${tag}}`;
    }

    const formula_input = document.getElementById('formula_input');
    formula_input?.focus()
  }

  changeFormula(event : any){
    if(this.newFormula){
      this.formula_ranges = event;
    }else{
      this.changesMade = true;
      this.orderChanged = true;
      this.selectedParam.formula = event;
    }

  }

  openReport(content: any, tmplt: any) {
    if (tmplt.report_type === 1) {
      this.ReportId = tmplt;
      this.tableParameters = [];

      this.remarkChanges = false;
      this.changesMade = false;
      this.formula_ranges = '';

      this.ReportTitle = `${this.getTestName(tmplt.LabGlobalTestID)?.name} | ${tmplt.name}`;
      this.ReportGlobalId = tmplt.LabGlobalTestID;
      this.initializeFixedReport(tmplt.LabGlobalTestID, tmplt.id);

      this.subsink.sink = this.endPoint.getReportData(tmplt.id, tmplt.LabGlobalTestID).subscribe((data: any) => {
        this.tableParameters = data;
        this.formula_ranges = '';
        this.normal_ranges = [];

        this.tableParameters.forEach((item: any, index: any) => {
          item['editmode'] = false;
          this.paramEditmode = false;
        })

        this.modalService.open(content, { size: 'xl', fullscreen: false, centered: false, scrollable: true, backdrop: 'static', keyboard: false });
        this.getRefGenders();
      }, (error)=>{
        this.showAPIError(error);
      })

      



    } else if (tmplt.report_type === 2) {

      this.ReportTitle = `${this.getTestName(tmplt.LabGlobalTestID)?.name} | ${tmplt.name}`;
      this.ReportId = tmplt;

      this.subsink.sink = this.endPoint.getReportData(tmplt.id, tmplt.LabGlobalTestID).subscribe((data: any) => {
        this.wordReportTemplate = data;


        this.fullScreen = false;
        this.showPreview = this.cookieSrvc.getSpecificBooleanData('prv');

        this.modalService.open(this.wordReportmodal, { size: 'xl', fullscreen: false, scrollable: false, centered: false, backdrop: 'static', keyboard: false });
      }, (error) => {
        this.alertService.showError(this.ReportTitle, error)
      })

    }

  }
  filterParameters: any = [];

  tableParameters: any;
  remarkChanges: boolean = false;
  drop(event: CdkDragDrop<string[]>) {
    this.orderChanged = true;
    this.changesMade = true;
    moveItemInArray(this.tableParameters, event.previousIndex, event.currentIndex);
    this.tableParameters.forEach((item: any, index: any) => {
      item.ordering = index + 1;
    });

  }

  orderSaveProgress: boolean = false;
  orderChanged = false;

  updateOrdering() {
    let count = 0;
    this.submitted = false;
    if (this.orderChanged) {
      this.inProgress = true;
      this.orderSaveProgress = true;
      this.tableParameters.forEach((param: any) => {
        this.subsink.sink = this.endPoint.updateFixedParameterOrdering(param).subscribe((data: any) => {
          count = count + 1;
          if (this.tableParameters.length === count) {
            this.inProgress = false;
            this.modalService.dismissAll();
            this.alertService.showSuccess("Saved")
          }

          this.orderSaveProgress = false;
        }, (error) => {

          this.inProgress = false;
          this.orderSaveProgress = false;
          this.alertService.showError(`Error in updating the order, ${param.parameter}`);
        })
      })
    }
  }


  toggleParamEditMode(report: any) {
    report.editMode = !report.editMode;
  }

  saveChanges(report: any) {
    // Implement logic to save changes
    this.changesMade = true;
    report.editMode = false; // Disable edit mode after saving changes
  }

  updateFixedParameter(e: any, param: any , type: any){
    this.changesMade = true;
    this.orderChanged = true;
    param[type] = e;
  }

  updateFixedReportParameterValue(e: any, param: any) {

  }

  updateFixedReportParameterName(e: any, param: any) {
    this.changesMade = true;
    this.orderChanged = true;
    param.parameter = e;
  }

  updateFixedReportParameterUnits(e: any, param: any) {
    this.changesMade = true;
    param.units = e;
    this.orderChanged = true
  }

  updateFixedReportParameterMethod(e: any, param: any) {
    this.changesMade = true;
    param.method = e;
    this.orderChanged = true
  }

  updateFixedReportParameterGroup(e: any, param: any) {
    this.changesMade = true;
    param.group = e;
    this.orderChanged = true
  }

  updateFixedReportParameterReferral(e: any, param: any) {
    this.changesMade = true;
    param.referral_range = e;
    this.orderChanged = true ;
  }


  updateFixedReportParameterValueOnly(e: any, param: any, type: any) {
    this.changesMade = true;
    param[type] = e;
    this.orderChanged = true
  }

  updateFixedReportParameterBold(e: any, param: any) {
    this.changesMade = true;
    param.is_value_bold = e;
    this.orderChanged = true
  }

  filterReports() {
    this.subsink.sink = this.endPoint.getReportData(this.ReportId.id, this.ReportGlobalId).subscribe((data: any) => {
      this.tableParameters = data;
      this.tableParameters.forEach((item: any, index: any) => {
        item.ordering = index + 1;
      })
    })
  }

  paramEditmode: boolean = false;
  toggleParametersEditMode() {
    this.paramEditmode = !this.paramEditmode;
    this.tableParameters.forEach((item: any, index: any) => {
      item.editmode = !item.editmode;
    });

    if (!this.paramEditmode) {
      this.resetNormalRanges();
    }
  }

  resetNormalRanges(){
    this.fixedReportForm.reset();
    this.normal_ranges = [];
  }

  private getFixedReportModel() {
    const model: any = {
      parameter: this.fixedReportForm.get('parameter')?.value,
      value: this.fixedReportForm.get('value')?.value || "",
      units: this.fixedReportForm.get('units')?.value || "",
      formula: this.formula_ranges && this.formula_ranges != '' ? this.formula_ranges : null,
      LabGlobalTestID: this.fixedReportForm.value.LabGlobalTestID,
      ordering: this.tableParameters?.length + 1 || 1,
      group: this.fixedReportForm.get('group')?.value || "",
      method: this.fixedReportForm.get('method')?.value || "",
      referral_range: this.fixedReportForm.get('referral_range')?.value || "",
      LabReportsTemplate: this.fixedReportForm.value.LabReportsTemplate,
      is_value_only: this.fixedReportForm.get('is_value_only')?.value || false,
      is_value_bold: this.fixedReportForm.get('is_value_bold')?.value || false,
      mcode: this.fixedReportForm.get('mcode')?.value || null,
      normal_ranges_display: this.fixedReportForm.get('normal_ranges_display')?.value || null
    }
    return model;
  }


  saveFixedReport() {

    if (this.fixedReportForm.valid) {
      const model = this.getFixedReportModel();

      this.subsink.sink = this.endPoint.postFixedReportParameters(model).subscribe((Response: any) => {
        this.fixedReportForm.reset();
        this.initializeFixedReport(Response.LabGlobalTestID, Response.LabReportsTemplate);
        this.pageNum = null;


        this.normal_ranges.forEach((item: any) => {
          item['parameter_id'] = Response.id;

          this.subsink.sink = this.endPoint.postNormalRanges(item).subscribe((res: any) => {

          }, (error) => {
            this.alertService.showError('Error in Posting the Normal Ranges', error)
          })
        })

        this.normal_ranges = [];
        this.filterParameters = [];
        this.filterReports();
        this.formula_ranges = '';

        this.alertService.showSuccess("Parameter Added", model.parameter)
      }, (error) => {
        this.alertService.showError(error);
      })
    } else {
      this.submitted = true;
    }
  }


  saveWordReport() {
    if (true) {

      const model = {
        id: this.ReportId.id,
        LabReportsTemplate: this.ReportId.id,
        report: this.wordReportContent
      }

      this.subsink.sink = this.endPoint.updateWordReport(this.wordReportTemplate).subscribe((Reponse: any) => {
        this.alertService.showSuccess(this.ReportTitle, "Saved");
        this.modalService.dismissAll();
      }, (error) => {
        this.alertService.showError(error)
      })

    }
  }



  fullScreen: any = false;

  handleFullscreenClick(e: any): any {
    this.htmlData = e;
    this.wordReportContent = e;
    this.wordReportTemplate.report = e;
    this.fullScreen = !this.fullScreen;
    this.modalService.dismissAll();
    this.showPreview = this.cookieSrvc.getSpecificBooleanData('prv');
    if (this.fullScreen) {

      this.modalService.open(this.wordReportmodal, { size: 'xl', fullscreen: true, centered: false, scrollable: false, backdrop: 'static', keyboard: false, });
    } else {
      this.modalService.open(this.wordReportmodal, { size: 'xl', fullscreen: false, centered: false, scrollable: false, backdrop: 'static', keyboard: false, });
    }
  }

  exitFullScreenClick(e: any): any {
    this.htmlData = e.data;
    this.wordReportContent = e.data;
    this.modalService.dismissAll();
    this.showPreview = this.cookieSrvc.getSpecificBooleanData('prv');
    this.modalService.open(this.wordReportmodal, { size: 'xl', fullscreen: false, centered: false, scrollable: true, backdrop: 'static', keyboard: false, });

  }

  handleExtractedContentChange(e: any) {
    this.wordReportTemplate.report = e.data;
    this.wordReportTemplate.rtf_content = e.rtf_content;
    this.saveWordReport()
  }




  // default parameter 


  defaultParameterString: any = "";

  SaveParameter() {
    if (this.defaultParameterString && this.defaultParameterString != '') {
      const model = {
        LabGlobalTestId: this.selectedLabGlobalTest,
        parameter: this.defaultParameterString
      }

      this.subsink.sink = this.endPoint.PostDefaultParamters(model).subscribe((res: any) => {
        this.alertService.showSuccess("Paramter Added");
        this.defaultParameterString = '';
        this.modalService.dismissAll();
        this.getTestDefaultParamters();
      }, (error) => {
        this.alertService.showError('Failed to add paramter', error)
      })
    } else {
      this.alertService.showInfo("Parameter should not be blank.")
    }

  }

  changeIsActive(param: any) {
    param.is_active = !param.is_active;
    this.setParam(param);
    this.updateParam();
  }

  updateParam() {
    if (this.defaultParameterString && this.defaultParameterString != '') {
      const model = {
        LabGlobalTestId: this.selectedLabGlobalTest,
        parameter: this.defaultParameterString,
        is_active: this.updateParameter.is_active,
        id: this.updateParameter.id
      }

      this.subsink.sink = this.endPoint.updateDefaultParam(model).subscribe((res: any) => {
        this.alertService.showSuccess("Paramter Updated");
        this.defaultParameterString = '';
        this.updateParameter = null;
        this.modalService.dismissAll();
        this.getTestDefaultParamters();
      }, (error) => {
        this.getTestDefaultParamters();
        this.alertService.showError('Failed to update paramter', error)
      })
    } else {
      this.alertService.showInfo("Parameter should not be blank.")
    }
  }

  updateParameter: any;

  setParam(param: any) {
    this.updateParameter = param;
    this.defaultParameterString = param.parameter;
  }
  activeIdTab: any = 1;
  parameters: any = [];

  getTestDefaultParamters() {
    this.subsink.sink = this.endPoint.getDefaultParamters(this.selectedLabGlobalTest, "all", 1, "").subscribe((res: any) => {
      this.parameters = res;
    })
  }


















  referralRangeForm!: UntypedFormGroup;
  refGenders: any = [];
  refAges: any = [];
  newParamRef: boolean = false;
  normal_ranges: any = [];
  selectedParam: any;

  nr_submitted: boolean = false;
  // referral Ranges

  getRefGenders() {
    this.subsink.sink = this.proEndpoint.getReferraRangesGenders().subscribe((res: any) => {
      this.refGenders = res;
      this.referralRangeForm.get('gender')?.setValue(res[0]);
    });

    this.subsink.sink = this.proEndpoint.getAges().subscribe((res: any) => {
      this.refAges = res.results.filter((r: any) => r.name != 'DOB');
    });

  }

  initializeReferralRangeForm() {
    this.referralRangeForm = this.formBuilder.group({
      gender: [null, Validators.required],
      age_min: [null, Validators.required],
      age_min_units: [1, Validators.required],

      age_max: [null, Validators.required],
      age_max_units: [1, Validators.required],

      value_min: [null, Validators.required],
      value_max: [null, Validators.required],

    })
  }

  getNormalRangeModel() {
    const model = {
      gender: this.referralRangeForm.get('gender')?.value.id,
      age_min: this.referralRangeForm.get('age_min')?.value,
      age_max: this.referralRangeForm.get('age_max')?.value,

      age_min_units: this.referralRangeForm.get('age_min_units')?.value,
      age_max_units: this.referralRangeForm.get('age_max_units')?.value,

      value_min: this.referralRangeForm.get('value_min')?.value,
      value_max: this.referralRangeForm.get('value_max')?.value,

    }

    return model;
  }

  getFloatVal(num: any) {
    return parseFloat(num.replace(/,/g, ''))
  }

  saveReferralRange() {
    if (this.referralRangeForm.valid) {
      const model: any = this.getNormalRangeModel();

      // Check that the value_min is less than value_max
      if (this.getFloatVal(model.value_min) >= this.getFloatVal(model.value_max)) {
        this.alertService.showError(`Value should be lower than ${model.value_max}`);
        return;
      }

      if (model.age_min_units == 1) {

        model['age_min_in_days'] = model.age_min * 365;
      } else if (model.age_min_units == 2) {
        model['age_min_in_days'] = model.age_min * 30
      } else {
        model['age_min_in_days'] = model.age_min
      }


      if (model.age_max_units == 1) {
        model['age_max_in_days'] = model.age_max * 365
      } else if (model.age_max_units == 2) {
        model['age_max_in_days'] = model.age_max * 30
      } else {
        model['age_max_in_days'] = model.age_max
      }

      if (model.age_min_in_days > model.age_max_in_days) {
        this.alertService.showError("Please Enter Valid Age Ranges.");
        return;
      }

      // If all checks pass, add the new range
      this.normal_ranges.push(model);

      this.referralRangeForm.reset();
      this.initializeReferralRangeForm();

    } else {
      this.nr_submitted = true;
      this.alertService.showError("Enter All Fields.")
    }
  }



  checkValidNormalRange() {
    if (this.referralRangeForm.valid) {
      const model: any = this.getNormalRangeModel();

      // Check that the value_min is less than value_max
      if (this.getFloatVal(model.value_min) >= this.getFloatVal(model.value_max)) {
        this.alertService.showError(`Value should be lower than ${model.value_max}`);
        return;
      }

      if (model.age_min_units == 1) {

        model['age_min_in_days'] = model.age_min * 365;
      } else if (model.age_min_units == 2) {
        model['age_min_in_days'] = model.age_min * 30
      } else {
        model['age_min_in_days'] = model.age_min
      }


      if (model.age_max_units == 1) {
        model['age_max_in_days'] = model.age_max * 365
      } else if (model.age_max_units == 2) {
        model['age_max_in_days'] = model.age_max * 30
      } else {
        model['age_max_in_days'] = model.age_max
      }

      if (model.age_min_in_days > model.age_max_in_days) {
        this.alertService.showError("Please Enter Valid Age Ranges.");
        return;
      }

      model['parameter_id'] = this.selectedParam.id;
      // If all checks pass, add the new range
      this.postNormalRange(model)
    } else {
      this.nr_submitted = true;
      this.alertService.showError("Enter All Fields.")
    }
  }


  postNormalRange(model: any) {
    if (this.referralRangeForm.valid) {

      this.subsink.sink = this.endPoint.postNormalRanges(model).subscribe((res: any) => {
        
        this.normal_ranges.push(this.getNormalRangeModel());
        this.referralRangeForm.reset();
        this.initializeReferralRangeForm();

        this.deleteNormalRange({}, false);

        try{
          if(this.tableParameters.find((param : any) => param.id == res.parameter_id)?.normal_ranges){
            this.tableParameters.find((param : any) => param.id == res.parameter_id).normal_ranges = [...this.tableParameters.find((param : any) => param.id == res.parameter_id)?.normal_ranges ] ;
            this.tableParameters.find((param : any) => param.id == res.parameter_id)?.normal_ranges.push(res);
          }else{
            this.tableParameters.find((param : any) => param.id == res.parameter_id).normal_ranges = [res];
          }
          this.selectedParam.normal_range.push(res);
        }catch(error){

        }
      })

    } else {
      this.nr_submitted = true;
      this.alertService.showError("Enter All Values");
    }
  }

  returnNRAges(id: any) {
    return this.refAges.find((age: any) => age.id == id).name
  }

  returnNRGenderName(id: any) {
    return this.refGenders.find((gen: any) => gen.id == id).name;
  }

  deleteNewNR(index: number) {
    // Check if the index is valid
    if (index > -1 && index < this.normal_ranges.length) {
      // Remove the item at the given index
      this.normal_ranges.splice(index, 1);
      this.checkNAddReferralRange();
    }
  }

  checkNAddReferralRange() {
    if (this.normal_ranges.length != 0) {
      this.fixedReportForm.get('normal_ranges_display')?.setValue(this.returnNormalRanges());
    } else {
      this.fixedReportForm.get('normal_ranges_display')?.setValue('')
    }
  }

  returnNormalRanges() {
    let refRange = ``

    this.normal_ranges.forEach((range: any) => {
      let gender = this.returnNRGenderName(range.gender) != 'Both' ? this.returnNRGenderName(range.gender)[0] : this.returnNRGenderName(range.gender)
      // this.returnNRGenderName(range.gender)
      let str = `${gender}: ${range.age_min}${this.returnNRAges(range.age_min_units)[0]} to ${range.age_max}${this.returnNRAges(range.age_max_units)[0]} : ${range.value_min}-${range.value_max}`;
      refRange += str + '\n'
    })

    refRange = refRange.trim();

    return refRange;
  }

  deleteNormalRange(normal_range: any, deleteNR: boolean = true) {

    this.selectedParam['normal_ranges_display'] = this.returnNormalRanges();

    this.subsink.sink = this.endPoint.updateFixedParameterOrdering(this.selectedParam).subscribe((data: any) => {

      if (deleteNR) {
        this.subsink.sink = this.endPoint.deleteNormalRanges(normal_range.id).subscribe((res: any) => {
          this.alertService.showSuccess("Deleted")
        })
      }


    }, (error) => {
      this.alertService.showError(error);
    })




  }

  setNR(param: any) {
    this.normal_ranges = param?.normal_ranges || [];
    this.newParamRef = false;
    this.selectedParam = param;
  }

  setFormula(param: any){
    this.newFormula = false;
    this.selectedParam = param;
  }




}
