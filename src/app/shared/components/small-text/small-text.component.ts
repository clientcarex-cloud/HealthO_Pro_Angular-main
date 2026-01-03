import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-small-text',
  templateUrl: './small-text.component.html',
})

export class SmallTextComponent {

  @Input() text: string = "" ;
  @Input() query: string = "" ;
  @Input() classVal : string = "" ;

  @Input() styleVal : string = "" ;
}
