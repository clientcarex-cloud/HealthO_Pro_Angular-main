import { Component, Injector, ViewChild, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { OutsourcingEndpoint } from '../../outsourcing.endpoint';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { DatepickerSectionComponent } from '@sharedcommon/components/datepicker-section/datepicker-section.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';

@Component({
  selector: 'app-outsourcings',
  templateUrl: './outsourcings.component.html',
  styleUrls: ['./outsourcings.component.scss']
})
export class OutsourcingsComponent extends BaseComponent<any> {

  @Input() to_send: boolean = true;

  @ViewChild('datePicker') datePicker!: AppDatePickerComponent;
  @ViewChild(DatepickerSectionComponent) dateSection!: any;

  count!: number ;
  all_count!: number;
  patients!:any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer:any; 
  page_size: any = 10;
  page_number : any = 1;
  query:string = "";
  sort : any = false;

  pageLoading: any ;

  constructor(
    injector: Injector,
    private endPoint: OutsourcingEndpoint,
    public timeSrvc : TimeConversionService
  ) { super(injector) }

  override ngOnInit(): void {
    this.date = this.timeSrvc.getTodaysDate();
    this.getData();
    
  }

  activeButton : string = "All";

  setActiveButton(id:string){
    this.activeButton = id;
  }

  changeSorting(){
    this.sort = !this.sort;
    this.getData();
  }

  getData(){
    this.patients_query = [];
    this.patients = [];
    this.pageLoading = true;

    this.subsink.sink = this.endPoint.getPatients(
      this.query,
      this.page_size, 
      this.page_number, 
      this.date,
      this.from_date,
      this.to_date,
      this.to_send,
      this.sort
    ).subscribe((res: any)=>{
      this.pageLoading = false;
      this.patients = res.results;
      this.all_count = res.count;
    }, (error: any)=>{
      this.pageLoading = false;
      this.alertService.showError(error?.error?.Error, error)
    })

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

  updateSample(model: any, receive: boolean){
    this.subsink.sink = this.endPoint.updateSourcing(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model?.patient?.name} | ${model.patient.test}`, receive ? "Received." : "Sent.");
      
      this.getData();

      if(receive){
        const sourcing = {
          sourcing_lab : model.sourcing_lab.id,
          patient_id: model.patient.id
        }

        this.getCreateSourcingTests(sourcing, model);
        // this.sourcingsReceive.push(sourcing);
      }
    },(error)=>{
      this.alertService.showError(`Failed to ${receive ? 'receive' : 'send.'}.`, error?.error?.Error);
      this.getData();
    })
  }

  bulkUpdateSample(model: any, receive: boolean) {
    return new Promise((resolve, reject) => {
      this.subsink.sink = this.endPoint.updateSourcing(model).subscribe(
        (res: any) => {
          this.alertService.showSuccess(`${model?.patient?.name} | ${model.patient.test}`, receive ? "Received." : "Sent.");
          
  
          if (receive) {
            const sourcing = {
              sourcing_lab: model.sourcing_lab.id,
              patient_id: model.patient.id,
            };
            this.sourcingsReceive.push(sourcing);
          }
          resolve(res); // Resolve the promise on success
        },
        (error) => {
          this.alertService.showError(`Failed to ${receive ? 'receive' : 'send.'}.`, error?.error?.Error);
          
          reject(error); // Reject the promise on error
        }
      );
    });
  }


  sourcingsReceive: any = [  ]

  getCreateSourcingTests(model: any, sample: any){
    this.subsink.sink = this.endPoint.createSouringTests(model).subscribe((res: any)=>{
      
    }, (error)=>{
      
      sample['is_received'] = false;
      this.updateSample(sample, false);
      this.alertService.showError("Error in Receiving.")
    })
  }

  makeSend(sample: any){
    sample['is_sent'] = true;
    this.updateSample(sample, false);
  }


  makeReceive(sample: any){
    sample['is_received'] = true;
    this.updateSample(sample, true);
  }


  patients_query : any = [] ; 

  add_or_remove(e: any, patient: any){
    if(e){
      this.patients_query.push(patient);
    }else{
      this.patients_query = this.patients_query.filter((ptn: any)=> ptn.id != patient.id)
    }
  }

  async send_for_sourcing() {
    if (this.patients_query.length !== 0) {
      for (const sample of this.patients_query) {
        sample[this.to_send ? 'is_sent' : 'is_received'] = true;
        await this.bulkUpdateSample(sample, !this.to_send);
      }

      this.patients_query = [];
  
      if (!this.to_send) {
        const uniquePatients: any = [];
        const labPatientMap: any = {};
  
        this.sourcingsReceive.forEach((item: any) => {

          const key: any = `${item.sourcing_lab}-${item.patient_id}`;
          
          // Check if the key is already in the map
          if (!labPatientMap[key]) {
            labPatientMap[key] = true; // Mark this lab-patient combination as seen
            uniquePatients.push({ sourcing_lab: item.sourcing_lab, patient_id: item.patient_id }); // Add to unique list
          }
        });
  
        this.sourcingsReceive = uniquePatients;
  
        const failedPatient: any = [];
        let createCounter = 0;
  
        // Use Promise.all to handle asynchronous requests
        await Promise.all(this.sourcingsReceive.map(async (model: any) => {
          return new Promise<void>((resolve, reject) => { // Specify <void> for the Promise type
            this.subsink.sink = this.endPoint.createSouringTests(model).subscribe((res: any) => {
              createCounter++;
              resolve(); // Resolve the promise on success
            }, (error) => {
              createCounter++;
              failedPatient.push(model.sourcing_lab);
              this.alertService.showError("Error in Receiving.");
              resolve(); // Resolve even on error to avoid hanging promises
            });
          });
        }));
        
  
        // After all requests are completed, check for failed patients
        if (failedPatient.length !== 0) {
          for (const sample of this.patients_query) {
            if (failedPatient.includes(sample.sourcing_lab)) {
              sample['is_received'] = false;
              await this.updateSample(sample, !this.to_send);
            }
          }
        }
      }

      this.sourcingsReceive = [];
      this.patients_query = [];
      

      this.getData();
    } else {
      this.alertService.showInfo("Select Atleast One Test.");
    }
  }
  

  selectAll(e: any){
    if(e){
      this.patients_query = [];
      this.patients.forEach((ptn: any)=>{
        if(!ptn.is_sent && this.to_send){
          this.patients_query.push(ptn);
        }else if(!ptn.is_received && !this.to_send){
          this.patients_query.push(ptn);
        }
      })
    }else{
      this.patients_query = [];
    }
  }

  checkObjExist(test: any){
    return this.patients_query.find((sample: any)=> sample.id == test.id)
  }

}
