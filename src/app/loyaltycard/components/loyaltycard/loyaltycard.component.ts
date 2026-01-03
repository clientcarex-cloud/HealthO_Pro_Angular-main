import { Component, Injector,ViewChildren, QueryList, ViewChild } from '@angular/core';
import { ConsultingService } from 'src/app/doctor/service/consultingdoctor.service';
import { Doctor } from 'src/app/doctor/models/doctor.model';
import { AppDatePickerComponent } from '@sharedcommon/components/datepicker-component/app-datepicker.component';
import { BaseComponent } from '@sharedcommon/base/base.component';

import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { Router } from '@angular/router';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { LoyaltyCardEndpoint } from '../../loyaltycard.enpoint';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-loyaltycard',
  templateUrl: './loyaltycard.component.html',
})

export class LoyaltycardComponent extends BaseComponent<Doctor> {

  constructor(
    public service : ConsultingService,
    private endPoint: LoyaltyCardEndpoint,
    private router : Router,
    injector: Injector,
    public timeSrvc: TimeConversionService,
    private cookieSrvc : CookieStorageService
    ){
    super(injector);
  }

  specialization!: any;
  hospitaName: string = "";

  override ngOnInit(): void {
    this.hospitaName = this.cookieSrvc?.getCookieData()?.business_name || ""
    this.page_size = 10;
    this.page_number = 1;
    this.count = 1 ;
    this.all_count = 1;
    this.query = "";
    this.cards = []
    this.getData();
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
  sort : any = false;
  valid_starts:boolean = false;
  valid_end: boolean = false;
  cards: any = [];
  
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
  @ViewChildren(CardComponent) cardComponent!: CardComponent;

  getData(e:any =''){
   
    this.subsink.sink = this.endPoint.getCards(
      this.page_size, this.page_number, this.query,
         this.sort, this.date, this.from_date, this.to_date, 
     
        ).subscribe((data:any)=>{

      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.cards = data.results;

    })
  }
  
  dataDoctor = [
    {label: 'cards', count:0, logo: false},
    {label: 'Departments', count:0, logo : false},
    {label: 'Specialists', count:0, logo : false},
  ]

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
  
  getSpecilizationName(id:any){
    return this.specialization?.find((spcl:any)=> spcl.id === id)?.name;
  }

  showDoc(id: any) {
    this.router.navigate(['/doctor/view/'], { queryParams: { d_id: id } });
  }


  title: string = '';
  cardData: any ;

  showCard(content: any, card: any){
    this.title = card.name;
    this.cardData = card;
    this.modalService.open(content, { size: 'lg', centered: true, scrollable: false, keyboard: true});
  }


  updateCard(model: any){
    this.subsink.sink = this.endPoint.updateCard(model.id, model).subscribe((res: any) => {
      this.alertService.showSuccess(`${model.name} Card Details Updated.`);
      this.modalService.dismissAll();
      this.getData();

    }, (error) => {
      this.getData();
      this.alertService.showError("Error saving card. Please try again.",  error?.error?.Error || error?.error?.error || error);
    });
  }


  updateActiveStatus(event: any , card: any){


    card['created_by'] = card?.created_by?.id;
    card['last_updated_by'] = this.cookieSrvc.getCookieData().lab_staff_id;
    card.duration_type = card?.duration_type?.id ;
    card.card_for = card?.card_for.id;
    card.is_active = event ; 

    delete card.benefits;
    // card.benefits = [{
    //   benefit: 1,
    //   free_usages: card.benefits[0].free_usages || null,
    //   discount_usages: card.benefits[0].discount_usages || null,
    // }],

    this.updateCard(card);

  }

  
}
