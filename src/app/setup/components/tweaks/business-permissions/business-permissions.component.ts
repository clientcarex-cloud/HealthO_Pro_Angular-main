import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Injector } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AlertService } from '@sharedcommon/service/alert.service';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';

@Component({
  selector: 'app-business-permissions',
  templateUrl: './business-permissions.component.html',
  styleUrl: './business-permissions.component.scss'
})
export class BusinessPermissionsComponent extends BaseComponent<any> {


  constructor(
    injector: Injector,
    private endPoint: MasterEndpoint,
    public capitalSrvc : CaptilizeService, 
    public captilizeService: CaptilizeService,
    private cookieSrvc: CookieStorageService
    ) { super(injector) }

    options:any ;

  override ngOnInit(): void {

    this.getData()

  }


  getData(){
    
    this.subsink.sink = this.endPoint.getDDashBoardOptions(this.cookieSrvc.getCookieData().lab_staff_id, this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{
      this.options = data;

      if(this.options.length == 0){
        this.createOptions();
      }
    })
  }

  createOptions(){
    const model = {
      lab_staff : this.cookieSrvc.getCookieData().lab_staff_id
    }
    this.subsink.sink = this.endPoint.postDashboardOptions(model).subscribe((data:any)=>{
      // this.alertService.showSuccess("Posted")
      this.getData()
    })
  }

  addRemoveCheck(e:any, item:any){
    item.is_active = e;
    const model = {
      id: item.id,
      is_active: item.is_active,
      ordering: item.ordering,
      lab_staff: item.lab_staff,
      graph_size: item?.graph_size 
  }
  this.update(model) ; 
  }

  updateSize(event: any, item: any){
    item['graph_size'] = event.target.value;
    this.addRemoveCheck(item.is_active, item);
  }


  orderingChanged : boolean = false ;

  drop(event: CdkDragDrop<string[]>) {

    this.orderingChanged = true ;

    moveItemInArray(this.options, event.previousIndex, event.currentIndex);
    this.options.forEach((item: any, index: any) => {
      item.ordering = index + 1;
    });

  }

  async saveOrderging(){
    try {
        await Promise.all(this.options.map(async (model: any) => {
            return new Promise<void>((resolve, reject) => {

              const dashModel = {
                id: model.id,
                is_active: model.is_active,
                ordering: model.ordering,
                lab_staff: this.cookieSrvc.getCookieData().lab_staff_id,
            }

                this.subsink.sink = this.endPoint.UpdateDashboardOptions(
                    dashModel,
                    this.cookieSrvc.getCookieData().lab_staff_id,
                    this.cookieSrvc.getCookieData().client_id
                ).subscribe(
                    (res: any) => {
                        resolve(); // Resolve on success
                    },
                    (error: any) => {
                        this.alertService.showError("Error in Receiving.");
                        reject(error); // Reject on error for better error handling
                    }
                );
            });
        }));

        this.orderingChanged = false;
        this.getData();
    } catch (error) {
        console.error("Failed to update dashboard options", error);
    }
  }


  update(model: any){
    this.subsink.sink = this.endPoint.UpdateDashboardOptions(model, this.cookieSrvc.getCookieData().lab_staff_id, this.cookieSrvc.getCookieData().client_id).subscribe((data:any)=>{
      if(model.is_active){
        this.alertService.showSuccess(model.dash_board, "Active")
      }else{
        this.alertService.showSuccess(model.dash_board, "In-Active")
      }

    }, (error)=>{
      this.alertService.showError(model.dash_board, "Failed to update status")
    })
  }


}
