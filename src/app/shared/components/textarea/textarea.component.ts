import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss']
})
export class TextareaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() placeholderText:string = 'Enter Text Here';
  @Input() Value: any = '';
  @Input() LabelText:string ='';
  @Input() classVal:string = "form-control p-2";
  @Input() labelText: string = 'Message'
  @Input() LabelShow: boolean = true;
  @Input() input_disabled: any = false;
  @Input() defHeight:any = 10;
}
