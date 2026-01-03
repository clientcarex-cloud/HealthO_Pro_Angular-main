import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-homeservices',
  templateUrl: './homeservices.component.html',
  styleUrls: ['./homeservices.component.scss']
})
export class HomeservicesComponent implements OnInit {

  @ViewChild('map', { static: true }) mapElement!: ElementRef;

  constructor() { }

  items: any[] = [];
  selectedItemId: number = 1;

  activeButton: string = "All";

  setActiveButton(id: string) {
    this.activeButton = id;
  }

  locations: any = [
    { lat: 16.7100, lng: 81.0950 },
    { lat: 17.3850, lng: 78.4867 },
    { lat: 16.5062, lng: 80.6480 }
  ];

  map: L.Map | undefined;
  // markers: L.Marker[] = [];

  ngOnInit(): void {
    this.initializeMap();
    // this.addMarkers();
  }

  private initializeMap(): void {
    this.map = L.map(this.mapElement.nativeElement).setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  private addMarkers(): void {
    this.locations.forEach((location: any) => {
      const marker = L.marker([location.lat, location.lng]).addTo(this.map!);
      // this.markers.push(marker);
    });
  }

  typeChange(event: any) {
    //pass
  }

  submitted: boolean = false;
  types: any = [5, 10, 15];
  total: any;
  minStartDate: any;
  service: any = {
    page: '', pageSize: ''
  }

  dataList = [
    { sno: 1, Name: 'Mr.Azam Khan', gender: "Male", Age: '25 Yrs old', sample: 1, area: 'Dilsuknagar', mobilenumber: 8465256642, address: 'Pillar no 45, opp.shine india police academy', executive: 'Shabaaz Khan', Action: 'Start' },
    { sno: 2, Name: 'Mr. Sam Khan', gender: "Male", Age: '25 Yrs old', sample: 1, area: 'Dilsuknagar', mobilenumber: 8465256642, address: 'Pillar no 45, opp.shine india police academy', executive: 'Ravi Kumar', Action: 'Collected' },
    { sno: 3, Name: 'Mr. Kumar ravi', gender: "Male", Age: '65 Yrs old', sample: 3, area: 'Dilsuknagar', mobilenumber: 8465256642, address: 'Pillar no 45, opp.shine india police academy', executive: 'Deepak Reddy', Action: 'Submitted' },
    { sno: 4, Name: 'Ms. Amrita', gender: "Female", Age: '25 Yrs old', sample: 2, area: 'Dilsuknagar', mobilenumber: 8465256642, address: 'Pillar no 45, opp.shine india police academy', executive: 'Shankar Rao Reddy', Action: 'Re-start' },
  ]

}
