import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { extend } from 'leaflet';
import { AnnoucementEndpoint } from '../announememnt.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { DoctorEndpoint } from 'src/app/doctor/endpoint/doctor.endpoint';
import { FileService } from '@sharedcommon/service/file.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss']
})
export class SmsComponent extends BaseComponent<any> {

  constructor(
    injector : Injector,
    private formBuilder: FormBuilder,
    private endPoint: AnnoucementEndpoint,
    private proEndpoint: ProEndpoint,
    private patientEndpoint: PatientEndpoint,
    public timeSrvc : TimeConversionService,
    private cookieSrvc : CookieStorageService,
    private staffEndpoint: StaffEndpoint,
    private doctorEndpoint: DoctorEndpoint,
    private fileSrvc: FileService
  ) { super(injector) }

  campaign : any ;
  sendTypes : any ;
  title : any = "";
  selected_Template: any ;
  selected_sendType: any;
  @Input() sms: boolean = true;
  dataSMS = [
    {label: 'Balance', count: '-'},
    {label: 'Used', count: '-'},
    {label: 'SMS Pack', count: '-' },
  ]
  count: number = 1;
  charac: number = 145;
  textareaValue:any = ''
  temp_name: any;
  temp_val: any ;

  override ngOnInit(): void {

    this.subsink.sink = this.proEndpoint.getSenderTypes().subscribe((res: any)=>{
      this.sendTypes = res;

      this.sendTypes.push({
        id: 5,
        name: 'Other',
        is_active: true
      })
    });
  
    this.getTemplates();
    this.getCount();
    this.initializeForm() ;

  }


  initializeForm(){
    this.baseForm = this.formBuilder.group({
      templateName: ['', Validators.required],
      templateContent: ['', Validators.required],
      templateId: [null],
      sender_id: [null],
      // "route": null,
      // "is_active": true,
      // "messaging_service_types": 5,
    })
  }

  getTemplates(){
    this.subsink.sink = this.endPoint.gettemplates(this.sms ? 1 : 2).subscribe((res: any)=>{
      this.campaign = res;
    })
  }


  getCount(){
    this.subsink.sink = this.endPoint.getStats(
      this.cookieSrvc.getCookieData().client_id, 
      this.sms ? 1 : 2).subscribe((res: any)=>{
      this.dataSMS[2].count = res.balance;
      this.dataSMS[1].count = res.total_messages_sent;
      this.dataSMS[0].count = res.remaining_messages;
    })
    
  }

  selectTemplate(e: any){

    this.selected_Template = e;
    this.textareaValue = e?.templateContent || "";

    

  }

  sendType(e: any) {
    this.selected_sendType = e;
    
    this.query = "";
    this.selectedItems = [];
    this.selectedItemsIds = [];
  
    // Using switch statement for cleaner logic
    switch (this.selected_sendType.id) {
      case 1:
        this.openXl(this.selectionModal, 'lg');
        break;
      case 3:
        this.check_sa = false;
        this.openXl(this.StaffSelectionModal, 'lg');
        break;
      case 2:
        this.openXl(this.doctorSelectionModal, 'lg');
        break;
      case 5:
        this.openXl(this.otherModal, 'lg');
        break;
      default:
        this.check_sa = true;
        this.openXl(this.StaffSelectionModal, 'lg');
        break;
    }
  }
  

  openModalss(){
    if(this.selected_sendType){
      this.sendType(this.selected_sendType);
    }else{
      this.alertService.showInfo("Select Send To Option.")
    }
  }

  openXl(content: any, sz:string = 'lg', cntrd:boolean = true, backDrop: string = 'light-blue-backdrop') {
    if(this.selected_sendType){

      if(this.selected_sendType && this.selected_sendType.id == 1){
        this.title = "Patients"
        this.getPatientsData();
        this.modalService.open(content, { size: sz, centered: cntrd, backdropClass: backDrop});
      }else if(this.selected_sendType && (this.selected_sendType.id == 3 || this.selected_sendType.id == 4)){
        this.title = "Staffs"
        this.modalService.open(content, { size: sz, scrollable: true , centered: cntrd, backdropClass: backDrop});
        this.pageLoading = true
        this.getStaffs();
      }else if(this.selected_sendType && this.selected_sendType.id == 2){
        this.title = "Doctors"
        this.modalService.open(content, { size: sz, scrollable: true , centered: cntrd, backdropClass: backDrop});
        this.pageLoading = true
        this.getDoctors();
      }else if(this.selected_sendType && this.selected_sendType.id == 5){
        this.title = "Other"
        this.modalService.open(content, { size: sz, scrollable: true , centered: cntrd, backdropClass: backDrop});
        // this.pageLoading = true
        // this.getDoctors();
      }
  }else{
      this.alertService.showInfo("Select Send To Type.")
    }

  }


  @ViewChild('StaffSelectionModal') StaffSelectionModal: any;
  staffs: any ;
  check_sa: boolean = false;

  getStaffs(){
    this.subsink.sink = this.staffEndpoint.getPaginatedStaff(
      "all", "1", this.query, true).subscribe((res: any)=>{
      this.staffs = res;
      this.pageLoading = false;

    }, (error)=>{
      this.alertService.showError("Failed to fetch employees", error)
    })
  }

