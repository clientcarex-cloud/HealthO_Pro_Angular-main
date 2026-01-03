import { Component, Injector,ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Doctor } from 'src/app/doctor/models/doctor.model';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { DoctorEndpoint } from 'src/app/doctor/endpoint/doctor.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { Router } from '@angular/router';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { LoyaltyCardEndpoint } from '../../loyaltycard.enpoint';
import { CardComponent } from '../card/card.component';
import { PrintService } from '@sharedcommon/service/print.service';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
})

export class MembersComponent extends BaseComponent<Doctor> {

  constructor(
    private endPoint: LoyaltyCardEndpoint,
    injector: Injector,
    public timeSrvc: TimeConversionService,
    private cookieSrvc : CookieStorageService,
    private printSrvc: PrintService
    ){ super(injector) }

  specialization!: any;
  hospitaName: string = "";

  override ngOnInit(): void {
    this.hospitaName = this.cookieSrvc?.getCookieData()?.business_name || ""
    this.page_size = 10;
    this.page_number = 1;
    this.count = 1 ;
    this.all_count = 1;
    this.query = "";
    this.members = []
    this.getData();

  }

  override ngAfterViewInit(): void {
    this.subsink.sink = this.endPoint.getCards("all", 1, "", true, "", "", "").subscribe((res: any)=>{
      this.cards = res.filter((card: any)=> card.is_active);

      this.cards?.forEach((card: any) =>{
        card.name = `${card.name} | ${card?.card_for?.name}`
      })

    });
  }

  count!: number ;
  all_count!: number;

  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer:any;
  page_size!: any ;
  page_number! : any;
  query!:string;
  sort : any = true;
  valid_starts:boolean = false;
  valid_end: boolean = false;
  members: any = [];

  pageLoading: boolean = false;

  card: any ;
  cards: any ;
  
  changeSorting(type: any = null){
    if(type == 1){
      this.valid_starts = !this.valid_starts
    }else if(type == 2){
      this.valid_end = !this.valid_end
    }else{
      this.sort = !this.sort;
    }
    this.getData();
  }
  

  @ViewChild('datePicker') datePicker!: AppDatePickerComponent;

  getData(e:any =''){
   
    this.pageLoading = true;
    this.subsink.sink = this.endPoint.getMemberships(
      this.page_size, this.page_number, this.query,
         this.sort, this.date, this.from_date, this.to_date, 
     
        ).subscribe((data:any)=>{

      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.members = data.results;
      this.pageLoading = false;
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
    if(this.page_size == this.all_count){
      this.page_number = 1;
    }
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



  printCard(e: any){
    const model = {
      membership_id: e.id,
      client_id: this.cookieSrvc.getCookieData().client_id
    }

    e['loading'] = true;

    this.subsink.sink = this.endPoint.PostnGetCardPrint(model).subscribe((res:any)=>{
      e['loading'] = false;
      this.printSrvc.printer(res.html_content);
    }, (error)=>{
      e['loading'] = false;
      this.alertService.showError("Failed to get print.", error?.error?.Error || error?.error?.error || error)
    })
  }

  updateMember(model: any){
    this.subsink.sink = this.endPoint.updateMember(model.id, model).subscribe((res: any) => {
      this.alertService.showSuccess(`${model.card_holder.name} Membership Details Updated.`);
      this.modalService.dismissAll();

      this.getData();
      
    }, (error) => {
      this.alertService.showError("Error saving Membership. Please try again.", error?.error?.Error || error?.error?.error || error);
    });
  }
  


  postRenewCard(){
    if(this.card){
      const model = {
        card: this.card.id,
        card_holder: this.memData.card_holder.id,
        lab_staff: this.cookieSrvc.getCookieData().lab_staff_id
      }

      this.subsink.sink = this.endPoint.postRenew(model).subscribe((res: any)=>{
        this.alertService.showSuccess(`${this.memData.card_holder.name} Membership Renewed.`);
        this.getData();
        this.modalService.dismissAll();
      }, (error: any)=>{
        this.alertService.showError("Error Saving Renewal. Please try again.", error?.error?.Error || error?.error?.error || error);
      })

    }
  }

  // utilies
  title: string = '';
  memData: any ;

  showMember(content: any, mem: any, size = 'lg'){
    this.title = `${mem?.card_holder?.name} | ${mem?.card?.name} | ${mem?.pc_no}`;
    this.memData = mem ;
    this.modalService.open(content, { size: size, centered: true, scrollable: true, keyboard: true});
  }


  cardSelected(cardDetails: any, popContent: NgbPopover){  

    if(cardDetails){
      this.card = cardDetails ;
      if(popContent){
        setTimeout(()=>{
          popContent.open();
         },100)
      }
    }else{
      this.card = null ;
    }

  }

}
