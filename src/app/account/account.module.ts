import { NgModule } from '@angular/core';
import { SharedModule } from "../shared/shared.module";
import { AccountRoutingModule } from './account-routing.module';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { IncomeComponent } from './components/income/income.component';
import { MainComponent } from './components/main/main.component';
import { AddexpenseComponent } from './components/addexpense/addexpense.component';
@NgModule({
  declarations: [   
    ExpensesComponent, IncomeComponent, MainComponent, AddexpenseComponent
  ],
  imports: [
    AccountRoutingModule,
    SharedModule,
  ],
  providers: [
  ]
})

export class AccountModule { }