import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss', './main.component.css']
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  separators: any = [];
  submitted = false;
  minStartDate = new Date;
  types: any = [];
  total:any;
  service:any = {
    page : '', pageSize :''
  }

  dataDoctor = [
    {label: 'Doctors', count:105},
    {label: 'Sepcialists', count:87},
    {label: 'Virtual', count: 5 },
    {label: 'Offline', count: 1 },
  ]
  
  typeChange(event:any){
    //pass
    }

    separatorChange(separator: any) {
      //pass
  }

  dataList: any = [
    { PID: 3, Name: 'Hameed Ahmed', Date: 'Today - 10.06 AM', test: 'CBP, Urine', Total: 2, status: 'Emergency', Receptionist: 'Fahad Ahmed', accession: 'SP356, SP357'  },
    { PID: 2, Name: 'Ravi Kumar', Date: '30 MAY-2022 - 10.01 AM', test: ' Urine', Total: 1, status: 'Collected', Receptionist: 'Fahad Ahmed', accession: 'SP255', Collection: "", Receiving: ""  },
    { PID: 1, Name: 'Amrit Mehta', Date: '30 MAY-2022 - 9:16 AM', test: ' Full Body', Total: 1, status: 'Pending', Receptionist: 'Fahad Ahmed', accession: 'SP235', Collection: "", Receiving: ""  },
  ]
  
  dataList_Sub = [
    { sno: 1, Test: "Complete Blood Picture", Status: "EMERGENCY", Receptionist: 'Fahad Ahmed', access: "SP357", Collection: " Collect & Print", Receiving: "Received",},
    { sno: 2, Test: "Urine Test", Status: "Pending", Receptionist: 'Ankit Rao', access: "SP356", Collection: " Collect & Print", Receiving: "Received",},
  ]

}
