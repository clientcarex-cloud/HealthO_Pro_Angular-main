import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { HIMSSetupEndpoint } from '../services-hims/hmis.endpoint';
import { FormBuilder, Validators } from '@angular/forms';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-add-rooms',
  templateUrl: './add-rooms.component.html'
})

export class AddRoomsComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private cookieSrvc: CookieStorageService,
    private endPoint: HIMSSetupEndpoint,
    private proEndpoint: ProEndpoint
  ){ super(injector) }


  @Input() room: any ;
  @Output() saved: EventEmitter<any> = new EventEmitter<any>() ;

  typeForm: any ; // Type Form for room types and floor types 

  is_adding_room_type: boolean = false ;
  roomTypes: any = [] ;
  floors: any = [] ;

  timeCategory = [] ;



  override ngOnInit(): void {
    
    this.baseForm = this.formBuilder.group({
      name: [this.room?.name || null, Validators.required],
      room_type: [this.room?.room_type || null, Validators.required],
      room_number: [this.room?.room_number || null, Validators.required],
      floor: [this.room?.floor || null, Validators.required],
      total_beds: [this.room?.total_beds || null, Validators.required],
      charges_per_bed: [this.room?.charges_per_bed || null, Validators.required],
      time_category: [this.room?.time_category?.id || 2, Validators.required]
    })

    this.typeForm = this.formBuilder.group({
      name: [null, Validators.required]
    })

    this.getRoomTypes();
    this.getFloors();
    this.getTimeCategories();

  }


  getRoomTypes(){
    this.subsink.sink = this.endPoint.getRoomTypes().subscribe((res: any)=>{
      this.roomTypes = res ;
    },(error)=> { this.showAPIError(error)});
  }

  getFloors(){
    this.subsink.sink = this.endPoint.getFloors().subscribe((res: any)=>{
      this.floors = res ;
    },(error)=> { this.showAPIError(error)});
  }


  getTimeCategories(){
    this.subsink.sink = this.proEndpoint.getTimeCategory().subscribe((res: any)=>{
      this.timeCategory = res ;
    },(error)=> { this.showAPIError(error)});
  }


  getModel(){
    const model = {
      name: this.baseForm.get('name')?.value,
      room_type: this.baseForm.get('room_type')?.value?.id,
      room_number: this.baseForm.get('room_number')?.value,
      floor: this.baseForm.get('floor')?.value?.id,
      total_beds: this.baseForm.get('total_beds')?.value,
      charges_per_bed: this.baseForm.get('charges_per_bed')?.value,
      time_category: this.baseForm.get('time_category')?.value,
    }
    return model ;
  }

  override saveApiCall(): void {
    if(this.baseForm.valid){
      if(this.room) this.updateRoom();
      else this.saveRoom()
    }else{
      this.showBaseFormErrors();
    }

  }

  updateRoom(){
    const model: any = this.getModel();
    model['id'] = this.room?.id;
    model['last_updated_by'] = this.cookieSrvc.getCookieData().lab_staff_id ;
    this.subsink.sink = this.endPoint.updateRoom(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.name} saved.`);
      this.saved.emit({});
      this.modalService.dismissAll();
    },(error)=>{ this.showAPIError(error)});
  }

  saveRoom(){
    const model: any = this.getModel();
    model['created_by'] = this.cookieSrvc.getCookieData().lab_staff_id ;
    this.subsink.sink = this.endPoint.postRoom(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.name} saved.`);
      this.saved.emit({});
      this.modalService.dismissAll();
    },(error)=>{ this.showAPIError(error)});
  }

  saveRoomType(modal: any){
    if(this.typeForm.valid){
      if(this.is_adding_room_type){
        this.subsink.sink = this.endPoint.postRoomType(this.typeForm.value)?.subscribe((res:any)=>{
          modal.dismiss('Cross click');
          this.getRoomTypes() ;
          this.typeForm.reset();
        },(error)=>{ this.showAPIError(error)});
      }else{
        this.subsink.sink = this.endPoint.postFloor(this.typeForm.value)?.subscribe((res:any)=>{
          modal.dismiss('Cross click');
          this.getFloors();
          this.typeForm.reset();
        },(error)=>{ this.showAPIError(error)});
      }
    }
  }


  setTimeCategory(event: any){
    this.baseForm.get('time_category')?.setValue(event)
  }
}
