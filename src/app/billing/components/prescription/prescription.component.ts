import { Component, Injector } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { PrintService } from '@sharedcommon/service/print.service';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { AddPatientEndpoint } from 'src/app/patient/endpoints/addpatient.endpoint';
import { PatientEndpoint } from 'src/app/patient/endpoints/patient.endpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { PharmacyEndpoint } from 'src/app/setup_hims/components/services-hims/pharmacy.endpoint';

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styles: `
  .ng-autocomplete {
    width:100%;
  }

  :host ::ng-deep .suggestions-container {
    position: fixed;
    max-width: 400px;
    overflow: visible;
  }

  :host ::ng-deep .autocomplete-container .not-found {
    padding: 0 .75em;
    border: solid 1px #f1f1f1;
    background: white;
    position: fixed;
  }

  `
})

export class PrescriptionComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private cookieSrvc: CookieStorageService,
    private timeSrvc: TimeConversionService,
    private printSrvc: PrintService,
    private endPoint: PatientEndpoint,
    private proEndpoint: ProEndpoint,
    private addpatientEndpoint: AddPatientEndpoint,
    private pharmacyEndpoint: PharmacyEndpoint
  ){ super(injector) }

  // pre datas variables 
  aliments: any ;
  foodInTakes: any = [];
  dayTimePeriods: any = [] ;

  timer: any ;
  testTerm: any = "";
  searchData: any = [] ;

  searchLoading: boolean = false ;
  testLoading: boolean = false; 
  medicines: any = [] ;
  selectedMedicines : any = [] ;

  override ngOnInit(): void {

    this.baseForm = this.formBuilder.group({
      bp: [null],
      height: [null],
      spo2: [null],

      pulse: [null],
      weight: [null],
      temperature: [null],

      ailments: [],

      remarks: [null],

      tests: [[]],

      follow_up_days: [null],
      follow_up_date: [null]

    });

    this.submitted = true;

    this.getAliments();
    this.getDayTimePeriods();
    this.getFoodInTakes();


  }


  getModel(){

    const model : any = {
      remarks: this.baseForm.get('remarks')?.value || null,
      follow_up_days : this.baseForm.get('follow_up_days')?.value || null,
      follow_up_date: this.baseForm.get('follow_up_date')?.value || null,
      ailments: [],
      vitals: {
        bp:  this.baseForm.get('bp')?.value || null,
        height:  this.baseForm.get('height')?.value || null,
        weight:  this.baseForm.get('weight')?.value || null,
        pulse:  this.baseForm.get('pulse')?.value || null,
        spo2:  this.baseForm.get('spo2')?.value || null,
        temperature:  this.baseForm.get('temperature')?.value || null,
      },
      investigations: {
        tests: [],
        packages: [],
      },
      medicines: []
    }

    if(this.selectedMedicines && this.selectedMedicines.length > 0){
      this.selectedMedicines.forEach((med: any)=>{

        const medModel = {
          medicine: med.medicine?.id,
          in_take_time: med?.in_take_time && med.in_take_time.length > 0 ? med.in_take_time.map((item: any) => item.id) : [],
          when_to_take: med?.when_to_take && med.when_to_take.length > 0 ? med.when_to_take.map((item: any) => item.id) : [],
          quantity: med?.quantity,
          duration: med?.duration
        };

        model.medicines.push(medModel) ;

      })
    }
    
    const lab_tests = this.baseForm.get('tests')?.value ;
    if(lab_tests && lab_tests.length > 0) {
      lab_tests.forEach((t: any)=> model.investigations.tests.push(t.id))
    }

    const ailments = this.baseForm.get('ailments')?.value ;
    if(ailments && ailments.length > 0) {
      ailments.forEach((t: any)=> model.ailments.push(t.id))
    }

    return model ;
  }

  override saveApiCall(): void {

    const model = this.getModel() ;
    this.subsink.sink = this.endPoint.postData(model).subscribe((res: any)=>{
      this.alertService.showSuccess("Saved.");
      if(res?.html_content){
        this.printSrvc.printer(res?.html_content, false, false, 300)
      }
    }, (error)=>{
      this.showAPIError(error);
    })
  }


  // get pre datas 

  getAliments(){
    this.subsink.sink = this.proEndpoint.getAliments().subscribe((res: any)=>{
      this.aliments = res ; 
    })
  }

  getFoodInTakes(){
    this.subsink.sink = this.proEndpoint.getFoodInTakes().subscribe((res: any)=>{
      this.foodInTakes = res ; 

    })
  }

  getDayTimePeriods(){
    this.subsink.sink = this.proEndpoint.getDayTimePeriods().subscribe((res: any)=>{
      this.dayTimePeriods = res ; 
    })
  }

  getSearches(searchTerm: any){
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.searchLoading = true ;
      this.subsink.sink = this.pharmacyEndpoint.getMedicines('all', 1, searchTerm, '', '').subscribe((res: any)=>{
        res.map((med: any)=> med['showName'] = `${med.name}${med?.composition ? ' - ' + med?.composition : ''}` ) ;
        this.medicines = res;
        this.searchLoading = false ;
      }, (error)=>{
        this.searchLoading = false ;
      })
      
    }, 500); // Adjust the delay as needed
  }


  getTestSearches(searchTerm: string): void {
    // Trim leading spaces from the searchTerm
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }

    if (searchTerm) {
      this.testTerm = searchTerm;
      this.testLoading = true;
      clearTimeout(this.timer);

      this.searchData = []; // Initialize an empty array
      this.timer = setTimeout(() => {

        this.subsink.sink = this.addpatientEndpoint.getTestsSearchResults(searchTerm).subscribe((testData: any) => {
          this.testLoading = false;
          this.searchData = [...testData.filter((test: any)=> test.is_active )];
        });

      }, 500);

    } else {
      // Reset relevant variables if searchTerm is empty
      this.testTerm = null;
      this.searchData = [];
      this.testLoading = false;
    }
  }

  // utilities
  inputSelected(item: any, autoComplete: any){
    const model = {
      medicine: item,
      in_take_time: [],
      when_to_take: [],
      quantity: null,
      duration: null
    }

    this.selectedMedicines.push(model);
    autoComplete.clear();
  }

  deleteStock(item: any, index: number){
    this.selectedMedicines.splice(index, 1);
  }


  checkFoodInTake(item: any, foodValue: any){
    return item.find((i: any) => i?.id == foodValue?.id )
  }
 
  setMedData(item: any, type: any, event: any){
    item[type] = event;
  }

  setDate(days: any){
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      function getDateAfterDays(days: any) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + days);
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1; // Months are 0-indexed, so add 1
        const year = currentDate.getFullYear();
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
      }
      
      this.baseForm.get('follow_up_date')?.setValue(days ? getDateAfterDays(parseInt(days)) : null )
      
    }, 500);
  }


  setDays(date: any){
    function calculateDaysDifference(targetDate: any) {
      const currentDate = new Date();
      const target = new Date(targetDate);
      const differenceInTime = target.getTime() - currentDate.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);
      return Math.round(differenceInDays); // Round to the nearest integer
    }
    
    this.baseForm.get('follow_up_days')?.setValue(date ? calculateDaysDifference(date) : null);
  }
  
}
