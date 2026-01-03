import { Component, OnInit, Input } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

@Component({
  selector: 'app-gmap',
  templateUrl: './gmap.component.html',
  styleUrls: ['./gmap.component.scss']
})
export class GmapComponent implements OnInit {

  @Input() locations: any = [16.7100, 81.0950];
  @Input() popUpText: any = null;
  @Input() showRoute: any = false;
  @Input() showRouteText: any = ''

  map: L.Map | undefined;
  markers: L.Marker[] = [];

  ngOnInit(): void {
    this.initializeMap();
    this.addMarkers();
    if (this.showRoute) {
      this.calculateRoute();
    }
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([this.locations[0], this.locations[1]], this.showRoute ? 30: 19, { animate: false });
  }

  private addMarkers(): void {
    if (!this.map) return;

    L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '',
    }).addTo(this.map);

    const icon = L.icon({
      // iconUrl: '/assets/images/location-icon-big.png',
      iconUrl: '/assets/images/executive.png',
      shadowUrl: 'https://res.cloudinary.com/rodrigokamada/image/upload/v1637581626/Blog/angular-leaflet/marker-shadow.png',
      iconSize: [40.1, 51.2],
      iconAnchor: [0, 0],
      shadowSize: [25.55, 40],
      popupAnchor: [12, 0]
    });

    const markerIcon = L.icon({
      iconUrl: '/assets/images/location-icon-big.png',
      // iconUrl: '/assets/images/executive.png',
      shadowUrl: 'https://res.cloudinary.com/rodrigokamada/image/upload/v1637581626/Blog/angular-leaflet/marker-shadow.png',
      iconSize: [28.75, 46],
      iconAnchor: [0, 0],
      shadowSize: [25.55, 40],
      popupAnchor: [12, 0]
    });

    const marker = L.marker([this.locations[0], this.locations[1]], { icon }).addTo(this.map);
    if (this.popUpText) {
      const styledPopupText = `<div class="fw-bold font-Readex">${this.popUpText}</div>`;
      marker.bindPopup(styledPopupText).openPopup();
    }

    this.markers.push(marker);

    if(this.showRoute){
      
      const marker = L.marker([this.locations[2], this.locations[3]], { icon: markerIcon }).addTo(this.map);

      if (this.popUpText) {
        const styledPopupText = `<div class="fw-bold font-Readex">${this.showRouteText}</div>`;
        marker.bindPopup(styledPopupText).openPopup();
      }
  
      this.markers.push(marker);
    }

    setTimeout(() => {
      const wm = document.querySelector('.leaflet-control-attribution');
      wm!.innerHTML = '';
    });
  }

  private calculateRoute(): void {
    // [18.5204303, 73.8567437]
    const startPoint = L.latLng(this.locations[0], this.locations[1]); // Start point
    const endPoint = L.latLng(this.locations[2], this.locations[3]); // End point

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

            const waypoints = [
              new L.Routing.Waypoint(startPoint, 'Start', { allowUTurn: true }),
              new L.Routing.Waypoint(endPoint, 'End', { allowUTurn: true })
            ];

            // Add the route to the map
            L.Routing.control({
              waypoints: waypoints,
              routeWhileDragging: false,
              addWaypoints: false,
              summaryTemplate: "<h5 class='fw-light'>{distance}, {time}</h5>",
              // summaryTemplate: '',
              containerClassName: 'lefleatStyle',
              itineraryClassName: 'd-none',
              showAlternatives: true,
              // useZoomParameter: true,
              autoRoute: true,
            //   lineOptions: {
            //     styles: [
            //         {
            //             color: 'blue', // Line color
            //             opacity: 0.7, // Line opacity
            //             weight: 5, // Line width

            //         }
            //     ],
            //     extendToWaypoints: false, // Set this to false if you don't want to extend the line to waypoints
            //     missingRouteTolerance: 10 // Set an appropriate tolerance value
            // },
              plan: L.Routing.plan(waypoints, {
                createMarker: () => false, // Suppress marker creation
              }),

            }).addTo(self.map!)


            // Create latLngs directly from start and end points
            const latLngs = [startPoint, endPoint];

            // Draw the route on the map (if needed)
            // L.polyline(latLngs, { color: 'blue' }).addTo(self.map!);

            // Fit the map view to the route
            const bounds = L.latLngBounds(latLngs);
            self.map!.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });

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
