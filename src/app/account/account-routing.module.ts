import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { IncomeComponent } from './components/income/income.component';
import { MainComponent } from './components/main/main.component';
import { PageGuard } from './account.guard';


const routes: Routes = [
    {path: 'main', component: MainComponent, 
    canActivate: [PageGuard]
},
    {path: 'expenses', component: ExpensesComponent, 
    canActivate: [PageGuard]
},
    {path: 'income', component: IncomeComponent, 
    canActivate: [PageGuard]
}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AccountRoutingModule { }
