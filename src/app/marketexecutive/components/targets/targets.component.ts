import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { MarketExecutiveEndpoint } from '../../marketexecutive.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';

@Component({
  selector: 'app-targets',
  templateUrl: './targets.component.html',
  styleUrl: './targets.component.scss'
})
export class TargetsComponent extends BaseComponent<any>{


  constructor(
    injector: Injector,

    private staffEndpoint: StaffEndpoint,
    private endPoint: MarketExecutiveEndpoint,
    private proEndPoint: ProEndpoint,

    private cookieSrvc: CookieStorageService,
    public capitalSrvc : CaptilizeService,
    public timeSrvc: TimeConversionService,

    private router : Router,
  ) { super(injector) }

  inProgress: boolean = false;
  pageNum! : number | null;
  users:any = [];
  visitStatuses: any;

  activeId: any ;

  is_sa: any = false ;

  toggleAccordionnn(id: any): void {
    this.activeId = this.activeId === id ? null : id;
  }


  override ngAfterViewInit(): void {

  }

  override ngOnInit(): void {

    if(!this.cookieSrvc.getCookieData().is_superadmin){
      this.staffQuery = `&labstaff=${this.cookieSrvc.getCookieData().lab_staff_id}`
    }else{
      this.is_sa = true
    }

    this.page_size = 10;
    this.page_number = 1;
    this.count = 1 ;
    this.all_count = 1;
    this.date = this.timeSrvc.getTodaysDate();
    this.query = "";
    
    this.getData();

    this.subsink.sink = this.proEndPoint.getVisitsStatues().subscribe((data: any)=>{
      this.visitStatuses = data ;
    });

  }


  datePickerMaxDate: any;
  count!: number ;
  all_count!: number;
  staffs!:any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer:any; 
  page_size!: any ;
  page_number! : any;
  query!:string;
  sort : any = false;
  pageLoading: boolean = false;

  staffQuery: any = null ;

  getData(){
    this.staffs = [];

    this.pageLoading = true;

    this.subsink.sink = this.endPoint.getExecutiveTargets(
      this.page_size, this.page_number, this.query, this.sort, this.date, this.from_date, this.to_date, this.staffQuery
    ).subscribe((data: any)=>{
      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.staffs = data?.results || data;
    }, (error)=>{
      
      this.alertService.showError(error?.error?.error || error?.error?.Error)
    });
    
  }

