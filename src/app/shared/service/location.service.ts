import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LocationService {

    constructor() { }

    async getLocation() {
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

}