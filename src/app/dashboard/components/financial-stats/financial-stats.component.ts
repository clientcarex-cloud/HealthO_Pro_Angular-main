import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-financial-stats',
  templateUrl: './financial-stats.component.html',
})

export class FinancialStatsComponent {

  @Input() business: any ;

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
