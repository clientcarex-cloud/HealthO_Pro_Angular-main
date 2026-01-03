import { Component, Injector, ViewChild } from '@angular/core';
import { ConsultingService } from 'src/app/doctor/service/consultingdoctor.service';
import { Doctor } from 'src/app/doctor/models/doctor.model';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { DoctorEndpoint } from 'src/app/doctor/endpoint/doctor.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { Router } from '@angular/router';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-consulting',
  templateUrl: './consulting.component.html',
})

export class ConsultingComponent extends BaseComponent<Doctor> {

  constructor(
    injector: Injector,
    private router : Router,
    public service : ConsultingService,
    public dateTimeSrv: TimeConversionService,
    private cookieSrvc : CookieStorageService,
    private endPoint: DoctorEndpoint,
    ){ super(injector); }

  @ViewChild('datePicker') datePicker!: AppDatePickerComponent;

  specialization!: any;
  hospitaName: string = "";

  dataDoctor = [
    {label: 'Doctors', count:0, logo: false},
    {label: 'Departments', count:0, logo : false},
    {label: 'Specialists', count:0, logo : false},
  ]

  override ngOnInit(): void {
    this.hospitaName = this.cookieSrvc?.getCookieData()?.business_name || ""
    this.page_size = 10;
    this.page_number = 1;
    this.count = 1 ;
    this.all_count = 1;
    this.query = "";
    this.doctors = []
    this.getData()
  }

  count!: number ;
  all_count!: number;
  doctors!:any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer:any;
  page_size!: any ;
  page_number! : any;
  query!:string;
  sort : any = false;

  changeSorting(){
    this.sort = !this.sort;
    this.getData();
  }

  getData(){

    this.doctors = [] ;
 
    this.subsink.sink = this.endPoint.getPaginatedConsultingDoctors(
      this.page_size, this.page_number, this.query,
        this.date, this.from_date, this.to_date, this.sort
        ).subscribe((data:any)=>{

      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.doctors = data.results;

      this.getStats()
    })
  }

  getStats(){
    this.subsink.sink = this.endPoint.getConsultingDoctorStat().subscribe((data:any)=>{

      this.dataDoctor[0].count = data.doctor_count;
      this.dataDoctor[1].count = data.department_count;
      this.dataDoctor[2].count = data.specialization_count;

    })
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

  changePageNumber(e:any){
    this.page_size = e.target.value;
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
  
  getSpecilizationName(id:any){
    return this.specialization?.find((spcl:any)=> spcl.id === id)?.name;
  }

  // utilities 
  manageAmount(doc: any){
    this.router.navigate(['/doctor/manage_doctor_amount/'], { queryParams: { d_id: doc.id } });
  }

  showDoc(id: any) {
    this.router.navigate(['/doctor/view/'], { queryParams: { d_id: id } });
  }

}
