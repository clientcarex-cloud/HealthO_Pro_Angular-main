import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.scss']
})
export class WhatsappComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  dataWhatsApp = [
    {label: 'WhatsApp Balance', count: '76,477'},
    {label: 'WhatsApp Used', count: '23,523'},
    {label: 'WhatsApp Pack', count: '1 Lac' },
  ]

  campaign: [string] = ['Greetings',];
  send:[string] = [ 'Ref. Doctors & Labs']
  submitted: boolean = false;
  count: number = 1;
  charac: number = 145;
  textareaValue:any = 'Hi {Name}, Very Happy [Festival Name] to You & Your Family, Let’s have fun and enjoy with family & friends on this occasion. [Company Name]'
  separatorChange(separator: any) {
    // this.setPreview();
}

}
