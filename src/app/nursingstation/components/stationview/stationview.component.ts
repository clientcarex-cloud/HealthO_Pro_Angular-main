import { Component, Injector, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { FileService } from '@sharedcommon/service/file.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { AutocompleteComponent } from 'angular-ng-autocomplete';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { HospitalEndpoint } from 'src/app/doctor/endpoint/hospital.endpoint';
import { LabTechnicianEndpoint } from 'src/app/labtechnician/endpoints/labtechnician.endpoint';
import { AddPatientEndpoint } from 'src/app/patient/endpoints/addpatient.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { SharedPatientsService } from 'src/app/patient/services/sharedpatient.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { HIMSSetupEndpoint } from 'src/app/setup_hims/components/services-hims/hmis.endpoint';
import { PharmacyEndpoint } from 'src/app/setup_hims/components/services-hims/pharmacy.endpoint';

@Component({
  selector: 'app-stationview',
  templateUrl: './stationview.component.html',
})

export class StationviewComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private cookieSrvc: CookieStorageService,
    private fileSrvc: FileService,
    public timeSrvc: TimeConversionService,
    private sharedPatient: SharedPatientsService,
    private spinner: NgxSpinnerService,
    private proEndpoint: ProEndpoint,
    private pharmacyEndpoint: PharmacyEndpoint,
    private addpatientEndpoint: AddPatientEndpoint,
    private hospitalEndpoint: HospitalEndpoint,
    private masterEndpoint: MasterEndpoint,
    private himsEndpoint: HIMSSetupEndpoint,
    private labTechnicianEndpoint: LabTechnicianEndpoint,
  ){ super(injector); }

  @ViewChild('auto_complete') auto_complete!: AutocompleteComponent ;

  ptn: any ;
  genders: any = [] ;
  activeTab: any = 1 ; // Section Navs

  selectedDepartment: any ;
  departments: any ;
  all_status: any = [];
  
  admitted_date: any = null; //new admitted date for patient

  selectedRoom: any ; //new room allocation for patient
  patientRooms: any ; // Added Rooms of patient

  selectedService: any ; // new service for patient
  patientServices: any ; // Added Services of Patient

  selectedMedicine: any ; 
  patientMedicines: any = [] ; // addded medicines of patient

  selectedTest: any ;
  patientTests: any ; // added tests of patient

  patientVitals: any ; // added vitals of patient

  timer: any ;
  searchLoading: boolean = false ;
  searchData: any = [] ; 

  override ngOnInit(): void {

    this.setAdmittedTime();

    this.subsink.sink = this.proEndpoint.getGender().subscribe((data: any) => {
      this.genders = data.results;

      this.route.queryParams.subscribe(params => {
        const ptnId = +params['patient_id'];
        this.getPatientData(ptnId);
  
        this.getDepartments();
      });

    });



    this.subsink.sink = this.proEndpoint.getLabTestStatus().subscribe((data: any) => {
      this.all_status = data.filter((d: any) => d.is_active);
    });

    this.initializeVitals();
  }

  initializeVitals(){
    this.baseForm = this.formBuilder.group({
      bp1: [null],
      bp2: [null],
      height: [null],
      spo2: [null],
      pulse: [null],
      weight: [null],
      temperature: [null],
      grbs: [null],
      ailments: [],
      remarks: [null],
      tests: [[]],
      follow_up_days: [null],
      follow_up_date: [null]
    });
  }

  getPatientData(ptnID: any){
    this.spinner.show();
    this.subsink.sink = this.addpatientEndpoint.getPatientDetails(ptnID).subscribe((data: any) => {
      this.ptn = data.results[0];
      try{
        this.ptn.gender = this.genders.find((gender: any)=> gender.id == this.ptn.gender)?.name ;
      }catch(error){
        
      }

      this.setData();

    })
  }
  

  setData(){

    this.setAdmittedTime();
    this.patientRooms = [] ;
    if (this.ptn && this.ptn?.booked_rooms?.rooms) {
      this.ptn?.booked_rooms?.rooms.forEach((item: any) => {
        this.setPatientRooms(item) ;
      });
    }

    this.patientServices = [] ;
    if (this.ptn && this.ptn?.services?.services) {
      this.ptn?.services?.services.forEach((item: any) => {
        this.setPatientService(item) ;
      });
    }

    this.patientMedicines = [] ;
    if(this.ptn && this.ptn?.medicines){
      this.ptn?.medicines?.medicines.forEach((med: any)=>{
        med.stock['added_on'] = med.added_on ;
        med.stock['is_strips'] = med.is_strip;
        med.stock['userQuantity'] = med.quantity ;
        med.stock['showName'] = `${med.stock.item?.name}${med.stock?.item?.composition ? ' - ' + med.stock?.item?.composition : ''}`;
        this.onMedicineItemSelected(med.stock, true);
      })
    }

    this.patientTests = [] ;
    if (this.ptn && this.ptn.lab_tests.lab_tests) {
      this.ptn.lab_tests.lab_tests.forEach((test: any) => {
        this.updateLabTest(test);
      });
    }

    this.patientVitals = [] ;
    if (this.ptn && this.ptn?.vitals) {
      this.ptn?.vitals.map((vital: any)=> vital.added_on = this.timeSrvc.decodeTimestamp(vital.added_on)) ;
      this.patientVitals = this.ptn.vitals;
    }

  }

  getPatientModel(){
    
    const model: any = {
      id: this.ptn?.id,
      name: this.ptn?.name,
      mobile_number: this.ptn?.mobile_number,
      age: this.ptn?.age,
    }

    if(this.selectedRoom && this.activeTab == 1){
      const room = this.selectedRoom ;
      if(room.canRemove) 
        model["room_booking"] = { GlobalRoomId: room.room?.id,  no_of_days: 1, 
                                    bed_number : room.room?.selectedBed?.id, admitted_date: this.getAdmittedDate() }
    }

    if(this.selectedService && this.activeTab == 2){
      model['services'] = [{ service : this.selectedService.id, status_id: 3, added_on: this.getAdmittedDate() }] ; 
    }

    if(this.selectedMedicine && this.activeTab == 3){
      model['medicine'] = [{
          stock: this.selectedMedicine.stock?.id,
          quantity: this.selectedMedicine.quantity,
          is_strip: this.selectedMedicine.is_strips
        }]
    }


    if(this.selectedTest && this.activeTab == 4){
      model['lab_tests'] = [{
        LabGlobalTestId: this.selectedTest.id,
        status_id: this.selectedTest?.patientStatus,
        added_on: this.getAdmittedDate()
      }]
    }

    if(this.baseForm.valid && this.activeTab == 5){
      model['vitals'] = {
        bp1:  this.baseForm.get('bp1')?.value || null,
        bp2:  this.baseForm.get('bp2')?.value || null,
        grbs:  this.baseForm.get('grbs')?.value || null,
        weight:  this.baseForm.get('weight')?.value || null,
        pulse:  this.baseForm.get('pulse')?.value || null,
        spo2:  this.baseForm.get('spo2')?.value || null,
        temperature:  this.baseForm.get('temperature')?.value || null,
        height: null,
        added_on: this.getAdmittedDate()
      };
    }

    return model ;

  }

  updatePatient(){
    const model = this.getPatientModel() ;

    this.subsink.sink = this.addpatientEndpoint.updatePatient(model, this.ptn?.id).subscribe((res: any)=>{
      this.alertService.showSuccess(`${this.ptn?.name}`, "Saved.");
      this.resetData();
      this.getPatientData(this.ptn?.id);

      this.applyFocus();
    }, (error)=>{ this.showAPIError(error) })

  }

  updatePatientRoom(model: any){
    this.subsink.sink = this.hospitalEndpoint.updatePatientRoomBooking(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Saved.", `${this.ptn.name} - ${model.name} Room/Ward Details Updated.`) ;
      this.getPatientData(this.ptn.id);
    }, (error)=>{
      this.showAPIError(error) ;
    })
  }


  

  // *********
  // UTILITIES
  // *********

  resetData(){
    this.selectedRoom = null ;
    this.setAdmittedTime();

    this.selectedService = null ;
    this.selectedMedicine = null ;
    this.selectedTest = null ;
  }

  applyFocus(){
    this.searchData = [] ;
    this.selectedDepartment = null;

    if(this.activeTab == 2 || this.activeTab == 3 || this.activeTab == 4) {
      setTimeout(()=>{
        this.auto_complete?.focus() ;
      }, 100)
    }else if(this.activeTab == 5){
      this.baseForm.reset() ;
      this.sharedPatient.setInputElementFocus('bloodPressure') ;
    }
  }

  getAdmittedDate(){

    if(!this.admitted_date) this.setAdmittedTime()
    return this.admitted_date?.replaceAll(", ", "T") + ":00" || this.timeSrvc.djangoFormatWithT() ;
  }
  
  navigateBack() {
    window.history.back()
  }

  removeDigitsAfterPlus(inputString: string): string {
    return this.sharedPatient.removeDigitsAfterPlus(inputString) ;
  }

  selectDepartment(event: any){
    this.selectedDepartment = event || null ;

    if(this.selectedDepartment){
      if(this.activeTab == 4) this.getSearches("", true);
      else if(this.activeTab == 2) this.getHospitalServices("", true);
      // this.auto_complete?.focus();
    }
  }

  getStatuses(e: any): any {
    return this.sharedPatient.getStatuses(e, this.all_status);
  }


  //*********
  // ROOMS
  // ********

  setAdmittedTime(){
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    this.admitted_date = `${year}-${month}-${day}, ${hours}:${minutes}`;
  }

  admitDate(event: any ){
    this.admitted_date = event || null ;
  }

  roomSelected(event: any) {

    const model = {
      room: event,
      added_on: this.timeSrvc.djangoFormatWithT(),
      canRemove: true,
      no_of_hours: "",
      type: 1,
    }

    this.selectedRoom = model;
    this.modalService.dismissAll();
  } 

  setPatientRooms(item: any){

    if(item.vacated_date) item.vacated_date = this.timeSrvc.decodeTimestamp(item.vacated_date);
    
    const model = {
      room: item,
      added_on : this.timeSrvc.decodeTimestamp(item.added_on),
      admitted_date: this.timeSrvc.decodeTimestamp(item.admitted_date),
      minimumDate: new Date(item.added_on),
      canRemove: false,
      no_of_hours : "",
      type: 1  
    }

    this.patientRooms.push(model);

  }

  vacateDate(room: any){
    const model = {
      id: room.id,
      name : room.name,
      vacated_date: room?.patientVacateDate
    }
   
    this.updatePatientRoom(model);
  }

  setVacateDate(room: any, event: any){
    room['patientVacateDate'] = event || null ;
  }


  //*********
  // SERVICES
  // ********


  setPatientService(item: any){
    const model = this.sharedPatient.updateServiceModel(item);
    this.patientServices.push(model);
  }

  onServiceItemSelected(item: any){
    this.selectedService = item ;
    this.selectedService.name = this.removeDigitsAfterPlus(item.name) ;
    this.searchData = [];
  }


  getHospitalServices(searchTerm: any, byPass: boolean = false) {
    while (searchTerm.startsWith(" "))  searchTerm = searchTerm.substring(1)
    
    if ((searchTerm && searchTerm.length >= 2) || byPass) {
      this.searchLoading = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.subsink.sink = this.himsEndpoint.getServices(
          "all", 1, searchTerm, this.selectedDepartment?.id || ""
        ).subscribe((res: any) => {
          this.searchLoading = false;
          this.searchData = [...res.map((item: any) => ({...item, name: item.name + '//++' + item.short_code })) ]
        })
        if(byPass) this.autoCompleteFocusOpen();
      }, 1000);
    }
  }



  //*********
  // MEDICINES
  // ********

  onMedicineItemSelected(item: any, updateBool: boolean, inputElement: any = null): void {

    if(updateBool){
      const model: any = this.sharedPatient.updateMedicineModel(item, updateBool);
      this.patientMedicines.push(model);
    }else{

      if(item.available_quantity < 1 ){
        this.alertService.showInfo(`${item.showName}`, 'Out of Stock');
        return ;
      }
  
      if(item?.expiry_date && this.timeSrvc.hasCrossedSpecifiedDateTime(item.expiry_date)){
        this.alertService.showWarning(`${item.showName}`, "Expired!");
        return ;
      }

      this.selectedMedicine = this.sharedPatient.updateMedicineModel(item, false); 
      this.searchData= [] ;

      this.sharedPatient.setInputElementFocus('quantityInput') ;

    }

  }


  getMedSearches(searchTerm: string): void {
    while (searchTerm.startsWith(" "))  searchTerm = searchTerm.substring(1)
    this.searchData = []; 
    if (searchTerm && searchTerm.length >= 2) {
      this.searchLoading = true;
      clearTimeout(this.timer);

      this.timer = setTimeout(() => {
        this.subsink.sink = this.pharmacyEndpoint.getPatientStocks(searchTerm)?.subscribe((res: any)=>{
          res.map((med: any)=> med['showName'] = `${med.item?.name}${med?.item?.composition ? ' - ' + med?.item?.composition : ''}` ) ;
          this.searchData = res;
          this.searchLoading = false;
        })

      }, 500);

    }
  }

  writeIsStrips(event: any){
    this.selectedMedicine['is_strips'] = event.target.value == "true" ;
  }

  writeQuantity(event: any){
    this.selectedMedicine['quantity'] = event ;
  }

  

  //*********
  // TESTS
  // ********

  updateLabTest(item: any) {

    const tempTest = {
      id: item.id,
      name: item.name,
      added_on: this.timeSrvc.decodeTimestamp(item.added_on),
      canRemove: false,
      package: false,
      status: item.status_id,
      department: item.department ? item.department : "",
      sourcing_lab: item?.sourcing_lab || null,
      action: item.status_id.toLowerCase().includes('complete') || item.status_id.toLowerCase().includes('Authorization')
    }

    this.patientTests.push(tempTest);
  }

  // UpdateLabPackage(item: any) {

  //   const tempTest = {
  //     id: item.id,
  //     name: item.name,
  //     added_on: this.timeSrvc.decodeTimestamp(item.added_on),
  //     canRemove: false,
  //     package: true,
  //     status: "",
  //     package_tests: item.lab_tests,
  //     package_id: item.id,
  //   };

  //   this.patientTests.push(tempTest);
  // }


  //*********
  // PRE DATA
  // ********


  onItemSelected(item: any){
    this.selectedTest = item ;
    this.selectedTest['patientStatus'] = 2 ;
    this.selectedTest.name = this.removeDigitsAfterPlus(item.name);
    this.searchData = [] ;
  }


  changeStatus(test: any, e: any) {
    const status_code = parseInt(e.target.value);

    const model = {
      patient: this.ptn.id,
      status_id: status_code,
      id: test.id
    }

    this.subsink.sink = this.addpatientEndpoint.cancelTest(model).subscribe((response: any) => {
      this.alertService.showSuccess(`${test.name}, status changed.`);
      this.getPatientData(this.ptn.id);
    }, (error) => {
      this.alertService.showError("Oops", "Error in Updating the Status")
    })
  }


  getSearches(searchTerm: string, byPass: boolean = false): void {
    this.searchData = []; 
    while (searchTerm.startsWith(" ")) searchTerm = searchTerm.substring(1);
    if ((searchTerm && searchTerm.length >= 2) || byPass) {
      this.searchLoading = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.subsink.sink = this.masterEndpoint.getPaginatedGlobalTests(
          "all", 1, searchTerm, this.selectedDepartment?.id || ""
        ).subscribe((res: any)=>{
            this.searchLoading = false;
            this.searchData = [ ...res.map((labTest: any) => ({ ...labTest, name: labTest.name + '//++' + labTest.short_code })) ]
            if(byPass) this.autoCompleteFocusOpen();
          })

      }, 1000);

    } else {
      this.searchData = [];
      this.searchLoading = false;
    }
  }

  patientTestStatus(event: any){
    this.selectedTest.patientStatus = parseInt(event.target.value) ;
  }

  
  getDepartments(){
    this.subsink.sink = this.masterEndpoint.getDepartments().subscribe((data: any) => {
      this.departments = data.filter((d: any) => d.is_active);
    })
  }

  printReport(test: any){

    test['isLoading'] = true ;
    const cookieData = this.cookieSrvc.getCookieData();

    const model = {
      test_id: test.id,
      client_id: cookieData.client_id, printed_by: cookieData.lab_staff_id,
      pdf: true, lh: true
    }

    this.subsink.sink = this.labTechnicianEndpoint.printReport(model).subscribe((res: any)=>{
      this.fileSrvc.openPdfInNewWindow(res?.link_pdf, "Test");
      test['isLoading'] = false ;
    }, (error)=> {
      test['isLoading'] = false ;
      this.showAPIError(error) 
    })


  }

  autoCompleteFocusOpen(){
    this.auto_complete.focus();
    setTimeout(()=>{
      this.auto_complete.open();
    }, 100)
  }

}
