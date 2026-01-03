import { Component, Input } from '@angular/core';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';

@Component({
  selector: 'app-pop-loyalty',
  templateUrl: './pop-loyalty.component.html',
})

export class PopLoyaltyComponent {

  @Input() card: any ;

  constructor(
    public timeSrvc: TimeConversionService
  ){}

  
  returnFreePrivilegeCard(total_type: any, used_type: any, word: any): any{


    if(this.card?.benefits[0][total_type]){
      
      const benefits = this.card?.benefits[0] ; 
      const left = (benefits[total_type] || 0) - (benefits[used_type] || 0) ;

      const model = {
        show : left <= 0 ? false : true,
        html_content:  `<div class='d-flex flex-nowrap gap-2'>
          <span>${word} remaining - <span class='fw-medium text-danger'>${left}</span>, </span>
          <span>Total - <span class='fw-medium'>${benefits[total_type]}</span></span>
        </div>`
      }

      return model
    }

    const model = {
      show : true,
      html_content: `<div><span>Unlimited ${word} Visits</span></div>`
    }

    return model ;
  }


  
}
