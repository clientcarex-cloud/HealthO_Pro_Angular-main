import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-offline',
  templateUrl: './offline.component.html',
  styleUrls: ['./offline.component.scss']
})
export class OfflineComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  isRotating: boolean = false;

  reload() {
    this.isRotating = true;
    // Perform your reload logic here
    location.reload();
  }

}
