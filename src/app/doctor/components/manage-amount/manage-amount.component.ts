import { Component, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { DoctorEndpoint } from '../../endpoint/doctor.endpoint';

@Component({
  selector: 'app-manage-amount',
  templateUrl: './manage-amount.component.html',
})

export class ManageAmountComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private endPoint: DoctorEndpoint
  ) {
    super(injector);
  }


  d_id: any;
  doctor: any;
  departments: any;
  referral_data: any;

  override ngOnInit(): void {
    this.doctor = '';
    this.modalService.dismissAll();
    this.page_size = 10;
    this.page_number = 1;
    this.query = "";
    this.testQuery = "";
    this.dept = "";
    
    this.route.queryParams.subscribe(params => {
      this.doctor = +params['d_id']

      this.subsink.sink = this.endPoint.getSingleDoctor(this.doctor).subscribe((data: any) => {
        this.doctor = data;
        this.getGlobalTestsData();
      })
    })
  }


  override ngAfterViewInit(): void {
    this.subsink.sink = this.endPoint.getDepartments().subscribe((data: any) => {
      this.departments = data.filter((d: any)=> d.is_active);
      this.testQuery = ""
    });
  }

  openXl(content:any, size=''){
    this.modalService.open(content,{ size: '', centered:true, scrollable : false});
  }


  global_tests: any;
  filtered_test: any;
  testQuery: any;
  temp: any;
  pageLoading: boolean = false;
  all_count: any ;

  page_size!: any ;
  page_number! : any;
  query:string = "";
  

  getGlobalTestsData() {
    this.pageLoading = true;
    this.subsink.sink = this.endPoint.getPaginatedGlobalTests(
      this.page_size, this.page_number, this.testQuery, this.dept
    ).subscribe((data: any) => {
      this.global_tests = data.results;
      this.filtered_test = data.results;
      this.all_count = data.count;
      this.getReferralAmounts();
    },(error)=>{
      this.pageLoading = false;
    });
  }


  getReferralAmounts(){
    let q = '';
    if(this.page_size !== this.all_count){
      this.filtered_test.forEach((test:any, index:number)=>{
        q += test.id;
        if(index < this.filtered_test.length - 1) {
          q += ',';
        }
      });
    }

  
    this.subsink.sink =  this.endPoint.getReferralAmount(this.doctor.id, 'all', this.page_size == this.all_count ? '' : q).subscribe((refData: any) => {
      this.filtered_test.forEach((t: any) => {
        // Check if the current global test is linked with a referral amount object
        const linkedReferralAmount = refData.find((referral: any) => referral.lab_test && referral.lab_test.id && referral.lab_test.id === t.id);
        if (linkedReferralAmount) {

          t['amount'] = linkedReferralAmount.referral_amount ? parseFloat(linkedReferralAmount.referral_amount.replace(/,/g, '')) : 0;
          t['is_percentage'] = linkedReferralAmount.is_percentage;
          t['is_new'] = false;
          t['ref_id'] = linkedReferralAmount.id;
          t['editMode'] = false;
          t['ini_perc'] = linkedReferralAmount.is_percentage;
          t['initialAmount'] = linkedReferralAmount.referral_amount ? parseFloat(linkedReferralAmount.referral_amount.replace(/,/g, '')) : 0;
        } else {
          // Assign default values if no linked referral amount object is found
          t['amount'] = null; // Or any default value you want
          t['is_percentage'] = false; // Or any default value you want
          t['is_new'] = true;
          t['editMode'] = false;
          t['ini_perc'] = false;
        }
      });
      this.pageLoading = false;
    });
  }
  
  timer: any;

  changePageNumber(e:any){
    this.page_size = e.target.value;
    this.page_number = 1;
    this.getGlobalTestsData()
    }

    onPageChange(e:any){
      this.page_number=e;
      this.getGlobalTestsData()
    }
  

  searchTestQuery(e: any) {
    this.testQuery = e;
    this.page_number=1;
    this.getGlobalTestsData()
    // this.filtered_test = this.global_tests.filter((test: any) => test.name.toLowerCase().includes(this.testQuery.toLowerCase()));
  }

  dept: string = "";

  i: number = 0;
  selectDepartment(e:any){
    let q = "";
    e.forEach((data:any)=> q += data.id.toString()+",")
    this.dept = e.length!==0 ? q.replace(/,\s*$/, '') : '';
    // this.getData();
    this.page_number = 1;
    this.getGlobalTestsData();
  }


  bulk = false;

  bulkEdit() {
    this.bulk = !this.bulk;
    if (this.bulk) {
      this.filtered_test.forEach((item: any) => {
        item.editMode = true;

      });
    } else {
      this.filtered_test.forEach((item: any) => {
        item.editMode = false;
        item.amount = item.initialAmount;
        item.is_percentage = item.ini_perc;
      });
    }

    this.bulkEnter = ""
    this.bulkPercentage = false;
  }

  editMode(test: any, e: boolean) {
    // Turn off edit mode for all other tests
    this.filtered_test.forEach((item: any) => {
      if (item !== test) {
        item.editMode = false;
        item.amount = item.initialAmount
      }
    });
    // Toggle edit mode for the specified test
    test.editMode = !test.editMode;
    if (!e) {
      test.amount = test.initialAmount
    }
  }

  controlPercentage(test: any, e: any) {
    test.is_percentage = e.target.checked;
    test.amount = "";
  }

  bulkEnter: any = ""
  bulkPercentage : boolean = false;

  enterBulkPercentage(e:any){
    this.bulkPercentage = e.target.checked;
    this.bulkEnter = "";
    this.filtered_test.forEach((test:any)=>{
      test.is_percentage = this.bulkPercentage;
      test.amount = ""
    })
  }


  enterBulk(i:any){
    clearTimeout(this.timer) ;

    this.timer = setTimeout(() => {

      let e = {
        target:{
          value : 0
        }
      }

      e.target.value = i;

      if(this.bulkPercentage){
        if (e.target.value >= 100) {
          this.bulkEnter = 100;
          e.target.value = 100;
          this.filtered_test.forEach((test:any)=>{
            test.amount = e.target.value;
            test.is_percentage = this.bulkPercentage;
          })
        }
        else {
          this.bulkEnter = e.target.value;
          this.filtered_test.forEach((test:any)=>{
            test.amount = e.target.value;
            test.is_percentage = this.bulkPercentage;
          })
        }
      }else{
        this.bulkEnter = e.target.value;
        this.filtered_test.forEach((test:any)=>{

          if(e.target.value <= parseInt(test.price)){
            test.amount = e.target.value;
          }else{
            test.amount = test.price
          }

          if(test.is_percentage && test.amount > 100){
            test.amount = 100
          }
          
        })
      }

    }, 1000)  


  }

  writeAmount(test: any, e: any) {

    const inputNumber = e ;
    // inputNumber = inputNumber.replace(/[^\d.]/g, '')
    if (test.is_percentage) {
      if (inputNumber >= 100) {
        test.amount = 100;
      }
      else {
        test.amount = inputNumber;
      }
    } else {
      if(inputNumber < parseInt(test.price)){
        test.amount = inputNumber;
      }else{
        test.amount = test.price
      }
    }

  }

  bulkSaveProgress: boolean = false;
  bulkSave() {
    this.bulkSaveProgress = true;

    let bulkModel: any =[];

    this.filtered_test.forEach((item: any) => {

      const model = {
        lab_test: item.id,
        referral_amount: item.amount,
        is_percentage: item.is_percentage || false
      }

      bulkModel.push(model)

    });

    const model = {
      referral_doctor: this.doctor.id,
      lab_tests_data : bulkModel
    }

    this.endPoint.postBulk(model).subscribe((response)=>{
      this.alertService.showSuccess("Referral Amounts for Tests Updated Successful");
      this.bulkSaveProgress = false;
      this.bulk = false;
      this.page_number=1;
      this.getGlobalTestsData();
    }, (error)=>{
      this.alertService.showError(error)
    })

  }

  updateAmountForTest(test: any, showAlert: boolean = true) {

    // test['is_loading'] = true;

    if (test.is_new) {
      const refAmountMOdel = {
        referral_amount: test.amount,
        is_percentage: test.amount && test.amount !== '' ? test.is_percentage : false,
        referral_doctor: this.doctor.id,
        lab_test: test.id
      }
      this.subsink.sink = this.endPoint.postReferralAmount(refAmountMOdel).subscribe((data: any) => {

        if (showAlert) {
          this.alertService.showSuccess("Posted");
        }

        test['ref_id'] = data.id;
        test['is_new'] = false;
        test.editMode = false;
        test['initialAmount'] = data.referral_amount;
        test.amount = data.referral_amount;
        test.is_percentage = data.is_percentage;


      }, (error) => {
        this.modalService.dismissAll();
        this.alertService.showError("Oops", "Error in Posting Referral Amount Please Try Again")
      })
    } else {
      const refAmountMOdel = {
        referral_amount: test.amount,
        is_percentage: test.amount && test.amount !== '' ? test.is_percentage : false,
        referral_doctor: this.doctor.id,
        lab_test: test.id,
        id: test.ref_id
      }
      this.endPoint.updateReferralAmount(refAmountMOdel).subscribe((data: any) => {
        if (showAlert) {
          this.alertService.showSuccess("price to " + test.amount + "", test.name);
        }
        test.editMode = false;
        test.amount = data.referral_amount;
        test['initialAmount'] = data.referral_amount;
        test.is_percentage = data.is_percentage
      }, (error) => {
        this.modalService.dismissAll();
        this.alertService.showError("Oops", "Error in Updating Referral Amount Please Try Again")
      })
    }
  }






  docLoading: boolean = false;
  mergeDoctors: any = []
  docTerm : any ="";

  getDoctorSearches(searchTerm: any): void {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }
    if (searchTerm && searchTerm.length > 1) {
      this.docTerm = searchTerm;
      this.docLoading = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.subsink.sink = this.endPoint.getLabDoctors(searchTerm).subscribe((data: any) => {
          data.forEach((d:any)=>{
            d.name = d.name + " | " + d.mobile_number.toString();
          })
          this.mergeDoctors = data.filter((d: any)=> !d.is_duplicate && d.is_active) ;
          this.docLoading = false;
        });
      }, 400);
    } else {
      this.docTerm  = null;
      this.mergeDoctors = [];
      this.docLoading = false;
    }
  }
  


  mergedDoc: any ;

  onItemSelected(e:any){
    this.mergedDoc = e;
  }


  syncSave: boolean = false ;

  syncDoctor(){
    if(this.mergedDoc){
      const model = {
        source_doctor_id: this.doctor.id,
        target_doctor_id: this.mergedDoc.id,
      }
      this.syncSave = true;
      this.subsink.sink = this.endPoint.syncDoctor(model).subscribe((data:any)=>{
        this.alertService.showSuccess("Sync Tests From "+ this.mergedDoc.name, );
        this.modalService.dismissAll();
        this.syncSave = false;
        this.page_number=1;
        // this.getGlobalTestsData();
      },(error)=>{
        // this.syncDoctor = f
        this.syncSave = false;
        this.alertService.showError(error)
      })
    }else{
      this.alertService.showError("Select Doctor", "")
    }
  }


  mergedDoctorList:any ;

  selectMerged(e:any){
    this.mergedDoctorList = e ;
  }

  mergeDoctorsPost(){
    if(this.mergedDoctorList && this.mergedDoctorList.length >0){
      let docList:any = [];

      this.mergedDoctorList.forEach((doc:any)=> docList.push(doc.id))

      const model = {
        main_doctor_id: this.doctor.id,
        duplicate_doctor_ids: docList
      }
      this.syncSave = true;
      this.subsink.sink = this.endPoint.mergeDoctor(model).subscribe((data:any)=>{

        this.alertService.showSuccess("Merge Doctors Successful")
        this.modalService.dismissAll();
        this.syncSave = false;
        this.page_number=1;

      },(error)=>{

        this.syncSave = false;
        this.alertService.showError(error)
      })
    }else{
      this.alertService.showError("Select Atleast One Doctor")
    }
  }
}
