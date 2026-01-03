import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { HIMSSetupEndpoint } from 'src/app/setup_hims/components/services-hims/hmis.endpoint';

@Component({
  selector: 'app-patient-room',
  templateUrl: './patient-room.component.html',
})

export class PatientRoomComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private cookieSrvc: CookieStorageService,
    public timeSrvc: TimeConversionService,
    private himsEndPoint: HIMSSetupEndpoint,
    private proEndpoint: ProEndpoint
  ){ super(injector) }

  @Output() saved: EventEmitter<any> = new EventEmitter<any>() ;

  rooms: any ;
  roomTypes: any = [] ;
  floors: any = [] ;
  timeCategory = [] ;

  selectedFloor: any ;
  override ngOnInit(): void {
    this.getFloors();
    // this.getRoomTypes();
    // this.getTimeCategories();
  }


  getRooms(){
    this.rooms = [] ;
    this.subsink.sink = this.himsEndPoint.getRooms(
      "all", 1, '', this.selectedFloor
    ).subscribe((res: any)=>{
      this.rooms = res ;
      this.rooms = this.groupRooms(res) ;
    },(error)=> { this.showAPIError(error)});
  }


  getRoomTypes(){
    this.subsink.sink = this.himsEndPoint.getRoomTypes().subscribe((res: any)=>{
      this.roomTypes = res ;
    },(error)=> { this.showAPIError(error)});
  }

  getFloors(){
    this.subsink.sink = this.himsEndPoint.getFloors().subscribe((res: any)=>{
      this.floors = res ;
      this.floorSelected(res[0]);
    },(error)=> { this.showAPIError(error)});
  }


  getTimeCategories(){
    this.subsink.sink = this.proEndpoint.getTimeCategory().subscribe((res: any)=>{
      this.timeCategory = res ;
    },(error)=> { this.showAPIError(error)});
  }


  // utilities 

  // Function to return an array with `total_beds` length
  createArray(num: number): any[] {
    let arr = [] ;
    for(let i = 1 ; 1 <= num ; i++) arr.push(i)
    return arr;
  }

  groupRooms(data: any){

    if(!data || data.length == 0){
      return [] ;
    }

    // Step 1: Group by name
    const groupedData = data.reduce((acc: any, curr: any) => {
      const existing = acc.find((item: any) => item.name === curr.name);
      if (existing) {
          existing.rooms.push(curr);  // Add the room to the existing array
      } else {
          acc.push({
              name: curr.name,
              rooms: [curr]  // Create a new group with the current room
          });
      }
      return acc;
    }, []);

    return groupedData ;
  }

  floorSelected(e: any){
    e && e!= '' ? this.selectedFloor = `${e.id}` : this.selectedFloor = "";
    this.getRooms() ;
  }

  roomSelected(room: any, bed: any){
    room['selectedBed'] = bed ;
    this.saved.emit(room);
  }

  test(){

  }

}