  @ViewChild('doctorSelectionModal') doctorSelectionModal: any;
  doctors: any;
  doctorTypes: any = [
    { id: 1,name: "All" },
    { id: 2,name: "Consulting" },
    { id: 3,name: "Referral" },
  ];

  selectedDocType: any = 2;
  getDoctors(){

    if(!this.selectedDocType){
      return 
    }

    this.pageLoading = true;
    // this.selectedItemsIds = [];
    // this.selectedItems = [];

    if(this.selectedDocType == 2){
      this.subsink.sink = this.doctorEndpoint.getPaginatedConsultingDoctors(
        "all", 1, this.query, "", "", "", true
      ).subscribe((res: any)=>{
        this.pageLoading = false;
        this.doctors = res;
      })
    }else if (this.selectedDocType == 3){
      this.subsink.sink = this.doctorEndpoint.getPaginatedReferralDoctors(
        "all", 1, this.query, "", "", "", true, null
      ).subscribe((res: any)=>{
        this.pageLoading = false;
        this.doctors = res;
      })
    }else{
      this.subsink.sink = this.doctorEndpoint.getLabDoctors(
        this.query
      ).subscribe((res: any)=>{
        this.pageLoading = false;
        this.doctors = res;
      })
    }

  }

  date: any = this.timeSrvc.getTodaysDate();
  patients: any ;
  query: any = "";
  activeId: any ;
  pageLoading: any = false;
  selectedItems: any = [];
  selectedItemsIds: any = [];

  getPatientsData(){
    this.pageLoading = true;
    this.subsink.sink = this.patientEndpoint.getPaginatedPatients(
      'all', '1', '', '', '', this.date, '','', false, ''
    ).subscribe((res: any)=>{
      this.pageLoading = false
      this.patients = res;
    }, (error)=>{
      this.showAPIError(error);
    })
  }
  
  checkEmergency(e:any){
    return e.toLowerCase().includes("emergency") || e.toLowerCase().includes("urgent")
  }

  toggleAccordionnn(id: any): void {
    this.activeId = this.activeId === id ? null : id;
  }

