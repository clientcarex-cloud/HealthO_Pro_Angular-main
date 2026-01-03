import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-net-collections',
  templateUrl: './net-collections.component.html',
  styleUrl: './net-collections.component.scss'
})
export class NetCollectionsComponent {

  
  @Input() collections: any ;

  formatCurrency(bill: any): any {
    if (bill) {
      const formatted = parseFloat(bill).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      })
      return formatted
    } else {
      return 0
    }
  }

}
