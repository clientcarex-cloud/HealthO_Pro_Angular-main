import { Component, Injector, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { StaffEndpoint } from 'src/app/staff/endpoint/staff.endpoint';
import { MarketExecutiveEndpoint } from '../../marketexecutive.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { NgxSpinnerService } from 'ngx-spinner';

import * as L from 'leaflet';
import 'leaflet-routing-machine';

@Component({
  selector: 'app-executive-visits',
  templateUrl: './executive-visits.component.html',
})

export class ExecutiveVisitsComponent extends BaseComponent<any>{


  constructor(
    injector: Injector,

    private staffEndpoint: StaffEndpoint,
    private endPoint: MarketExecutiveEndpoint,
    private proEndPoint: ProEndpoint,

    private cookieSrvc: CookieStorageService,
    public capitalSrvc : CaptilizeService,
    public timeSrvc: TimeConversionService,
    private spinner: NgxSpinnerService,

    private router : Router,
  ) { super(injector) }

  @ViewChild('lefleatMap') lefleatMap: any ;
  @ViewChild('addRefDoc') addRefDoc: any ;

  inProgress: boolean = false;
  pageNum! : number | null;
  users:any = [];
  visitStatuses: any;
  activeId: any ;

  is_sa: any = false;
  
  toggleAccordionnn(id: any): void {
    this.activeId = this.activeId === id ? null : id;
  }

  override ngAfterViewInit(): void {

  }

  override ngOnInit(): void {

    this.is_sa = this.cookieSrvc.getCookieData().is_superadmin
    if(!this.is_sa){
      this.staffQuery = `&lab_staff=${this.cookieSrvc.getCookieData().lab_staff_id}`
    }

    this.page_size = 10;
    this.page_number = 1;
    this.count = 1 ;
    this.all_count = 1;
    this.date = this.timeSrvc.getTodaysDate();
    this.query = "";

    this.getData();

    this.subsink.sink = this.proEndPoint.getVisitsStatues().subscribe((data: any)=>{
      this.visitStatuses = data ;
    });



  }


  datePickerMaxDate: any;
  count!: number ;
  all_count!: number;
  staffs!:any;
  date: string = "";
  status_id: string = "";
  from_date: string = "";
  to_date: string = "";
  timer:any; 
  page_size!: any ;
  page_number! : any;
  query!:string;
  sort : any = false;
  pageLoading: boolean = false;

  staffQuery: any = null ;

  getData(){
    this.staffs = [];

    this.pageLoading = true;

    this.subsink.sink = this.endPoint.getVisitByExecutive(
      this.page_size, this.page_number, this.query, this.sort, this.date, this.from_date, this.to_date , this.staffQuery
    ).subscribe((data: any)=>{
      this.pageLoading = false;
      this.count = Math.ceil(data.count / this.page_size)
      this.all_count = data.count;
      this.staffs = data.results ;
    });
    
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

  showStaff(id:any){
    this.router.navigate(['/marketingexecutive/view/'], { queryParams: {s_id: id}});
  }


  updateStartOrEndTime(item: any, is_start: any){
 
    this.getLocation().then((location: any) => {

      if(!location?.error){
        const model = item ;

        item['is_loading'] = true ;
        
        if(is_start){
          model.latitude_at_start = location.latitude ;
          model.longitude_at_start = location .longitude ;

          model.start_time = this.timeSrvc.djangoFormatWithT();
  
          model.lab_staff = model?.lab_staff?.id;
          model.status = model?.status?.id ;
          model.visit_type = model?.visit_type?.id;
    
          this.updateVisit(model, false);

          item['is_loading'] = false;
          
        }else{
          model.latitude_at_end = location.latitude ;
          model.longitude_at_end = location .longitude ;

          model.end_time = this.timeSrvc.djangoFormatWithT();
  
          const coords = `${model.latitude_at_start},${model.longitude_at_start};${model.latitude_at_end},${model.longitude_at_end}`;

          const start_loc = [parseFloat(model.latitude_at_start), parseFloat(model.longitude_at_start)];
          const end_loc = [model.latitude_at_end, model.longitude_at_end] ;
          setTimeout(async ()=>{

            await this.getDistanceByMap(start_loc, end_loc, coords).then((response: any)=>{
              try{
                model['total_distance_travelled'] = response?.distanceinKm.toFixed(2) || 0 ;
              }catch(error){
                model['total_distance_travelled'] = response?.distanceinKm || 0 ;
              }

              model.lab_staff = model?.lab_staff?.id;
              model.status = model?.status?.id ;
              model.visit_type = model?.visit_type?.id;
        
              this.updateVisit(model, false);
            }).catch((error: any)=>{
              model.lab_staff = model?.lab_staff?.id;
              model.status = model?.status?.id ;
              model.visit_type = model?.visit_type?.id;
        
              this.updateVisit(model, false);

              item['is_loading'] = false;
            })
          })
        }
      }else{
        console.error('Geolocation Error:', location?.error); // Log the complete error object
        this.alertService.showInfo(location?.errorMessage);
      }

    })
    .catch(error => {
      this.alertService.showInfo('Please Turn ON Location and Try Again.', error.errorMessage);
    });
    
  }


  selected_doc_item: any = null ;
  updateStatus(event: any, item: any, staff: any){
    if(event.target.value == 3 && !this.is_sa){
      event.preventDefault(); 
      this.alertService.showInfo("Only super admins has access to change status to accepted");
      this.getData() ;
    }else{
      const model = item;
      model.status = event.target.value ;
      model.lab_staff = model.lab_staff.id;
      model.visit_type = model.visit_type.id;
  
      this.updateVisit(model, false);
  
      if(model.status == 3){
        this.selected_doc_item = model ;
        this.selected_doc_item.lab_staff = {
          id: this.selected_doc_item.lab_staff,
          name : staff.name
        }
        this.openDoctor();
      }
    }


  }


  openDoctor(){
    this.openModal(this.addRefDoc, { size: '', centered: true })
  }

  saveRemark(){
    const model = this.selectedItem;
    model.status = model.status.id ;
    model.lab_staff = model?.lab_staff?.id;
    model.visit_type = model.visit_type.id;
    this.updateVisit(this.selectedItem, true);
    }

  updateVisit(model: any, closeModal: any){
    
    delete model.total_time_taken ;

    this.subsink.sink = this.endPoint.updateVisit(model).subscribe((res: any)=>{
      this.alertService.showSuccess(`${model.name} Visit Status Updated.`);
      this.getData();
      
      if(closeModal){
        this.modalService.dismissAll();
      }
    }, (error: any)=>{
      this.getData();
      this.alertService.showError(error?.error?.Error || error?.error?.error);
    })
  }



  // utilities 
  getLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            resolve({ 
              latitude: latitude,
              longitude: longitude,
              error: false
            });
          },
          (error) => {
            reject({ 
              latitude: null,
              longitude: null,
              error: true,
              errorMessage: error.message
            });
          }
        );
      } else {
        reject({ 
          latitude: null,
          longitude: null,
          error: true,
          errorMessage: 'Geolocation is not supported by this browser.'
        });
      }
    });
  }
  
  selectedItem: any ;
  addOrEditRemark(content: any, item: any){
    this.selectedItem = item;
    this.openModal(content, {size: '', centered: true});
  }

  writeRemark(event: any){
    this.selectedItem['remarks'] = event ;
  }

  addOrEditImage(content: any, item: any){
    this.selectedItem = item;
    this.openModal(content, {size: '', centered: true});
  }

  onFileChanged(event: any, item: any): void {
    const file = event.target.files[0];
    if (file) {
      this.convertToBase64(file).then((base64String: string) => {
        
        const model = item;
        model.visit_img = base64String ;
        model.status = model.status.id ;
        model.lab_staff = model.lab_staff.id;
        model.visit_type = model.visit_type.id;

        this.updateVisit(model, false);

      });
    }
  }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  addCameraImage(e:any){
    this.selectedItem.visit_img = e.imageAsDataUrl ;
    const model = this.selectedItem;
    model.status = model.status.id ;
    model.lab_staff = model.lab_staff.id;
    model.visit_type = model.visit_type.id;
    this.updateVisit(model, true);
  }

  openImage(content: any, item: any, size: any = ''){
    this.selectedItem = item ;
    this.openModal(content, { size: size, centered: true });
  }

  removeImage(item: any){
    const model = item;
    model.visit_img = null;
    model.status = model.status.id ;
    model.lab_staff = model.lab_staff.id;
    model.visit_type = model.visit_type.id;

    this.updateVisit(model, false);
  }


  openMap(content: any, item:any, is_start: any, showRoute: boolean){  
    this.selectedItem = item ;
    this.selectedItem['is_start'] = is_start ;
    this.selectedItem['showRoute'] = showRoute ;
    if(is_start){
      this.selectedItem['locations'] = [this.selectedItem.latitude_at_start, this.selectedItem.longitude_at_start]
    }else{
      this.selectedItem['locations'] = [this.selectedItem.latitude_at_end, this.selectedItem.longitude_at_end]
    }

    if(showRoute){
      this.selectedItem['locations'] = [this.selectedItem.latitude_at_start, this.selectedItem.longitude_at_start, this.selectedItem.latitude_at_end, this.selectedItem.longitude_at_end]
    }
    this.openModal(content, { size: 'xl', centered: true });
  }


  map: L.Map | undefined;

  distance: any ; 

  async getDistance(coords: any){
    return new Promise((resolve, reject) => {
      // this.subsink.sink = this.endPoint.getDistance(coords).subscribe(
      //   (res: any) => { resolve(res); },
      //   (error) => { reject(error); }
      // );

      const xhr = new XMLHttpRequest();
    
      const serviceUrl = 'http://router.project-osrm.org/route/v1/driving/';
      const requestUrl = `${serviceUrl}${coords}?overview=false&alternatives=true&steps=true`;

      xhr.open('GET', requestUrl, true);
  
      xhr.onload = () => {

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.response))
        } else {
          reject(xhr.status)
          console.error('Request failed with status:', xhr.status);
        }
      };
  
      // Define what happens in case of error
      xhr.onerror = () => {
        reject({})
        console.error('Network error occurred.');
      };
  
      xhr.send();

      // const map  = document.createElement('div');
      // map.setAttribute("id", 'map');
      // try{
      //   this.map = L.map('mapp').setView([17.4489249,78.4470947], 19 , { animate: false });

      //   L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
      //     maxZoom: 20,
      //     subdomains:['mt0','mt1','mt2','mt3'],
      //     attribution: '',
      //   }).addTo(this.map);
  
      //   const routingControl = L.Routing.control({
  
      //   router: L.Routing.osrmv1({
      //     serviceUrl: 'http://router.project-osrm.org/route/v1',        
      //   }),
      //   waypoints: [
      //     L.latLng(coords.latitude_at_start,coords.longitude_at_start), // Start point
      //     L.latLng(coords.latitude_at_end,coords.longitude_at_end)   // End point
      //   ],
      //   routeWhileDragging: false,
      //   addWaypoints: false, 
  
      //   summaryTemplate: "<h6>{distance}, {time}</h6>",
      //   containerClassName: 'lefleatStyle',
      //   itineraryClassName: 'display-none',
      //   }).addTo(this.map);
  
      //   // Listen to the 'routesfound' event to capture the distance
      //   routingControl.on('routesfound', function(e: any) {
      //     const routes = e.routes;
      //     const summary = routes[0].summary;
      //     const distanceInKm = summary.totalDistance / 1000; // Convert to kilometers
      //     resolve({
      //       distance: distanceInKm
      //     }); // Resolve the promise on success
      //   });
      // }catch(error){
      //   reject(error); 
      // }

    });
  }



  async getDistanceByMap(start_loc: any, end_loc: any, coords: string){
    return new Promise((resolve, reject) => {
      try{

        this.map =  L.map('mapp').setView( end_loc , 19 , { animate: false });

        L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3'],
          attribution: '',
        }).addTo(this.map);


        this.calculateRoute(start_loc, end_loc).then((response: any)=>{
          resolve(response)
        }).catch((error: any)=>{
          resolve(error)
        })

      }catch(error){
        resolve({ distanceinKm: 0, is_error: true })
      }

    })

  }


    private calculateRoute(start_loc: any, end_loc: any) {
      return new Promise((resolve, reject) => {
        try{
          const startPoint = L.latLng(start_loc[0], start_loc[1]); // Start point
          const endPoint = L.latLng(end_loc[0], end_loc[1]); // End point
  
          // Create an XMLHttpRequest
          const xhr = new XMLHttpRequest();
          const serviceUrl = 'https://router.project-osrm.org/route/v1/driving/';
          const coordinates = `${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}`;
          const requestUrl = `${serviceUrl}${coordinates}?overview=false&alternatives=true&steps=true`;
  
          // Configure the request
          xhr.open('GET', requestUrl, true);
          xhr.setRequestHeader('Accept', 'application/json');
  
          // Save reference to `this`
          const self = this;
  
          // Handle the response
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.routes && response.routes.length > 0) {
                  const route = response.routes[0];
  
                  // Add the route to the map
                  const waypoints = [
                    new L.Routing.Waypoint(startPoint, 'Start', { allowUTurn: true }),
                    new L.Routing.Waypoint(endPoint, 'End', { allowUTurn: true })
                ];
      
                  // Add the route to the map
                  L.Routing.control({
                    waypoints: waypoints,
                    routeWhileDragging: false,
                    addWaypoints: false,
                    summaryTemplate: `
                    <div class='d-flex font-Readex fs-4'>
                        <h6>{distance}, {time}</h6>
                    </div>
                    `,
                    containerClassName: 'lefleatStyle',
                    itineraryClassName: 'd-none',
                    showAlternatives: true,
                    useZoomParameter: false,
                    autoRoute: true,
                    plan: L.Routing.plan(waypoints, {
                      createMarker: () => false, // Suppress marker creation
                    })
                  }).addTo(self.map!).addTo(self.map!).on('routesfound', function(e: any) {
                    const routes = e.routes;
                    const distances = routes.map((route: any) => route.summary.totalDistance);
                    const lowestDistance = Math.min(...distances);
                    const lowestDistanceInKm = lowestDistance / 1000;
                    resolve({ distanceinKm: lowestDistanceInKm, is_error: false })
                  });
  
                } else {
                  resolve({ distanceinKm: 0, is_error: true })
                  console.error('No route found:', response.message);
                }
              } else {
                resolve({ distanceinKm: 0, is_error: true })
                console.error('Request failed:', xhr.status, xhr.statusText);
              }
            }
          };
  
          // Send the request
          xhr.send();
        }catch(error){
          reject({ distanceinKm: 0, is_error: true })
        }

    })
  }

  private TestcalculateRoute(): void {
    // [18.5204303, 73.8567437]
    const startPoint = L.latLng(17.3971123, 78.4950727); // Start point
    const endPoint = L.latLng(18.5204303, 73.8567437); // End point

    // Create an XMLHttpRequest
    const xhr = new XMLHttpRequest();
    const serviceUrl = 'https://router.project-osrm.org/route/v1/driving/';
    const coordinates = `${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}`;
    const requestUrl = `${serviceUrl}${coordinates}?overview=false&alternatives=true&steps=true`;

    // Configure the request
    xhr.open('GET', requestUrl, true);
    xhr.setRequestHeader('Accept', 'application/json');

    // Save reference to `this`
    const self = this;

    // Handle the response
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.routes && response.routes.length > 0) {
            const route = response.routes[0];

            // Add the route to the map
            L.Routing.control({
              waypoints: [
                startPoint,
                endPoint
              ],
              routeWhileDragging: false,
              addWaypoints: false,
              summaryTemplate: "<h6>{distance}, {time}</h6>",
              containerClassName: 'lefleatStyle',
              itineraryClassName: 'display-none',

              
            }).addTo(self.map!).on('routesfound', function(e: any) {
              const routes = e.routes;
              const summary = routes[0].summary;
            
              // Distance is in meters
              const distanceInKm = summary.totalDistance / 1000; // Convert to kilometers
              
            });; // Use the saved context

            // Draw the route on the map
            const latLngs = route.geometry.coordinates.map((coord: any) => L.latLng(coord[1], coord[0]));
            L.polyline(latLngs, { color: 'blue' }).addTo(self.map!);

          } else {
            console.error('No route found:', response.message);
          }
        } else {
          console.error('Request failed:', xhr.status, xhr.statusText);
        }
      }
    };

    // Send the request
    xhr.send();
  }

}
