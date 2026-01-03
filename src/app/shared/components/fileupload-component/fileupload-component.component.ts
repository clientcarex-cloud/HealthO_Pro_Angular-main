import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-fileupload-component',
  templateUrl: './fileupload-component.component.html',
  styleUrls: ['./fileupload-component.component.scss']
})
export class FileuploadComponentComponent implements OnInit {

  @Input() labelText:string = 'Attach File';

  constructor() { }

  ngOnInit(): void {
  }

}
