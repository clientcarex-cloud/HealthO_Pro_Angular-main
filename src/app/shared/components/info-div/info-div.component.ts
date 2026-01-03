import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-div',
  templateUrl: './info-div.component.html',
  styleUrl: './info-div.component.scss'
})
export class InfoDivComponent {

  @Input() timeText: any = '';
  @Input() MainText: any = '';
}