  searchQuery(e: any) {
    this.query = e;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.page_number = 1;
      this.getData();
    }, 500); // Adjust the delay as needed
  }

  changePageNumber(e:any){
    this.page_size = e.target.value;
    this.page_number = 1;
    this.getData()
  }

  onPageChange(e:any){
    this.page_number=e;
    this.getData();
  }

  getRangeValue(e:any){
    if(e.length !== 0){
      if(e.includes("to")){
        this.separateDates(e);
      }else{
        this.date = e;
        this.from_date = "";
        this.to_date = "" ;
        this.page_number = 1;
        this.getData();
      }}
      else{
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
    this.to_date = endDate ;
    this.date = "";
    this.page_number = 1;
    this.getData();
  }

  showStaff(id:any){
    this.router.navigate(['/marketingexecutive/view/'], { queryParams: {s_id: id}});
  }


  updateStartOrEndTime(item: any, is_start: any){
 
    this.getLocation().then((location: any) => {

      const model = item ;
      if(is_start){
        model.latitude_at_start = location.latitude ;
        model.longitude_at_start = location .longitude ;
        model.start_time = this.timeSrvc.djangoFormatWithT();
      }else{
        model.latitude_at_end = location.latitude ;
        model.longitude_at_end = location .longitude ;
        model.end_time = this.timeSrvc.djangoFormatWithT();
      }

      model.lab_staff = model?.lab_staff?.id;
      model.status = model?.status?.id ;
      model.visit_type = model?.visit_type?.id;

      this.updateVisit(model, false);
    })
    .catch(error => {
      console.error('Geolocation Error:', error); // Log the complete error object
      this.alertService.showInfo(error.errorMessage);
    });
    

  }

  updateStatus(event: any, item: any){

    const model = item;
    model.status = event.target.value ;
    model.lab_staff = model.lab_staff.id;
    model.visit_type = model.visit_type.id;

    this.updateVisit(model, false);

  }

  saveRemark(){
    const model = this.selectedItem;
    model.status = model.status.id ;
    model.lab_staff = model?.lab_staff?.id;
    model.visit_type = model.visit_type.id;
    this.updateVisit(this.selectedItem, true);
    }

  updateVisit(model: any, closeModal: any){
    
    delete model.total_time_taken ;

    this.subsink.sink = this.endPoint.updateVisit(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.name} Visit Status Updated.`);
      this.getData();
      if(closeModal){
        this.modalService.dismissAll();
      }
    }, (error: any)=>{
      this.getData();
      this.alertService.showError(error?.error?.Error);
    })
  }



  // utilities 

  
  selectedItem: any ; 
  editTarget(content: any, staff: any){
    this.selectedItem = staff ; 

    this.openModal(content, { size: 'lg', centered: true })
  }

  getLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            resolve({ 
              latitude: latitude,
              longitude: longitude,
            });
          },
          (error) => {
            reject({ 
              latitude: null,
              longitude: null,
              error: true,
              errorMessage: error.message
            });
          }
        );
      } else {
        reject({ 
          latitude: null,
          longitude: null,
          error: true,
          errorMessage: 'Geolocation is not supported by this browser.'
        });
      }
    });
  }
  

  addOrEditRemark(content: any, item: any){
    this.selectedItem = item;
    this.openModal(content, {size: ''});
  }

  writeRemark(event: any){
    this.selectedItem['remarks'] = event ;
  }

  addOrEditImage(content: any, item: any){
    this.selectedItem = item;
    this.openModal(content, {size: ''});
  }

  onFileChanged(event: any, item: any): void {
    const file = event.target.files[0];
    if (file) {
      this.convertToBase64(file).then((base64String: string) => {
        
        const model = item;
        model.visit_img = base64String ;
        model.status = model.status.id ;
        model.lab_staff = model.lab_staff.id;
        model.visit_type = model.visit_type.id;

        this.updateVisit(model, false);

      });
    }
  }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  addCameraImage(e:any){
    this.selectedItem.visit_img = e.imageAsDataUrl ;
    const model = this.selectedItem;
    model.status = model.status.id ;
    model.lab_staff = model.lab_staff.id;
    model.visit_type = model.visit_type.id;
    this.updateVisit(model, true);
  }

  openImage(content: any, item: any, size: any = ''){
    this.selectedItem = item ;
    this.openModal(content, { size: size });
  }

  removeImage(item: any){
    const model = item;
    model.visit_img = null;
    model.status = model.status.id ;
    model.lab_staff = model.lab_staff.id;
    model.visit_type = model.visit_type.id;

    this.updateVisit(model, false);

  }

  openMap(content: any, item:any, is_start: any){  
    this.selectedItem = item ;
    this.selectedItem['is_start'] = is_start ;
    if(is_start){
      this.selectedItem['locations'] = [this.selectedItem.latitude_at_start, this.selectedItem.longitude_at_start]
    }else{
      this.selectedItem['locations'] = [this.selectedItem.latitude_at_end, this.selectedItem.longitude_at_end]
    }
    this.openModal(content, { size: 'xl', centered: true });
  }

  openRefDoc(content: any, item: any, type: any){
    if(item[type] && item[type] != 0){
      this.selectedItem = item ;
      this.openModal(content, { size: 'xl', centered: true });
    }
  }

  test(){
    let tests : any = [];

    this.staffs.forEach((staff: any)=>{
      delete staff.visits ;
      delete staff.profile_pic ; 
      tests.push(staff);
    })

  }

  returnPendingRev(staff: any){
    if(staff?.target_revenue && staff?.revenue_achieved){
      const pending = this.getFloatVal(staff?.target_revenue) - this.getFloatVal(staff?.revenue_achieved)

      return pending >= 0 ? pending : 0 
    }else{
      return 0
    }
  }

  returnPendingRefs(staff: any){
    if(staff?.no_of_referrals && staff?.referrals_achieved){
      const pending = this.getFloatVal(staff?.no_of_referrals) - this.getFloatVal(staff?.referrals_achieved)

      return pending >= 0 ? pending : 0 
    }else{
      return 0
    }
  }

  getFloatVal(num: any) {
    try {
      const floatNum = parseFloat(num.replace(/,/g, ''))
      return floatNum
    } catch (error) {
      return num
    }

  }
}
