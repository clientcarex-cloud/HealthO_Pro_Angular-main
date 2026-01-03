import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { ClientEndpoint } from '../../clients.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-delete-organizations',
  templateUrl: './delete-organizations.component.html'
})

export class DeleteOrganizationsComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,

    public timeSrvc: TimeConversionService,
    private endPoint: ClientEndpoint,

    public spinner: NgxSpinnerService
  ){ super(injector) }


  @Output() saved: EventEmitter<any> = new EventEmitter<any>();

  clients: any ;
  searchData: any = [];
  activeTab: any = 1;

  pageLoading: boolean = false ;
  searchLoading: boolean = false ;

  timer: any ;

  item: any ;

  override ngOnInit(): void {
    // this.getReadytoDelete();
  }

  getData(){
    this.clients = [] ;
    this.item = null ;
    this.searchData = [] ;
    if(this.activeTab == 2){
      this.getReadytoDelete('ready_to_delete');
    }
  }

  getReadytoDelete(action: any){
    this.subsink.sink = this.endPoint.getDeleteOragnizations(action)?.subscribe((res: any)=>{
      this.clients = res;
    })
  }

  getClients(searchTerm: string): void {
    if(searchTerm.length > 2){
      this.searchLoading = true;
      this.timer = setTimeout(() => {
        this.subsink.sink = this.endPoint.getDeleteOrgs(
          "all", 1, searchTerm, '', '', '', true
        ).subscribe((data: any) => {
          this.searchLoading = false;
          this.searchData = data;
        })
      }, 1000)
    }

  }

  selectOrganization(org: any, action: any){
    this.item = org ;  
  }

  takeAction(action: any, item: any){
    const model = {
      b_id: item.id,
      action: action
    }
    this.spinner.show();
    this.subsink.sink = this.endPoint.postOrganizationForDelete(model)?.subscribe((res: any)=>{
      if(action == "delete"){
        this.alertService.showSuccess(`${item?.organization_name} deleted.`);
        this.saved.emit({});
      }else{
        this.alertService.showSuccess(`${item?.organization_name} marked to ready to complete.`);
      }
      this.activeTab = 2 ;
      this.getReadytoDelete('ready_to_delete');
    },(error)=>{
      this.showAPIError(error);
    })
  }



  // utilities 

  hasCrossedSpecifiedDateTime(specifiedTimestamp: string): boolean {
    const specifiedDate = new Date(specifiedTimestamp);
    const currentDate = new Date();
    return currentDate.getTime() > specifiedDate.getTime();
  }

  returnHtml(e: any){
    if(this.hasCrossedSpecifiedDateTime(e)){
      return "<span class='text-danger'>Expired</span>"
    }else{
      return "<span class='text-success'>Active</span>"
    }
  }
  
}
