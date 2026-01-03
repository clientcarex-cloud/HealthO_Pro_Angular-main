import { Component, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AnnoucementEndpoint } from '../announememnt.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';

@Component({
  selector: 'app-bulk-history',
  templateUrl: './bulk-history.component.html',
  styleUrl: './bulk-history.component.scss'
})

export class BulkHistoryComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: AnnoucementEndpoint,
    public timeSrvc: TimeConversionService
  ) { super(injector) }

  override ngOnInit(): void {
    this.showHistory();
  }

  history: any = [];
  page_size:any = 10;
  page_number:any = 1;
  all_count: any = 0;
  count: any = 1;

  date: any = '';
  from_date: any = '' ;
  to_date: any = '' ;
  types: any = [
    {id: 1, name: "SMS"},
    {id: 2, name: "WhatsApp"},
    {id: 3, name: "All"}
  ]

  @Input() activeTab: any = 1;
  @Input() msg_type: any = 1;

  showHistory(){
    if(this.activeTab == 1){
      this.msg_type = 1;
      this.getData(1);
    }else if(this.activeTab == 2){
      this.msg_type = 2;
      this.getData(2);
    }else{
      this.alertService.showInfo("Feature Under Development.")
    }

  }
  
  changePageNumber(e: any) {
    this.page_size = e.target.value;
    this.getData()
  }

  onPageChange(e: any) {
    this.page_number = e;
    this.getData();
  }

  getData(type: any = this.msg_type){
    this.subsink.sink = this.endPoint.getBulkSent(
      this.page_size, this.page_number, "", this.date, this.from_date, this.to_date, this.msg_type
    ).subscribe((data: any)=>{
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.history = data.results
    })
    
  }

  selectType(e: any){
    if(e && e.id!=3){
      this.msg_type = e.id;
      this.getData();
    }else{
      this.msg_type = '';
      this.getData()
    }
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
  

}
