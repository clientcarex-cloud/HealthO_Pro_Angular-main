import { Component, Injector, Input, Output, ViewChildren, EventEmitter, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { LoyaltyCardEndpoint } from '../../loyaltycard.enpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { LoyaltycardComponent } from '../loyaltycard/loyaltycard.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private formBuilder: UntypedFormBuilder,
    private cookieSrvc: CookieStorageService,
    private masterEndpoint: MasterEndpoint,
    private endPoint: LoyaltyCardEndpoint,
    private proEndpoint: ProEndpoint,
    public timeSrvc: TimeConversionService
  ) {
    super(injector);
  }

  @Output() updated: EventEmitter<any> = new EventEmitter<any>();
  @Output() saved: EventEmitter<any> = new EventEmitter<any>();
  
  @Input() updateForm: boolean = false;
  @Input() cardData: any = null;

  //boolean
  showDepartments: boolean = false;

  //forms 
  cardHolderForm!: UntypedFormGroup;

  // strings
  title: any = "";

  bulkValue: any = 0;

  // objects
  consultaionType: any = [];
  ambulanceType: any = [];
  departments: any = [];
  cardForTypes: any = [];
  validityType: any = [];

  cardPaymentTypes: any = [] ;
  banefitsTypes: any = [
    { id: 1, name: 'Card' }, 
    { id: 2, name: 'Department' },
    { id: 3, name: 'Tests' }
  ] ;

  deptTestData: any = [
    {
      id: null, 
      discount: null,
      is_discount_percentage: true
    }
   ];


  globalTests: any ; 

  override ngOnInit(): void {

    this.initialisebaseForm();

    if (this.updateForm) {
      this.setCardData();

      this.subsink.sink = this.masterEndpoint.getDepartments().subscribe((res: any) => {
        this.departments = [] ;

        this.departments = res.filter((r: any)=> r.is_active);
        
      })
    } else {
      this.subsink.sink = this.masterEndpoint.getDepartments().subscribe((res: any) => {
        let array: any = [];
        res.forEach((dept: any) => {
          if (dept.is_active) {
            dept['price'] = "0.00";
            dept['frequency'] = "";
            array.push(dept);
          }
        })
        this.departments = array;
      }, (error) => {
        this.alertService.showError(error)
      })
    }

    this.cardHolderForm = this.formBuilder.group({
      name: [null, Validators.required]
    })

  }

  override ngAfterViewInit(): void {
    this.getCardHolders();
    this.preValues();    
  }

  preValues(){
    this.subsink.sink = this.proEndpoint.getValidityTypes().subscribe((res: any)=>{
      this.validityType = res;
    })

    this.subsink.sink = this.proEndpoint.getPrivilegeCardPaymentTypes().subscribe((res: any)=>{
      this.cardPaymentTypes = res;
      if(this.updateForm){
        this.baseForm.get('plan_period_type')?.setValue(res.find((r: any)=> r.id == this.cardData.plan_period_type));
      }else{
        this.baseForm.get('plan_period_type')?.setValue(res[0]);
      }
    });


    if(!this.cardData){
      this.baseForm.get('discount_on')?.setValue(this.banefitsTypes[0]);
    }
  }

  getCardHolders(){
    this.subsink.sink = this.endPoint.getPrevilageCardFor().subscribe((res: any) => {
      this.cardForTypes = res;
      if(!this.updateForm){
        this.baseForm.get('card_for')?.setValue(res[0])
      }
    });
  }

  initialisebaseForm() {
    this.baseForm = this.formBuilder.group({
      name: [null, Validators.required],
      card_for: [null, Validators.required],
      no_of_members: [1],

      plan_period_type: [null, Validators.required],
      duration: [null, Validators.required],
      duration_type: [2, Validators.required],

      card_cost: [null, Validators.required],

      free_usages: [0], //eligible free
      free_usages_check: [false],

      discount_usages: [0], //eligible discount
      discount_usages_check: [false],

      discount_on: [null, Validators.required], // based on card, department and test
      discount: [0], // discount only if discount on is 1 i.e card

      bulkEnter: [null],


    });
  }

  timer: any ; 
  searchData: any = [];
  searchLoading: boolean = false ;
  tests_included: any = [] ;
  getSearches(searchTerm: string): void {
    // Trim leading spaces from the searchTerm
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm) {
      this.searchLoading = true;
      clearTimeout(this.timer);
      this.searchData = []; 
      this.timer = setTimeout(() => {

        this.subsink.sink = this.masterEndpoint.getPaginatedGlobalTests(
          'all', 1, searchTerm, ''
        ).subscribe((testData: any) => {
          this.searchLoading = false;
          this.searchData = [ ...testData.filter((labTest: any) => !this.tests_included.includes(labTest.id))]
        });
      }, 500);
    } else {
      // Reset relevant variables if searchTerm is empty
      this.searchData = [];
      this.searchLoading = false;
    }
  }
  

  setCardData() {
    this.baseForm.patchValue({
      name: this.cardData.name,
      card_for: this.cardData.card_for,
      no_of_members: this.cardData.no_of_members,

      duration: this.cardData.duration,
      duration_type: this.cardData.duration_type.id,
      
      card_cost: this.cardData.card_cost,
      
      free_usages: this.cardData.benefits[0]?.free_usages,
      discount_usages: this.cardData.benefits[0]?.discount_usages,

      discount: this.cardData.benefits[0]?.discount || 0,

    });

    // this.setCardFor(this.cardData.card_for);
    if(this.cardData.card_for.name == 'Individual'){
      this.baseForm.get('no_of_members')?.setValue(1);
      this.baseForm.get('no_of_members')?.disable();
    }else{
      this.baseForm.get('no_of_members')?.setValue(this.cardData.no_of_members);
      this.baseForm.get('no_of_members')?.enable();
    }

    this.setDeptOrTestsData();
    this.updateDurationValidation() ;

    this.setEligibleValue(this.cardData.benefits[0]?.free_usages ? false : true, false, 'free_usages', );
    this.setEligibleValue(this.cardData.benefits[0]?.discount_usages ? false : true, false, 'discount_usages');

    if(this.cardData.benefits[0]?.free_usages == null){
      this.baseForm.get('free_usages_check')?.setValue(true) ;
    }

    if(this.cardData.benefits[0]?.discount_usages == null){
      this.baseForm.get('discount_usages_check')?.setValue(true) ;
    }
  }

  setDeptOrTestsData(){
    if(this.cardData.test_wise_benefits.length >= 1){

      if(this.cardData.test_wise_benefits.length >= 1){
        this.baseForm.get('discount_on')?.setValue(this.banefitsTypes[2]);

        this.deptTestData = [];
        this.cardData.test_wise_benefits.forEach((testData: any)=>{
          const model = {
            id: testData.test, 
            discount: parseFloat(testData.discount),
            is_discount_percentage: true
          }
  
          this.deptTestData.push(model);
        })
      }

    }else if(this.cardData.department_wise_benefits.length >= 1){
      this.baseForm.get('discount_on')?.setValue(this.banefitsTypes[1]);

      if(this.cardData.department_wise_benefits.length >= 1){
        this.deptTestData = [];
        this.cardData.department_wise_benefits.forEach((testData: any)=>{
          const model = {
            id: testData.department, 
            discount: parseFloat(testData.discount),
            is_discount_percentage: true
          }
  
          this.deptTestData.push(model);
        })
      }

    }else{
      this.baseForm.get('discount_on')?.setValue(this.banefitsTypes[0]);
    }
  }

  openXl(content: any, sz: string = 'lg', cntrd: boolean = true, title: string) {
    this.title = title;
    this.modalService.open(content, { size: sz, centered: cntrd, scrollable: false, keyboard: true });
  }


  getDeptOrTests(){
    let data: any = [] ;

    this.deptTestData?.forEach((item: any)=>{
      if(item?.id && item?.discount && item?.discount != 0){
        const model = {
          id: item?.id?.id,
          discount : item?.discount,
          is_discount_percentage : true
        }
        data.push(model);
      }
    })

    return data ;
  }


  checkValue(val: any){
    if(val == undefined){
      return null ;
    }else if(val == ''){
      return 0 ;
    }else{
      return val
    }
  }

  public getCardModel(): any {
    const model: any = {
      name: this.baseForm.value?.name,
      card_for: this.baseForm.value?.card_for?.id,
      no_of_members: this.baseForm.value?.no_of_members || null,

      plan_period_type: this.baseForm?.value?.plan_period_type?.id || null,
      duration: this.baseForm.value?.duration,
      duration_type: this.baseForm.value?.duration_type,

      card_cost: this.baseForm.value?.card_cost,

      benefits: [{
        benefit: 1,
        free_usages: this.checkValue(this.baseForm.value?.free_usages),
        discount_usages: this.checkValue(this.baseForm.value?.discount_usages),
      }],

      lab_tests_data : [],
      departments_data: [],

    };

    if(this.baseForm.value?.discount_on?.id == 1){
      model.benefits[0]['discount'] = this.baseForm.value?.discount ;
      model.benefits[0]['is_discount_percentage'] = true ;

      delete model.departments_data;
      delete model.lab_tests_data ;

    }else if(this.baseForm.value?.discount_on?.id == 3){

      delete model.departments_data;
      model['lab_tests_data'] = this.getDeptOrTests() ; 
    
    }else if(this.baseForm.value?.discount_on?.id == 2){

      delete model.lab_tests_data ;
      model['departments_data'] = this.getDeptOrTests() ; 
    
    }

    return model;
  }

  saveCard() {

    if (this.baseForm.valid) {

      const model = this.getCardModel();

      if (!this.updateForm) {

        model['created_by'] = this.cookieSrvc.getCookieData().lab_staff_id;
        model['last_updated_by'] = this.cookieSrvc.getCookieData().lab_staff_id;

        this.saved.emit(model);

      } else {
      
        model['created_by'] = this.cardData?.created_by?.id;
        model['last_updated_by'] = this.cookieSrvc.getCookieData().lab_staff_id;
        model['id'] = this.cardData.id ;

        this.updated.emit(model);
  
        }

    } else {
      this.submitted = true; // Mark form as submitted
      this.showBaseFormErrors();
    }
  }



  resetbaseForm() {
    this.baseForm.reset();
    this.initialisebaseForm();
    this.submitted = false;
  }


  saveCardHolder(content: any){
    if(this.cardHolderForm.valid){
      this.subsink.sink = this.endPoint.postCardHolder(this.cardHolderForm.value).subscribe((res: any)=>{
        this.getCardHolders();
        content?.dismiss('Cross click');
      }, (error: any)=>{
        this.alertService.showError(error?.error?.Error || error?.error?.error || error) ;
      })
    }
  }


  writeBulk(e: any, type: any) {
    if(type=='price'){
      this.baseForm.get('bulkEnter')?.setValue(e)
    }
    if (this.departments) {
      this.departments.forEach((d: any) => {
        d[type] = e;
      })
    }
  }


  writePrice(dept: any, e: any, type: any) {
    dept[type] = e;
  }





  // utilities

  setCardFor(e: any,){

    if(e && e!=''){
      if(e.name == 'Individual'){
        this.baseForm.get('no_of_members')?.setValue(1);
        this.baseForm.get('no_of_members')?.disable();
      }else{
        this.baseForm.get('no_of_members')?.setValue(null);
        this.baseForm.get('no_of_members')?.enable();
      }
    }else{
      this.baseForm.get('no_of_members')?.setValue(null);
        this.baseForm.get('no_of_members')?.enable();
    }
  }

  resetCardDiscountOn(){
    this.deptTestData = [ { id: null,  discount: null } ];
    this.baseForm.get('discount')?.setValue(0)
  }

  selectDeptOrTest(event: any, item: any, index: number) {
    const testId = event?.id;
  
    // Create the model based on the event
    const model = {
      id: testId ? event : null,
      discount: 0,
      is_discount_percentage: true
    };
  
    // Update tests_included based on whether an id is present
    if (testId) {
      this.tests_included.push(testId);
    } else {
      this.tests_included = this.tests_included.filter(
        (test: any) => test !== this.deptTestData[index].id.id
      );
    }

    // Update the item
    this.deptTestData[index] = model;
  }
  

  addRow(index: any){
    // if(index == 0 || (this.deptTestData[index - 1].id && this.deptTestData[index].id) ){
      // this.deptTestData[index - 1].id && 
    if(this.deptTestData[index].id){
      const model = {
        id: null,
        discount: null,
        is_discount_percentage: true
      };
  
      this.deptTestData.push(model)
    }else{
      this.alertService.showInfo("Enter details.");
    }
  }

  writeDiscount(event: any, item: any){
    item.discount  = event ; 
  }


  setEligibleValue(e: any , set: boolean,  type: any){
    if(e){
      if(set) { this.baseForm.get(type)?.setValue(null) ; }
      this.baseForm.get(type)?.disable()
    }else{
      if(set) { this.baseForm.get(type)?.setValue(0) ; }
      this.baseForm.get(type)?.enable()
    }
  }


  updateDurationValidation(){
    const set = this.baseForm?.get('plan_period_type')?.value?.id === 1;

    const durationControl = this.baseForm.get('duration');
    
    if (set) {
      durationControl?.setValidators([Validators.required]);
    } else {
      durationControl?.clearValidators();
    }
    
    // Update the validity of the control
    durationControl?.updateValueAndValidity();
    
  }
}