  concatenateShortCodes(item:any) {
    let shortForm = ''
    if(item.lab_tests.length > 0){
      item.lab_tests.forEach((test:any)=>{
        shortForm += test.name + ', '
      })
    }

    if(item.lab_packages.length > 0){
      item.lab_packages.forEach((pkg:any)=>{
        pkg.lab_tests.forEach((test:any)=>{
          shortForm += test.name + ', '
        })
      })
    }

    return shortForm.slice(0, -2)
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

  selectPatient(e: any , patient: any){
    if(e){
      this.selectedItems.push(patient);
      this.selectedItemsIds.push(patient.id);
    }else{
      this.selectedItems = this.selectedItems.filter((ptn: any)=> ptn.id != patient.id);
      this.selectedItemsIds = this.selectedItemsIds.filter((ptn: any)=> ptn != patient.id);
    }
  }

  bulkPatients(e: any){
    if(e){
      this.selectedItems = [];
      this.selectedItemsIds = [];
      this.patients.forEach((ptn: any)=>{
        this.selectedItems.push(ptn);
        this.selectedItemsIds.push(ptn.id);
      })
    }else{
      this.selectedItems = [];
      this.selectedItemsIds = [];
    }
  }

  bulkStaffs(e: any){
    if(e){
      this.selectedItems = [];
      this.selectedItemsIds = [];
      this.staffs.forEach((ptn: any)=>{
        this.selectedItems.push(ptn);
        this.selectedItemsIds.push(ptn.id);
      })
    }else{
      this.selectedItems = [];
      this.selectedItemsIds = [];
    }
  }

  bulkDoctors(e: any){
    if(e){
      this.selectedItems = [];
      this.selectedItemsIds = [];
      this.doctors.forEach((ptn: any)=>{
        this.selectedItems.push(ptn);
        this.selectedItemsIds.push(ptn.id);
      })
    }else{
      this.selectedItems = [];
      this.selectedItemsIds = [];
    }
  }


  validatePatient(id: any){
    return this.selectedItemsIds.includes(id);
  }

  concenateNamesMob(items: any){
    let name: any = ""

    if(items){
      items.forEach((ptn: any)=>{
        if(ptn?.mobile_number?.toString()?.length == 10){
          if(ptn?.name) name += ptn?.name + " | " ;
          if(ptn?.mobile_number) name += ptn.mobile_number + "\n" ;
        }
      })
    }

    return name;
  }
  

  loading: boolean = false;
  @ViewChild('selectionModal') selectionModal: any;

  sendMessage(){

    if(this.selected_Template && this.selected_sendType && this.selectedItemsIds?.length != 0){
      const model : any = {
        recipient_type: this.selected_sendType.id,  
        recipient_ids: this.selectedItemsIds,
        template_id: this.selected_Template.id,
        client: this.cookieSrvc.getCookieData().client_id
      }
  
      this.loading = true;
      this.subsink.sink = this.endPoint.postMessage(model, this.sms ? 'bulk_sms' : 'bulk_whatsapp_messaging').subscribe((res: any)=>{
        this.alertService.showSuccess("Message Sent");

        this.selectedItems = null;
        this.selectedItemsIds = null;
        this.selected_Template = null;

        this.textareaValue = "";
        this.getCount();

        this.loading = false;
      },(error)=>{
        this.loading = false;
        this.alertService.showError("Failed to send Messages",error?.error?.error || error?.error?.Error || error )
      })
    }else{
      if(!this.selected_Template){
        this.alertService.showInfo("Select Campaign");
      }
      if(!this.selected_sendType){
        this.alertService.showInfo("Select Sender Type");
      }
      if(this.selectedItemsIds.length == 0){
        this.alertService.showInfo("Select Senders");
        this.openXl(this.selectionModal, 'lg')
      }
    }

  }


  sendOtherMessages(){
    if(this.selected_Template && this.selected_sendType && this.otherData && this.otherData?.length != 0){
      const model : any = {
        recipient_type: null,  
        recipients: this.otherData,
        template_id: this.selected_Template.id,
        client: this.cookieSrvc.getCookieData().client_id
      }
  
      this.loading = true;
      this.subsink.sink = this.endPoint.postMessage(model, 'bulk_campaign_for_recipients').subscribe((res: any)=>{
        this.alertService.showSuccess("Message Sent");

        this.selectedItems = null;
        this.selectedItemsIds = null;
        this.selected_Template = null;

        this.textareaValue = "";
        this.getCount();

        this.loading = false;
      },(error)=>{
        this.loading = false;
        this.alertService.showError("Failed to send Messages",error?.error?.error || error?.error?.Error || error )
      })
    }else{
      if(!this.selected_Template){
        this.alertService.showInfo("Select Campaign");
      }
      if(this.otherData.length == 0){
        this.alertService.showInfo("Select Senders");
        this.openXl(this.otherModal, 'lg');
      }
    }
  }

  saveTemplate(){

    if(this.baseForm.valid){
      const model: any = {
        templateName: this.baseForm.get('templateName')?.value,
        templateContent: this.baseForm.get('templateContent')?.value,
        templateId: this.baseForm.get('templateId')?.value,
        sender_id: this.baseForm.get('sender_id')?.value ,
        route: this.sms ? 'dlt' : null,
        messaging_service_types: this.sms ? 1 : 2,
        messaging_category: 5
      }
  
      this.subsink.sink = this.endPoint.postSaveTemplate(model).subscribe((res: any)=>{
        this.alertService.showSuccess("Template Saved", this.temp_name);
        this.temp_name = "";
        this.temp_val = "";
        this.getTemplates();
      }, (error)=>{
        this.alertService.showError(error)
      })
    }else{
      this.submitted = true ;
      // this.showBaseFormErrors()
      this.alertService.showInfo("Name and Content May Not Be Blank.");
    }

  }
  
  @ViewChild('otherModal') otherModal: any ;
  otherData: any ;
  fileName: any = '';

  jsondATA = [  ]
  
  keys: any = [] ;

  onFileChanged(event: any){
    const file = event.target.files[0];

    if (file) {
      this.fileSrvc.excelToJson(file).then((data: string) => {
        this.fileName = file.name ;
        this.validateJsonData(data) ;
        this.otherData = data ;

        this.keys = this.getAllKeysFromJson(data) ;
      });
    }
  }

  validateJsonData(jsonData: any): boolean {
    // Check if jsonData is an array
    if (!Array.isArray(jsonData)) {
      console.error('The provided data is not an array.');
      return false;
    }
  
    // Validate each entry in the array
    for (let index = 0; index < jsonData.length; index++) {
      const entry = jsonData[index];
  
      // Check if 'mobile_number' is present
      if (!entry.hasOwnProperty('mobile_number')) {
        this.alertService.showError(`Validation failed at row ${index + 1}: "mobile_number" is missing.`) ;
        // return false; // Stop on first failure
      }
  
      // Validate that 'mobile_number' is a number and is exactly 10 digits long
      const mobileNumber = entry.mobile_number;
      if (typeof mobileNumber !== 'number' || mobileNumber.toString().length !== 10) {
        this.alertService.showError(`Validation failed at row ${index + 1}: "mobile_number" should be a 10-digit number. Found: ${mobileNumber}`)
        // return false; // Stop on first failure
      }
    }
  
    // If all validations pass, return true
    return true;
  }

  // Utility function to get all key-value pairs from an object
  objectEntries(obj: any): [string, any][] {
    return Object.entries(obj); // Return key-value pairs
  }
    
  getAllKeysFromJson(jsonData: any): string[] {
    const allKeys = new Set<string>();
  
    jsonData.forEach((item: any) => {
      Object.keys(item).forEach((key) => {
        allKeys.add(key); // Add each key to a Set to ensure uniqueness
      });
    });
  
    return Array.from(allKeys); // Convert Set to Array
  }
  
  writeMobNum(e: any, item: any){
    item.mobile_number = e
  }


  nameTag: any = 'name' ;
  

  writeTag(e: any){
    this.nameTag = e ;
  }

}
