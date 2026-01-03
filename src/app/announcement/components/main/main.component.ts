import { Component, Injector, OnInit } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AnnoucementEndpoint } from '../announememnt.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: AnnoucementEndpoint,
    public timeSrvc: TimeConversionService
  ) { super(injector) }

  override ngOnInit(): void {
  }

  history: any = [];
  page_size:any = 10;
  page_number:any = 1;
  all_count: any = 0;
  count: any = 1;
  msg_type: any = 1;
  types: any = [
    {id: 1, name: "SMS"},
    {id: 2, name: "WhatsApp"},
    {id: 3, name: "All"}
  ]
  
  changePageNumber(e: any) {
    this.page_size = e.target.value;
    this.getData()
  }

  onPageChange(e: any) {
    this.page_number = e;
    this.getData();
  }

  getData(type: any = this.msg_type){
    this.subsink.sink = this.endPoint.getHistory(
      this.page_size,
      this.page_number,
      type
    ).subscribe((data: any) => {
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
      this.msg_type = null;
      this.getData()
    }
  }
  activeTab: any = 1;

  showHistory(content: any, call: boolean = true){
    if(this.activeTab == 1){
      this.msg_type = 1;
      if(call) this.getData(1);
    }else if(this.activeTab == 2){
      this.msg_type = 2;
      if(call) this.getData(2);

    }else{
      this.alertService.showInfo("Feature Under Development.")
    }
    this.modalService.open(content, {size: call ? 'lg' : 'xl'})
  }
  
}
